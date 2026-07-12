import unittest
from contextlib import contextmanager
import importlib
from unittest.mock import Mock, patch

from app import build_discovery_service as service
from oneoff.build_discovery_prototype import BuildDiscoveryQuery


class FakeCache:
    def __init__(self, values=None):
        self.values = list(values or [])
        self.stored = {}
        self.get_keys = []

    def get(self, key):
        self.get_keys.append(key)
        if self.values:
            return self.values.pop(0)
        return self.stored.get(key)

    def set(self, key, value):
        self.stored[key] = value


class FakeLock:
    def __init__(self, acquired=True):
        self.acquired = acquired
        self.acquire_calls = []
        self.released = False

    def acquire(self, **kwargs):
        self.acquire_calls.append(kwargs)
        return self.acquired

    def release(self):
        self.released = True


class FakeRedis:
    def __init__(self, lock=None):
        self.fake_lock = lock or FakeLock()
        self.calls = []

    def lock(self, key, **kwargs):
        self.calls.append((key, kwargs))
        return self.fake_lock


def response():
    return {
        "status": "complete",
        "datasetVersion": "dataset-v1",
        "diagnostics": {"elapsedMs": 12.0},
    }


class BuildDiscoveryServiceTest(unittest.TestCase):
    def setUp(self):
        self.query = BuildDiscoveryQuery(class_name="Iop", elements=("strength",))
        self.dataset_patch = patch.object(service, "dataset_version", return_value="dataset-v1")
        self.dataset_patch.start()
        self.addCleanup(self.dataset_patch.stop)

    def test_cache_hit_is_lock_free_and_exposes_diagnostics(self):
        cache = FakeCache([response()])
        redis = FakeRedis()
        solve = Mock()

        result = service.build_discovery_cached_response(
            self.query, cache_region=cache, redis_client=redis, solve_fn=solve
        )

        self.assertEqual(redis.calls, [])
        solve.assert_not_called()
        self.assertEqual(result["diagnostics"]["solver"], "cpsat")
        self.assertEqual(result["solver"], "cpsat")
        self.assertEqual(result["diagnostics"]["cacheStatus"], "hit")
        self.assertTrue(result["diagnostics"]["appCacheHit"])

    def test_miss_uses_production_args_and_global_serialization(self):
        cache = FakeCache([None, None])
        lock = FakeLock()
        redis = FakeRedis(lock)
        solve = Mock(return_value=response())

        result = service.build_discovery_cached_response(
            self.query, cache_region=cache, redis_client=redis, solve_fn=solve
        )

        self.assertEqual(
            redis.calls,
            [
                (
                    service.CPSAT_SOLVE_LOCK_KEY,
                    {
                        "timeout": service.CPSAT_SOLVE_LOCK_TIMEOUT_SECONDS,
                        "blocking_timeout": service.CPSAT_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS,
                    },
                )
            ],
        )
        args = solve.call_args.args[1]
        self.assertEqual(args.workers, 2)
        self.assertEqual(args.time_limit_seconds, 2.8)
        self.assertEqual(lock.acquire_calls, [{"blocking": True}])
        self.assertTrue(lock.released)
        self.assertEqual(result["cache"]["status"], "miss")
        self.assertEqual(result["solverVersion"], service.CPSAT_SOLVER_VERSION)
        self.assertTrue(next(iter(cache.stored)).startswith(service.CPSAT_CACHE_PREFIX))

    def test_recheck_after_lock_deduplicates(self):
        cached = response()
        cache = FakeCache([None, cached])
        lock = FakeLock()
        solve = Mock()

        result = service.build_discovery_cached_response(
            self.query,
            cache_region=cache,
            redis_client=FakeRedis(lock),
            solve_fn=solve,
        )

        solve.assert_not_called()
        self.assertEqual(len(cache.get_keys), 2)
        self.assertEqual(result["cache"]["status"], "deduplicated")
        self.assertTrue(result["diagnostics"]["solveLockAcquired"])
        self.assertTrue(lock.released)

    def test_lock_acquisition_failure_is_explicit_and_bounded(self):
        redis = FakeRedis(FakeLock(acquired=False))
        with self.assertRaisesRegex(service.BuildDiscoverySolveLockTimeout, "6s"):
            service.build_discovery_cached_response(
                self.query,
                cache_region=FakeCache([None]),
                redis_client=redis,
                solve_fn=Mock(),
            )

    def test_cache_key_is_solver_dataset_and_query_specific(self):
        first = service.build_discovery_app_cache_key(self.query, "dataset-v1")
        other_dataset = service.build_discovery_app_cache_key(self.query, "dataset-v2")
        other_query = service.build_discovery_app_cache_key(
            BuildDiscoveryQuery(class_name="Cra", elements=("strength",)), "dataset-v1"
        )
        self.assertNotEqual(first, other_dataset)
        self.assertNotEqual(first, other_query)
        self.assertTrue(first.startswith("build_discovery_response:cpsat:"))
        self.assertFalse(first.startswith("build_discovery_response:build-discovery-prototype"))


class ProductionDelegationTest(unittest.TestCase):
    def test_graphql_delegates_to_service_entry_point(self):
        schema = importlib.import_module("app.schema")

        query = Mock()
        expected = response()
        with patch.object(schema, "build_discovery_query_from_args", return_value=query), patch.object(
            schema, "require_build_discovery_index"
        ), patch.object(
            schema, "build_discovery_cached_response", return_value=expected
        ) as delegated:
            result = schema.Query.resolve_build_discovery(Mock(), Mock(), class_name="Iop")

        self.assertIs(result, expected)
        delegated.assert_called_once_with(query)

    def test_rq_job_delegates_and_preserves_persistence(self):
        from app import tasks

        query = Mock()
        result = response()
        job = Mock(
            status="queued",
            request_payload={"queryIdentity": {}},
            result_payload=None,
            dataset_version=None,
            solver_version=None,
            elapsed_ms=None,
        )

        class FakeDbSession:
            def query(self, model):
                return self

            def get(self, job_id):
                return job

        @contextmanager
        def fake_session_scope():
            yield FakeDbSession()

        with patch.object(tasks, "session_scope", fake_session_scope), patch.object(
            tasks, "build_discovery_query_from_payload", return_value=query
        ), patch.object(
            tasks, "build_discovery_cached_response", return_value=result
        ) as delegated:
            succeeded = tasks.run_build_discovery_job("job-1")

        self.assertTrue(succeeded)
        delegated.assert_called_once_with(query)
        self.assertEqual(job.status, "succeeded")
        self.assertEqual(job.progress, 100)
        self.assertIs(job.result_payload, result)
        self.assertEqual(job.dataset_version, "dataset-v1")
        self.assertEqual(job.elapsed_ms, 12.0)


if __name__ == "__main__":
    unittest.main()
