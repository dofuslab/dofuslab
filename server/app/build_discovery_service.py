"""Production integration boundary for CP-SAT Build Discovery."""

from copy import deepcopy
import hashlib
import json

from dogpile.cache.api import NO_VALUE

from oneoff.build_discovery_cpsat_runner import build_cpsat_args, solve_cpsat_query
from oneoff.build_discovery_prototype import (
    BuildDiscoveryQuery,
    DEFAULT_MAX_SHARED_ITEMS,
    dataset_version,
    query_cache_identity,
)


CPSAT_SOLVER_VERSION = "build-discovery-cpsat-production-v1"
CPSAT_TIME_LIMIT_SECONDS = 2.8
CPSAT_WORKERS = 2
CPSAT_SOLVE_LOCK_KEY = "build_discovery:cpsat:solve_lock"
CPSAT_SOLVE_LOCK_TIMEOUT_SECONDS = 30
CPSAT_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS = 6
CPSAT_CACHE_PREFIX = "build_discovery_response:cpsat:"


class BuildDiscoverySolveLockTimeout(RuntimeError):
    pass


def build_discovery_query_from_payload(payload):
    query_payload = (payload or {}).get("queryIdentity") or (payload or {}).get("query") or {}
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


def _with_cache_diagnostics(response, status, lock_acquired=False):
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
    if diagnostics["appCacheHit"]:
        diagnostics["cacheHit"] = True
        diagnostics["elapsedMs"] = 0.0
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
        timeout=CPSAT_SOLVE_LOCK_TIMEOUT_SECONDS,
        blocking_timeout=CPSAT_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS,
    )
    if not solve_lock.acquire(blocking=True):
        raise BuildDiscoverySolveLockTimeout(
            "CP-SAT solve capacity unavailable after "
            f"{CPSAT_SOLVE_LOCK_BLOCKING_TIMEOUT_SECONDS}s."
        )
    try:
        cached = _cached_value(cache_region, cache_key)
        if cached is not None:
            return _with_cache_diagnostics(cached, "deduplicated", lock_acquired=True)

        args = build_cpsat_args(
            query,
            time_limit_seconds=CPSAT_TIME_LIMIT_SECONDS,
            workers=CPSAT_WORKERS,
        )
        response = _with_cache_diagnostics(
            solve_fn(query, args), "miss", lock_acquired=True
        )
        cache_region.set(cache_key, response)
        return response
    finally:
        solve_lock.release()
