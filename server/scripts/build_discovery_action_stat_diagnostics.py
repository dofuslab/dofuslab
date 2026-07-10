"""Diagnose AP/MP/Range feasibility for generated matrix rows."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    ACTION_STATS,
    SLOTS,
    BuildDiscoveryQuery,
    base_ap_for_level,
    effective_exo_policy,
    load_items,
    query_summary,
)


REPORT_VERSION = "build-discovery-action-stat-diagnostics-v1"


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def query_from_entry(entry: dict[str, Any]) -> BuildDiscoveryQuery:
    target = entry["target"]
    source_query = entry.get("query") or {}
    return BuildDiscoveryQuery(
        class_name=source_query.get("className") or target.get("className", "Iop"),
        level=source_query.get("level") or target["level"],
        elements=tuple(source_query.get("elements") or (target["element"],)),
        mode=source_query.get("mode", "pvm"),
        ap_target=source_query.get("apTarget") or target["apTarget"],
        mp_target=source_query.get("mpTarget") or target["mpTarget"],
        range_target=source_query.get("rangeTarget", target["rangeTarget"]),
        damage_survivability_preset=source_query.get("damageSurvivabilityPreset", 3),
        budget_tier=source_query.get("budgetTier") or target["budgetTier"],
        exo_policy=source_query.get("exoPolicy") or ("none" if target["budgetTier"] < 3 else "allow"),
        weapon_policy=source_query.get("weaponPolicy", "stat_stick_allowed"),
        locked_item_ids=tuple(source_query.get("lockedItemIds") or ()),
        avoided_item_ids=tuple(source_query.get("avoidedItemIds") or ()),
        limit=1,
    )


def selected_matrix_entries(
    report: dict[str, Any],
    *,
    statuses: set[str] | None = None,
    target_ids: set[str] | None = None,
) -> list[dict[str, Any]]:
    entries = []
    for entry in report.get("results", []):
        target = entry.get("target") or {}
        if statuses is not None and entry.get("status") not in statuses:
            continue
        if target_ids is not None and target.get("id") not in target_ids:
            continue
        entries.append(entry)
    return entries


def stat_vector(stats: dict[str, int]) -> dict[str, int]:
    return {stat: int(stats.get(stat, 0) or 0) for stat in ACTION_STATS}


def slot_action_summaries(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    summaries = []
    for slot_name, slot_types in SLOTS:
        compatible = [item for item in items if item.get("itemType") in slot_types]
        max_stats = {
            stat: max((item.get("_stats", {}).get(stat, 0) for item in compatible), default=0)
            for stat in ACTION_STATS
        }
        action_items = [
            item for item in compatible if any(item.get("_stats", {}).get(stat, 0) > 0 for stat in ACTION_STATS)
        ]
        top_action_items = sorted(
            action_items,
            key=lambda item: (
                sum(max(0, item.get("_stats", {}).get(stat, 0)) for stat in ACTION_STATS),
                item.get("_score", 0),
                item.get("level", 0),
            ),
            reverse=True,
        )[:8]
        summaries.append(
            {
                "slot": slot_name,
                "compatibleCount": len(compatible),
                "actionSourceCount": len(action_items),
                "maxActionStats": max_stats,
                "topActionSources": [
                    {
                        "id": item.get("dofusID"),
                        "name": item.get("_name") or item.get("name") or item.get("dofusID"),
                        "level": item.get("level"),
                        "itemType": item.get("itemType"),
                        "stats": stat_vector(item.get("_stats", {})),
                    }
                    for item in top_action_items
                ],
            }
        )
    return summaries


def optimistic_upper_bound(query: BuildDiscoveryQuery, slot_summaries: Iterable[dict[str, Any]]) -> dict[str, int]:
    totals = {"AP": base_ap_for_level(query.level), "MP": 3, "Range": 0}
    for summary in slot_summaries:
        for stat, value in summary["maxActionStats"].items():
            totals[stat] += max(0, value)
    if effective_exo_policy(query) != "none":
        for stat in ACTION_STATS:
            totals[stat] += 1
    return totals


def diagnostic_reasons(query: BuildDiscoveryQuery, upper_bound: dict[str, int]) -> list[str]:
    reasons = []
    targets = {"AP": query.ap_target, "MP": query.mp_target, "Range": query.target.range}
    for stat, target_value in targets.items():
        if upper_bound.get(stat, 0) < target_value:
            reasons.append(f"{stat} optimistic upper bound {upper_bound.get(stat, 0)} is below target {target_value}")
    if not reasons:
        reasons.append(
            "Optimistic item-stat-only independent slot upper bound reaches the target; no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question."
        )
    return reasons


def diagnose_entry(entry: dict[str, Any]) -> dict[str, Any]:
    target = entry["target"]
    query = query_from_entry(entry)
    query.validate()
    items = load_items(query.target, budget_tier=query.budget_tier)
    summaries = slot_action_summaries(items)
    upper_bound = optimistic_upper_bound(query, summaries)
    reasons = diagnostic_reasons(query, upper_bound)
    return {
        "target": target,
        "query": query_summary(query),
        "matrixStatus": entry.get("status"),
        "catalogItemCount": len(items),
        "effectiveExoPolicy": effective_exo_policy(query),
        "optimisticIndependentSlotUpperBound": upper_bound,
        "diagnosticStatus": (
            "item_stat_upper_bound_below_target"
            if any("below target" in reason for reason in reasons)
            else "not_proven_infeasible"
        ),
        "reasons": reasons,
        "slotSummaries": summaries,
    }


def build_diagnostics_report(
    matrix_report: dict[str, Any],
    *,
    statuses: set[str] | None = None,
    target_ids: set[str] | None = None,
) -> dict[str, Any]:
    diagnostics = [
        diagnose_entry(entry)
        for entry in selected_matrix_entries(matrix_report, statuses=statuses, target_ids=target_ids)
    ]
    return {
        "reportVersion": REPORT_VERSION,
        "sourceMatrix": matrix_report.get("scope"),
        "sourceGeneratedAt": matrix_report.get("generatedAt"),
        "diagnosticCount": len(diagnostics),
        "itemStatUpperBoundBelowTargetCount": sum(
            1 for diagnostic in diagnostics if diagnostic["diagnosticStatus"] == "item_stat_upper_bound_below_target"
        ),
        "notProvenInfeasibleCount": sum(
            1 for diagnostic in diagnostics if diagnostic["diagnosticStatus"] == "not_proven_infeasible"
        ),
        "diagnostics": diagnostics,
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
        "# Build Discovery Action-Stat Diagnostics",
        "",
        "This diagnostic is an optimistic AP/MP/Range item-stat check.",
        "It sums the best independent item stat per slot and optional exos, but does not include set bonuses.",
        "If the item-stat-only upper bound is below target, the no-build row has strong catalog evidence but is not fully proven infeasible until set bonuses are considered.",
        "If the upper bound reaches target, no-build remains a solver/search, set-bonus, uniqueness, condition, or interaction question.",
        "",
        f"Diagnostics: `{report['diagnosticCount']}`",
        f"Item-stat upper-bound below target: `{report['itemStatUpperBoundBelowTargetCount']}`",
        f"Not proven infeasible: `{report['notProvenInfeasibleCount']}`",
        "",
        "| Target | Matrix status | Diagnostic status | Upper AP/MP/Range | Reasons |",
        "|---|---|---|---|---|",
    ]
    for diagnostic in report["diagnostics"]:
        upper = diagnostic["optimisticIndependentSlotUpperBound"]
        lines.append(
            "| {} | {} | {} | {}/{}/{} | {} |".format(
                target_label(diagnostic["target"]),
                diagnostic["matrixStatus"],
                diagnostic["diagnosticStatus"],
                upper.get("AP", ""),
                upper.get("MP", ""),
                upper.get("Range", ""),
                "; ".join(diagnostic["reasons"]),
            )
        )
    lines.append("")
    return "\n".join(lines)


def csv_filter(raw_value: str | None) -> set[str] | None:
    if not raw_value or raw_value == "all":
        return None
    return {value.strip() for value in raw_value.split(",") if value.strip()}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("matrix_report")
    parser.add_argument("--statuses", default="no_build")
    parser.add_argument("--targets")
    parser.add_argument("--output-json")
    parser.add_argument("--output-md")
    args = parser.parse_args()

    report = build_diagnostics_report(
        load_json(args.matrix_report),
        statuses=csv_filter(args.statuses),
        target_ids=csv_filter(args.targets),
    )

    if args.output_json:
        output_json = Path(args.output_json)
        output_json.parent.mkdir(parents=True, exist_ok=True)
        output_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    else:
        print(json.dumps(report, indent=2, ensure_ascii=False))

    if args.output_md:
        output_md = Path(args.output_md)
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(render_markdown(report), encoding="utf-8")


if __name__ == "__main__":
    main()
