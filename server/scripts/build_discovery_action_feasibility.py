"""Bounded action-stat feasibility diagnostics for build discovery targets.

This is not a build scorer. It answers a narrower question: can the catalog
assemble the requested AP/MP/Range under level, budget, slot, duplicate-item,
condition, and set-bonus constraints?
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff import build_discovery_prototype as solver  # noqa: E402
from scripts.build_discovery_level_diversity_matrix import (  # noqa: E402
    csv_filter,
    selected_targets,
    targets_for_set,
)
from scripts.build_discovery_level_diversity_targets import (  # noqa: E402
    LevelDiversityTarget,
    query_for_target,
)


REPORT_VERSION = "build-discovery-action-feasibility-v1"


@dataclass(frozen=True)
class FeasibilityConfig:
    max_states_per_slot: int = 50_000
    max_examples: int = 3


def target_to_build_target(target: LevelDiversityTarget) -> solver.BuildTarget:
    return solver.BuildTarget(
        ap=target.ap,
        mp=target.mp,
        range=solver.normalize_range_target(target.range_target),
        level=target.level,
        min_ap=solver.base_ap_for_level(target.level),
        range_required=target.range_target is not None,
    )


def is_dofus_slot(slot_name: str) -> bool:
    return slot_name.startswith("dofus_")


def action_stats(stats: dict[str, int]) -> dict[str, int]:
    return {stat: stats.get(stat, 0) for stat in solver.ACTION_STATS}


def action_stat_total(stats: dict[str, int], target: solver.BuildTarget) -> int:
    total = min(stats.get("AP", 0), target.ap) + min(stats.get("MP", 0), target.mp)
    if target.range_required:
        total += min(stats.get("Range", 0), target.range)
    return total


def action_deficit(stats: dict[str, int], target: solver.BuildTarget) -> int:
    deficit = max(target.ap - stats.get("AP", 0), 0) + max(target.mp - stats.get("MP", 0), 0)
    if target.range_required:
        deficit += max(target.range - stats.get("Range", 0), 0)
    return deficit


def state_sort_key(state: solver.BuildState, target: solver.BuildTarget) -> tuple[float, int, int, int, int, float]:
    ap_progress = min(state.stats.get("AP", 0), target.ap)
    mp_progress = min(state.stats.get("MP", 0), target.mp)
    range_progress = min(state.stats.get("Range", 0), target.range) if target.range_required else 0
    return (
        -action_deficit(state.stats, target),
        ap_progress,
        mp_progress,
        range_progress,
        action_stat_total(state.stats, target),
        solver.final_utility_score(state.stats),
    )


def action_set_ids(sets: dict[str, dict[str, Any]]) -> set[str]:
    return {
        set_id
        for set_id, set_obj in sets.items()
        if any(
            any(stats.get(stat, 0) > 0 for stat in solver.ACTION_STATS)
            for stats in solver.set_bonus_stats(set_obj).values()
        )
    }


def action_relevant_pools(
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    action_sets = action_set_ids(sets)
    pools: dict[str, list[dict[str, Any]]] = {}
    for slot_name, slot_types in solver.SLOTS:
        compatible = [item for item in items if item.get("itemType") in slot_types]
        selected = [
            item
            for item in compatible
            if any(item["_stats"].get(stat, 0) != 0 for stat in solver.ACTION_STATS)
            or item.get("setID") in action_sets
        ]
        pools[slot_name] = sorted(
            selected,
            key=lambda item: (
                sum(abs(item["_stats"].get(stat, 0)) for stat in solver.ACTION_STATS),
                solver.final_utility_score(item["_stats"]),
                item.get("level", 0),
            ),
            reverse=True,
        )
    return pools


def slot_action_pressure(slot_name: str, pool: list[dict[str, Any]]) -> tuple[int, int, int, int]:
    max_ap = max((item["_stats"].get("AP", 0) for item in pool), default=0)
    max_mp = max((item["_stats"].get("MP", 0) for item in pool), default=0)
    max_range = max((item["_stats"].get("Range", 0) for item in pool), default=0)
    return (max_ap, max_mp, max_range, len(pool))


def ordered_gear_slots(pools: dict[str, list[dict[str, Any]]]) -> list[str]:
    gear_slots = [slot_name for slot_name, _ in solver.SLOTS if not is_dofus_slot(slot_name)]
    return sorted(
        gear_slots,
        key=lambda slot_name: slot_action_pressure(slot_name, pools[slot_name]),
        reverse=True,
    )


def state_signature(state: solver.BuildState, target: solver.BuildTarget) -> tuple[Any, ...]:
    return (
        min(state.stats.get("AP", 0), target.ap),
        min(state.stats.get("MP", 0), target.mp),
        min(state.stats.get("Range", 0), target.range) if target.range_required else 0,
        tuple(sorted((set_id, min(count, 8)) for set_id, count in state.set_counts.items() if count)),
        tuple(sorted(state.used_item_ids)),
    )


def trim_states(
    states: Iterable[solver.BuildState],
    target: solver.BuildTarget,
    max_states: int,
) -> tuple[list[solver.BuildState], bool]:
    best_by_signature: dict[tuple[Any, ...], solver.BuildState] = {}
    for state in states:
        signature = state_signature(state, target)
        current = best_by_signature.get(signature)
        if current is None or state_sort_key(state, target) > state_sort_key(current, target):
            best_by_signature[signature] = state

    ranked = sorted(best_by_signature.values(), key=lambda state: state_sort_key(state, target), reverse=True)
    return ranked[:max_states], len(ranked) > max_states


def complete_with_action_dofus(
    state: solver.BuildState,
    dofus_items: list[dict[str, Any]],
    target: solver.BuildTarget,
    exo_policy: str,
    max_examples: int,
) -> list[solver.BuildState]:
    from itertools import combinations

    examples = []
    open_dofus_slots = [
        slot_name
        for slot_name, _ in solver.SLOTS
        if is_dofus_slot(slot_name) and slot_name not in state.slots
    ]
    max_combo_size = min(6, len(dofus_items))
    for combo_size in range(max_combo_size + 1):
        for combo in combinations(dofus_items, combo_size):
            if any(item["dofusID"] in state.used_item_ids for item in combo):
                continue
            completed = state.clone()
            for slot_name, item in zip(open_dofus_slots, combo):
                completed.slots[slot_name] = item
                completed.used_item_ids.add(item["dofusID"])
                solver.apply_stat_delta(completed.stats, item["_stats"])
            completed = solver.apply_missing_exos(completed, target, exo_policy)
            if completed is None:
                continue
            if (
                not solver.action_stats_meet_target(completed, target)
                or solver.unmet_item_conditions(completed)
            ):
                continue
            examples.append(completed)
            if len(examples) >= max_examples:
                return examples
    return examples


def summarize_state(state: solver.BuildState, sets: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {
        "stats": action_stats(state.stats),
        "items": [
            {
                "slot": slot_name,
                "id": item["dofusID"],
                "name": item["_name"],
                "stats": action_stats(item["_stats"]),
                "set": sets.get(item.get("setID"), {}).get("_name") if item.get("setID") else None,
            }
            for slot_name, item in sorted(state.slots.items())
        ],
        "exos": dict(state.exos),
        "sets": [
            {"name": sets.get(set_id, {}).get("_name", set_id), "count": count}
            for set_id, count in sorted(state.set_counts.items())
            if count
        ],
    }


def diagnose_target(
    target_spec: LevelDiversityTarget,
    config: FeasibilityConfig,
) -> dict[str, Any]:
    query = query_for_target(target_spec)
    target = target_to_build_target(target_spec)
    solver.configure_damage_profile(query.primary_element)
    exo_policy = solver.effective_exo_policy(query)
    with solver.target_level_context(target.level):
        items = solver.load_items(target, None, query.budget_tier)
        sets = solver.load_sets()
        items = [
            item
            for item in items
            if not item.get("setID") or not sets.get(item["setID"], {}).get("_excluded")
        ]
        pools = action_relevant_pools(items, sets)
        gear_slots = ordered_gear_slots(pools)
        dofus_by_id = {
            item["dofusID"]: item
            for slot_name in [slot for slot, _ in solver.SLOTS if is_dofus_slot(slot)]
            for item in pools[slot_name]
            if any(item["_stats"].get(stat, 0) != 0 for stat in solver.ACTION_STATS)
        }
        action_dofus = sorted(dofus_by_id.values(), key=lambda item: solver.final_utility_score(item["_stats"]), reverse=True)

        search_target = solver.exo_search_target(target)
        natural_cap_target = solver.exo_natural_cap_target(target)
        states = [solver.BuildState()]
        slot_summaries = []
        cap_hit = False
        examples: list[solver.BuildState] = []

        for slot_name in gear_slots:
            # Carry the current states through each slot to represent a non-action filler.
            # This keeps the diagnostic focused on AP/MP/Range feasibility instead of
            # forcing every slot to use an action-stat or action-set item.
            next_states = list(states)
            for state in states:
                for item in pools[slot_name]:
                    next_state = solver.add_item_to_state(
                        state,
                        slot_name,
                        item,
                        sets,
                        search_target,
                        condition_target=target,
                        cap_target=natural_cap_target,
                        include_potential_score=False,
                    )
                    if next_state is not None:
                        next_states.append(next_state)
            states, slot_cap_hit = trim_states(next_states, target, config.max_states_per_slot)
            cap_hit = cap_hit or slot_cap_hit
            best_state = max(states, key=lambda state: state_sort_key(state, target), default=None)
            slot_summaries.append(
                {
                    "slot": slot_name,
                    "candidateCount": len(pools[slot_name]),
                    "stateCount": len(states),
                    "stateCapHit": slot_cap_hit,
                    "bestActionStats": action_stats(best_state.stats) if best_state else None,
                }
            )

        for state in states:
            examples.extend(
                complete_with_action_dofus(
                    state,
                    action_dofus,
                    target,
                    exo_policy,
                    config.max_examples - len(examples),
                )
            )
            if len(examples) >= config.max_examples:
                break

        status = "feasible" if examples else "unknown_state_cap_hit" if cap_hit else "likely_infeasible"
        return {
            "target": {
                "id": target_spec.name,
                "level": target_spec.level,
                "element": target_spec.element,
                "budgetTier": target_spec.budget_tier,
                "apTarget": target_spec.ap,
                "mpTarget": target_spec.mp,
                "rangeTarget": target_spec.range_target,
            },
            "status": status,
            "baseStats": action_stats(solver.active_base_stats()),
            "slotSummaries": slot_summaries,
            "actionDofus": [
                {"id": item["dofusID"], "name": item["_name"], "stats": action_stats(item["_stats"])}
                for item in action_dofus
            ],
            "examples": [summarize_state(state, sets) for state in examples],
        }


def build_report(
    targets: list[LevelDiversityTarget],
    config: FeasibilityConfig,
) -> dict[str, Any]:
    results = [diagnose_target(target, config) for target in targets]
    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "targetCount": len(targets),
        "statusCounts": {
            status: sum(1 for result in results if result["status"] == status)
            for status in sorted({result["status"] for result in results})
        },
        "results": results,
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery Action Feasibility",
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        f"Targets: `{report['targetCount']}`",
        "",
        "| Target | Status | Base AP/MP/Range | Example AP/MP/Range | Notes |",
        "|---|---:|---:|---:|---|",
    ]
    for result in report["results"]:
        target = result["target"]
        base = result["baseStats"]
        example_stats = result["examples"][0]["stats"] if result["examples"] else None
        notes = []
        if any(summary["stateCapHit"] for summary in result["slotSummaries"]):
            notes.append("state cap hit")
        if result["actionDofus"]:
            notes.append(f"{len(result['actionDofus'])} action Dofus/trophies")
        lines.append(
            "| "
            + " | ".join(
                [
                    f"L{target['level']} {target['element']} {target['apTarget']}/{target['mpTarget']}/{target['rangeTarget']} tier {target['budgetTier']}",
                    result["status"],
                    f"{base.get('AP', 0)}/{base.get('MP', 0)}/{base.get('Range', 0)}",
                    (
                        f"{example_stats.get('AP', 0)}/{example_stats.get('MP', 0)}/{example_stats.get('Range', 0)}"
                        if example_stats
                        else ""
                    ),
                    ", ".join(notes),
                ]
            )
            + " |"
        )
    lines.append("")
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target-set", default="level-diversity")
    parser.add_argument("--targets", default=None, help="Comma-separated target ids, or all.")
    parser.add_argument("--levels", default=None, help="Comma-separated levels.")
    parser.add_argument("--elements", default=None, help="Comma-separated elements.")
    parser.add_argument("--budget-tiers", default=None, help="Comma-separated budget tiers.")
    parser.add_argument("--max-states-per-slot", type=int, default=50_000)
    parser.add_argument("--output-json", type=Path, required=True)
    parser.add_argument("--output-md", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    targets = selected_targets(
        all_targets=targets_for_set(args.target_set),
        target_names=csv_filter(args.targets),
        levels={int(level) for level in csv_filter(args.levels) or set()} or None,
        elements=csv_filter(args.elements),
        budget_tiers={int(tier) for tier in csv_filter(args.budget_tiers) or set()} or None,
    )
    report = build_report(
        targets,
        FeasibilityConfig(max_states_per_slot=args.max_states_per_slot),
    )
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_md.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(report, indent=2), encoding="utf-8")
    args.output_md.write_text(render_markdown(report), encoding="utf-8")


if __name__ == "__main__":
    main()
