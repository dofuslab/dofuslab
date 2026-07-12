"""Run generated Build Discovery outputs for supported prod aggregate candidates."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    BuildDiscoveryQuery,
    build_discovery_response,
)
from oneoff.build_discovery_cpsat_runner import build_cpsat_args, solve_cpsat_query  # noqa: E402

REPORT_VERSION = "build-discovery-prod-candidate-generated-results-v1"
DEFAULT_CANDIDATE_LIMIT = 10
MAX_CANDIDATE_LIMIT = 50
REQUIRED_QUERY_FIELDS = (
    "className",
    "level",
    "mode",
    "elements",
    "apTarget",
    "mpTarget",
    "rangeTarget",
)


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def missing_query_fields(candidate_query: dict[str, Any]) -> list[str]:
    missing = []
    for field in REQUIRED_QUERY_FIELDS:
        if field not in candidate_query:
            missing.append(field)
        elif field != "rangeTarget" and candidate_query[field] in (None, []):
            missing.append(field)
    return missing


def build_query(candidate_query: dict[str, Any]) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        class_name=candidate_query["className"],
        level=candidate_query["level"],
        mode=candidate_query["mode"],
        elements=tuple(candidate_query["elements"]),
        ap_target=candidate_query["apTarget"],
        mp_target=candidate_query["mpTarget"],
        range_target=candidate_query["rangeTarget"],
        damage_survivability_preset=candidate_query.get("damageSurvivabilityPreset", 2),
        budget_tier=candidate_query.get("budgetTier", 4),
        exo_policy=candidate_query.get("exoPolicy", "opti"),
        limit=candidate_query.get("limit", 5),
    )


def cpsat_args(query: BuildDiscoveryQuery, args: argparse.Namespace) -> argparse.Namespace:
    return build_cpsat_args(
        query,
        time_limit_seconds=args.cpsat_time_limit_seconds,
        workers=args.cpsat_workers,
        max_attempts=1,
        candidate_limit=args.cpsat_candidate_limit,
        summary_limit=args.cpsat_candidate_limit,
        collection_mode="callback",
        stop_after_candidates=True,
        objective_mode="final-linear",
        max_shared_items=None,
        generic_damage_weight=0.45,
    )


def cpsat_generator(args: argparse.Namespace) -> Callable[[BuildDiscoveryQuery], dict[str, Any]]:
    def generate(query: BuildDiscoveryQuery) -> dict[str, Any]:
        return solve_cpsat_query(query, cpsat_args(query, args))

    return generate


def response_result_count(response: dict[str, Any]) -> int:
    if isinstance(response.get("builds"), list):
        return len(response["builds"])
    return 1 if response.get("build") else 0


def response_best_score(response: dict[str, Any]) -> float | None:
    build = response_best_build(response)
    if build:
        return build.get("score")
    return None


def response_best_build(response: dict[str, Any]) -> dict[str, Any] | None:
    if response.get("builds"):
        return response["builds"][0]
    if response.get("build"):
        return response["build"]
    return None


def compact_items(build: dict[str, Any] | None) -> list[str]:
    if not build:
        return []
    return [
        item.get("name") or item.get("id") or slot
        for slot, item in sorted((build.get("items") or {}).items())
    ]


def profile_id(profile: dict[str, Any]) -> str:
    return "{}_{}_{}_{}_{}".format(
        profile.get("className", "unknown"),
        profile.get("element", "unknown"),
        profile.get("ap", "ap"),
        profile.get("mp", "mp"),
        profile.get("range", "range"),
    ).lower()


def candidate_summary(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": profile_id(profile),
        "className": profile.get("className"),
        "element": profile.get("element"),
        "ap": profile.get("ap"),
        "mp": profile.get("mp"),
        "range": profile.get("range"),
        "sampleCount": profile.get("sampleCount"),
        "commonItems": profile.get("commonItems", []),
    }


def build_prod_candidate_generated_results(
    discovery_report: dict[str, Any],
    candidate_limit: int = DEFAULT_CANDIDATE_LIMIT,
    generator: Callable[[BuildDiscoveryQuery], dict[str, Any]] = build_discovery_response,
) -> dict[str, Any]:
    if candidate_limit < 1 or candidate_limit > MAX_CANDIDATE_LIMIT:
        raise ValueError(f"candidate_limit must be between 1 and {MAX_CANDIDATE_LIMIT}.")

    generated_results = []
    skipped_results = []
    profiles = discovery_report.get("profiles", [])
    for profile in profiles:
        candidate = profile.get("generatedQueryCandidate") or {}
        summary = candidate_summary(profile)
        if not candidate.get("supported"):
            skipped_results.append(
                {
                    **summary,
                    "status": "unsupported",
                    "unsupportedReasons": candidate.get("unsupportedReasons", []),
                }
            )
            continue
        if len(generated_results) >= candidate_limit:
            skipped_results.append(
                {
                    **summary,
                    "status": "not_run",
                    "reason": "candidate limit reached",
                }
            )
            continue

        candidate_query = candidate.get("query") or {}
        missing_fields = missing_query_fields(candidate_query)
        if missing_fields:
            skipped_results.append(
                {
                    **summary,
                    "status": "malformed",
                    "reason": "supported candidate is missing required query fields",
                    "missingQueryFields": missing_fields,
                }
            )
            continue

        query = build_query(candidate_query)
        query.validate()
        response = generator(query)
        best_build = response_best_build(response)
        generated_results.append(
            {
                **summary,
                "status": "generated",
                "query": candidate_query,
                "resultCount": response_result_count(response),
                "bestGeneratedScore": response_best_score(response),
                "bestGeneratedTotals": (best_build or {}).get("totals", {}),
                "bestGeneratedSets": (best_build or {}).get("sets", {}),
                "bestGeneratedExos": (best_build or {}).get("exos", {}),
                "bestGeneratedItems": compact_items(best_build),
                "responseStatus": response.get("status"),
                "solverStatus": response.get("solverStatus"),
                "timings": response.get("timings", {}),
                "scoring": response.get("scoring", {}),
                "warnings": response.get("warnings", []),
                "cache": response.get("cache", {}),
                "diagnostics": response.get("diagnostics", {}),
            }
        )

    return {
        "reportVersion": REPORT_VERSION,
        "sourceReportVersion": discovery_report.get("reportVersion"),
        "candidateLimit": candidate_limit,
        "profileCount": len(profiles),
        "generatedCount": len(generated_results),
        "skippedCount": len(skipped_results),
        "generatedCandidates": generated_results,
        "skippedCandidates": skipped_results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("discovery_report", help="Path to a prod benchmark discovery JSON report.")
    parser.add_argument("--candidate-limit", type=int, default=DEFAULT_CANDIDATE_LIMIT)
    parser.add_argument("--solver", choices=("prototype", "cpsat"), default="prototype")
    parser.add_argument("--cpsat-time-limit-seconds", type=float, default=5.0)
    parser.add_argument("--cpsat-workers", type=int, default=8)
    parser.add_argument("--cpsat-candidate-limit", type=int, default=3)
    parser.add_argument("--output", help="Write generated candidate results JSON to this path.")
    args = parser.parse_args()

    try:
        generator = build_discovery_response
        if args.solver == "cpsat":
            if args.cpsat_time_limit_seconds <= 0:
                parser.error("--cpsat-time-limit-seconds must be positive.")
            if args.cpsat_workers < 1:
                parser.error("--cpsat-workers must be positive.")
            if args.cpsat_candidate_limit < 1:
                parser.error("--cpsat-candidate-limit must be positive.")
            generator = cpsat_generator(args)
        report = build_prod_candidate_generated_results(
            load_json(args.discovery_report),
            candidate_limit=args.candidate_limit,
            generator=generator,
        )
    except ValueError as error:
        parser.error(str(error))

    output = json.dumps(report, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(output)
            file.write("\n")
    else:
        print(output)


if __name__ == "__main__":
    main()
