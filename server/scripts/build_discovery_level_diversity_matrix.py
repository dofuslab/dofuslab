"""Generate review artifacts for the Iop level-diversity smoke matrix."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
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
    AP_MP_RANGE_GRID_NEXT_CAP_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS,
    BOUNDARY_LEVEL_TARGETS,
    LEVEL_DIVERSITY_TARGETS,
    LevelDiversityTarget,
    query_for_target,
)


REPORT_VERSION = "build-discovery-level-diversity-matrix-v1"


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


def targets_for_set(target_set: str) -> tuple[LevelDiversityTarget, ...]:
    if target_set == "level-diversity":
        return LEVEL_DIVERSITY_TARGETS
    if target_set == "boundary":
        return BOUNDARY_LEVEL_TARGETS
    if target_set == "coverage":
        return AP_MP_RANGE_COVERAGE_TARGETS
    if target_set == "grid-next-minimum":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS
    if target_set == "grid-next-cap":
        return AP_MP_RANGE_GRID_NEXT_CAP_TARGETS
    if target_set == "all":
        return (
            LEVEL_DIVERSITY_TARGETS
            + BOUNDARY_LEVEL_TARGETS
            + AP_MP_RANGE_COVERAGE_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_TARGETS
        )
    raise ValueError(f"Unsupported target set: {target_set}")


def target_source_for_set(target_set: str) -> str:
    if target_set == "boundary":
        return "scripts.build_discovery_level_diversity_targets.BOUNDARY_LEVEL_TARGETS"
    if target_set == "coverage":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_COVERAGE_TARGETS"
    if target_set == "grid-next-minimum":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS"
    if target_set == "grid-next-cap":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_TARGETS"
    if target_set == "all":
        return "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS+BOUNDARY_LEVEL_TARGETS+AP_MP_RANGE_COVERAGE_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_TARGETS"
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


def build_matrix_report(
    targets: Iterable[LevelDiversityTarget],
    *,
    generator: Callable[[BuildDiscoveryQuery], dict[str, Any]] = build_discovery_response,
    generated_at: str | None = None,
    target_set: str = "level-diversity",
    git_sha: str | None = None,
) -> dict[str, Any]:
    entries = []
    for target in targets:
        query = query_for_target(target)
        query.validate()
        response = generator(query)
        entries.append(matrix_entry(target, response, query))

    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": generated_at or datetime.now(timezone.utc).isoformat(),
        "scope": f"Iop {target_set} generated target matrix",
        "evidenceType": (
            "action_stat_feasibility"
            if target_set == "coverage"
            else "generated_solver_snapshot"
        ),
        "provenance": {
            "gitSha": git_sha or current_git_sha(),
            "targetSource": target_source_for_set(target_set),
            "generator": "scripts/build_discovery_level_diversity_matrix.py",
        },
        "targetCount": len(entries),
        "generatedCount": sum(1 for entry in entries if entry["status"] == "generated"),
        "noBuildCount": sum(1 for entry in entries if entry["status"] == "no_build"),
        "invalidCount": sum(1 for entry in entries if entry["status"] == "invalid"),
        "results": entries,
    }


def target_label(target: dict[str, Any]) -> str:
    range_value = target["rangeTarget"]
    range_label = "any" if range_value is None else str(range_value)
    return (
        f"L{target['level']} {target['element']} "
        f"{target['apTarget']}/{target['mpTarget']}/{range_label} "
        f"tier {target['budgetTier']}"
    )


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery Iop Level Diversity Matrix",
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        (
            "This is a generated-output snapshot for the sampled Milestone 3 "
            "level-diversity targets. It records the current best solver result "
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
    parser.add_argument(
        "--target-set",
        choices=("level-diversity", "boundary", "coverage", "grid-next-minimum", "grid-next-cap", "all"),
        default="level-diversity",
    )
    parser.add_argument("--levels", help="Comma-separated levels to include.")
    parser.add_argument("--elements", help="Comma-separated elements to include.")
    parser.add_argument("--budget-tiers", help="Comma-separated budget tiers to include.")
    parser.add_argument("--output-json", help="Write JSON report to this path.")
    parser.add_argument("--output-md", help="Write Markdown summary to this path.")
    parser.add_argument("--git-sha", help="Git SHA to record when the runtime cannot see .git.")
    parser.add_argument("--use-cache", action="store_true", help="Use process cache during generation.")
    args = parser.parse_args()

    targets = selected_targets(
        all_targets=targets_for_set(args.target_set),
        target_names=csv_filter(args.targets),
        levels=parse_int_filter(args.levels),
        elements=csv_filter(args.elements),
        budget_tiers=parse_int_filter(args.budget_tiers),
    )
    if not targets:
        parser.error("No level-diversity targets selected.")

    generator = (
        build_discovery_response
        if args.use_cache
        else lambda query: build_discovery_response(query, use_cache=False)
    )
    report = build_matrix_report(
        targets,
        generator=generator,
        target_set=args.target_set,
        git_sha=args.git_sha,
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
