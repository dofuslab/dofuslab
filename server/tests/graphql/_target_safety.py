"""Fail-closed checks for database-backed integration test targets."""

import re
from urllib.parse import unquote, urlparse

from sqlalchemy.dialects.postgresql.psycopg2 import PGDialect_psycopg2
from sqlalchemy.engine.url import make_url


SAFE_SERVICE_HOSTS = {"127.0.0.1", "::1", "localhost", "postgres", "redis"}
SAFE_TASK_SERVICE_HOSTS = {
    "codex-dofuslab-review-postgres",
    "codex-dofuslab-review-redis",
    "codex-dofuslab-tests-postgres",
    "codex-dofuslab-tests-redis",
}
OPT_IN_VARIABLE = "DOFUSLAB_TEST_SERVICES"
SAFE_DATABASE_SCHEMES = {
    "postgres",
    "postgres+psycopg2",
    "postgresql",
    "postgresql+psycopg2",
}
SAFE_REDIS_SCHEMES = {"redis", "rediss"}

# libpq fills unspecified connection parameters from PG* environment variables.
# PGHOSTADDR and service files are particularly dangerous here: they can route a
# connection somewhere other than the hostname visible in DATABASE_URL.
LIBPQ_ROUTING_VARIABLES = {
    "PGDATABASE",
    "PGHOST",
    "PGHOSTADDR",
    "PGPORT",
    "PGSERVICE",
    "PGSERVICEFILE",
    "PGSYSCONFDIR",
    "PGUSER",
}
URL_TOKEN = re.compile(r"(?:[A-Za-z0-9._~-]|%[0-9A-Fa-f]{2})+")
DATABASE_PATH = re.compile(r"/[A-Za-z0-9_-]+")


def _is_safe_host(hostname):
    return hostname in SAFE_SERVICE_HOSTS or hostname in SAFE_TASK_SERVICE_HOSTS


def _assert_safe_url(name, target, schemes):
    if "?" in target or "#" in target:
        raise RuntimeError(
            "{} must not contain raw query or fragment delimiters; connection "
            "parsers can interpret suffixes differently.".format(name)
        )
    parsed = urlparse(target)
    if parsed.scheme not in schemes:
        raise RuntimeError(
            "{} scheme {!r} is not an allowed test service scheme."
            .format(name, parsed.scheme)
        )
    if not parsed.hostname or not _is_safe_host(parsed.hostname):
        raise RuntimeError(
            "{} host {!r} is not an allowed disposable test host."
            .format(name, parsed.hostname)
        )
    return parsed


def _assert_safe_database_url(target):
    parsed = _assert_safe_url(
        "DATABASE_URL", target, SAFE_DATABASE_SCHEMES
    )
    if target.count("@") != 1:
        raise RuntimeError(
            "DATABASE_URL must contain exactly one raw @ authority delimiter."
        )

    authority = target.split("://", 1)[1].split("@", 1)[0]
    if authority.count(":") != 1:
        raise RuntimeError(
            "DATABASE_URL credentials must use one colon delimiter and "
            "percent-encode reserved characters."
        )
    raw_user, raw_password = authority.split(":", 1)
    if not URL_TOKEN.fullmatch(raw_user) or not URL_TOKEN.fullmatch(raw_password):
        raise RuntimeError(
            "DATABASE_URL credentials must be non-empty and percent-encode "
            "reserved characters."
        )
    if not DATABASE_PATH.fullmatch(parsed.path):
        raise RuntimeError(
            "DATABASE_URL must select exactly one simple database path component."
        )

    try:
        parsed_port = parsed.port
        sqlalchemy_url = make_url(target)
        sqlalchemy_port = sqlalchemy_url.port
    except (TypeError, ValueError):
        raise RuntimeError("DATABASE_URL must contain a valid explicit port.")
    if parsed_port is None:
        raise RuntimeError("DATABASE_URL must contain a valid explicit port.")

    expected = {
        "drivername": parsed.scheme,
        "host": parsed.hostname,
        "port": parsed_port,
        "database": parsed.path[1:],
        "username": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
    }
    observed = {
        "drivername": sqlalchemy_url.drivername,
        "host": sqlalchemy_url.host,
        "port": sqlalchemy_port,
        "database": sqlalchemy_url.database,
        "username": sqlalchemy_url.username,
        "password": sqlalchemy_url.password,
    }
    if observed != expected:
        raise RuntimeError(
            "DATABASE_URL is interpreted differently by URL parsers."
        )

    positional, connect_args = PGDialect_psycopg2().create_connect_args(
        sqlalchemy_url
    )
    expected_connect_args = {
        "host": expected["host"],
        "port": expected["port"],
        "database": expected["database"],
        "user": expected["username"],
        "password": expected["password"],
    }
    if positional or connect_args != expected_connect_args:
        raise RuntimeError(
            "DATABASE_URL produces unexpected psycopg2 connection arguments."
        )


def _assert_safe_redis_url(target):
    parsed = _assert_safe_url("REDIS_URL", target, SAFE_REDIS_SCHEMES)
    if "@" in target or parsed.username is not None or parsed.password is not None:
        raise RuntimeError("REDIS_URL must not contain credentials.")
    if parsed.path:
        raise RuntimeError("REDIS_URL must not contain a database path.")
    try:
        parsed_port = parsed.port
        sqlalchemy_url = make_url(target)
    except (TypeError, ValueError):
        raise RuntimeError("REDIS_URL must contain a valid explicit port.")
    if parsed_port is None:
        raise RuntimeError("REDIS_URL must contain a valid explicit port.")
    if (
        sqlalchemy_url.drivername != parsed.scheme
        or sqlalchemy_url.host != parsed.hostname
        or sqlalchemy_url.port != parsed_port
        or sqlalchemy_url.database is not None
        or sqlalchemy_url.query
    ):
        raise RuntimeError("REDIS_URL is interpreted differently by URL parsers.")
    return parsed


def assert_safe_test_services(environ):
    """Reject missing, non-local, or non-explicit integration service targets."""
    if environ.get(OPT_IN_VARIABLE) != "1":
        raise RuntimeError(
            "Database-backed tests are disabled unless {}=1 is explicitly set."
            .format(OPT_IN_VARIABLE)
        )

    database_url = environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL must select a disposable test service.")
    _assert_safe_database_url(database_url)

    redis_url = environ.get("REDIS_URL")
    if not redis_url:
        raise RuntimeError("REDIS_URL must select a disposable test service.")
    parsed_redis_url = _assert_safe_redis_url(redis_url)

    overridden = sorted(LIBPQ_ROUTING_VARIABLES.intersection(environ))
    if overridden:
        raise RuntimeError(
            "PostgreSQL routing environment variables are not allowed for "
            "database-backed tests: {}.".format(", ".join(overridden))
        )

    redis_host = environ.get("REDIS_HOST")
    if not redis_host or not _is_safe_host(redis_host):
        raise RuntimeError(
            "REDIS_HOST {!r} is not an allowed disposable test host."
            .format(redis_host)
        )
    if redis_host != parsed_redis_url.hostname:
        raise RuntimeError(
            "REDIS_HOST must match the host selected by REDIS_URL."
        )

    try:
        redis_port = int(environ.get("REDIS_PORT", ""))
        redis_url_port = parsed_redis_url.port or 6379
    except ValueError:
        raise RuntimeError("Redis test service ports must be valid integers.")
    if redis_port != redis_url_port:
        raise RuntimeError(
            "REDIS_PORT must match the port selected by REDIS_URL."
        )
