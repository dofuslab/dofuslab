"""Generate benchmark-keyed Build Discovery outputs for comparison reports."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_benchmark_report import BENCHMARKS  # noqa: E402
from oneoff.build_discovery_prototype import (  # noqa: E402
    DEFAULT_MAX_SHARED_ITEMS,
    GENERIC_DAMAGE_WEIGHT,
    WEAPON_DAMAGE_WEIGHT,
    BuildDiscoveryQuery,
    build_discovery_response,
    query_summary,
)

REPORT_VERSION = "build-discovery-benchmark-generated-results-v1"


def query_for_benchmark(
    benchmark,
    args: argparse.Namespace,
) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        elements=(benchmark.element,),
        ap_target=benchmark.target.ap,
        mp_target=benchmark.target.mp,
        range_target=benchmark.target.range,
        budget_tier=args.budget_tier,
        exo_policy=args.exo_policy,
        limit=args.limit,
        top_k=args.top_k,
        beam_width=args.beam_width,
        per_signature_cap=args.per_signature_cap,
        relevant_set_limit=args.relevant_set_limit,
        max_shared_items=args.max_shared_items,
        generic_damage_weight=args.generic_damage_weight,
        weapon_damage_weight=args.weapon_damage_weight,
    )


def build_generated_results(args: argparse.Namespace) -> dict[str, Any]:
    benchmark_results = {}
    for benchmark in BENCHMARKS:
        query = query_for_benchmark(benchmark, args)
        response = build_discovery_response(query, use_cache=True)
        benchmark_results[benchmark.id] = {
            "benchmarkId": benchmark.id,
            "query": query_summary(query),
            "builds": response.get("builds", []),
            "diagnostics": response.get("diagnostics", {}),
            "cache": response.get("cache", {}),
            "warnings": response.get("warnings", []),
        }

    return {
        "reportVersion": REPORT_VERSION,
        "benchmarks": benchmark_results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", help="Write generated benchmark results to this path.")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--top-k", type=int, default=25)
    parser.add_argument("--beam-width", type=int, default=250)
    parser.add_argument("--per-signature-cap", type=int, default=40)
    parser.add_argument("--relevant-set-limit", type=int, default=60)
    parser.add_argument("--budget-tier", type=int, default=4)
    parser.add_argument("--exo-policy", choices=("none", "allow", "opti"), default="opti")
    parser.add_argument("--max-shared-items", type=int, default=DEFAULT_MAX_SHARED_ITEMS)
    parser.add_argument("--generic-damage-weight", type=float, default=GENERIC_DAMAGE_WEIGHT)
    parser.add_argument("--weapon-damage-weight", type=float, default=WEAPON_DAMAGE_WEIGHT)
    args = parser.parse_args()

    output = json.dumps(build_generated_results(args), indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(output)
            file.write("\n")
    else:
        print(output)


if __name__ == "__main__":
    main()
