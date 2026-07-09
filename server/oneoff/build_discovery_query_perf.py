"""Measure Build Discovery query response timings."""

from __future__ import annotations

import argparse
import json
import os
import time
from dataclasses import replace
from statistics import mean
from typing import Any

from oneoff import build_discovery_prototype
from oneoff.build_discovery_prototype import (
    BuildDiscoveryQuery,
    build_discovery_response,
    clear_build_discovery_response_cache,
)

MAX_RUNS = 20
MAX_LIMIT = 20
MAX_TOP_K = 100
MAX_BEAM_WIDTH = 1000
MAX_PER_SIGNATURE_CAP = 200
MAX_RELEVANT_SET_LIMIT = 200
SUPPORTED_IOP_ELEMENTS = ("strength", "intelligence", "chance", "agility")


def percentile(values: list[float], percentile_value: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, int(round((len(ordered) - 1) * percentile_value))))
    return ordered[index]


def timing_summary(values: list[float]) -> dict[str, float]:
    if not values:
        return {"minMs": 0.0, "avgMs": 0.0, "p95Ms": 0.0, "maxMs": 0.0}
    return {
        "minMs": round(min(values), 1),
        "avgMs": round(mean(values), 1),
        "p95Ms": round(percentile(values, 0.95), 1),
        "maxMs": round(max(values), 1),
    }


def measure_query(query: BuildDiscoveryQuery, runs: int, use_cache: bool) -> dict[str, Any]:
    clear_build_discovery_response_cache()
    timings = []
    cache_hits = 0
    last_response: dict[str, Any] | None = None
    for _ in range(runs):
        started = time.perf_counter()
        last_response = build_discovery_response(query, use_cache=use_cache)
        timings.append((time.perf_counter() - started) * 1000)
        if last_response.get("diagnostics", {}).get("cacheHit"):
            cache_hits += 1

    return {
        "runs": runs,
        "cacheEnabled": use_cache,
        "cacheHits": cache_hits,
        "timings": timing_summary(timings),
        "resultCount": (last_response or {}).get("diagnostics", {}).get("resultCount", 0),
        "cacheKey": (last_response or {}).get("cacheKey"),
    }


def measure_element_matrix(
    query: BuildDiscoveryQuery,
    runs: int,
    use_cache: bool,
    elements: tuple[str, ...] = SUPPORTED_IOP_ELEMENTS,
) -> dict[str, Any]:
    results = []
    for element in elements:
        element_query = replace(query, elements=(element,))
        report = measure_query(element_query, runs, use_cache)
        results.append({"element": element, **report})

    return {
        "elements": list(elements),
        "runs": runs,
        "cacheEnabled": use_cache,
        "results": results,
    }


def validate_cli_bounds(parser: argparse.ArgumentParser, args: argparse.Namespace) -> None:
    bounded_values = (
        ("--runs", args.runs, 1, MAX_RUNS),
        ("--limit", args.limit, 1, MAX_LIMIT),
        ("--top-k", args.top_k, 1, MAX_TOP_K),
        ("--beam-width", args.beam_width, 1, MAX_BEAM_WIDTH),
        ("--per-signature-cap", args.per_signature_cap, 1, MAX_PER_SIGNATURE_CAP),
        ("--relevant-set-limit", args.relevant_set_limit, 1, MAX_RELEVANT_SET_LIMIT),
    )
    for flag, value, minimum, maximum in bounded_values:
        if value < minimum or value > maximum:
            parser.error(f"{flag} must be between {minimum} and {maximum}.")


def validate_index_source(parser: argparse.ArgumentParser, allow_db: bool) -> None:
    index_path = build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH
    if index_path and os.path.exists(index_path):
        return
    if allow_db:
        return
    parser.error(
        "No build discovery index exists at BUILD_DISCOVERY_INDEX_PATH "
        f"({index_path or '<empty>'}). Generate a local JSON index or pass --allow-db."
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--no-cache", action="store_true")
    parser.add_argument(
        "--element-matrix",
        action="store_true",
        help="Measure the bounded supported Iop element matrix.",
    )
    parser.add_argument(
        "--allow-db",
        action="store_true",
        help="Allow prototype DB fallback when no generated index is available.",
    )
    parser.add_argument("--element", default="strength")
    parser.add_argument("--target-ap", type=int, default=11)
    parser.add_argument("--target-mp", type=int, default=6)
    parser.add_argument("--target-range", type=int, default=0)
    parser.add_argument("--budget-tier", type=int, default=2)
    parser.add_argument("--exo-policy", choices=("none", "allow", "opti"), default="allow")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--top-k", type=int, default=25)
    parser.add_argument("--beam-width", type=int, default=250)
    parser.add_argument("--per-signature-cap", type=int, default=40)
    parser.add_argument("--relevant-set-limit", type=int, default=60)
    args = parser.parse_args()
    validate_cli_bounds(parser, args)
    validate_index_source(parser, args.allow_db)

    query = BuildDiscoveryQuery(
        elements=(args.element,),
        ap_target=args.target_ap,
        mp_target=args.target_mp,
        range_target=args.target_range,
        budget_tier=args.budget_tier,
        exo_policy=args.exo_policy,
        limit=args.limit,
        top_k=args.top_k,
        beam_width=args.beam_width,
        per_signature_cap=args.per_signature_cap,
        relevant_set_limit=args.relevant_set_limit,
    )
    if args.element_matrix:
        report = measure_element_matrix(query, args.runs, not args.no_cache)
    else:
        report = measure_query(query, args.runs, not args.no_cache)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
