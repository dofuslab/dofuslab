"""Fail-closed checks for database-backed integration test targets."""

from urllib.parse import urlparse


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


def _is_safe_host(hostname):
    return hostname in SAFE_SERVICE_HOSTS or hostname in SAFE_TASK_SERVICE_HOSTS


def _assert_safe_url(name, target, schemes):
    parsed = urlparse(target)
    if parsed.scheme not in schemes:
        raise RuntimeError(
            "{} scheme {!r} is not an allowed test service scheme."
            .format(name, parsed.scheme)
        )
    if parsed.query:
        raise RuntimeError(
            "{} must not contain query parameters; connection libraries can "
            "use them to override routing.".format(name)
        )
    if not parsed.hostname or not _is_safe_host(parsed.hostname):
        raise RuntimeError(
            "{} host {!r} is not an allowed disposable test host."
            .format(name, parsed.hostname)
        )
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
    _assert_safe_url("DATABASE_URL", database_url, SAFE_DATABASE_SCHEMES)

    redis_url = environ.get("REDIS_URL")
    if not redis_url:
        raise RuntimeError("REDIS_URL must select a disposable test service.")
    parsed_redis_url = _assert_safe_url(
        "REDIS_URL", redis_url, SAFE_REDIS_SCHEMES
    )

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
