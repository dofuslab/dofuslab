"""Unit tests for integration target checks; these never connect to services."""

import pytest

from tests.graphql._target_safety import assert_safe_test_services


def safe_environment():
    return {
        "DOFUSLAB_TEST_SERVICES": "1",
        "DATABASE_URL": "postgresql://postgres:password@localhost:5432/dofuslab",
        "REDIS_URL": "redis://localhost:6379",
        "REDIS_HOST": "localhost",
    }


def test_disposable_local_targets_are_allowed():
    assert_safe_test_services(safe_environment())


@pytest.mark.parametrize(
    "updates",
    [
        {"DOFUSLAB_TEST_SERVICES": "0"},
        {"DATABASE_URL": "postgresql://user:password@db.example.com/production"},
        {"REDIS_URL": "redis://cache.example.com:6379"},
        {"REDIS_HOST": "cache.example.com"},
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
