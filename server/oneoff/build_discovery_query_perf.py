"""Measure Build Discovery query response timings."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import replace
from statistics import mean
from typing import Any

from oneoff import build_discovery_prototype
from oneoff.build_discovery_prototype import (
    BuildDiscoveryQuery,
    ELEMENT_PROFILES,
    build_discovery_response,
    clear_build_discovery_response_cache,
    query_cache_identity,
)

REPORT_VERSION = "build-discovery-local-query-validation-v1"
SUITE_REPORT_VERSION = "build-discovery-local-query-regression-suite-v1"
MAX_RUNS = 20
MAX_LIMIT = 20
MAX_TOP_K = 100
MAX_BEAM_WIDTH = 1000
MAX_PER_SIGNATURE_CAP = 200
MAX_RELEVANT_SET_LIMIT = 200
DEFAULT_P95_THRESHOLD_MS = 5000.0
SUPPORTED_IOP_ELEMENTS = ("strength", "intelligence", "chance", "agility")
LOCAL_VALIDATION_PROFILE_ID = "iop_element_matrix_11_6_0_budget4_exo_allow"
LOCAL_VALIDATION_PROFILE_LABEL = "Iop element matrix 11/6/0 budget tier 4 exo allow"
LOCAL_VALIDATION_QUERY = BuildDiscoveryQuery(
    ap_target=11,
    mp_target=6,
    range_target=0,
    budget_tier=4,
    exo_policy="allow",
    limit=3,
    top_k=10,
    beam_width=75,
    per_signature_cap=20,
    relevant_set_limit=60,
)
LOCAL_VALIDATION_SUITE_ID = "iop_element_matrix_11_6_0_and_12_6_0_budget4_exo_allow"
LOCAL_VALIDATION_SUITE_LABEL = "Iop element matrix 11/6/0 and 12/6/0 budget tier 4 exo allow"
LOCAL_VALIDATION_SUITE_PROFILES = (
    {
        "id": LOCAL_VALIDATION_PROFILE_ID,
        "label": LOCAL_VALIDATION_PROFILE_LABEL,
        "query": LOCAL_VALIDATION_QUERY,
    },
    {
        "id": "iop_element_matrix_12_6_0_budget4_exo_allow",
        "label": "Iop element matrix 12/6/0 budget tier 4 exo allow",
        "query": replace(LOCAL_VALIDATION_QUERY, ap_target=12),
    },
)
LOCAL_SUITE_FIXTURE_VERSION = "build-discovery-local-query-suite-fixture-v1"


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


def clear_prototype_data_caches() -> None:
    for function_name in ("load_build_discovery_index", "load_all_item_records", "load_sets"):
        cache_clear = getattr(getattr(build_discovery_prototype, function_name, None), "cache_clear", None)
        if cache_clear:
            cache_clear()
    clear_build_discovery_response_cache()


def configure_index_path(index_path: str | None) -> None:
    if index_path is None:
        return
    build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH = index_path
    clear_prototype_data_caches()


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


def expected_element_profile(element: str) -> dict[str, Any]:
    profile = ELEMENT_PROFILES[element]
    return {
        "primaryStat": profile.primary_stat,
        "damageStat": profile.damage_stat,
        "damageElement": profile.element,
        "secondaryDamageStats": sorted(profile.secondary_damage_weights),
    }


def local_validation_query_summary(
    query: BuildDiscoveryQuery,
    elements: tuple[str, ...] = SUPPORTED_IOP_ELEMENTS,
) -> dict[str, Any]:
    summary = query_cache_identity(query)
    summary["elements"] = list(elements)
    return summary


def validation_failures(row: dict[str, Any], p95_threshold_ms: float) -> list[str]:
    failures = []
    if row.get("resultCount", 0) <= 0:
        failures.append("empty_results")
    p95_ms = row.get("timings", {}).get("p95Ms", 0.0)
    if p95_ms > p95_threshold_ms:
        failures.append("p95_threshold_exceeded")
    return failures


def validate_local_element_matrix(
    query: BuildDiscoveryQuery = LOCAL_VALIDATION_QUERY,
    runs: int = 1,
    use_cache: bool = False,
    p95_threshold_ms: float = DEFAULT_P95_THRESHOLD_MS,
    elements: tuple[str, ...] = SUPPORTED_IOP_ELEMENTS,
    profile_id: str = LOCAL_VALIDATION_PROFILE_ID,
    profile_label: str = LOCAL_VALIDATION_PROFILE_LABEL,
) -> dict[str, Any]:
    matrix = measure_element_matrix(query, runs, use_cache, elements=elements)
    rows_by_element = {row["element"]: row for row in matrix["results"]}
    results = []
    for element in elements:
        row = rows_by_element.get(element)
        if row is None:
            results.append(
                {
                    "element": element,
                    "runs": runs,
                    "cacheEnabled": use_cache,
                    "cacheHits": 0,
                    "timings": {},
                    "resultCount": 0,
                    "expectedProfile": expected_element_profile(element),
                    "validation": {
                        "status": "fail",
                        "failures": ["missing_element_result"],
                    },
                }
            )
            continue
        failures = validation_failures(row, p95_threshold_ms)
        results.append(
            {
                **row,
                "expectedProfile": expected_element_profile(element),
                "validation": {
                    "status": "fail" if failures else "pass",
                    "failures": failures,
                },
            }
        )

    status = "fail" if any(row["validation"]["failures"] for row in results) else "pass"
    return {
        "reportVersion": REPORT_VERSION,
        "status": status,
        "profile": {
            "id": profile_id,
            "label": profile_label,
            "source": "generated_json_index_local_smoke",
            "assumption": "All supported Iop elements should return at least one build for this bounded profile.",
        },
        "index": {
            "path": build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH,
            "source": "generated_json_index",
        },
        "thresholds": {
            "p95Ms": p95_threshold_ms,
        },
        "queryParams": local_validation_query_summary(query, elements=elements),
        "expectedProfiles": {
            element: expected_element_profile(element)
            for element in elements
        },
        "runs": runs,
        "cacheEnabled": use_cache,
        "results": results,
    }


def validate_local_query_suite(
    runs: int = 1,
    use_cache: bool = False,
    p95_threshold_ms: float = DEFAULT_P95_THRESHOLD_MS,
    elements: tuple[str, ...] = SUPPORTED_IOP_ELEMENTS,
) -> dict[str, Any]:
    profile_reports = [
        validate_local_element_matrix(
            query=profile["query"],
            runs=runs,
            use_cache=use_cache,
            p95_threshold_ms=p95_threshold_ms,
            elements=elements,
            profile_id=profile["id"],
            profile_label=profile["label"],
        )
        for profile in LOCAL_VALIDATION_SUITE_PROFILES
    ]
    status = "fail" if any(profile["status"] != "pass" for profile in profile_reports) else "pass"
    return {
        "reportVersion": SUITE_REPORT_VERSION,
        "status": status,
        "suite": {
            "id": LOCAL_VALIDATION_SUITE_ID,
            "label": LOCAL_VALIDATION_SUITE_LABEL,
            "source": "generated_json_index_local_smoke",
            "assumption": "Supported Iop 11/6/0 and 12/6/0 element profiles should return at least one build under the fresh-query threshold.",
        },
        "index": {
            "path": build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH,
            "source": "generated_json_index",
        },
        "thresholds": {
            "p95Ms": p95_threshold_ms,
        },
        "runs": runs,
        "cacheEnabled": use_cache,
        "elements": list(elements),
        "profiles": profile_reports,
    }


def normalized_local_suite_fixture(report: dict[str, Any]) -> dict[str, Any]:
    profiles = []
    for profile in report.get("profiles", []):
        rows = []
        for row in profile.get("results", []):
            rows.append(
                {
                    "element": row.get("element"),
                    "resultPresent": row.get("resultCount", 0) > 0,
                    "cacheMetadataPresent": {
                        "cacheEnabled": "cacheEnabled" in row,
                        "cacheHits": "cacheHits" in row,
                        "cacheKey": "cacheKey" in row,
                    },
                    "validation": row.get("validation", {}),
                    "expectedProfile": row.get("expectedProfile", {}),
                }
            )
        profiles.append(
            {
                "reportVersion": profile.get("reportVersion"),
                "status": profile.get("status"),
                "profile": profile.get("profile"),
                "queryParams": profile.get("queryParams"),
                "expectedProfiles": profile.get("expectedProfiles"),
                "results": rows,
            }
        )

    return {
        "fixtureVersion": LOCAL_SUITE_FIXTURE_VERSION,
        "reportVersion": report.get("reportVersion"),
        "status": report.get("status"),
        "suite": report.get("suite"),
        "thresholds": report.get("thresholds"),
        "runs": report.get("runs"),
        "cacheEnabled": report.get("cacheEnabled"),
        "elements": report.get("elements"),
        "profiles": profiles,
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


def validate_index_source(
    parser: argparse.ArgumentParser,
    allow_db: bool,
    show_allow_db_hint: bool = True,
) -> None:
    index_path = build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH
    if index_path and os.path.exists(index_path):
        return
    if allow_db:
        return
    message = (
        "No build discovery index exists at BUILD_DISCOVERY_INDEX_PATH "
        f"({index_path or '<empty>'}). Generate a local JSON index"
    )
    if show_allow_db_hint:
        message += " or pass --allow-db"
    parser.error(f"{message}.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument(
        "--index-path",
        help="Generated JSON index path to use for local query validation or measurement.",
    )
    parser.add_argument("--no-cache", action="store_true")
    parser.add_argument(
        "--element-matrix",
        action="store_true",
        help="Measure the bounded supported Iop element matrix.",
    )
    parser.add_argument(
        "--validate-local-profile",
        action="store_true",
        help="Validate the deterministic local Iop element matrix profile against a generated JSON index.",
    )
    parser.add_argument(
        "--validate-local-suite",
        action="store_true",
        help="Validate the deterministic local Iop 11/6/0 and 12/6/0 element matrix suite against a generated JSON index.",
    )
    parser.add_argument(
        "--p95-threshold-ms",
        type=float,
        default=DEFAULT_P95_THRESHOLD_MS,
        help="Fail local validation when any element p95 exceeds this threshold.",
    )
    parser.add_argument("--output", help="Write report JSON to this path instead of stdout.")
    parser.add_argument(
        "--fixture-output",
        help="Write a normalized local-suite fixture JSON to this path. Requires --validate-local-suite.",
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
    if args.validate_local_profile and args.validate_local_suite:
        parser.error("--validate-local-profile and --validate-local-suite are mutually exclusive.")
    if args.fixture_output and not args.validate_local_suite:
        parser.error("--fixture-output requires --validate-local-suite.")
    configure_index_path(args.index_path)
    validate_cli_bounds(parser, args)
    local_validation_mode = args.validate_local_profile or args.validate_local_suite
    validate_index_source(
        parser,
        args.allow_db and not local_validation_mode,
        show_allow_db_hint=not local_validation_mode,
    )

    if args.validate_local_suite:
        report = validate_local_query_suite(
            runs=args.runs,
            use_cache=not args.no_cache,
            p95_threshold_ms=args.p95_threshold_ms,
        )
    elif args.validate_local_profile:
        report = validate_local_element_matrix(
            runs=args.runs,
            use_cache=not args.no_cache,
            p95_threshold_ms=args.p95_threshold_ms,
        )
    else:
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
    output = json.dumps(report, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(output)
            file.write("\n")
    else:
        print(output)
    if args.fixture_output:
        fixture = normalized_local_suite_fixture(report)
        with open(args.fixture_output, "w", encoding="utf-8") as file:
            file.write(json.dumps(fixture, indent=2))
            file.write("\n")
    if local_validation_mode and report["status"] != "pass":
        sys.exit(1)


if __name__ == "__main__":
    main()
