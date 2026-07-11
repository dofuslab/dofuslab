"""Generate review artifacts for the Iop level-diversity smoke matrix."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    SLOTS,
    BuildDiscoveryQuery,
    build_discovery_response,
    query_summary,
)
from scripts.build_discovery_level_diversity_targets import (  # noqa: E402
    AP_MP_RANGE_COVERAGE_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS,
    BOUNDARY_LEVEL_TARGETS,
    LEVEL_DIVERSITY_TARGETS,
    LevelDiversityTarget,
    query_for_target,
)


REPORT_VERSION = "build-discovery-level-diversity-matrix-v1"


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


@dataclass(frozen=True)
class TargetFileRows:
    rows: list[dict[str, Any]]
    source_kind: str


@dataclass(frozen=True)
class TargetFileLoadResult:
    targets: tuple[LevelDiversityTarget, ...]
    source: str
    source_kind: str


def csv_filter(raw_value: str | None) -> set[str] | None:
    if not raw_value or raw_value == "all":
        return None
    return {value.strip() for value in raw_value.split(",") if value.strip()}


def selected_targets(
    *,
    all_targets: Iterable[LevelDiversityTarget] = LEVEL_DIVERSITY_TARGETS,
    target_names: set[str] | None = None,
    levels: set[int] | None = None,
    elements: set[str] | None = None,
    budget_tiers: set[int] | None = None,
) -> list[LevelDiversityTarget]:
    targets = []
    for target in all_targets:
        if target_names is not None and target.name not in target_names:
            continue
        if levels is not None and target.level not in levels:
            continue
        if elements is not None and target.element not in elements:
            continue
        if budget_tiers is not None and target.budget_tier not in budget_tiers:
            continue
        targets.append(target)
    return targets


def target_name_from_row(row: dict[str, Any], prefix: str = "file") -> str:
    range_value = row.get("rangeTarget")
    range_label = "none" if range_value is None else str(range_value)
    return (
        f"{prefix}_level_{row['level']}_{row['element']}_"
        f"{row['apTarget']}_{row['mpTarget']}_{range_label}_budget{row['budgetTier']}"
    )


def normalize_range_target(value: Any, *, index: int) -> int | None:
    if value is None:
        return None
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"", "none", "any", "null"}:
            return None
        try:
            return int(normalized)
        except ValueError as exc:
            raise ValueError(f"target row {index} has invalid rangeTarget: {value}") from exc
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"target row {index} has invalid rangeTarget: {value}") from exc


def required_row_value(row: dict[str, Any], key: str, *, index: int) -> Any:
    if key not in row:
        raise ValueError(f"target row {index} missing {key}")
    return row[key]


def target_from_row(row: dict[str, Any], prefix: str = "file", *, index: int = 0) -> LevelDiversityTarget:
    if not isinstance(row, dict):
        raise ValueError(f"target row {index} must be an object")
    normalized_row = {
        "level": int(required_row_value(row, "level", index=index)),
        "element": str(required_row_value(row, "element", index=index)),
        "budgetTier": int(required_row_value(row, "budgetTier", index=index)),
        "apTarget": int(required_row_value(row, "apTarget", index=index)),
        "mpTarget": int(required_row_value(row, "mpTarget", index=index)),
        "rangeTarget": normalize_range_target(
            required_row_value(row, "rangeTarget", index=index),
            index=index,
        ),
    }
    return LevelDiversityTarget(
        row.get("id") or target_name_from_row(normalized_row, prefix),
        normalized_row["level"],
        normalized_row["element"],
        normalized_row["budgetTier"],
        normalized_row["apTarget"],
        normalized_row["mpTarget"],
        normalized_row["rangeTarget"],
    )


def rows_from_target_file_payload(payload: Any) -> TargetFileRows:
    if isinstance(payload, list):
        return TargetFileRows(payload, "array")
    if not isinstance(payload, dict):
        raise ValueError("Target file must contain a JSON object or array.")
    if isinstance(payload.get("nextUnprovenTargets"), list):
        return TargetFileRows(payload["nextUnprovenTargets"], "nextUnprovenTargets")
    if isinstance(payload.get("targets"), list):
        return TargetFileRows(payload["targets"], "targets")
    if isinstance(payload.get("results"), list):
        rows = []
        for index, result in enumerate(payload["results"]):
            if not isinstance(result, dict) or not isinstance(result.get("target"), dict):
                raise ValueError(f"target file results row {index} missing target object")
            rows.append(result["target"])
        return TargetFileRows(rows, "results")
    raise ValueError("Target file must contain nextUnprovenTargets, targets, results, or a target row array.")


def target_source_for_file(path: str | Path, source_kind: str) -> str:
    return f"{path}#{source_kind}"


def load_targets_from_file(path: str | Path, *, limit: int | None = None, prefix: str = "file") -> TargetFileLoadResult:
    if limit is not None and limit < 0:
        raise ValueError("--target-file-limit must be non-negative")
    with open(path, encoding="utf-8") as file:
        payload = json.load(file)
    target_rows = rows_from_target_file_payload(payload)
    rows = target_rows.rows
    if limit is not None:
        rows = rows[:limit]
    targets = []
    seen_names: set[str] = set()
    seen_row_keys: set[tuple[int, str, int, int, int, int | None]] = set()
    for index, row in enumerate(rows):
        target = target_from_row(row, prefix, index=index)
        row_key = (
            target.level,
            target.element,
            target.budget_tier,
            target.ap,
            target.mp,
            target.range_target,
        )
        if target.name in seen_names:
            duplicate_type = "explicit target id" if isinstance(row, dict) and row.get("id") else "synthesized target row key"
            raise ValueError(f"Duplicate {duplicate_type} in target file: {target.name}")
        if row_key in seen_row_keys:
            raise ValueError(f"Duplicate target row key in target file: {row_key}")
        seen_names.add(target.name)
        seen_row_keys.add(row_key)
        targets.append(target)
    return TargetFileLoadResult(
        tuple(targets),
        target_source_for_file(path, target_rows.source_kind),
        target_rows.source_kind,
    )


def targets_from_file(path: str | Path, *, limit: int | None = None, prefix: str = "file") -> tuple[LevelDiversityTarget, ...]:
    return load_targets_from_file(path, limit=limit, prefix=prefix).targets


def targets_for_set(target_set: str) -> tuple[LevelDiversityTarget, ...]:
    if target_set == "level-diversity":
        return LEVEL_DIVERSITY_TARGETS
    if target_set == "boundary":
        return BOUNDARY_LEVEL_TARGETS
    if target_set == "coverage":
        return AP_MP_RANGE_COVERAGE_TARGETS
    if target_set == "grid-next-minimum":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS
    if target_set == "grid-next-minimum-2":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS
    if target_set == "grid-next-minimum-3":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS
    if target_set == "grid-next-cap":
        return AP_MP_RANGE_GRID_NEXT_CAP_TARGETS
    if target_set == "grid-next-cap-2":
        return AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS
    if target_set == "grid-next-cap-3":
        return AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS
    if target_set == "grid-next-cap-4":
        return AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS
    if target_set == "all":
        return (
            LEVEL_DIVERSITY_TARGETS
            + BOUNDARY_LEVEL_TARGETS
            + AP_MP_RANGE_COVERAGE_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS
        )
    raise ValueError(f"Unsupported target set: {target_set}")


def target_source_for_set(target_set: str) -> str:
    if target_set == "target-file":
        return "target file"
    if target_set == "boundary":
        return "scripts.build_discovery_level_diversity_targets.BOUNDARY_LEVEL_TARGETS"
    if target_set == "coverage":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_COVERAGE_TARGETS"
    if target_set == "grid-next-minimum":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS"
    if target_set == "grid-next-minimum-2":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS"
    if target_set == "grid-next-minimum-3":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS"
    if target_set == "grid-next-cap":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_TARGETS"
    if target_set == "grid-next-cap-2":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS"
    if target_set == "grid-next-cap-3":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS"
    if target_set == "grid-next-cap-4":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS"
    if target_set == "all":
        return "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS+BOUNDARY_LEVEL_TARGETS+AP_MP_RANGE_COVERAGE_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS"
    return "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS"


def target_summary(target: LevelDiversityTarget) -> dict[str, Any]:
    return {
        "id": target.name,
        "className": "Iop",
        "level": target.level,
        "element": target.element,
        "budgetTier": target.budget_tier,
        "apTarget": target.ap,
        "mpTarget": target.mp,
        "rangeTarget": target.range_target,
    }


def item_names(build: dict[str, Any] | None) -> list[str]:
    if not build:
        return []
    items = build.get("items", {})
    names = []
    for slot_name, _ in SLOTS:
        item = items.get(slot_name)
        if item:
            names.append(item.get("name") or item.get("id") or slot_name)
    return names


def compact_build_summary(build: dict[str, Any] | None) -> dict[str, Any] | None:
    if not build:
        return None
    totals = build.get("totals", {})
    return {
        "score": build.get("score"),
        "apStrategy": build.get("apStrategy"),
        "totals": totals,
        "sets": build.get("sets", {}),
        "exos": build.get("exos", {}),
        "items": item_names(build),
    }


def current_git_sha() -> str | None:
    repo_root = Path(__file__).resolve().parents[2]
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=repo_root,
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return result.stdout.strip() or None


def validate_best_build(target: LevelDiversityTarget, query: BuildDiscoveryQuery, build: dict[str, Any] | None) -> list[str]:
    if not build:
        return ["no build returned"]

    errors = []
    condition_failures = build.get("conditionFailures") or []
    if condition_failures:
        errors.append(f"condition failures present: {condition_failures}")

    totals = build.get("totals") or {}
    ap = totals.get("AP")
    mp = totals.get("MP")
    range_value = totals.get("Range")
    if not isinstance(ap, (int, float)):
        errors.append("missing numeric AP total")
    elif ap < query.ap_target or ap > MAX_AP:
        errors.append(f"AP total {ap} outside target/cap {query.ap_target}-{MAX_AP}")
    if not isinstance(mp, (int, float)):
        errors.append("missing numeric MP total")
    elif mp < query.mp_target or mp > MAX_MP:
        errors.append(f"MP total {mp} outside target/cap {query.mp_target}-{MAX_MP}")
    if not isinstance(range_value, (int, float)):
        errors.append("missing numeric Range total")
    elif range_value > MAX_RANGE:
        errors.append(f"Range total {range_value} exceeds cap {MAX_RANGE}")
    elif query.range_target is not None and range_value < query.range_target:
        errors.append(f"Range total {range_value} below target {query.range_target}")

    for slot_name, item in (build.get("items") or {}).items():
        item_level = item.get("level")
        if isinstance(item_level, (int, float)) and item_level > target.level:
            errors.append(f"{slot_name} item level {item_level} exceeds target level {target.level}")

    return errors


def matrix_entry(
    target: LevelDiversityTarget,
    response: dict[str, Any],
    query: BuildDiscoveryQuery,
) -> dict[str, Any]:
    builds = response.get("builds", [])
    best_build = builds[0] if builds else None
    validation_errors = validate_best_build(target, query, best_build)
    status = "no_build" if not best_build else "invalid" if validation_errors else "generated"
    return {
        "target": target_summary(target),
        "query": query_summary(query),
        "status": status,
        "resultCount": len(builds),
        "validationErrors": validation_errors,
        "bestBuild": best_build,
        "bestBuildSummary": compact_build_summary(best_build),
        "warnings": response.get("warnings", []),
        "diagnostics": response.get("diagnostics", {}),
        "cache": response.get("cache", {}),
        "datasetVersion": response.get("datasetVersion"),
        "solverVersion": response.get("solverVersion"),
    }


def matrix_report_from_entries(
    entries: list[dict[str, Any]],
    *,
    generated_at: str,
    target_set: str,
    git_sha: str | None,
    target_source: str | None = None,
) -> dict[str, Any]:
    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": generated_at,
        "scope": f"Iop {target_set} generated target matrix",
        "evidenceType": (
            "action_stat_feasibility"
            if target_set == "coverage"
            else "generated_solver_snapshot"
        ),
        "provenance": {
            "gitSha": git_sha or current_git_sha(),
            "targetSource": target_source or target_source_for_set(target_set),
            "generator": "scripts/build_discovery_level_diversity_matrix.py",
        },
        "targetCount": len(entries),
        "generatedCount": sum(1 for entry in entries if entry["status"] == "generated"),
        "noBuildCount": sum(1 for entry in entries if entry["status"] == "no_build"),
        "invalidCount": sum(1 for entry in entries if entry["status"] == "invalid"),
        "results": entries,
    }


def build_matrix_report(
    targets: Iterable[LevelDiversityTarget],
    *,
    generator: Callable[[BuildDiscoveryQuery], dict[str, Any]] = build_discovery_response,
    generated_at: str | None = None,
    target_set: str = "level-diversity",
    git_sha: str | None = None,
    target_source: str | None = None,
) -> dict[str, Any]:
    entries = []
    for target in targets:
        query = query_for_target(target)
        query.validate()
        response = generator(query)
        entries.append(matrix_entry(target, response, query))

    return matrix_report_from_entries(
        entries,
        generated_at=generated_at or datetime.now(timezone.utc).isoformat(),
        target_set=target_set,
        git_sha=git_sha,
        target_source=target_source,
    )


def artifact_stem_for_target(target: LevelDiversityTarget) -> str:
    stem = re.sub(r"[^A-Za-z0-9_.-]+", "-", target.name).strip("-")
    return stem or "unknown-target"


def unique_artifact_stem_for_target(target: LevelDiversityTarget, used_stems: set[str]) -> str:
    stem = artifact_stem_for_target(target)
    base_stem = stem
    suffix = 2
    while stem in used_stems:
        stem = f"{base_stem}-{suffix}"
        suffix += 1
    used_stems.add(stem)
    return stem


def split_report_target_id(report: dict[str, Any]) -> str | None:
    results = report.get("results")
    if not isinstance(results, list) or len(results) != 1:
        return None
    target = results[0].get("target") if isinstance(results[0], dict) else None
    if not isinstance(target, dict):
        return None
    return target.get("id")


def existing_split_report_for_target(path: Path, target: LevelDiversityTarget) -> dict[str, Any] | None:
    if not path.exists():
        return None
    report = load_json(path)
    if split_report_target_id(report) != target.name:
        raise ValueError(f"Existing split report {path} does not match target {target.name}.")
    return report


def write_split_matrix_reports(
    targets: Iterable[LevelDiversityTarget],
    *,
    output_dir: Path,
    generator: Callable[[BuildDiscoveryQuery], dict[str, Any]] = build_discovery_response,
    generated_at: str | None = None,
    target_set: str = "level-diversity",
    git_sha: str | None = None,
    target_source: str | None = None,
    resume_existing: bool = False,
) -> dict[str, Any]:
    generated_at = generated_at or datetime.now(timezone.utc).isoformat()
    output_dir.mkdir(parents=True, exist_ok=True)
    entries = []
    manifest_rows = []
    used_stems: set[str] = set()
    for target in targets:
        query = query_for_target(target)
        query.validate()

        stem = unique_artifact_stem_for_target(target, used_stems)

        json_path = output_dir / f"{stem}.json"
        md_path = output_dir / f"{stem}.md"
        existing_report = existing_split_report_for_target(json_path, target) if resume_existing else None
        if existing_report:
            one_row_report = existing_report
            entry = existing_report["results"][0]
            if not md_path.exists():
                md_path.write_text(render_markdown(one_row_report), encoding="utf-8")
        else:
            response = generator(query)
            entry = matrix_entry(target, response, query)
            one_row_report = matrix_report_from_entries(
                [entry],
                generated_at=generated_at,
                target_set=target_set,
                git_sha=git_sha,
                target_source=target_source,
            )
            json_path.write_text(json.dumps(one_row_report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            md_path.write_text(render_markdown(one_row_report), encoding="utf-8")
        entries.append(entry)
        manifest_rows.append(
            {
                "targetId": target.name,
                "status": entry["status"],
                "resumed": bool(existing_report),
                "json": str(json_path),
                "markdown": str(md_path),
            }
        )
        manifest = {"splitReportCount": len(manifest_rows), "reports": manifest_rows}
        (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    aggregate_report = matrix_report_from_entries(
        entries,
        generated_at=generated_at,
        target_set=target_set,
        git_sha=git_sha,
        target_source=target_source,
    )
    return {
        "manifest": {"splitReportCount": len(manifest_rows), "reports": manifest_rows},
        "aggregateReport": aggregate_report,
    }


def target_label(target: dict[str, Any]) -> str:
    range_value = target["rangeTarget"]
    range_label = "any" if range_value is None else str(range_value)
    return (
        f"L{target['level']} {target['element']} "
        f"{target['apTarget']}/{target['mpTarget']}/{range_label} "
        f"tier {target['budgetTier']}"
    )


def report_title(report: dict[str, Any]) -> str:
    scope = report.get("scope", "")
    if scope.startswith("Iop ") and scope.endswith(" generated target matrix"):
        target_set = scope[len("Iop ") : -len(" generated target matrix")]
        target_set_label = target_set.replace("-", " ").title()
        return f"# Build Discovery Iop {target_set_label} Matrix"
    return "# Build Discovery Iop Target Matrix"


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        report_title(report),
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        (
            "This is a generated-output snapshot for the sampled target set. "
            "It records the current best solver result "
            "for review; it is not yet a human-accepted benchmark list."
        ),
        (
            "Coverage target-set artifacts are action-stat feasibility evidence "
            "only. They do not prove realistic build quality at every level."
            if report.get("evidenceType") == "action_stat_feasibility"
            else ""
        ),
        "",
        f"Targets: `{report['targetCount']}`",
        f"Generated: `{report['generatedCount']}`",
        f"No build: `{report['noBuildCount']}`",
        f"Invalid: `{report.get('invalidCount', 0)}`",
        "",
        "| Target | Status | Score | Miss ms | AP/MP/Range | Main stat | Vitality | Validation | Sets | Items |",
        "|---|---:|---:|---:|---|---:|---:|---|---|---|",
    ]
    for entry in report["results"]:
        target = entry["target"]
        summary = entry.get("bestBuildSummary") or {}
        totals = summary.get("totals", {})
        main_stat = totals.get(target["element"].capitalize(), "")
        if target["element"] == "strength":
            main_stat = totals.get("Strength", main_stat)
        elif target["element"] == "intelligence":
            main_stat = totals.get("Intelligence", main_stat)
        elif target["element"] == "chance":
            main_stat = totals.get("Chance", main_stat)
        elif target["element"] == "agility":
            main_stat = totals.get("Agility", main_stat)
        diagnostics = entry.get("diagnostics", {})
        elapsed = diagnostics.get("elapsedMs", "")
        action_stats = (
            f"{totals.get('AP', '')}/{totals.get('MP', '')}/{totals.get('Range', '')}"
            if totals
            else ""
        )
        sets = ", ".join(f"{name} x{count}" for name, count in summary.get("sets", {}).items())
        items = ", ".join(summary.get("items", []))
        validation = "; ".join(entry.get("validationErrors", []))
        lines.append(
            "| {} | {} | {} | {} | {} | {} | {} | {} | {} | {} |".format(
                target_label(target),
                entry["status"],
                summary.get("score", ""),
                elapsed,
                action_stats,
                main_stat,
                totals.get("Vitality", ""),
                validation,
                sets,
                items,
            )
        )
    lines.append("")
    return "\n".join(lines)


def parse_int_filter(raw_value: str | None) -> set[int] | None:
    values = csv_filter(raw_value)
    if values is None:
        return None
    return {int(value) for value in values}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--targets", help="Comma-separated target ids to include.")
    parser.add_argument("--target-file", help="JSON target rows, inventory report, or matrix report to run.")
    parser.add_argument("--target-file-limit", type=int, help="Limit target rows loaded from --target-file.")
    parser.add_argument("--target-file-prefix", default="file", help="Prefix for generated target ids from --target-file.")
    parser.add_argument(
        "--target-set",
        choices=("level-diversity", "boundary", "coverage", "grid-next-minimum", "grid-next-minimum-2", "grid-next-minimum-3", "grid-next-cap", "grid-next-cap-2", "grid-next-cap-3", "grid-next-cap-4", "all"),
        default="level-diversity",
    )
    parser.add_argument("--levels", help="Comma-separated levels to include.")
    parser.add_argument("--elements", help="Comma-separated elements to include.")
    parser.add_argument("--budget-tiers", help="Comma-separated budget tiers to include.")
    parser.add_argument("--output-json", help="Write JSON report to this path.")
    parser.add_argument("--output-md", help="Write Markdown summary to this path.")
    parser.add_argument("--split-output-dir", help="Write one JSON/Markdown report per selected target.")
    parser.add_argument("--resume-existing", action="store_true", help="In split-output mode, reuse existing one-row target reports.")
    parser.add_argument("--git-sha", help="Git SHA to record when the runtime cannot see .git.")
    parser.add_argument("--use-cache", action="store_true", help="Use process cache during generation.")
    args = parser.parse_args()
    if args.resume_existing and not args.split_output_dir:
        parser.error("--resume-existing requires --split-output-dir.")

    target_source = None
    if args.target_file:
        target_file_result = load_targets_from_file(
            args.target_file,
            limit=args.target_file_limit,
            prefix=args.target_file_prefix,
        )
        all_targets = target_file_result.targets
        target_source = target_file_result.source
    else:
        all_targets = targets_for_set(args.target_set)
    target_set = "target-file" if args.target_file else args.target_set
    targets = selected_targets(
        all_targets=all_targets,
        target_names=csv_filter(args.targets),
        levels=parse_int_filter(args.levels),
        elements=csv_filter(args.elements),
        budget_tiers=parse_int_filter(args.budget_tiers),
    )
    if not targets:
        parser.error(f"No targets selected from {target_source or args.target_set}.")

    generator = (
        build_discovery_response
        if args.use_cache
        else lambda query: build_discovery_response(query, use_cache=False)
    )
    if args.split_output_dir:
        split_result = write_split_matrix_reports(
            targets,
            output_dir=Path(args.split_output_dir),
            generator=generator,
            target_set=target_set,
            git_sha=args.git_sha,
            target_source=target_source,
            resume_existing=args.resume_existing,
        )
        report = split_result["aggregateReport"]
    else:
        report = build_matrix_report(
            targets,
            generator=generator,
            target_set=target_set,
            git_sha=args.git_sha,
            target_source=target_source,
        )

    if args.output_json:
        output_json = Path(args.output_json)
        output_json.parent.mkdir(parents=True, exist_ok=True)
        output_json.write_text(
            json.dumps(report, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    else:
        print(json.dumps(report, indent=2, ensure_ascii=False))

    if args.output_md:
        output_md = Path(args.output_md)
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(render_markdown(report), encoding="utf-8")


if __name__ == "__main__":
    main()
