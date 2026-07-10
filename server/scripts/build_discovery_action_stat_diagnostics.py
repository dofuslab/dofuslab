"""Diagnose AP/MP/Range feasibility for generated matrix rows."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from typing import Any, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    ACTION_STATS,
    LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL,
    SLOTS,
    BuildState,
    BuildDiscoveryQuery,
    action_stats_meet_target,
    add_item_to_state,
    apply_missing_exos,
    base_ap_for_level,
    candidate_pool_for_slot,
    effective_exo_policy,
    hard_cap_target,
    is_dofus_slot,
    load_items,
    load_sets,
    query_summary,
    relevant_set_ids,
    set_bonus_stats,
    target_level_context,
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


def action_bonus_set_ids(sets: dict[str, dict[str, Any]]) -> set[str]:
    set_ids = set()
    for set_id, set_obj in sets.items():
        for stats in set_bonus_stats(set_obj).values():
            if any(stats.get(stat, 0) > 0 for stat in ACTION_STATS):
                set_ids.add(set_id)
                break
    return set_ids


def item_action_stats(item: dict[str, Any]) -> dict[str, int]:
    return stat_vector(item.get("_stats", {}))


def compact_witness_state(state: BuildState) -> dict[str, Any]:
    return {
        "totals": stat_vector(state.stats),
        "exos": state.exos,
        "items": [
            {
                "slot": slot_name,
                "id": item.get("dofusID"),
                "name": item.get("_name") or item.get("name") or item.get("dofusID"),
                "level": item.get("level"),
                "itemType": item.get("itemType"),
                "stats": item_action_stats(item),
            }
            for slot_name, item in state.slots.items()
        ],
    }


def solver_candidate_pool_coverage(
    query: BuildDiscoveryQuery,
    witness: dict[str, Any] | None,
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
) -> dict[str, Any] | None:
    if not witness:
        return None

    started_at = time.perf_counter()
    relevant_sets = relevant_set_ids(items, sets, query.relevant_set_limit)
    pools = {
        slot_name: candidate_pool_for_slot(
            slot_types,
            items,
            relevant_sets,
            query.top_k,
            required_item_ids=set(query.locked_item_ids),
            target_level=query.level,
        )
        for slot_name, slot_types in SLOTS
    }
    by_slot = []
    missing = []
    for witness_item in witness.get("items", []):
        slot_name = witness_item["slot"]
        item_id = str(witness_item["id"])
        pool = pools.get(slot_name, [])
        present = any(str(item.get("dofusID")) == item_id for item in pool)
        row = {
            "slot": slot_name,
            "id": item_id,
            "name": witness_item.get("name"),
            "inSolverPool": present,
            "poolSize": len(pool),
        }
        by_slot.append(row)
        if not present:
            missing.append(row)
    return {
        "topK": query.top_k,
        "relevantSetLimit": query.relevant_set_limit,
        "elapsedMs": round((time.perf_counter() - started_at) * 1000, 1),
        "missingCount": len(missing),
        "witnessItemCount": len(by_slot),
        "missingItems": missing,
        "items": by_slot,
    }


def witness_slot_choices(
    slot_name: str,
    slot_types: tuple[str, ...],
    items: list[dict[str, Any]],
    action_set_ids: set[str],
    level: int,
) -> list[dict[str, Any] | None]:
    compatible = [item for item in items if item.get("itemType") in slot_types]
    useful = [
        item
        for item in compatible
        if any(item.get("_stats", {}).get(stat, 0) > 0 for stat in ACTION_STATS)
        or item.get("setID") in action_set_ids
    ]
    if slot_name == "pet" or is_dofus_slot(slot_name) or level <= LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL:
        return [None] + useful
    if useful:
        return useful
    if compatible:
        return compatible[:1]
    return []


def find_action_stat_witness_result(
    query: BuildDiscoveryQuery,
    *,
    max_states_per_slot: int = 20_000,
) -> dict[str, Any]:
    items = load_items(query.target, budget_tier=query.budget_tier)
    sets = load_sets()
    action_set_ids = action_bonus_set_ids(sets)
    cap_target = hard_cap_target(query.level)
    slot_choices = [
        (
            slot_name,
            witness_slot_choices(slot_name, slot_types, items, action_set_ids, query.level),
        )
        for slot_name, slot_types in SLOTS
    ]
    if any(not choices for _, choices in slot_choices):
        return {
            "enabled": True,
            "maxStatesPerSlot": max_states_per_slot,
            "stateLimitHit": False,
            "found": False,
            "witness": None,
        }

    with target_level_context(query.level):
        states = [BuildState()]
        state_limit_hit = False
        for slot_name, choices in slot_choices:
            next_states: list[BuildState] = []
            for state in states:
                for item in choices:
                    if item is None:
                        next_states.append(state)
                        continue
                    next_state = add_item_to_state(
                        state,
                        slot_name,
                        item,
                        sets,
                        query.target,
                        condition_target=query.target,
                        cap_target=cap_target,
                        include_potential_score=False,
                    )
                    if next_state is not None:
                        next_states.append(next_state)
            buckets: dict[tuple[Any, ...], BuildState] = {}
            for state in next_states:
                key = (
                    min(state.stats.get("AP", 0), query.ap_target),
                    min(state.stats.get("MP", 0), query.mp_target),
                    min(state.stats.get("Range", 0), query.target.range),
                    tuple(
                        sorted(
                            (set_id, min(count, 8))
                            for set_id, count in state.set_counts.items()
                            if set_id in action_set_ids
                        )
                    ),
                )
                buckets.setdefault(key, state)
            if len(buckets) > max_states_per_slot:
                state_limit_hit = True
            states = sorted(
                buckets.values(),
                key=lambda state: (
                    state.stats.get("AP", 0),
                    state.stats.get("MP", 0),
                    state.stats.get("Range", 0),
                    len(state.slots),
                ),
                reverse=True,
            )[:max_states_per_slot]

        for state in states:
            state_with_exos = apply_missing_exos(state, query.target, effective_exo_policy(query))
            if state_with_exos and action_stats_meet_target(state_with_exos, query.target):
                return {
                    "enabled": True,
                    "maxStatesPerSlot": max_states_per_slot,
                    "stateLimitHit": state_limit_hit,
                    "found": True,
                    "witness": compact_witness_state(state_with_exos),
                }
    return {
        "enabled": True,
        "maxStatesPerSlot": max_states_per_slot,
        "stateLimitHit": state_limit_hit,
        "found": False,
        "witness": None,
    }


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


def diagnose_entry(
    entry: dict[str, Any],
    *,
    witness_search: bool = False,
    witness_max_states_per_slot: int = 20_000,
    solver_pool_coverage: bool = False,
) -> dict[str, Any]:
    target = entry["target"]
    query = query_from_entry(entry)
    query.validate()
    items = load_items(query.target, budget_tier=query.budget_tier)
    summaries = slot_action_summaries(items)
    upper_bound = optimistic_upper_bound(query, summaries)
    reasons = diagnostic_reasons(query, upper_bound)
    witness_search_result = (
        find_action_stat_witness_result(query, max_states_per_slot=witness_max_states_per_slot)
        if witness_search
        else {
            "enabled": False,
            "maxStatesPerSlot": witness_max_states_per_slot,
            "stateLimitHit": False,
            "found": False,
            "witness": None,
        }
    )
    witness = witness_search_result["witness"]
    sets = load_sets() if witness and solver_pool_coverage else {}
    return {
        "target": target,
        "query": query_summary(query),
        "matrixStatus": entry.get("status"),
        "catalogItemCount": len(items),
        "effectiveExoPolicy": effective_exo_policy(query),
        "optimisticIndependentSlotUpperBound": upper_bound,
        "diagnosticStatus": (
            "action_stat_witness_found"
            if witness
            else
            "item_stat_upper_bound_below_target"
            if any("below target" in reason for reason in reasons)
            else "not_proven_infeasible"
        ),
        "reasons": reasons,
        "witnessSearch": {
            key: value for key, value in witness_search_result.items() if key != "witness"
        },
        "actionStatWitness": witness,
        "solverCandidatePoolCoverage": (
            solver_candidate_pool_coverage(query, witness, items, sets)
            if solver_pool_coverage
            else None
        ),
        "slotSummaries": summaries,
    }


def build_diagnostics_report(
    matrix_report: dict[str, Any],
    *,
    statuses: set[str] | None = None,
    target_ids: set[str] | None = None,
    witness_search: bool = False,
    witness_max_states_per_slot: int = 20_000,
    solver_pool_coverage: bool = False,
) -> dict[str, Any]:
    return build_diagnostics_report_for_entries(
        matrix_report,
        selected_matrix_entries(matrix_report, statuses=statuses, target_ids=target_ids),
        witness_search=witness_search,
        witness_max_states_per_slot=witness_max_states_per_slot,
        solver_pool_coverage=solver_pool_coverage,
    )


def build_diagnostics_report_for_entries(
    matrix_report: dict[str, Any],
    entries: Iterable[dict[str, Any]],
    *,
    witness_search: bool = False,
    witness_max_states_per_slot: int = 20_000,
    solver_pool_coverage: bool = False,
) -> dict[str, Any]:
    diagnostics = [
        diagnose_entry(
            entry,
            witness_search=witness_search,
            witness_max_states_per_slot=witness_max_states_per_slot,
            solver_pool_coverage=solver_pool_coverage,
        )
        for entry in entries
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
        "actionStatWitnessFoundCount": sum(
            1 for diagnostic in diagnostics if diagnostic["diagnosticStatus"] == "action_stat_witness_found"
        ),
        "witnessSearchRunCount": sum(
            1 for diagnostic in diagnostics if (diagnostic.get("witnessSearch") or {}).get("enabled")
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
        f"Witness searches run: `{report.get('witnessSearchRunCount', 0)}`",
        (
            "Action-stat witnesses found: "
            f"`{report.get('actionStatWitnessFoundCount', 0)}` "
            f"of `{report.get('witnessSearchRunCount', 0)}` searched"
        ),
        "",
        "| Target | Matrix status | Diagnostic status | Upper AP/MP/Range | Witness search | Witness AP/MP/Range | Default solver pool missing | Reasons |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for diagnostic in report["diagnostics"]:
        upper = diagnostic["optimisticIndependentSlotUpperBound"]
        witness = diagnostic.get("actionStatWitness") or {}
        witness_totals = witness.get("totals") or {}
        witness_label = (
            f"{witness_totals.get('AP', '')}/{witness_totals.get('MP', '')}/{witness_totals.get('Range', '')}"
            if witness_totals
            else ""
        )
        witness_search = diagnostic.get("witnessSearch") or {}
        witness_search_label = (
            "not run"
            if not witness_search.get("enabled")
            else "found, state cap hit"
            if witness_search.get("found") and witness_search.get("stateLimitHit")
            else "found"
            if witness_search.get("found")
            else "not found, state cap hit"
            if witness_search.get("stateLimitHit")
            else "not found"
        )
        pool_coverage = diagnostic.get("solverCandidatePoolCoverage") or {}
        missing_items = pool_coverage.get("missingItems") or []
        pool_missing_label = (
            "not checked"
            if not pool_coverage
            else "0"
            if not missing_items
            else "{}: {}".format(
                len(missing_items),
                ", ".join(str(item.get("name") or item.get("id")) for item in missing_items[:6]),
            )
        )
        if pool_coverage:
            pool_missing_label = (
                f"{pool_missing_label} "
                f"(topK {pool_coverage.get('topK')}, "
                f"sets {pool_coverage.get('relevantSetLimit')}, "
                f"{pool_coverage.get('elapsedMs')}ms)"
            )
        lines.append(
            "| {} | {} | {} | {}/{}/{} | {} | {} | {} | {} |".format(
                target_label(diagnostic["target"]),
                diagnostic["matrixStatus"],
                diagnostic["diagnosticStatus"],
                upper.get("AP", ""),
                upper.get("MP", ""),
                upper.get("Range", ""),
                witness_search_label,
                witness_label,
                pool_missing_label,
                "; ".join(diagnostic["reasons"]),
            )
        )
    lines.append("")
    return "\n".join(lines)


def artifact_stem_for_target(entry: dict[str, Any]) -> str:
    target_id = str((entry.get("target") or {}).get("id") or "unknown-target")
    stem = re.sub(r"[^A-Za-z0-9_.-]+", "-", target_id).strip("-")
    return stem or "unknown-target"


def unique_artifact_stem(entry: dict[str, Any], used_stems: dict[str, int]) -> str:
    stem = artifact_stem_for_target(entry)
    count = used_stems.get(stem, 0)
    used_stems[stem] = count + 1
    if count == 0:
        return stem
    return f"{stem}-{count + 1}"


def write_report_outputs(report: dict[str, Any], *, output_json: Path, output_md: Path | None = None) -> None:
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if output_md is not None:
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(render_markdown(report), encoding="utf-8")


def combine_split_diagnostics(matrix_report: dict[str, Any], reports: Iterable[dict[str, Any]]) -> dict[str, Any]:
    diagnostics = []
    for report in reports:
        diagnostics.extend(report.get("diagnostics", []))
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
        "actionStatWitnessFoundCount": sum(
            1 for diagnostic in diagnostics if diagnostic["diagnosticStatus"] == "action_stat_witness_found"
        ),
        "witnessSearchRunCount": sum(
            1 for diagnostic in diagnostics if (diagnostic.get("witnessSearch") or {}).get("enabled")
        ),
        "diagnostics": diagnostics,
    }


def write_split_reports(
    matrix_report: dict[str, Any],
    entries: Iterable[dict[str, Any]],
    *,
    output_dir: Path,
    witness_search: bool = False,
    witness_max_states_per_slot: int = 20_000,
    solver_pool_coverage: bool = False,
) -> dict[str, Any]:
    written = []
    reports = []
    used_stems: dict[str, int] = {}
    output_dir.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        report = build_diagnostics_report_for_entries(
            matrix_report,
            [entry],
            witness_search=witness_search,
            witness_max_states_per_slot=witness_max_states_per_slot,
            solver_pool_coverage=solver_pool_coverage,
        )
        reports.append(report)
        stem = unique_artifact_stem(entry, used_stems)
        json_path = output_dir / f"{stem}.json"
        md_path = output_dir / f"{stem}.md"
        write_report_outputs(report, output_json=json_path, output_md=md_path)
        written.append(
            {
                "targetId": (entry.get("target") or {}).get("id"),
                "json": str(json_path),
                "markdown": str(md_path),
                "diagnosticStatus": report["diagnostics"][0]["diagnosticStatus"] if report["diagnostics"] else None,
            }
        )
    manifest = {
        "reportVersion": REPORT_VERSION,
        "sourceMatrix": matrix_report.get("scope"),
        "sourceGeneratedAt": matrix_report.get("generatedAt"),
        "splitReportCount": len(written),
        "reports": written,
    }
    write_report_outputs(manifest, output_json=output_dir / "manifest.json")
    return {
        "manifest": manifest,
        "aggregateReport": combine_split_diagnostics(matrix_report, reports),
    }


def csv_filter(raw_value: str | None) -> set[str] | None:
    if not raw_value or raw_value == "all":
        return None
    return {value.strip() for value in raw_value.split(",") if value.strip()}


def require_selected_entries(
    parser: argparse.ArgumentParser,
    entries: list[dict[str, Any]],
    *,
    statuses: set[str] | None,
    target_ids: set[str] | None,
) -> None:
    if entries:
        return
    filters = []
    if statuses is not None:
        filters.append(f"statuses={','.join(sorted(statuses))}")
    if target_ids is not None:
        filters.append(f"targets={','.join(sorted(target_ids))}")
    filter_label = "; ".join(filters) if filters else "no filters"
    parser.error(f"no matrix rows matched diagnostic filters ({filter_label})")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("matrix_report")
    parser.add_argument("--statuses", default="no_build")
    parser.add_argument("--targets")
    parser.add_argument("--witness-search", action="store_true")
    parser.add_argument("--witness-max-states-per-slot", type=int, default=20_000)
    parser.add_argument(
        "--solver-pool-coverage",
        action="store_true",
        help="For found witnesses, also check default solver candidate-pool coverage.",
    )
    parser.add_argument("--output-json")
    parser.add_argument("--output-md")
    parser.add_argument(
        "--split-output-dir",
        help="Write one JSON/Markdown diagnostic artifact per selected target and a manifest.",
    )
    args = parser.parse_args()

    matrix_report = load_json(args.matrix_report)
    statuses = csv_filter(args.statuses)
    target_ids = csv_filter(args.targets)

    selected_entries = selected_matrix_entries(matrix_report, statuses=statuses, target_ids=target_ids)
    require_selected_entries(parser, selected_entries, statuses=statuses, target_ids=target_ids)

    if args.split_output_dir:
        split_result = write_split_reports(
            matrix_report,
            selected_entries,
            output_dir=Path(args.split_output_dir),
            witness_search=args.witness_search,
            witness_max_states_per_slot=args.witness_max_states_per_slot,
            solver_pool_coverage=args.solver_pool_coverage,
        )
        if args.output_json:
            write_report_outputs(
                split_result["aggregateReport"],
                output_json=Path(args.output_json),
                output_md=Path(args.output_md) if args.output_md else None,
            )
        elif args.output_md:
            output_md = Path(args.output_md)
            output_md.parent.mkdir(parents=True, exist_ok=True)
            output_md.write_text(render_markdown(split_result["aggregateReport"]), encoding="utf-8")
        else:
            print(json.dumps(split_result["manifest"], indent=2, ensure_ascii=False))
        return

    report = build_diagnostics_report_for_entries(
        matrix_report,
        selected_entries,
        witness_search=args.witness_search,
        witness_max_states_per_slot=args.witness_max_states_per_slot,
        solver_pool_coverage=args.solver_pool_coverage,
    )

    if args.output_json:
        write_report_outputs(
            report,
            output_json=Path(args.output_json),
            output_md=Path(args.output_md) if args.output_md else None,
        )
    else:
        print(json.dumps(report, indent=2, ensure_ascii=False))

    if args.output_md and not args.output_json:
        output_md = Path(args.output_md)
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(render_markdown(report), encoding="utf-8")


if __name__ == "__main__":
    main()
