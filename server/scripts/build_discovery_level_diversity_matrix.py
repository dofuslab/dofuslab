"""Generate review artifacts for the Iop level-diversity smoke matrix."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    SLOTS,
    BuildDiscoveryQuery,
    build_discovery_response,
    query_summary,
)
from scripts.test_build_discovery_level_diversity_generation_smoke import (  # noqa: E402
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
    target_names: set[str] | None = None,
    levels: set[int] | None = None,
    elements: set[str] | None = None,
    budget_tiers: set[int] | None = None,
) -> list[LevelDiversityTarget]:
    targets = []
    for target in LEVEL_DIVERSITY_TARGETS:
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


def matrix_entry(
    target: LevelDiversityTarget,
    response: dict[str, Any],
    query: BuildDiscoveryQuery,
) -> dict[str, Any]:
    builds = response.get("builds", [])
    best_build = builds[0] if builds else None
    return {
        "target": target_summary(target),
        "query": query_summary(query),
        "status": "generated" if best_build else "no_build",
        "resultCount": len(builds),
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
        "scope": "Iop level-diversity sampled targets from prod aggregate discovery",
        "targetCount": len(entries),
        "generatedCount": sum(1 for entry in entries if entry["status"] == "generated"),
        "noBuildCount": sum(1 for entry in entries if entry["status"] == "no_build"),
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
        "",
        f"Targets: `{report['targetCount']}`",
        f"Generated: `{report['generatedCount']}`",
        f"No build: `{report['noBuildCount']}`",
        "",
        "| Target | Status | Score | Miss ms | AP/MP/Range | Main stat | Vitality | Sets | Items |",
        "|---|---:|---:|---:|---|---:|---:|---|---|",
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
        lines.append(
            "| {} | {} | {} | {} | {} | {} | {} | {} | {} |".format(
                target_label(target),
                entry["status"],
                summary.get("score", ""),
                elapsed,
                action_stats,
                main_stat,
                totals.get("Vitality", ""),
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
    parser.add_argument("--levels", help="Comma-separated levels to include.")
    parser.add_argument("--elements", help="Comma-separated elements to include.")
    parser.add_argument("--budget-tiers", help="Comma-separated budget tiers to include.")
    parser.add_argument("--output-json", help="Write JSON report to this path.")
    parser.add_argument("--output-md", help="Write Markdown summary to this path.")
    parser.add_argument("--use-cache", action="store_true", help="Use process cache during generation.")
    args = parser.parse_args()

    targets = selected_targets(
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
    report = build_matrix_report(targets, generator=generator)

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
