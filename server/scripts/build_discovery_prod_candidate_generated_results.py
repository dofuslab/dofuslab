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
    return [
        field
        for field in REQUIRED_QUERY_FIELDS
        if field not in candidate_query or candidate_query[field] in (None, [])
    ]


def build_query(candidate_query: dict[str, Any]) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        class_name=candidate_query["className"],
        level=candidate_query["level"],
        mode=candidate_query["mode"],
        elements=tuple(candidate_query["elements"]),
        ap_target=candidate_query["apTarget"],
        mp_target=candidate_query["mpTarget"],
        range_target=candidate_query["rangeTarget"],
        budget_tier=candidate_query.get("budgetTier", 4),
        exo_policy=candidate_query.get("exoPolicy", "opti"),
        limit=candidate_query.get("limit", 5),
    )


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
        generated_results.append(
            {
                **summary,
                "status": "generated",
                "query": candidate_query,
                "resultCount": len(response.get("builds", [])),
                "bestGeneratedScore": (
                    response.get("builds", [{}])[0].get("score")
                    if response.get("builds")
                    else None
                ),
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
    parser.add_argument("--output", help="Write generated candidate results JSON to this path.")
    args = parser.parse_args()

    try:
        report = build_prod_candidate_generated_results(
            load_json(args.discovery_report),
            candidate_limit=args.candidate_limit,
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
