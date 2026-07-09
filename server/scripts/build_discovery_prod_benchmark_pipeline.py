"""Run the bounded prod Build Discovery benchmark pipeline."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prod_benchmark_discovery import (  # noqa: E402
    DEFAULT_SAMPLE_LIMIT,
    DEFAULT_STATEMENT_TIMEOUT_MS,
    DEFAULT_TOP_ITEMS,
    discover_prod_benchmarks,
    preflight_status,
    prod_database_url,
)
from scripts.build_discovery_prod_candidate_generated_results import (  # noqa: E402
    DEFAULT_CANDIDATE_LIMIT,
    build_prod_candidate_generated_results,
)

REPORT_VERSION = "build-discovery-prod-benchmark-pipeline-v1"
DISCOVERY_FILENAME = "prod_benchmark_discovery.json"
GENERATED_RESULTS_FILENAME = "prod_candidate_generated_results.json"
SUMMARY_FILENAME = "prod_benchmark_pipeline_summary.json"


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        file.write(json.dumps(payload, indent=2, ensure_ascii=False))
        file.write("\n")


def build_summary(
    discovery_report: dict[str, Any],
    generated_results: dict[str, Any],
    output_dir: Path,
) -> dict[str, Any]:
    return {
        "reportVersion": REPORT_VERSION,
        "artifacts": {
            "discoveryReport": str(output_dir / DISCOVERY_FILENAME),
            "generatedResults": str(output_dir / GENERATED_RESULTS_FILENAME),
        },
        "sourceReportVersion": discovery_report.get("reportVersion"),
        "candidateResultsVersion": generated_results.get("reportVersion"),
        "profileCount": generated_results.get("profileCount", 0),
        "generatedCount": generated_results.get("generatedCount", 0),
        "skippedCount": generated_results.get("skippedCount", 0),
        "supportedGeneratedCandidateIds": [
            candidate.get("id")
            for candidate in generated_results.get("generatedCandidates", [])
        ],
        "skippedCandidateStatuses": [
            {
                "id": candidate.get("id"),
                "status": candidate.get("status"),
                "unsupportedReasons": candidate.get("unsupportedReasons", []),
                "reason": candidate.get("reason"),
            }
            for candidate in generated_results.get("skippedCandidates", [])
        ],
    }


def run_pipeline(
    output_dir: str | Path,
    sample_limit: int = DEFAULT_SAMPLE_LIMIT,
    top_items: int = DEFAULT_TOP_ITEMS,
    candidate_limit: int = DEFAULT_CANDIDATE_LIMIT,
    locale: str = "en",
    statement_timeout_ms: int = DEFAULT_STATEMENT_TIMEOUT_MS,
    discovery_fn: Callable[..., dict[str, Any]] = discover_prod_benchmarks,
    candidate_results_fn: Callable[..., dict[str, Any]] = build_prod_candidate_generated_results,
) -> dict[str, Any]:
    output_path = Path(output_dir)
    discovery_report = discovery_fn(
        prod_database_url(),
        sample_limit=sample_limit,
        top_items=top_items,
        locale=locale,
        statement_timeout_ms=statement_timeout_ms,
    )
    generated_results = candidate_results_fn(
        discovery_report,
        candidate_limit=candidate_limit,
    )
    summary = build_summary(discovery_report, generated_results, output_path)

    write_json(output_path / DISCOVERY_FILENAME, discovery_report)
    write_json(output_path / GENERATED_RESULTS_FILENAME, generated_results)
    write_json(output_path / SUMMARY_FILENAME, summary)
    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="/tmp/build_discovery_prod_benchmark_pipeline")
    parser.add_argument("--sample-limit", type=int, default=DEFAULT_SAMPLE_LIMIT)
    parser.add_argument("--top-items", type=int, default=DEFAULT_TOP_ITEMS)
    parser.add_argument("--candidate-limit", type=int, default=DEFAULT_CANDIDATE_LIMIT)
    parser.add_argument("--locale", default="en")
    parser.add_argument("--statement-timeout-ms", type=int, default=DEFAULT_STATEMENT_TIMEOUT_MS)
    parser.add_argument(
        "--check-env",
        action="store_true",
        help="Print non-secret runtime readiness without connecting to prod.",
    )
    args = parser.parse_args()

    if args.check_env:
        print(json.dumps(preflight_status(), indent=2))
        return

    try:
        summary = run_pipeline(
            output_dir=args.output_dir,
            sample_limit=args.sample_limit,
            top_items=args.top_items,
            candidate_limit=args.candidate_limit,
            locale=args.locale,
            statement_timeout_ms=args.statement_timeout_ms,
        )
    except ValueError as error:
        parser.error(str(error))

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
