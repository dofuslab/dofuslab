import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import importlib
from threading import Condition, Lock
from time import monotonic, sleep
from unittest.mock import Mock, patch
from redis.exceptions import LockError
from graphql import GraphQLError

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
        self.extend_calls = []

    def acquire(self, **kwargs):
        self.acquire_calls.append(kwargs)
        return self.acquired

    def release(self):
        self.released = True

    def extend(self, seconds):
        self.extend_calls.append(seconds)
        return True


class BuildDiscoveryProductResponseTest(unittest.TestCase):
    def test_compacts_duplicate_and_solver_only_debug_fields(self):
        response = service.compact_product_response(
            {
                "status": "complete",
                "build": {"score": 1},
                "builds": [{"score": 1}],
                "candidateSummaries": [{"score": 1}],
                "effectiveScoringStats": {"Strength": 1000},
                "objectiveWeights": {"Strength": 1.0},
                "attempts": [
                    {
                        "attempt": 1,
                        "status": "FEASIBLE",
                        "solveMs": 3000,
                        "callbackCandidateEvents": [{"large": "payload"}],
                    }
                ],
            }
        )

        self.assertEqual(response["builds"], [{"score": 1}])
        self.assertNotIn("build", response)
        self.assertNotIn("candidateSummaries", response)
        self.assertNotIn("objectiveWeights", response)
        self.assertEqual(
            response["attempts"],
            [{"attempt": 1, "status": "FEASIBLE", "solveMs": 3000}],
        )


class LostOwnershipLock(FakeLock):
    def release(self):
        raise LockError("lock is no longer owned")


class FakeRedis:
    def __init__(self, lock=None):
        self.fake_lock = lock or FakeLock()
        self.calls = []

    def lock(self, key, **kwargs):
        self.calls.append((key, kwargs))
        return self.fake_lock


class SharedFakeRedis:
    def __init__(self):
        self.mutex = Lock()

    def lock(self, key, **kwargs):
        mutex = self.mutex

        class SharedFakeLock:
            def acquire(self, **acquire_kwargs):
                return mutex.acquire(timeout=kwargs["blocking_timeout"])

            def release(self):
                mutex.release()

            def extend(self, seconds):
                return True

        return SharedFakeLock()


class ExpiringFakeRedis:
    def __init__(self):
        self.condition = Condition()
        self.owner = None
        self.deadline = 0.0

    def lock(self, key, **kwargs):
        redis = self
        token = object()
        lease_seconds = kwargs["timeout"]

        class ExpiringFakeLock:
            def acquire(self, **acquire_kwargs):
                wait_deadline = monotonic() + kwargs["blocking_timeout"]
                with redis.condition:
                    while redis.owner is not None and redis.deadline > monotonic():
                        remaining = min(
                            redis.deadline - monotonic(), wait_deadline - monotonic()
                        )
                        if remaining <= 0:
                            return False
                        redis.condition.wait(remaining)
                    redis.owner = token
                    redis.deadline = monotonic() + lease_seconds
                    return True

            def extend(self, seconds):
                with redis.condition:
                    if redis.owner is not token or redis.deadline <= monotonic():
                        raise LockError("lock expired")
                    redis.deadline += seconds
                    redis.condition.notify_all()
                    return True

            def release(self):
                with redis.condition:
                    if redis.owner is not token or redis.deadline <= monotonic():
                        raise LockError("lock is no longer owned")
                    redis.owner = None
                    redis.condition.notify_all()

        return ExpiringFakeLock()


def response():
    return {
        "status": "complete",
        "datasetVersion": "dataset-v1",
        "diagnostics": {"elapsedMs": 12.0},
    }


class BuildDiscoveryServiceTest(unittest.TestCase):
    def setUp(self):
        self.query = BuildDiscoveryQuery(class_name="Iop", elements=("strength",))
        self.dataset_patch = patch.object(
            service, "dataset_version", return_value="dataset-v1"
        )
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
        self.assertEqual(result["diagnostics"]["lockWaitMs"], 0.0)

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
                        "thread_local": False,
                    },
                )
            ],
        )
        args = solve.call_args.args[1]
        self.assertEqual(args.workers, 2)
        self.assertEqual(args.time_limit_seconds, 3.1)
        self.assertEqual(lock.acquire_calls, [{"blocking": True}])
        self.assertTrue(lock.released)
        self.assertEqual(result["cache"]["status"], "miss")
        self.assertEqual(result["solverVersion"], service.CPSAT_SOLVER_VERSION)
        self.assertTrue(next(iter(cache.stored)).startswith(service.CPSAT_CACHE_PREFIX))

    def test_solve_lock_is_renewed_past_its_initial_expiry(self):
        lock = FakeLock()

        def slow_solve(query, args):
            sleep(0.08)
            return response()

        result = service.build_discovery_cached_response(
            self.query,
            cache_region=FakeCache([None, None]),
            redis_client=FakeRedis(lock),
            solve_fn=slow_solve,
            lock_timeout_seconds=0.03,
            lock_renewal_interval_seconds=0.01,
        )

        self.assertEqual(result["status"], "complete")
        self.assertGreaterEqual(len(lock.extend_calls), 2)
        self.assertTrue(lock.released)

    def test_expiring_lock_keeps_long_solves_serialized(self):
        redis = ExpiringFakeRedis()
        active = 0
        maximum_active = 0
        counter_lock = Lock()

        def slow_solve(query, args):
            nonlocal active, maximum_active
            with counter_lock:
                active += 1
                maximum_active = max(maximum_active, active)
            sleep(0.08)
            with counter_lock:
                active -= 1
            return response()

        def run(query):
            return service.build_discovery_cached_response(
                query,
                cache_region=FakeCache([None, None]),
                redis_client=redis,
                solve_fn=slow_solve,
                lock_blocking_timeout_seconds=0.3,
                lock_timeout_seconds=0.03,
                lock_renewal_interval_seconds=0.01,
            )

        queries = [
            self.query,
            BuildDiscoveryQuery(class_name="Cra", elements=("chance",)),
        ]
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(run, queries))

        self.assertEqual(maximum_active, 1)
        self.assertEqual([result["status"] for result in results], ["complete"] * 2)

    def test_renewal_failure_rejects_result_and_joins_before_release(self):
        events = []

        class FailingRenewalLock(FakeLock):
            def extend(self, seconds):
                events.append("renew-failed")
                raise LockError("expired")

            def release(self):
                events.append("release")
                raise LockError("not owned")

        cache = FakeCache([None, None])
        with self.assertRaises(service.BuildDiscoverySolveLockLost):
            service.build_discovery_cached_response(
                self.query,
                cache_region=cache,
                redis_client=FakeRedis(FailingRenewalLock()),
                solve_fn=lambda query, args: (sleep(0.04), response())[1],
                lock_timeout_seconds=0.03,
                lock_renewal_interval_seconds=0.01,
            )

        self.assertEqual(events, ["renew-failed", "release"])
        self.assertEqual(cache.stored, {})

    def test_recheck_after_lock_deduplicates(self):
        cached = response()
        cache = FakeCache([None, cached])
        lock = FakeLock()
        solve = Mock()

        with patch.object(service, "monotonic", side_effect=[10.0, 10.125]):
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
        self.assertEqual(result["diagnostics"]["lockWaitMs"], 125.0)
        self.assertEqual(result["diagnostics"]["elapsedMs"], 12.0)
        self.assertTrue(lock.released)

    def test_lost_lock_ownership_does_not_mask_completed_solve(self):
        result = service.build_discovery_cached_response(
            self.query,
            cache_region=FakeCache([None, None]),
            redis_client=FakeRedis(LostOwnershipLock()),
            solve_fn=Mock(return_value=response()),
        )

        self.assertEqual(result["status"], "complete")

    def test_response_provenance_and_target_metadata_are_preserved(self):
        solved = response()
        solved.update(
            {
                "cacheKey": "prototype-key",
                "targets": {"ap": 11, "mp": 6, "range": 3},
            }
        )

        result = service.build_discovery_cached_response(
            self.query,
            cache_region=FakeCache([None, None]),
            redis_client=FakeRedis(),
            solve_fn=Mock(return_value=solved),
        )

        self.assertEqual(result["datasetVersion"], "dataset-v1")
        self.assertEqual(result["cacheKey"], "prototype-key")
        self.assertEqual(result["targets"], {"ap": 11, "mp": 6, "range": 3})

    def test_lock_acquisition_failure_is_explicit_and_bounded(self):
        redis = FakeRedis(FakeLock(acquired=False))
        with patch.object(service, "monotonic", side_effect=[2.0, 8.0]):
            with self.assertRaisesRegex(
                service.BuildDiscoverySolveLockTimeout, "6s"
            ) as raised:
                service.build_discovery_cached_response(
                    self.query,
                    cache_region=FakeCache([None]),
                    redis_client=redis,
                    solve_fn=Mock(),
                )

        self.assertEqual(raised.exception.lock_wait_ms, 6000.0)

    def test_sync_lock_acquisition_fails_within_250ms_policy(self):
        redis = FakeRedis(FakeLock(acquired=False))
        with self.assertRaises(service.BuildDiscoverySolveLockTimeout):
            service.build_discovery_cached_response(
                self.query,
                cache_region=FakeCache([None]),
                redis_client=redis,
                solve_fn=Mock(),
                lock_blocking_timeout_seconds=(
                    service.CPSAT_SYNC_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS
                ),
            )

        self.assertEqual(
            redis.calls[0][1]["blocking_timeout"],
            service.CPSAT_SYNC_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS,
        )
        self.assertLess(redis.calls[0][1]["blocking_timeout"], 0.25)

    def test_concurrent_misses_never_solve_in_parallel(self):
        redis = SharedFakeRedis()
        active = 0
        maximum_active = 0
        counter_lock = Lock()

        def solve(query, args):
            nonlocal active, maximum_active
            with counter_lock:
                active += 1
                maximum_active = max(maximum_active, active)
            sleep(0.05)
            with counter_lock:
                active -= 1
            return response()

        def run(query):
            return service.build_discovery_cached_response(
                query,
                cache_region=FakeCache([None, None]),
                redis_client=redis,
                solve_fn=solve,
            )

        queries = [
            self.query,
            BuildDiscoveryQuery(class_name="Cra", elements=("chance",)),
        ]
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(run, queries))

        self.assertEqual(maximum_active, 1)
        self.assertEqual([result["status"] for result in results], ["complete"] * 2)

    def test_cache_key_is_solver_dataset_and_query_specific(self):
        first = service.build_discovery_app_cache_key(self.query, "dataset-v1")
        other_dataset = service.build_discovery_app_cache_key(self.query, "dataset-v2")
        other_query = service.build_discovery_app_cache_key(
            BuildDiscoveryQuery(class_name="Cra", elements=("strength",)), "dataset-v1"
        )
        self.assertNotEqual(first, other_dataset)
        self.assertNotEqual(first, other_query)
        self.assertTrue(first.startswith("build_discovery_response:cpsat:"))
        self.assertFalse(
            first.startswith("build_discovery_response:build-discovery-prototype")
        )


class ProductionDelegationTest(unittest.TestCase):
    def test_query_defaults_to_limit_five_and_default_max_shared(self):
        schema = importlib.import_module("app.schema")

        query = schema.build_discovery_query_from_args({})

        self.assertEqual(query.limit, 5)
        self.assertEqual(query.max_shared_items, service.DEFAULT_MAX_SHARED_ITEMS)

    def test_graphql_fast_limit_one_delegates_with_fast_lock_wait(self):
        schema = importlib.import_module("app.schema")

        query = Mock(limit=1)
        expected = response()
        with patch.object(
            schema, "build_discovery_query_from_args", return_value=query
        ), patch.object(schema, "require_build_discovery_index"), patch.object(
            schema, "build_discovery_cached_response_hit", return_value=None
        ), patch.object(
            schema, "build_discovery_cached_response", return_value=expected
        ) as delegated:
            result = schema.Query.resolve_build_discovery(
                Mock(), Mock(), class_name="Iop", limit=1
            )

        self.assertIs(result, expected)
        delegated.assert_called_once_with(
            query,
            lock_blocking_timeout_seconds=(
                service.CPSAT_SYNC_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS
            ),
        )

    def test_graphql_uncached_default_query_requires_async_api(self):
        schema = importlib.import_module("app.schema")
        query = Mock(limit=5)
        with patch.object(
            schema, "build_discovery_query_from_args", return_value=query
        ), patch.object(schema, "require_build_discovery_index"), patch.object(
            schema, "build_discovery_cached_response_hit", return_value=None
        ), self.assertRaisesRegex(GraphQLError, "startBuildDiscovery"):
            schema.Query.resolve_build_discovery(Mock(), Mock())

    def test_graphql_cached_default_query_remains_synchronous(self):
        schema = importlib.import_module("app.schema")
        query = Mock(limit=5)
        expected = response()
        with patch.object(
            schema, "build_discovery_query_from_args", return_value=query
        ), patch.object(schema, "require_build_discovery_index"), patch.object(
            schema, "build_discovery_cached_response_hit", return_value=expected
        ), patch.object(schema, "build_discovery_cached_response") as solve:
            result = schema.Query.resolve_build_discovery(Mock(), Mock())

        self.assertIs(result, expected)
        solve.assert_not_called()

    def test_graphql_contention_maps_to_clean_error(self):
        schema = importlib.import_module("app.schema")
        query = Mock(limit=1)
        with patch.object(
            schema, "build_discovery_query_from_args", return_value=query
        ), patch.object(schema, "require_build_discovery_index"), patch.object(
            schema, "build_discovery_cached_response_hit", return_value=None
        ), patch.object(
            schema,
            "build_discovery_cached_response",
            side_effect=service.BuildDiscoverySolveLockTimeout("internal", 200),
        ), self.assertRaisesRegex(GraphQLError, "capacity is busy"):
            schema.Query.resolve_build_discovery(Mock(), Mock(), limit=1)

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

    def test_rq_capacity_contention_retries_with_bounded_backoff(self):
        from app import tasks

        job = Mock(status="queued", request_payload={"queryIdentity": {}})

        class FakeDbSession:
            def query(self, model):
                return self

            def get(self, job_id):
                return job

        @contextmanager
        def fake_session_scope():
            yield FakeDbSession()

        with patch.object(tasks, "session_scope", fake_session_scope), patch.object(
            tasks, "build_discovery_query_from_payload", return_value=Mock()
        ), patch.object(
            tasks,
            "build_discovery_cached_response",
            side_effect=service.BuildDiscoverySolveLockTimeout("capacity", 6000.0),
        ), patch.object(tasks, "sleep") as retry_sleep, patch.object(
            tasks.q, "enqueue"
        ) as enqueue:
            succeeded = tasks.run_build_discovery_job("job-1")

            self.assertFalse(succeeded)
            self.assertEqual(job.status, "queued")
            self.assertEqual(job.progress, 0)
            self.assertTrue(job.error_payload["retryable"])
            self.assertEqual(job.error_payload["lockWaitMs"], 6000.0)
            retry_sleep.assert_called_once_with(
                tasks.BUILD_DISCOVERY_RETRY_DELAYS_SECONDS[0]
            )
            enqueue.assert_called_once_with(
                tasks.run_build_discovery_job,
                "job-1",
                1,
            )
            enqueue.reset_mock()
            succeeded = tasks.run_build_discovery_job(
                "job-1", len(tasks.BUILD_DISCOVERY_RETRY_DELAYS_SECONDS)
            )
            self.assertFalse(succeeded)
            self.assertEqual(job.status, "failed")
            self.assertFalse(job.error_payload["retryable"])
            enqueue.assert_not_called()


if __name__ == "__main__":
    unittest.main()
