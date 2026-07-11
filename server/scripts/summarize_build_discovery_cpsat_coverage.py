from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


SERVER_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))

from build_discovery_level_diversity_targets import MILESTONE2_LEVEL200_TARGETS


def target_id_set() -> set[str]:
    return {target.name for target in MILESTONE2_LEVEL200_TARGETS}


def split_reports(root: Path) -> list[Path]:
    return sorted(root.glob("build-discovery-cpsat-*-split/*.json"))


def generated_cpsat_targets(root: Path) -> dict[str, dict[str, Any]]:
    valid_targets = target_id_set()
    generated: dict[str, dict[str, Any]] = {}
    for path in split_reports(root):
        if path.name == "manifest.json":
            continue
        try:
            report = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        results = report.get("results")
        if not isinstance(results, list) or len(results) != 1:
            continue
        result = results[0]
        if result.get("status") != "generated":
            continue
        diagnostics = result.get("diagnostics")
        if not isinstance(diagnostics, dict) or diagnostics.get("solver") != "cpsat":
            continue
        target = result.get("target")
        if not isinstance(target, dict):
            continue
        target_id = target.get("id")
        if target_id not in valid_targets:
            continue
        generated[target_id] = {
            "target": target,
            "path": str(path),
            "solverStatus": diagnostics.get("solverStatus"),
            "elapsedMs": diagnostics.get("elapsedMs"),
        }
    return generated


def counter_for(generated: dict[str, dict[str, Any]], key: str) -> Counter:
    return Counter(row["target"].get(key) for row in generated.values())


def coverage_report(root: Path) -> dict[str, Any]:
    generated = generated_cpsat_targets(root)
    total = len(MILESTONE2_LEVEL200_TARGETS)
    return {
        "targetSet": "milestone2-level200",
        "targetCount": total,
        "generatedCpsatTargetCount": len(generated),
        "coveragePercent": round((len(generated) / total) * 100, 2),
        "byElement": dict(sorted(counter_for(generated, "element").items())),
        "byBudgetTier": dict(sorted(counter_for(generated, "budgetTier").items())),
        "byAp": dict(sorted(counter_for(generated, "apTarget").items())),
        "byMp": dict(sorted(counter_for(generated, "mpTarget").items())),
        "byRange": dict(
            sorted(
                (
                    "none" if range_target is None else str(range_target),
                    count,
                )
                for range_target, count in counter_for(generated, "rangeTarget").items()
            )
        ),
        "bySolverStatus": dict(sorted(Counter(row["solverStatus"] for row in generated.values()).items())),
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery CP-SAT Coverage",
        "",
        f"Target set: `{report['targetSet']}`",
        f"Generated CP-SAT targets: `{report['generatedCpsatTargetCount']}` / `{report['targetCount']}`",
        f"Coverage: `{report['coveragePercent']}%`",
        "",
    ]
    for title, key in (
        ("Element", "byElement"),
        ("Budget Tier", "byBudgetTier"),
        ("AP", "byAp"),
        ("MP", "byMp"),
        ("Range", "byRange"),
        ("Solver Status", "bySolverStatus"),
    ):
        lines.extend([f"## {title}", "", "| Value | Count |", "|---|---:|"])
        for value, count in report[key].items():
            lines.append(f"| {value} | {count} |")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--state-dir", default=".codex/state")
    parser.add_argument("--output-json")
    parser.add_argument("--output-md")
    args = parser.parse_args()

    report = coverage_report(Path(args.state_dir))
    if args.output_json:
        Path(args.output_json).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if args.output_md:
        Path(args.output_md).write_text(render_markdown(report), encoding="utf-8")
    if not args.output_json and not args.output_md:
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
