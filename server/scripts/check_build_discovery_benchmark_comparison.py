"""Validate a Build Discovery benchmark comparison report against a fixture."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

DEFAULT_FIXTURE_PATH = (
    Path(__file__).resolve().parents[1]
    / "oneoff"
    / "fixtures"
    / "build_discovery_benchmark_comparison_fixture.json"
)


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def assert_close(
    failures: list[str],
    benchmark_id: str,
    field: str,
    actual: float | int | None,
    expected: float | int,
    tolerance: float,
) -> None:
    if not isinstance(actual, (int, float)):
        failures.append(f"{benchmark_id}: missing numeric {field}")
        return
    if abs(float(actual) - float(expected)) > tolerance:
        failures.append(
            f"{benchmark_id}: {field} drifted from {expected} to {actual} "
            f"(tolerance {tolerance})"
        )


def validate_report(report: dict[str, Any], fixture: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    tolerance = float(fixture.get("scoreTolerance", 0))
    expected_by_id = fixture.get("benchmarks", {})
    actual_by_id = {
        benchmark.get("id"): benchmark
        for benchmark in report.get("benchmarks", [])
        if isinstance(benchmark.get("id"), str)
    }

    if report.get("errorCount") != 0:
        failures.append(f"report errorCount is {report.get('errorCount')}, expected 0")

    for benchmark_id, expected in expected_by_id.items():
        actual = actual_by_id.get(benchmark_id)
        if actual is None:
            failures.append(f"{benchmark_id}: missing benchmark report")
            continue
        if actual.get("status") == "error":
            failures.append(f"{benchmark_id}: benchmark scoring errored")
            continue

        comparison = actual.get("generatedComparison") or {}
        actual_status = comparison.get("status")
        if actual_status != expected.get("status"):
            failures.append(
                f"{benchmark_id}: status changed from {expected.get('status')} "
                f"to {actual_status}"
            )

        for field in ("benchmarkScore", "bestGeneratedScore", "delta"):
            assert_close(
                failures,
                benchmark_id,
                field,
                comparison.get(field),
                expected[field],
                tolerance,
            )

    extra_ids = sorted(set(actual_by_id) - set(expected_by_id))
    if extra_ids:
        failures.append(f"unexpected benchmark reports: {', '.join(extra_ids)}")

    return failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", help="Path to a benchmark comparison report JSON file.")
    parser.add_argument(
        "--fixture",
        default=str(DEFAULT_FIXTURE_PATH),
        help="Path to the compact comparison fixture JSON.",
    )
    args = parser.parse_args()

    failures = validate_report(load_json(args.report), load_json(args.fixture))
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        raise SystemExit(1)
    print("Build Discovery benchmark comparison fixture check passed.")


if __name__ == "__main__":
    main()
