"""Shared CP-SAT Build Discovery runner helpers.

The CP-SAT solver is still a milestone/tooling path, not the GraphQL product
path. Keep the speed/quality defaults centralized so scripts do not silently
use different candidate collection behavior.
"""

from __future__ import annotations

import argparse
from typing import Any

from oneoff.build_discovery_prototype import BuildDiscoveryQuery


DEFAULT_FAST_TIME_LIMIT_SECONDS = 2.8
DEFAULT_FAST_WORKERS = 8
DEFAULT_FAST_CANDIDATE_LIMIT = 3
DEFAULT_OBJECTIVE_MODE = "final-linear"
_QUERY_MAX_SHARED_ITEMS = object()


def build_cpsat_args(
    query: BuildDiscoveryQuery,
    *,
    time_limit_seconds: float = DEFAULT_FAST_TIME_LIMIT_SECONDS,
    workers: int = DEFAULT_FAST_WORKERS,
    max_attempts: int = 1,
    candidate_limit: int = DEFAULT_FAST_CANDIDATE_LIMIT,
    summary_limit: int | None = None,
    output_build_limit: int | None = None,
    collection_mode: str = "callback",
    stop_after_candidates: bool = False,
    objective_mode: str = DEFAULT_OBJECTIVE_MODE,
    max_shared_items: int | None | object = _QUERY_MAX_SHARED_ITEMS,
    generic_damage_weight: float | None = None,
) -> argparse.Namespace:
    requested_limit = query.limit or 1
    effective_candidate_limit = max(candidate_limit, requested_limit)
    return argparse.Namespace(
        time_limit_seconds=time_limit_seconds,
        workers=workers,
        max_attempts=max_attempts,
        candidate_limit=effective_candidate_limit,
        summary_limit=summary_limit if summary_limit is not None else effective_candidate_limit,
        output_build_limit=output_build_limit if output_build_limit is not None else requested_limit,
        collection_mode=collection_mode,
        stop_after_candidates=stop_after_candidates,
        objective_mode=objective_mode,
        max_shared_items=(
            query.max_shared_items
            if max_shared_items is _QUERY_MAX_SHARED_ITEMS
            else max_shared_items
        ),
        generic_damage_weight=generic_damage_weight
        if generic_damage_weight is not None
        else query.generic_damage_weight,
    )


def add_cpsat_diagnostics(response: dict[str, Any]) -> dict[str, Any]:
    diagnostics = response.setdefault("diagnostics", {})
    diagnostics.setdefault("solver", "cpsat")
    timings = response.get("timings") if isinstance(response.get("timings"), dict) else {}
    load_ms = timings.get("loadMs", 0) if isinstance(timings.get("loadMs", 0), (int, float)) else 0
    total_search_ms = (
        timings.get("totalSearchMs", 0)
        if isinstance(timings.get("totalSearchMs", 0), (int, float))
        else 0
    )
    diagnostics.setdefault("elapsedMs", round(load_ms + total_search_ms, 1))
    for key in (
        "solverStatus",
        "timings",
        "attempts",
        "itemCount",
        "candidateCount",
        "requestedCandidateLimit",
        "collectionMode",
        "stopAfterCandidates",
        "maxSharedItems",
        "maxSharedItemsEnforced",
        "objectiveWeights",
    ):
        if key in response:
            diagnostics.setdefault(key, response[key])
    response.setdefault("solverVersion", "oneoff.build_discovery_cpsat_experiment")
    return response


def solve_cpsat_query(query: BuildDiscoveryQuery, args: argparse.Namespace) -> dict[str, Any]:
    from oneoff.build_discovery_cpsat_experiment import solve_query

    return add_cpsat_diagnostics(solve_query(query, args))
