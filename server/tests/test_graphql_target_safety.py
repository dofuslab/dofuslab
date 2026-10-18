"""Unit tests for integration target checks; these never connect to services."""

import pytest

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


@pytest.mark.parametrize(
    "database_url",
    [
        "postgresql://postgres:password@localhost:5432/dofuslab?host=production.example",
        "postgresql://postgres:password@localhost:5432/dofuslab?hostaddr=203.0.113.10",
        "postgresql://postgres:password@localhost:5432/dofuslab?service=production",
        "postgresql://postgres:password@localhost:5432/dofuslab?sslmode=disable",
    ],
)
def test_database_query_parameters_cannot_override_local_authority(database_url):
    environment = safe_environment()
    environment["DATABASE_URL"] = database_url
    with pytest.raises(RuntimeError, match="must not contain query parameters"):
        assert_safe_test_services(environment)


def test_redis_query_parameters_are_rejected_too():
    environment = safe_environment()
    environment["REDIS_URL"] = "redis://localhost:6379?db=1"
    with pytest.raises(RuntimeError, match="must not contain query parameters"):
        assert_safe_test_services(environment)


@pytest.mark.parametrize(
    "updates,error",
    [
        ({"REDIS_HOST": "redis"}, "REDIS_HOST must match"),
        ({"REDIS_PORT": "6380"}, "REDIS_PORT must match"),
        ({"REDIS_PORT": "not-a-port"}, "valid integers"),
        ({"REDIS_URL": "redis://localhost:not-a-port"}, "valid integers"),
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
