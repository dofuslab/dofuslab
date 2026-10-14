"""Fail-closed checks for database-backed integration test targets."""

from urllib.parse import urlparse


SAFE_SERVICE_HOSTS = {"127.0.0.1", "::1", "localhost", "postgres", "redis"}
OPT_IN_VARIABLE = "DOFUSLAB_TEST_SERVICES"


def _is_safe_host(hostname):
    return hostname in SAFE_SERVICE_HOSTS or hostname.startswith(
        ("codex-dofuslab-tests-", "codex-dofuslab-review-")
    )


def assert_safe_test_services(environ):
    """Reject missing, non-local, or non-explicit integration service targets."""
    if environ.get(OPT_IN_VARIABLE) != "1":
        raise RuntimeError(
            "Database-backed tests are disabled unless {}=1 is explicitly set."
            .format(OPT_IN_VARIABLE)
        )

    for name in ("DATABASE_URL", "REDIS_URL"):
        target = environ.get(name)
        if not target:
            raise RuntimeError("{} must select a disposable test service.".format(name))
        hostname = urlparse(target).hostname
        if not hostname or not _is_safe_host(hostname):
            raise RuntimeError(
                "{} host {!r} is not an allowed disposable test host."
                .format(name, hostname)
            )

    redis_host = environ.get("REDIS_HOST")
    if not redis_host or not _is_safe_host(redis_host):
        raise RuntimeError(
            "REDIS_HOST {!r} is not an allowed disposable test host."
            .format(redis_host)
        )
