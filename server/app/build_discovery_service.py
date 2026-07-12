"""Production integration boundary for CP-SAT Build Discovery."""

from copy import deepcopy
import hashlib
import json
from threading import Event, Thread
from time import monotonic

from redis.exceptions import LockError

from dogpile.cache.api import NO_VALUE

from oneoff.build_discovery_cpsat_runner import (
    DEFAULT_FAST_TIME_LIMIT_SECONDS,
    build_cpsat_args,
    solve_cpsat_query,
)
from oneoff.build_discovery_prototype import (
    BuildDiscoveryQuery,
    DEFAULT_MAX_SHARED_ITEMS,
    dataset_version,
    query_cache_identity,
)


CPSAT_SOLVER_VERSION = "build-discovery-cpsat-production-v1"
CPSAT_TIME_LIMIT_SECONDS = DEFAULT_FAST_TIME_LIMIT_SECONDS
CPSAT_WORKERS = 2
CPSAT_SOLVE_LOCK_KEY = "build_discovery:cpsat:solve_lock"
CPSAT_SOLVE_LOCK_TIMEOUT_SECONDS = 30
CPSAT_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS = 6
CPSAT_SYNC_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS = 0.2
CPSAT_CACHE_PREFIX = "build_discovery_response:cpsat:"


class BuildDiscoverySolveLockTimeout(RuntimeError):
    def __init__(self, message, lock_wait_ms):
        super().__init__(message)
        self.lock_wait_ms = lock_wait_ms


class BuildDiscoverySolveLockLost(RuntimeError):
    pass


def compact_product_response(response):
    """Remove solver-only debug data before Redis and GraphQL serialization."""
    result = dict(response)
    for key in (
        "build",
        "candidateSummaries",
        "effectiveScoringStats",
        "objectiveWeights",
    ):
        result.pop(key, None)
    result["attempts"] = [
        {
            key: attempt[key]
            for key in ("attempt", "mode", "status", "modelMs", "solveMs", "objective")
            if key in attempt
        }
        for attempt in result.get("attempts") or ()
    ]
    return result


class _RenewableSolveLock:
    def __init__(self, lock, lease_seconds, renewal_interval_seconds=None):
        self.lock = lock
        self.renewal_interval_seconds = renewal_interval_seconds or lease_seconds / 3.0
        self.stop_event = Event()
        self.renewal_error = None
        self.thread = None

    def start(self):
        self.thread = Thread(
            target=self._renew,
            name="build-discovery-solve-lock-renewal",
            daemon=True,
        )
        self.thread.start()

    def _renew(self):
        while not self.stop_event.wait(self.renewal_interval_seconds):
            try:
                if not self.lock.extend(self.renewal_interval_seconds * 3.0):
                    raise LockError("solve lock renewal was rejected")
            except Exception as error:
                self.renewal_error = error
                self.stop_event.set()
                return

    def stop_and_join(self):
        self.stop_event.set()
        if self.thread is not None:
            self.thread.join()

    def raise_if_lost(self):
        if self.renewal_error is not None:
            raise BuildDiscoverySolveLockLost(
                "CP-SAT solve lock ownership could not be renewed."
            ) from self.renewal_error


def build_discovery_query_from_payload(payload):
    query_payload = (
        (payload or {}).get("queryIdentity") or (payload or {}).get("query") or {}
    )
    return BuildDiscoveryQuery(
        class_name=query_payload.get("className", "Iop"),
        level=query_payload.get("level", 200),
        elements=tuple(query_payload.get("elements", ("strength",))),
        mode=query_payload.get("mode", "pvm"),
        ap_target=query_payload.get("apTarget", 11),
        mp_target=query_payload.get("mpTarget", 6),
        range_target=query_payload.get("rangeTarget", 0),
        damage_survivability_preset=query_payload.get("damageSurvivabilityPreset", 3),
        budget_tier=query_payload.get("budgetTier", 2),
        exo_policy=query_payload.get("exoPolicy", "allow"),
        weapon_policy=query_payload.get("weaponPolicy", "stat_stick_allowed"),
        locked_item_ids=tuple(query_payload.get("lockedItemIds", ())),
        avoided_item_ids=tuple(query_payload.get("avoidedItemIds", ())),
        limit=query_payload.get("limit", 5),
        top_k=query_payload.get("topK", 25),
        beam_width=query_payload.get("beamWidth", 250),
        per_signature_cap=query_payload.get("perSignatureCap", 40),
        relevant_set_limit=query_payload.get("relevantSetLimit", 60),
        max_shared_items=query_payload.get("maxSharedItems", DEFAULT_MAX_SHARED_ITEMS),
    )


def build_discovery_app_cache_key(query, current_dataset_version=None):
    dataset = current_dataset_version or dataset_version()
    payload = {
        "solverVersion": CPSAT_SOLVER_VERSION,
        "datasetVersion": dataset,
        "query": query_cache_identity(query),
    }
    digest = hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    return CPSAT_CACHE_PREFIX + digest


def _cached_value(cache_region, cache_key):
    response = cache_region.get(cache_key)
    return None if response is None or response is NO_VALUE else response


def _with_cache_diagnostics(response, status, lock_acquired=False, lock_wait_ms=0.0):
    result = deepcopy(response)
    result["solver"] = "cpsat"
    result["solverVersion"] = CPSAT_SOLVER_VERSION
    result["cache"] = {
        **result.get("cache", {}),
        "status": status,
        "storage": "app_cache",
        "solver": "cpsat",
    }
    diagnostics = result.setdefault("diagnostics", {})
    diagnostics["solver"] = "cpsat"
    diagnostics["cacheStatus"] = status
    diagnostics["appCacheHit"] = status in {"hit", "deduplicated"}
    diagnostics["solveLockAcquired"] = lock_acquired
    diagnostics["lockWaitMs"] = round(lock_wait_ms, 3)
    if status == "hit":
        diagnostics["cacheHit"] = True
        diagnostics["elapsedMs"] = 0.0
    elif status == "deduplicated":
        diagnostics["cacheHit"] = True
    return result


def build_discovery_cached_response_hit(query, cache_region=None):
    if cache_region is None:
        from app import cache_region as app_cache_region

        cache_region = app_cache_region
    cached = _cached_value(cache_region, build_discovery_app_cache_key(query))
    if cached is None:
        return None
    return _with_cache_diagnostics(cached, "hit")


def build_discovery_cached_response(
    query,
    cache_region=None,
    redis_client=None,
    solve_fn=solve_cpsat_query,
    lock_blocking_timeout_seconds=CPSAT_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS,
    lock_timeout_seconds=CPSAT_SOLVE_LOCK_TIMEOUT_SECONDS,
    lock_renewal_interval_seconds=None,
):
    if cache_region is None or redis_client is None:
        from app import cache as app_redis_client, cache_region as app_cache_region

        cache_region = cache_region or app_cache_region
        redis_client = redis_client or app_redis_client

    cache_key = build_discovery_app_cache_key(query)
    cached = _cached_value(cache_region, cache_key)
    if cached is not None:
        return _with_cache_diagnostics(cached, "hit")

    solve_lock = redis_client.lock(
        CPSAT_SOLVE_LOCK_KEY,
        timeout=lock_timeout_seconds,
        blocking_timeout=lock_blocking_timeout_seconds,
        thread_local=False,
    )
    lock_wait_started = monotonic()
    if not solve_lock.acquire(blocking=True):
        lock_wait_ms = (monotonic() - lock_wait_started) * 1000.0
        raise BuildDiscoverySolveLockTimeout(
            "CP-SAT solve capacity unavailable after "
            f"{lock_blocking_timeout_seconds}s.",
            lock_wait_ms=lock_wait_ms,
        )
    lock_wait_ms = (monotonic() - lock_wait_started) * 1000.0
    renewable_lock = _RenewableSolveLock(
        solve_lock, lock_timeout_seconds, lock_renewal_interval_seconds
    )
    renewable_lock.start()
    try:
        cached = _cached_value(cache_region, cache_key)
        if cached is not None:
            return _with_cache_diagnostics(
                cached,
                "deduplicated",
                lock_acquired=True,
                lock_wait_ms=lock_wait_ms,
            )

        args = build_cpsat_args(
            query,
            time_limit_seconds=CPSAT_TIME_LIMIT_SECONDS,
            workers=CPSAT_WORKERS,
        )
        solved = compact_product_response(solve_fn(query, args))
        renewable_lock.stop_and_join()
        renewable_lock.raise_if_lost()
        response = _with_cache_diagnostics(
            solved,
            "miss",
            lock_acquired=True,
            lock_wait_ms=lock_wait_ms,
        )
        cache_region.set(cache_key, response)
        return response
    finally:
        renewable_lock.stop_and_join()
        try:
            solve_lock.release()
        except LockError:
            # Redis locks release by token, so an expired/reassigned lock is never
            # deleted by its former owner.
            pass
