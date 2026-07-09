"""Measure Build Discovery query response timings."""

from __future__ import annotations

import argparse
import json
import time
from statistics import mean
from typing import Any

from oneoff.build_discovery_prototype import (
    BuildDiscoveryQuery,
    build_discovery_response,
    clear_build_discovery_response_cache,
)


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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--no-cache", action="store_true")
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
    print(json.dumps(measure_query(query, args.runs, not args.no_cache), indent=2))


if __name__ == "__main__":
    main()
