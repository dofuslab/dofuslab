"""Validate a generated Build Discovery level-diversity matrix artifact."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.build_discovery_level_diversity_matrix import (  # noqa: E402
    LEVEL_DIVERSITY_TARGETS,
    REPORT_VERSION,
)


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def validate_report(report: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    if report.get("reportVersion") != REPORT_VERSION:
        failures.append(
            f"reportVersion is {report.get('reportVersion')}, expected {REPORT_VERSION}"
        )

    expected_ids = {target.name for target in LEVEL_DIVERSITY_TARGETS}
    results = report.get("results", [])
    actual_ids = {
        result.get("target", {}).get("id")
        for result in results
        if isinstance(result.get("target", {}).get("id"), str)
    }
    missing_ids = sorted(expected_ids - actual_ids)
    extra_ids = sorted(actual_ids - expected_ids)
    if missing_ids:
        failures.append(f"missing target reports: {', '.join(missing_ids)}")
    if extra_ids:
        failures.append(f"unexpected target reports: {', '.join(extra_ids)}")

    if report.get("targetCount") != len(expected_ids):
        failures.append(f"targetCount is {report.get('targetCount')}, expected {len(expected_ids)}")
    if report.get("generatedCount") != len(expected_ids):
        failures.append(
            f"generatedCount is {report.get('generatedCount')}, expected {len(expected_ids)}"
        )
    if report.get("noBuildCount") != 0:
        failures.append(f"noBuildCount is {report.get('noBuildCount')}, expected 0")

    for result in results:
        target_id = result.get("target", {}).get("id", "unknown")
        if result.get("status") != "generated":
            failures.append(f"{target_id}: status is {result.get('status')}, expected generated")
        if result.get("resultCount", 0) < 1:
            failures.append(f"{target_id}: resultCount is {result.get('resultCount')}, expected >= 1")
        summary = result.get("bestBuildSummary")
        if not isinstance(summary, dict):
            failures.append(f"{target_id}: missing bestBuildSummary")
            continue
        if not isinstance(summary.get("score"), (int, float)):
            failures.append(f"{target_id}: missing numeric bestBuildSummary.score")
        totals = summary.get("totals") or {}
        for stat in ("AP", "MP", "Range", "Vitality"):
            if not isinstance(totals.get(stat), (int, float)):
                failures.append(f"{target_id}: missing numeric totals.{stat}")
        if not summary.get("items"):
            failures.append(f"{target_id}: bestBuildSummary.items is empty")

    return failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", help="Path to a level-diversity matrix JSON artifact.")
    args = parser.parse_args()

    failures = validate_report(load_json(args.report))
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        raise SystemExit(1)
    print("Build Discovery level-diversity matrix check passed.")


if __name__ == "__main__":
    main()
