"""Unit tests for integration target checks; these never connect to services."""

import pytest
from sqlalchemy.dialects.postgresql.psycopg2 import PGDialect_psycopg2
from sqlalchemy.engine.url import make_url

from tests.graphql._target_safety import assert_safe_test_services


def safe_environment():
    return {
        "DOFUSLAB_TEST_SERVICES": "1",
        "DATABASE_URL": "postgresql://postgres:password@localhost:5432/dofuslab",
        "REDIS_URL": "redis://localhost:6379",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
    }


def test_disposable_local_targets_are_allowed():
    assert_safe_test_services(safe_environment())


def test_percent_encoded_database_credentials_are_allowed():
    environment = safe_environment()
    environment["DATABASE_URL"] = (
        "postgresql+psycopg2://post%67res:pass%40word@localhost:5432/dofuslab"
    )
    assert_safe_test_services(environment)


def test_canonical_database_url_has_exact_psycopg2_connect_arguments():
    database_url = safe_environment()["DATABASE_URL"]
    sqlalchemy_url = make_url(database_url)
    positional, connect_args = PGDialect_psycopg2().create_connect_args(
        sqlalchemy_url
    )
    assert positional == []
    assert connect_args == {
        "host": "localhost",
        "port": 5432,
        "database": "dofuslab",
        "user": "postgres",
        "password": "password",
    }


@pytest.mark.parametrize(
    "database_url",
    [
        "postgresql://postgres:password@localhost:5432/dofuslab?host=production.example",
        "postgresql://postgres:password@localhost:5432/dofuslab?hostaddr=203.0.113.10",
        "postgresql://postgres:password@localhost:5432/dofuslab?service=production",
        "postgresql://postgres:password@localhost:5432/dofuslab?sslmode=disable",
        "postgresql+psycopg2://postgres:password@localhost:5432/"
        "dofuslab#?host=production.example&database=dofuslab",
        "postgresql+psycopg2://postgres:password@localhost:5432/"
        "dofuslab@production.example/dofuslab",
    ],
)
def test_database_suffixes_cannot_override_local_authority(database_url):
    environment = safe_environment()
    environment["DATABASE_URL"] = database_url
    with pytest.raises(RuntimeError):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "redis_url",
    [
        "redis://localhost:6379?db=1",
        "redis://localhost:6379#?host=production.example",
        "redis://localhost:6379/cache@production.example",
    ],
)
def test_redis_suffixes_are_rejected_too(redis_url):
    environment = safe_environment()
    environment["REDIS_URL"] = redis_url
    with pytest.raises(RuntimeError):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "database_url,expected_host",
    [
        (
            "postgresql+psycopg2://postgres:password@localhost:5432/"
            "dofuslab#?host=production.example&database=dofuslab",
            "production.example",
        ),
        (
            "postgresql+psycopg2://postgres:password@localhost:5432/"
            "dofuslab@production.example/dofuslab",
            "production.example",
        ),
    ],
)
def test_reported_parser_differentials_are_rejected_without_connecting(
    database_url, expected_host
):
    sqlalchemy_url = make_url(database_url)
    positional, connect_args = PGDialect_psycopg2().create_connect_args(
        sqlalchemy_url
    )
    assert positional == []
    assert connect_args["host"] == expected_host

    environment = safe_environment()
    environment["DATABASE_URL"] = database_url
    with pytest.raises(RuntimeError):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "database_url",
    [
        "postgresql://postgres:password@localhost:5432",
        "postgresql://postgres:password@localhost:5432/one/two",
        "postgresql://postgres:password@localhost:5432/dofuslab;service=prod",
        "postgresql://postgres:pass:word@localhost:5432/dofuslab",
        "postgresql://postgres:p@ssword@localhost:5432/dofuslab",
        "postgresql://postgres:password@localhost/dofuslab",
    ],
)
def test_database_url_must_use_canonical_structure(database_url):
    environment = safe_environment()
    environment["DATABASE_URL"] = database_url
    with pytest.raises(RuntimeError):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "database_url",
    [
        "postgresql://postgres:password@localhost:5432/dofuslab#fragment",
        "postgresql://postgres:password@localhost:5432/dofuslab?hostaddr=203.0.113.10",
        "postgresql://postgres:password@localhost:5432/dofuslab%3Fhost=production",
        "postgresql://postgres:password@localhost:5432/dofuslab//production",
        "postgresql://postgres:p@ss@localhost:5432/dofuslab",
        "postgresql://postgres:password@localhost:5432/dofuslab@127.0.0.1/prod",
        "postgresql://postgres:password@localhost:5432/dofuslab#?service=prod",
    ],
)
def test_broad_parser_differential_corpus_is_fail_closed(database_url):
    environment = safe_environment()
    environment["DATABASE_URL"] = database_url
    with pytest.raises(RuntimeError):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "updates,error",
    [
        ({"REDIS_HOST": "redis"}, "REDIS_HOST must match"),
        ({"REDIS_PORT": "6380"}, "REDIS_PORT must match"),
        ({"REDIS_PORT": "not-a-port"}, "valid integers"),
        ({"REDIS_URL": "redis://localhost:not-a-port"}, "valid explicit port"),
    ],
)
def test_redis_connection_settings_cannot_disagree(updates, error):
    environment = safe_environment()
    environment.update(updates)
    with pytest.raises(RuntimeError, match=error):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "name,value",
    [
        ("PGHOST", "production.example"),
        ("PGHOSTADDR", "203.0.113.10"),
        ("PGPORT", "5433"),
        ("PGDATABASE", "production"),
        ("PGUSER", "production-user"),
        ("PGSERVICE", "production"),
        ("PGSERVICEFILE", "/tmp/production.pg_service.conf"),
        ("PGSYSCONFDIR", "/tmp/production-pg-config"),
    ],
)
def test_libpq_environment_cannot_override_database_url(name, value):
    environment = safe_environment()
    environment[name] = value
    with pytest.raises(RuntimeError, match=name):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "updates",
    [
        {"DOFUSLAB_TEST_SERVICES": "0"},
        {"DATABASE_URL": "postgresql://user:password@db.example.com/production"},
        {"REDIS_URL": "redis://cache.example.com:6379"},
        {"REDIS_HOST": "cache.example.com"},
        {"DATABASE_URL": "mysql://root:password@localhost/dofuslab"},
        {"REDIS_URL": "http://localhost:6379"},
        {
            "DATABASE_URL": "postgresql://postgres:password@codex-dofuslab-tests-postgres.attacker.example/dofuslab"
        },
        {"REDIS_HOST": "codex-dofuslab-review-redis.attacker.example"},
    ],
)
def test_unsafe_or_unapproved_targets_are_rejected(updates):
    environment = safe_environment()
    environment.update(updates)
    with pytest.raises(RuntimeError):
        assert_safe_test_services(environment)
