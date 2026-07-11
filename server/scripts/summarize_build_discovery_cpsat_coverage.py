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
from check_build_discovery_level_diversity_matrix import validate_full_build_artifact

EXCLUSION_SAMPLE_LIMIT = 10


def target_id_set() -> set[str]:
    return {target.name for target in MILESTONE2_LEVEL200_TARGETS}


def split_reports(root: Path) -> list[Path]:
    return sorted(root.glob("build-discovery-cpsat-*-split/*.json"))


def solver_status_rank(status: str | None) -> int:
    return {
        "OPTIMAL": 3,
        "FEASIBLE": 2,
        "UNKNOWN": 1,
    }.get(status or "", 0)


def better_generated_row(existing: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    existing_status = existing.get("solverStatus")
    candidate_status = candidate.get("solverStatus")
    if solver_status_rank(candidate_status) != solver_status_rank(existing_status):
        return candidate if solver_status_rank(candidate_status) > solver_status_rank(existing_status) else existing

    existing_elapsed = existing.get("elapsedMs")
    candidate_elapsed = candidate.get("elapsedMs")
    if isinstance(existing_elapsed, (int, float)) and isinstance(candidate_elapsed, (int, float)):
        return candidate if candidate_elapsed < existing_elapsed else existing
    return existing


def report_path(root: Path, path: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


def record_exclusion(samples: dict[str, list[dict[str, Any]]], reason: str, path: Path, root: Path, target_id: Any = None) -> None:
    bucket = samples.setdefault(reason, [])
    if len(bucket) >= EXCLUSION_SAMPLE_LIMIT:
        return
    sample: dict[str, Any] = {"path": report_path(root, path)}
    if isinstance(target_id, str):
        sample["targetId"] = target_id
    bucket.append(sample)


def generated_cpsat_targets(root: Path) -> dict[str, dict[str, Any]]:
    return coverage_inventory(root)["generatedTargets"]


def coverage_inventory(root: Path) -> dict[str, Any]:
    valid_targets = target_id_set()
    target_by_id = {target.name: target for target in MILESTONE2_LEVEL200_TARGETS}
    generated: dict[str, dict[str, Any]] = {}
    duplicate_paths: dict[str, list[str]] = {}
    excluded = Counter()
    excluded_samples: dict[str, list[dict[str, Any]]] = {}
    examined = 0
    for path in split_reports(root):
        if path.name == "manifest.json":
            continue
        examined += 1
        try:
            report = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            excluded["unreadable_json"] += 1
            record_exclusion(excluded_samples, "unreadable_json", path, root)
            continue
        results = report.get("results")
        if not isinstance(results, list) or len(results) != 1:
            excluded["not_single_result_report"] += 1
            record_exclusion(excluded_samples, "not_single_result_report", path, root)
            continue
        result = results[0]
        if result.get("status") != "generated":
            excluded["not_generated"] += 1
            record_exclusion(excluded_samples, "not_generated", path, root, result.get("target", {}).get("id"))
            continue
        diagnostics = result.get("diagnostics")
        if not isinstance(diagnostics, dict) or diagnostics.get("solver") != "cpsat":
            excluded["not_cpsat"] += 1
            record_exclusion(excluded_samples, "not_cpsat", path, root, result.get("target", {}).get("id"))
            continue
        target = result.get("target")
        if not isinstance(target, dict):
            excluded["missing_target"] += 1
            record_exclusion(excluded_samples, "missing_target", path, root)
            continue
        target_id = target.get("id")
        if target_id not in valid_targets:
            excluded["outside_target_set"] += 1
            record_exclusion(excluded_samples, "outside_target_set", path, root, target_id)
            continue
        validation_errors = validate_full_build_artifact(result, target_by_id)
        if validation_errors:
            excluded["strict_validation_failed"] += 1
            record_exclusion(excluded_samples, "strict_validation_failed", path, root, target_id)
            continue
        row = {
            "target": target,
            "path": report_path(root, path),
            "solverStatus": diagnostics.get("solverStatus"),
            "elapsedMs": diagnostics.get("elapsedMs"),
        }
        if target_id in generated:
            duplicate_paths.setdefault(target_id, [generated[target_id]["path"]]).append(str(path))
            generated[target_id] = better_generated_row(generated[target_id], row)
        else:
            generated[target_id] = row
    return {
        "generatedTargets": generated,
        "examinedSplitReports": examined,
        "excludedSplitReports": dict(sorted(excluded.items())),
        "excludedSplitReportSamples": dict(sorted(excluded_samples.items())),
        "duplicateTargetCount": len(duplicate_paths),
        "duplicateSplitReportSurplus": sum(len(paths) - 1 for paths in duplicate_paths.values()),
        "duplicateTargets": dict(sorted(duplicate_paths.items())),
    }


def counter_for(generated: dict[str, dict[str, Any]], key: str) -> Counter:
    return Counter(row["target"].get(key) for row in generated.values())


def coverage_report(root: Path) -> dict[str, Any]:
    inventory = coverage_inventory(root)
    generated = inventory["generatedTargets"]
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
        "examinedSplitReports": inventory["examinedSplitReports"],
        "excludedSplitReports": inventory["excludedSplitReports"],
        "excludedSplitReportSamples": inventory["excludedSplitReportSamples"],
        "duplicateTargetCount": inventory["duplicateTargetCount"],
        "duplicateSplitReportSurplus": inventory["duplicateSplitReportSurplus"],
        "duplicateTargets": inventory["duplicateTargets"],
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery CP-SAT Coverage",
        "",
        f"Target set: `{report['targetSet']}`",
        f"Generated CP-SAT targets: `{report['generatedCpsatTargetCount']}` / `{report['targetCount']}`",
        f"Coverage: `{report['coveragePercent']}%`",
        f"Examined split reports: `{report['examinedSplitReports']}`",
        f"Excluded split reports: `{sum(report['excludedSplitReports'].values())}`",
        f"Duplicate targets: `{report['duplicateTargetCount']}` "
        f"(`{report['duplicateSplitReportSurplus']}` surplus reports)",
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
    if report["excludedSplitReports"]:
        lines.extend(["## Excluded Split Reports", "", "| Reason | Count |", "|---|---:|"])
        for reason, count in report["excludedSplitReports"].items():
            lines.append(f"| {reason} | {count} |")
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
