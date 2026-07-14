import importlib
import unittest
from concurrent.futures import ThreadPoolExecutor
from threading import Condition, Lock
from time import monotonic, sleep
from unittest.mock import Mock, patch

from graphql import GraphQLError
from redis.exceptions import LockError

from app import build_discovery_service as service
from oneoff.build_discovery_core import BuildDiscoveryQuery


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
        self.assertEqual(args.time_limit_seconds, 3.2)
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
        self.assertTrue(result["cacheKey"].startswith(service.CPSAT_CACHE_PREFIX))
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
    def test_product_input_maps_to_query_without_public_solver_tuning(self):
        graphql = importlib.import_module("app.build_discovery_graphql")
        input_value = Mock(
            class_name="Iop",
            level=200,
            element="strength",
            ap_target=11,
            mp_target=6,
            range_target=None,
            damage_survivability_preset=3,
            budget_tier=2,
            exo_policy="allow",
            weapon_policy="stat_stick_allowed",
            locked_item_ids=[],
            avoided_item_ids=[],
            result_limit=3,
            max_shared_items=service.DEFAULT_MAX_SHARED_ITEMS,
        )

        query = graphql.build_discovery_query_from_input(input_value)

        self.assertEqual(query.elements, ("strength",))
        self.assertEqual(query.mode, "pvm")
        self.assertEqual(query.limit, 3)
        self.assertEqual(query.max_shared_items, service.DEFAULT_MAX_SHARED_ITEMS)

    def test_product_input_bounds_locked_and_avoided_item_controls(self):
        graphql = importlib.import_module("app.build_discovery_graphql")
        input_value = Mock(
            class_name="Iop",
            level=200,
            element="strength",
            ap_target=11,
            mp_target=6,
            range_target=None,
            damage_survivability_preset=3,
            budget_tier=2,
            exo_policy="allow",
            weapon_policy="stat_stick_allowed",
            locked_item_ids=[],
            avoided_item_ids=[],
            result_limit=3,
            max_shared_items=service.DEFAULT_MAX_SHARED_ITEMS,
        )

        for attribute, public_name in (
            ("locked_item_ids", "lockedItemIds"),
            ("avoided_item_ids", "avoidedItemIds"),
        ):
            with self.subTest(attribute=attribute):
                setattr(
                    input_value,
                    attribute,
                    [
                        str(index)
                        for index in range(graphql.MAX_ITEM_CONTROLS + 1)
                    ],
                )
                with self.assertRaisesRegex(
                    GraphQLError,
                    f"{public_name} cannot contain more than "
                    f"{graphql.MAX_ITEM_CONTROLS} items",
                ):
                    graphql.build_discovery_query_from_input(input_value)
                setattr(input_value, attribute, [])


if __name__ == "__main__":
    unittest.main()
