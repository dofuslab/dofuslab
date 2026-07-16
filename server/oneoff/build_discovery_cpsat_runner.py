"""Shared production defaults and diagnostics for the CP-SAT solver."""

from __future__ import annotations

import argparse
import copy
from typing import Any

from oneoff.build_discovery_core import BuildDiscoveryQuery

DEFAULT_FAST_TIME_LIMIT_SECONDS = 3.2
DEFAULT_RELEASE_TIME_LIMIT_SECONDS = 6.0
DEFAULT_FAST_WORKERS = 2
DEFAULT_FAST_CANDIDATE_LIMIT = 20
DEFAULT_OBJECTIVE_MODE = "final-linear"
DEFAULT_OBJECTIVE_MODES = ("final-linear", "final-linear-crit-neutral")
CPSAT_SOLVER_VERSION = "build-discovery-cpsat-v4"
_QUERY_MAX_SHARED_ITEMS = object()


def build_cpsat_args(
    query: BuildDiscoveryQuery,
    *,
    time_limit_seconds: float = DEFAULT_RELEASE_TIME_LIMIT_SECONDS,
    workers: int = DEFAULT_FAST_WORKERS,
    max_attempts: int = 1,
    candidate_limit: int = DEFAULT_FAST_CANDIDATE_LIMIT,
    summary_limit: int | None = None,
    output_build_limit: int | None = None,
    collection_mode: str = "callback",
    objective_mode: str = DEFAULT_OBJECTIVE_MODE,
    objective_modes: tuple[str, ...] | None = DEFAULT_OBJECTIVE_MODES,
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
        objective_modes=objective_modes or (objective_mode,),
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
        "objectiveLanes",
    ):
        if key in response:
            diagnostics.setdefault(key, response[key])
    response.setdefault("solverVersion", CPSAT_SOLVER_VERSION)
    return response


def solve_cpsat_query(
    query: BuildDiscoveryQuery, args: argparse.Namespace
) -> dict[str, Any]:
    from oneoff.build_discovery_cpsat_solver import solve_query

    objective_modes = tuple(
        getattr(args, "objective_modes", None) or (args.objective_mode,)
    )
    lane_responses = []
    for objective_mode in objective_modes:
        lane_args = copy.copy(args)
        lane_args.objective_mode = objective_mode
        lane_args.objective_modes = (objective_mode,)
        lane_responses.append((objective_mode, solve_query(query, lane_args)))
    return add_cpsat_diagnostics(merge_objective_lane_responses(lane_responses, args))


def serialized_build_signature(build: dict[str, Any]) -> tuple:
    item_ids = frozenset(
        item.get("id")
        for item in (build.get("items") or {}).values()
        if item.get("id") is not None
    )
    exos = tuple(
        sorted(
            (
                stat,
                exo.get("itemId") if isinstance(exo, dict) else exo,
                exo.get("slot") if isinstance(exo, dict) else None,
            )
            for stat, exo in (build.get("exos") or {}).items()
        )
    )
    return item_ids, exos


def merge_objective_lane_responses(
    lane_responses: list[tuple[str, dict[str, Any]]],
    args: argparse.Namespace,
) -> dict[str, Any]:
    lane_builds: list[tuple[dict[str, Any], dict[str, Any]]] = []
    for _mode, response in lane_responses:
        for build in response.get("builds") or []:
            lane_builds.append((build, response))
    lane_builds.sort(key=lambda item: item[0].get("score", float("-inf")), reverse=True)
    ranked: list[tuple[dict[str, Any], dict[str, Any]]] = []
    seen_signatures = set()
    for build, response in lane_builds:
        signature = serialized_build_signature(build)
        if signature in seen_signatures:
            continue
        seen_signatures.add(signature)
        ranked.append((build, response))

    selected: list[tuple[dict[str, Any], dict[str, Any]]] = []
    max_shared_items = getattr(args, "max_shared_items", None)
    for build, response in ranked:
        item_ids = serialized_build_signature(build)[0]
        if max_shared_items is not None and any(
            len(item_ids & serialized_build_signature(existing)[0]) > max_shared_items
            for existing, _existing_response in selected
        ):
            continue
        selected.append((build, response))
        if len(selected) >= args.output_build_limit:
            break

    complete_responses = [
        response
        for _mode, response in lane_responses
        if response.get("status") == "complete"
    ]
    base_response = (
        selected[0][1]
        if selected
        else (complete_responses or [lane_responses[0][1]])[0]
    )
    merged = copy.deepcopy(base_response)
    merged["query"]["objectiveMode"] = "+".join(
        mode for mode, _response in lane_responses
    )
    merged["objectiveLanes"] = [
        {
            "objectiveMode": mode,
            "status": response.get("status"),
            "solverStatus": response.get("solverStatus"),
            "candidateCount": response.get("candidateCount", 0),
            "timings": response.get("timings", {}),
            "objectiveWeights": response.get("objectiveWeights", {}),
        }
        for mode, response in lane_responses
    ]
    merged["attempts"] = [
        {**attempt, "objectiveMode": mode}
        for mode, response in lane_responses
        for attempt in response.get("attempts", [])
    ]
    merged["timings"] = {
        "loadMs": round(
            sum(
                (response.get("timings") or {}).get("loadMs", 0)
                for _, response in lane_responses
            ),
            1,
        ),
        "totalSearchMs": round(
            sum(
                (response.get("timings") or {}).get("totalSearchMs", 0)
                for _, response in lane_responses
            ),
            1,
        ),
        "lanes": {
            mode: response.get("timings", {}) for mode, response in lane_responses
        },
    }
    merged["candidateCount"] = len(ranked)
    merged["warnings"] = list(
        dict.fromkeys(
            warning
            for _mode, response in lane_responses
            for warning in response.get("warnings", [])
        )
    )
    if selected:
        merged["status"] = "complete"
        merged["build"] = selected[0][0]
        merged["builds"] = [build for build, _response in selected]
    else:
        merged["status"] = "no_valid_build"
        merged.pop("build", None)
        merged.pop("builds", None)
        merged.pop("effectiveScoringStats", None)
    merged.pop("candidateSummaries", None)
    return merged
