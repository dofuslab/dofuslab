"""Shared production defaults and diagnostics for the CP-SAT solver."""

from __future__ import annotations

import argparse
from typing import Any

from oneoff.build_discovery_core import BuildDiscoveryQuery

DEFAULT_FAST_TIME_LIMIT_SECONDS = 3.2
DEFAULT_FAST_WORKERS = 8
DEFAULT_FAST_CANDIDATE_LIMIT = 20
DEFAULT_OBJECTIVE_MODE = "final-linear"
CPSAT_SOLVER_VERSION = "build-discovery-cpsat-v3"
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
        summary_limit=summary_limit
        if summary_limit is not None
        else effective_candidate_limit,
        output_build_limit=output_build_limit
        if output_build_limit is not None
        else requested_limit,
        collection_mode=collection_mode,
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
    timings = (
        response.get("timings") if isinstance(response.get("timings"), dict) else {}
    )
    load_ms = (
        timings.get("loadMs", 0)
        if isinstance(timings.get("loadMs", 0), (int, float))
        else 0
    )
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
        "workers",
        "collectionMode",
        "maxSharedItems",
        "maxSharedItemsEnforced",
        "objectiveWeights",
    ):
        if key in response:
            diagnostics.setdefault(key, response[key])
    response.setdefault("solverVersion", CPSAT_SOLVER_VERSION)
    return response


def solve_cpsat_query(
    query: BuildDiscoveryQuery, args: argparse.Namespace
) -> dict[str, Any]:
    from oneoff.build_discovery_cpsat_solver import solve_query

    return add_cpsat_diagnostics(solve_query(query, args))
