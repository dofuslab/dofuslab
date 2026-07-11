"""CP-SAT experiment for one Build Discovery query.

This is intentionally isolated from the product path. It tests whether a
global constraint solver can produce a valid level 200 12/6/0 Strength Iop
build from the same indexed item data used by the prototype.
"""

from __future__ import annotations

import argparse
import json
import time
from collections import defaultdict
from dataclasses import dataclass
from typing import Any

from ortools.sat.python import cp_model

from oneoff.condition_evaluator import (
    CONDITION_STAT_TO_STAT_NAME,
    is_leaf_condition,
    unmet_item_conditions,
)
from oneoff.build_discovery_prototype import (
    ACTION_STATS,
    BuildDiscoveryQuery,
    BuildState,
    BuildTarget,
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    SLOTS,
    STAT_WEIGHTS,
    action_stats_meet_target,
    active_base_stats,
    apply_stat_delta,
    cheap_profile_damage_score,
    configure_damage_profile,
    effective_scoring_stats,
    expected_item_effect_stats,
    final_score_state,
    final_utility_score,
    item_score,
    load_items,
    load_sets,
    normalize_stats,
    optimize_base_allocation,
    parse_optional_range_target,
    profile_damage_reference_stats,
    query_summary,
    serialize_build,
    set_bonus_stats,
    survivability_score,
)


SCALE = 100
DEFAULT_TIME_LIMIT_SECONDS = 20.0
DOFUS_GROUP_SLOT = "dofus"
DOFUS_GROUP_SIZE = 6
DOFUS_SLOT_TYPES = ("Dofus", "Trophy", "Prysmaradite")


def scaled_score(value: float) -> int:
    return int(round(value * SCALE))


def slot_candidates(items: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    candidates = {
        slot_name: [
            item
            for item in items
            if item.get("itemType") in slot_types
        ]
        for slot_name, slot_types in SLOTS
        if not slot_name.startswith("dofus_")
    }
    candidates[DOFUS_GROUP_SLOT] = [
        item
        for item in items
        if item.get("itemType") in DOFUS_SLOT_TYPES
    ]
    return candidates


def score_stat_lines(stats: dict[str, float], weights: dict[str, float]) -> float:
    return sum(
        stats.get(stat, 0) * weight
        for stat, weight in weights.items()
    )


def cheap_final_score_for_stats(stats: dict[str, int], generic_damage_weight: float) -> float:
    return (
        final_utility_score(stats)
        + cheap_profile_damage_score(stats) * generic_damage_weight
        + survivability_score(stats)
    )


@dataclass(frozen=True)
class ModelMetadata:
    candidates_by_slot: dict[str, list[dict[str, Any]]]
    item_by_id: dict[str, dict[str, Any]]
    selected_set_ids: set[str]
    max_set_counts: dict[str, int]
    set_bonus_by_id: dict[str, dict[str, dict[str, int]]]
    item_objective_stats_by_id: dict[str, dict[str, float]]


def objective_stats_for_item(item: dict[str, Any]) -> dict[str, float]:
    stats: dict[str, float] = defaultdict(float, item.get("_stats") or normalize_stats(item.get("stats", [])))
    for stat, value in expected_item_effect_stats(item).items():
        stats[stat] += value
    return dict(stats)


def build_model_metadata(items: list[dict[str, Any]], sets: dict[str, dict[str, Any]]) -> ModelMetadata:
    max_set_counts: dict[str, int] = defaultdict(int)
    selected_sets: set[str] = set()
    for item in items:
        set_id = item.get("setID")
        if set_id:
            selected_sets.add(set_id)
            max_set_counts[set_id] += 1
    return ModelMetadata(
        candidates_by_slot=slot_candidates(items),
        item_by_id=items_by_id(items),
        selected_set_ids=selected_sets,
        max_set_counts=dict(max_set_counts),
        set_bonus_by_id={
            set_id: set_bonus_stats(set_obj)
            for set_id, set_obj in sets.items()
        },
        item_objective_stats_by_id={
            item["dofusID"]: objective_stats_for_item(item)
            for item in items
        },
    )


def collect_objective_stats(metadata: ModelMetadata) -> set[str]:
    stats = set(STAT_WEIGHTS)
    for item_stats in metadata.item_objective_stats_by_id.values():
        stats.update(item_stats.keys())
    for bonus_stats_by_count in metadata.set_bonus_by_id.values():
        for bonus_stats in bonus_stats_by_count.values():
            stats.update(bonus_stats.keys())
    return stats


def linearized_final_score_weights(
    metadata: ModelMetadata,
    generic_damage_weight: float,
) -> dict[str, float]:
    reference_stats = profile_damage_reference_stats()
    objective_stats = collect_objective_stats(metadata)
    for stat in objective_stats:
        reference_stats.setdefault(stat, active_base_stats().get(stat, 0))
    baseline = cheap_final_score_for_stats(reference_stats, generic_damage_weight)
    weights: dict[str, float] = {}
    for stat in objective_stats:
        step = 100 if stat in {"Strength", "Intelligence", "Chance", "Agility", "Power", "Vitality", "Initiative"} else 1
        next_stats = dict(reference_stats)
        next_stats[stat] = next_stats.get(stat, 0) + step
        weights[stat] = (cheap_final_score_for_stats(next_stats, generic_damage_weight) - baseline) / step
    for stat in ACTION_STATS:
        weights[stat] = STAT_WEIGHTS.get(stat, 0.0)
    return weights


def objective_weights_for_mode(
    mode: str,
    metadata: ModelMetadata,
    generic_damage_weight: float,
) -> dict[str, float]:
    if mode == "stat-linear":
        return dict(STAT_WEIGHTS)
    if mode == "final-linear":
        return linearized_final_score_weights(metadata, generic_damage_weight)
    raise ValueError(f"Unsupported objective mode: {mode}")


def objective_item_score(item_stats: dict[str, float], weights: dict[str, float]) -> int:
    return scaled_score(score_stat_lines(item_stats, weights))


def objective_set_bonus_score(stats: dict[str, int], weights: dict[str, float]) -> int:
    return scaled_score(score_stat_lines(stats, weights))


def set_bonus_upper_bound_condition(condition_obj: dict[str, Any]) -> int | None:
    if not condition_obj:
        return None
    if (
        condition_obj.get("operator") == "<"
        and condition_obj.get("stat") == "SET_BONUS"
        and condition_obj.get("value") is not None
    ):
        return int(condition_obj["value"]) - 1
    if condition_obj.get("and"):
        bounds = [
            bound
            for child in condition_obj["and"]
            for bound in (set_bonus_upper_bound_condition(child),)
            if bound is not None
        ]
        return min(bounds) if bounds else None
    return None


def items_by_id(items: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {item["dofusID"]: item for item in items}


def build_model(
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    *,
    forbidden_signatures: list[frozenset[str]],
    max_shared_item_cuts: list[frozenset[str]],
    max_shared_items: int | None,
    objective_weights: dict[str, float],
    exo_policy: str,
    metadata: ModelMetadata | None = None,
) -> tuple[
    cp_model.CpModel,
    dict[tuple[str, str], cp_model.IntVar],
    dict[tuple[str, str], cp_model.IntVar],
    dict[str, Any],
]:
    model = cp_model.CpModel()
    metadata = metadata or build_model_metadata(items, sets)
    candidates_by_slot = metadata.candidates_by_slot
    item_by_id = metadata.item_by_id

    slot_item_vars: dict[tuple[str, str], cp_model.IntVar] = {}
    item_presence_terms: dict[str, list[cp_model.IntVar]] = defaultdict(list)

    for slot_name, candidates in candidates_by_slot.items():
        slot_vars = []
        for item in candidates:
            item_id = item["dofusID"]
            var = model.NewBoolVar(f"{slot_name}_{item_id}")
            slot_item_vars[(slot_name, item_id)] = var
            item_presence_terms[item_id].append(var)
            slot_vars.append(var)
        if slot_name == DOFUS_GROUP_SLOT:
            model.Add(sum(slot_vars) == DOFUS_GROUP_SIZE)
        else:
            model.Add(sum(slot_vars) == 1)

    for item_id, vars_for_item in item_presence_terms.items():
        model.Add(sum(vars_for_item) <= 1)

    prysmaradite_terms = [
        var
        for (_slot_name, item_id), var in slot_item_vars.items()
        if item_by_id[item_id].get("itemType") == "Prysmaradite"
    ]
    if prysmaradite_terms:
        model.Add(sum(prysmaradite_terms) <= 1)

    exo_vars: dict[tuple[str, str], cp_model.IntVar] = {}
    exo_stats = () if exo_policy == "none" else ("AP", "MP")
    if exo_policy != "none" and target.range > 0:
        exo_stats = ("AP", "MP", "Range")
    for slot_name, candidates in candidates_by_slot.items():
        if slot_name == DOFUS_GROUP_SLOT or slot_name == "pet":
            continue
        for stat in exo_stats:
            eligible_vars = [
                slot_item_vars[(slot_name, item["dofusID"])]
                for item in candidates
                if item.get("itemType") in {
                    "Hat",
                    "Cloak",
                    "Amulet",
                    "Ring",
                    "Belt",
                    "Boots",
                    "Sword",
                    "Hammer",
                    "Staff",
                    "Dagger",
                    "Wand",
                    "Bow",
                    "Axe",
                    "Shovel",
                    "Lance",
                    "Scythe",
                    "Shield",
                }
                and item.get("_stats", {}).get(stat, 0) == 0
            ]
            if not eligible_vars:
                continue
            var = model.NewBoolVar(f"exo_{slot_name}_{stat}")
            exo_vars[(slot_name, stat)] = var
            model.Add(var <= sum(eligible_vars))
        slot_exos = [
            exo_vars[(slot_name, stat)]
            for stat in exo_stats
            if (slot_name, stat) in exo_vars
        ]
        if slot_exos:
            model.Add(sum(slot_exos) <= 1)

    for stat in ("AP", "MP", "Range"):
        stat_exos = [
            var
            for (slot_name, exo_stat), var in exo_vars.items()
            if exo_stat == stat
        ]
        if stat_exos:
            model.Add(sum(stat_exos) <= 1)

    exact_set_count_vars: dict[tuple[str, int], cp_model.IntVar] = {}

    item_terms_by_set: dict[str, list[cp_model.IntVar]] = defaultdict(list)
    non_dofus_slots_by_set: dict[str, set[str]] = defaultdict(set)
    dofus_item_ids_by_set: dict[str, set[str]] = defaultdict(set)
    item_ids_by_set: dict[str, set[str]] = defaultdict(set)
    for (slot_name, item_id), var in slot_item_vars.items():
        set_id = item_by_id[item_id].get("setID")
        if set_id:
            item_terms_by_set[set_id].append(var)
            if slot_name == DOFUS_GROUP_SLOT:
                dofus_item_ids_by_set[set_id].add(item_id)
            else:
                non_dofus_slots_by_set[set_id].add(slot_name)
            item_ids_by_set[set_id].add(item_id)

    for set_id in sorted(metadata.selected_set_ids):
        item_terms = item_terms_by_set[set_id]
        if not item_terms:
            continue
        max_selectable_slots = len(non_dofus_slots_by_set[set_id]) + min(
            DOFUS_GROUP_SIZE,
            len(dofus_item_ids_by_set[set_id]),
        )
        max_count = min(metadata.max_set_counts[set_id], len(item_ids_by_set[set_id]), max_selectable_slots)
        exact_vars = []
        for count in range(max_count + 1):
            var = model.NewBoolVar(f"set_{set_id}_{count}")
            exact_set_count_vars[(set_id, count)] = var
            exact_vars.append(var)
        model.Add(sum(exact_vars) == 1)
        model.Add(sum(item_terms) == sum(count * exact_set_count_vars[(set_id, count)] for count in range(max_count + 1)))

    total_stat_expr_cache: dict[str, Any] = {}

    def total_stat_expr(stat: str) -> Any:
        if stat in total_stat_expr_cache:
            return total_stat_expr_cache[stat]
        expr = active_base_stats().get(stat, 0)
        for (slot_name, item_id), var in slot_item_vars.items():
            item = item_by_id[item_id]
            expr += item.get("_stats", {}).get(stat, 0) * var
        for (set_id, count), var in exact_set_count_vars.items():
            expr += metadata.set_bonus_by_id.get(set_id, {}).get(str(count), {}).get(stat, 0) * var
        for (slot_name, exo_stat), var in exo_vars.items():
            if exo_stat == stat:
                expr += var
        total_stat_expr_cache[stat] = expr
        return expr

    set_bonus_count_expr = sum(
        max(count - 1, 0) * var
        for (_set_id, count), var in exact_set_count_vars.items()
    )

    presence_var_by_item: dict[str, cp_model.IntVar] = {}

    def presence_var_for_item(item_id: str) -> cp_model.IntVar:
        if item_id not in presence_var_by_item:
            presence = model.NewBoolVar(f"present_{item_id}")
            model.Add(sum(item_presence_terms[item_id]) == presence)
            presence_var_by_item[item_id] = presence
        return presence_var_by_item[item_id]

    def condition_expr(stat: str) -> Any | None:
        if stat == "SET_BONUS":
            return set_bonus_count_expr
        stat_name = CONDITION_STAT_TO_STAT_NAME.get(stat)
        if not stat_name:
            return None
        return total_stat_expr(stat_name)

    condition_constraint_count = 0
    condition_literal_count = 0

    def add_leaf_condition_constraint(
        condition_obj: dict[str, Any],
        enforcement_literal: cp_model.IntVar,
    ) -> bool:
        nonlocal condition_constraint_count
        expr = condition_expr(condition_obj["stat"])
        if expr is None:
            return False
        value = int(condition_obj["value"])
        operator = condition_obj["operator"]
        if operator == "<":
            model.Add(expr <= value - 1).OnlyEnforceIf(enforcement_literal)
            condition_constraint_count += 1
            return True
        if operator == ">":
            model.Add(expr >= value + 1).OnlyEnforceIf(enforcement_literal)
            condition_constraint_count += 1
            return True
        return False

    def add_condition_constraints(condition_obj: dict[str, Any], presence: cp_model.IntVar) -> bool:
        nonlocal condition_constraint_count, condition_literal_count
        if not condition_obj:
            return True
        if is_leaf_condition(condition_obj):
            return add_leaf_condition_constraint(condition_obj, presence)
        if condition_obj.get("and"):
            for child in condition_obj["and"]:
                if not add_condition_constraints(child, presence):
                    return False
            return True
        if condition_obj.get("or"):
            child_literals = []
            for index, child in enumerate(condition_obj["or"]):
                condition_literal_count += 1
                child_literal = model.NewBoolVar(f"condition_or_{condition_literal_count}_{index}")
                if not add_condition_constraints(child, child_literal):
                    return False
                child_literals.append(child_literal)
            if not child_literals:
                return False
            model.AddBoolOr(child_literals).OnlyEnforceIf(presence)
            condition_constraint_count += 1
            return True
        return False

    model.Add(total_stat_expr("AP") >= target.ap)
    model.Add(total_stat_expr("AP") <= MAX_AP)
    model.Add(total_stat_expr("MP") >= target.mp)
    model.Add(total_stat_expr("MP") <= MAX_MP)
    model.Add(total_stat_expr("Range") <= MAX_RANGE)
    if target.range_required:
        model.Add(total_stat_expr("Range") >= target.range)

    for item_id, presence_vars in item_presence_terms.items():
        condition_obj = item_by_id[item_id].get("conditions", {}).get("conditions", {})
        if condition_obj:
            add_condition_constraints(condition_obj, presence_var_for_item(item_id))
        set_bonus_upper_bound = set_bonus_upper_bound_condition(condition_obj)
        if set_bonus_upper_bound is None:
            continue
        presence = presence_var_for_item(item_id)
        model.Add(set_bonus_count_expr <= set_bonus_upper_bound).OnlyEnforceIf(presence)

    for forbidden in forbidden_signatures:
        terms = [
            var
            for (slot_name, item_id), var in slot_item_vars.items()
            if item_id in forbidden
        ]
        if terms:
            model.Add(sum(terms) <= len(forbidden) - 1)

    if max_shared_items is not None:
        for cut_signature in max_shared_item_cuts:
            terms = [
                var
                for (_slot_name, item_id), var in slot_item_vars.items()
                if item_id in cut_signature
            ]
            if terms:
                model.Add(sum(terms) <= max_shared_items)

    objective_terms = []
    for (slot_name, item_id), var in slot_item_vars.items():
        objective_terms.append(
            objective_item_score(metadata.item_objective_stats_by_id[item_id], objective_weights) * var
        )
    for (set_id, count), var in exact_set_count_vars.items():
        objective_terms.append(
            objective_set_bonus_score(metadata.set_bonus_by_id.get(set_id, {}).get(str(count), {}), objective_weights) * var
        )
    for (slot_name, stat), var in exo_vars.items():
        objective_terms.append(scaled_score(objective_weights.get(stat, 0.0)) * var)
    model.Maximize(sum(objective_terms))

    model_stats = {
        "slotCandidateCounts": {
            slot_name: len(candidates)
            for slot_name, candidates in candidates_by_slot.items()
        },
        "slotVarCount": len(slot_item_vars),
        "uniqueItemCount": len(item_by_id),
        "exoVarCount": len(exo_vars),
        "exactSetCountVarCount": len(exact_set_count_vars),
        "conditionConstraintCount": condition_constraint_count,
        "setCountConstraintCount": len({set_id for set_id, _count in exact_set_count_vars}),
    }
    return model, slot_item_vars, exo_vars, model_stats


def next_item_by_id(items: list[dict[str, Any]], item_id: str) -> dict[str, Any]:
    # Kept simple for experiment readability; the item pool is small enough.
    for item in items:
        if item["dofusID"] == item_id:
            return item
    raise KeyError(item_id)


def item_signature(state: BuildState) -> frozenset[str]:
    return frozenset(item["dofusID"] for item in state.slots.values())


def state_signature(state: BuildState) -> tuple[frozenset[str], tuple[tuple[str, str], ...]]:
    return (
        item_signature(state),
        tuple(sorted(state.exos.items())),
    )


def append_unique_candidate(
    candidates: list[BuildState],
    seen_valid_signatures: set[tuple[frozenset[str], tuple[tuple[str, str], ...]]],
    state: BuildState,
) -> bool:
    signature = state_signature(state)
    if signature in seen_valid_signatures:
        return False
    candidates.append(state)
    seen_valid_signatures.add(signature)
    return True


class CandidateCollectionCallback(cp_model.CpSolverSolutionCallback):
    def __init__(
        self,
        *,
        slot_item_vars: dict[tuple[str, str], cp_model.IntVar],
        exo_vars: dict[tuple[str, str], cp_model.IntVar],
        items: list[dict[str, Any]],
        sets: dict[str, dict[str, Any]],
        target: BuildTarget,
        candidate_limit: int,
    ) -> None:
        super().__init__()
        self.slot_item_vars = slot_item_vars
        self.exo_vars = exo_vars
        self.items = items
        self.sets = sets
        self.target = target
        self.candidate_limit = candidate_limit
        self.solution_count = 0
        self.valid_solution_count = 0
        self.invalid_solution_count = 0
        self.candidates: list[BuildState] = []
        self.seen_valid_signatures: set[tuple[frozenset[str], tuple[tuple[str, str], ...]]] = set()
        self.candidate_events: list[dict[str, Any]] = []
        self.invalid_events: list[dict[str, Any]] = []

    def OnSolutionCallback(self) -> None:
        self.solution_count += 1
        if len(self.candidates) >= self.candidate_limit:
            return
        state, invalid_reason = reconstruct_state(
            self,
            self.slot_item_vars,
            self.exo_vars,
            self.items,
            self.sets,
            self.target,
        )
        if state is None:
            self.invalid_solution_count += 1
            if len(self.invalid_events) < 5:
                self.invalid_events.append(
                    {
                        "callbackIndex": self.solution_count,
                        "wallTimeMs": round(self.WallTime() * 1000, 1),
                        "reason": invalid_reason,
                    }
                )
            return
        if append_unique_candidate(self.candidates, self.seen_valid_signatures, state):
            self.valid_solution_count += 1
            self.candidate_events.append(
                {
                    "callbackIndex": self.solution_count,
                    "rankBeforeRerank": len(self.candidate_events) + 1,
                    "wallTimeMs": round(self.WallTime() * 1000, 1),
                    "objective": round(self.ObjectiveValue() / SCALE, 2),
                    "score": round(state.score, 2),
                    "itemIds": sorted(item_signature(state), key=lambda value: (len(value), value)),
                    "exos": dict(sorted(state.exos.items())),
                }
            )


def build_summary(state: BuildState) -> dict[str, Any]:
    return {
        "score": round(state.score, 2),
        "items": {
            slot: item["_name"]
            for slot, item in state.slots.items()
        },
        "itemIds": {
            slot: item["dofusID"]
            for slot, item in state.slots.items()
        },
        "totals": {
            "AP": state.stats.get("AP", 0),
            "MP": state.stats.get("MP", 0),
            "Range": state.stats.get("Range", 0),
            "Strength": state.stats.get("Strength", 0),
            "Power": state.stats.get("Power", 0),
            "Earth Damage": state.stats.get("Earth Damage", 0),
            "Neutral Damage": state.stats.get("Neutral Damage", 0),
            "Critical": state.stats.get("Critical", 0),
            "Critical Damage": state.stats.get("Critical Damage", 0),
            "Vitality": state.stats.get("Vitality", 0),
        },
        "exos": dict(state.exos),
        "sets": dict(state.set_counts),
    }


def reconstruct_state(
    solver: cp_model.CpSolver,
    slot_item_vars: dict[tuple[str, str], cp_model.IntVar],
    exo_vars: dict[tuple[str, str], cp_model.IntVar],
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
) -> tuple[BuildState | None, dict[str, Any] | None]:
    item_by_id = items_by_id(items)
    state = BuildState()
    selected_by_slot: dict[str, dict[str, Any]] = {}
    for slot_name, _slot_types in SLOTS:
        if slot_name.startswith("dofus_"):
            continue
        selected = [
            item_id
            for (var_slot, item_id), var in slot_item_vars.items()
            if var_slot == slot_name and solver.BooleanValue(var)
        ]
        if len(selected) != 1:
            return None, {"reason": "slot_selection_count", "slot": slot_name, "selected": selected}
        selected_by_slot[slot_name] = item_by_id[selected[0]]

    selected_dofus_ids = [
        item_id
        for (var_slot, item_id), var in slot_item_vars.items()
        if var_slot == DOFUS_GROUP_SLOT and solver.BooleanValue(var)
    ]
    if len(selected_dofus_ids) != DOFUS_GROUP_SIZE:
        return None, {
            "reason": "slot_selection_count",
            "slot": DOFUS_GROUP_SLOT,
            "selected": selected_dofus_ids,
        }
    selected_dofus_items = sorted(
        (item_by_id[item_id] for item_id in selected_dofus_ids),
        key=lambda item: (
            item.get("itemType") or "",
            item.get("_name") or "",
            item.get("dofusID") or "",
        ),
    )
    for index, item in enumerate(selected_dofus_items, start=1):
        selected_by_slot[f"dofus_{index}"] = item

    state.slots = dict(selected_by_slot)
    state.used_item_ids = {item["dofusID"] for item in selected_by_slot.values()}
    state.stats = dict(active_base_stats())
    state.set_counts = defaultdict(int)
    for item in selected_by_slot.values():
        apply_stat_delta(state.stats, item.get("_stats") or normalize_stats(item.get("stats", [])))
        set_id = item.get("setID")
        if set_id:
            state.set_counts[set_id] += 1

    for set_id, count in state.set_counts.items():
        set_obj = sets.get(set_id)
        if not set_obj:
            continue
        apply_stat_delta(state.stats, set_bonus_stats(set_obj).get(str(count), {}))
    state.set_counts = dict(state.set_counts)

    for (slot_name, stat), var in sorted(exo_vars.items()):
        if not solver.BooleanValue(var):
            continue
        item = state.slots[slot_name]
        state.stats[stat] = state.stats.get(stat, 0) + 1
        state.exos[stat] = item["dofusID"]

    if not action_stats_meet_target(state, target):
        return None, {
            "reason": "action_stats",
            "stats": {stat: state.stats.get(stat, 0) for stat in ACTION_STATS},
            "exos": dict(state.exos),
        }
    state.condition_failures = unmet_item_conditions(state)
    if state.condition_failures:
        return None, {
            "reason": "conditions",
            "stats": {stat: state.stats.get(stat, 0) for stat in state.stats if stat in {"AP", "MP", "Range", "Strength", "Vitality"}},
            "failures": state.condition_failures,
            "items": {
                slot: {"id": item["dofusID"], "name": item["_name"]}
                for slot, item in state.slots.items()
            },
        }
    state = optimize_base_allocation(state)
    state.score = final_score_state(state)
    return state, None


def solve_query(query: BuildDiscoveryQuery, args: argparse.Namespace) -> dict[str, Any]:
    query.validate()
    configure_damage_profile(query.primary_element)
    target = query.target
    load_start = time.perf_counter()
    items = load_items(
        target=target,
        budget_tier=query.budget_tier,
        excluded_item_ids=set(query.avoided_item_ids),
    )
    sets = load_sets()
    metadata = build_model_metadata(items, sets)
    objective_weights = objective_weights_for_mode(
        args.objective_mode,
        metadata,
        args.generic_damage_weight,
    )
    load_ms = (time.perf_counter() - load_start) * 1000

    forbidden: list[frozenset[str]] = []
    max_shared_item_cuts: list[frozenset[str]] = []
    attempts = []
    candidates: list[BuildState] = []
    seen_valid_signatures: set[tuple[frozenset[str], tuple[tuple[str, str], ...]]] = set()
    best_solver_status = None
    total_start = time.perf_counter()

    collection_mode = getattr(args, "collection_mode", "repeated")

    if collection_mode == "callback":
        model_start = time.perf_counter()
        model, slot_item_vars, exo_vars, model_stats = build_model(
            items,
            sets,
            target,
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights=objective_weights,
            exo_policy=query.exo_policy,
            metadata=metadata,
        )
        model_ms = (time.perf_counter() - model_start) * 1000

        collector = CandidateCollectionCallback(
            slot_item_vars=slot_item_vars,
            exo_vars=exo_vars,
            items=items,
            sets=sets,
            target=target,
            candidate_limit=args.candidate_limit,
        )
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = args.time_limit_seconds
        solver.parameters.num_search_workers = args.workers
        solve_start = time.perf_counter()
        status = solver.Solve(model, collector)
        solve_ms = (time.perf_counter() - solve_start) * 1000
        best_solver_status = solver.StatusName(status)
        candidates = list(collector.candidates)
        seen_valid_signatures = set(collector.seen_valid_signatures)

        final_considered = status in (cp_model.OPTIMAL, cp_model.FEASIBLE)
        final_added = False
        final_represented = False
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            final_state, final_invalid_reason = reconstruct_state(
                solver,
                slot_item_vars,
                exo_vars,
                items,
                sets,
                target,
            )
            if final_state is not None:
                final_signature = state_signature(final_state)
                final_added = append_unique_candidate(candidates, seen_valid_signatures, final_state)
                final_represented = final_added or final_signature in seen_valid_signatures
            else:
                collector.invalid_solution_count += 1
        else:
            final_invalid_reason = None

        attempts.append(
            {
                "attempt": 1,
                "mode": "callback",
                "status": best_solver_status,
                "modelMs": round(model_ms, 1),
                "solveMs": round(solve_ms, 1),
                "objective": solver.ObjectiveValue() / SCALE if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else None,
                "solutionCallbackCount": collector.solution_count,
                "validCallbackCandidateCount": collector.valid_solution_count,
                "invalidCallbackCandidateCount": collector.invalid_solution_count,
                "finalAssignmentConsidered": final_considered,
                "finalAssignmentAdded": final_added,
                "finalAssignmentRepresented": final_represented,
                "finalInvalidReason": final_invalid_reason,
                "callbackCandidateEvents": collector.candidate_events,
                "callbackInvalidEvents": collector.invalid_events,
                "modelStats": model_stats,
            }
        )
    else:
        for attempt_index in range(args.max_attempts):
            if len(candidates) >= args.candidate_limit:
                break
            model_start = time.perf_counter()
            model, slot_item_vars, exo_vars, model_stats = build_model(
                items,
                sets,
                target,
                forbidden_signatures=forbidden,
                max_shared_item_cuts=max_shared_item_cuts,
                max_shared_items=args.max_shared_items,
                objective_weights=objective_weights,
                exo_policy=query.exo_policy,
                metadata=metadata,
            )
            model_ms = (time.perf_counter() - model_start) * 1000

            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = args.time_limit_seconds
            solver.parameters.num_search_workers = args.workers
            solve_start = time.perf_counter()
            status = solver.Solve(model)
            solve_ms = (time.perf_counter() - solve_start) * 1000
            best_solver_status = solver.StatusName(status)

            attempt = {
                "attempt": attempt_index + 1,
                "mode": "repeated",
                "status": best_solver_status,
                "modelMs": round(model_ms, 1),
                "solveMs": round(solve_ms, 1),
                "objective": solver.ObjectiveValue() / SCALE if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else None,
                "modelStats": model_stats,
            }
            attempts.append(attempt)

            if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
                break

            state, invalid_reason = reconstruct_state(solver, slot_item_vars, exo_vars, items, sets, target)
            selected_ids = frozenset(
                item_id
                for (_slot_name, item_id), var in slot_item_vars.items()
                if solver.BooleanValue(var)
            )
            if state is not None:
                if append_unique_candidate(candidates, seen_valid_signatures, state):
                    if args.max_shared_items is not None:
                        max_shared_item_cuts.append(item_signature(state))
                    attempt["validCandidate"] = {
                        "score": round(state.score, 2),
                        "totals": {
                            "AP": state.stats.get("AP", 0),
                            "MP": state.stats.get("MP", 0),
                            "Range": state.stats.get("Range", 0),
                            "Strength": state.stats.get("Strength", 0),
                            "Power": state.stats.get("Power", 0),
                            "Earth Damage": state.stats.get("Earth Damage", 0),
                            "Vitality": state.stats.get("Vitality", 0),
                        },
                        "items": {
                            slot: item["_name"]
                            for slot, item in state.slots.items()
                        },
                    }
                forbidden.append(selected_ids)
                continue
            attempt["invalidReason"] = invalid_reason
            attempt["selectedItemIds"] = sorted(selected_ids, key=lambda value: (len(value), value))
            forbidden.append(selected_ids)

    total_ms = (time.perf_counter() - total_start) * 1000
    ranked_candidates = sorted(candidates, key=lambda state: state.score, reverse=True)
    if len(ranked_candidates) > args.candidate_limit:
        ranked_candidates = ranked_candidates[: args.candidate_limit]
    best_state = ranked_candidates[0] if ranked_candidates else None
    warnings = []
    max_shared_items_enforced = collection_mode != "callback" or args.max_shared_items is None
    if collection_mode == "callback" and args.max_shared_items is not None:
        warnings.append(
            "callback collection uses natural feasible-solution diversity; maxSharedItems is not enforced as a hard cut"
        )
    response = {
        "query": {
            **query_summary(query),
            "objectiveMode": args.objective_mode,
        },
        "status": "complete" if best_state else "no_valid_build",
        "solverStatus": best_solver_status,
        "timings": {
            "loadMs": round(load_ms, 1),
            "totalSearchMs": round(total_ms, 1),
        },
        "attempts": attempts,
        "itemCount": len(items),
        "candidateCount": len(ranked_candidates),
        "requestedCandidateLimit": args.candidate_limit,
        "collectionMode": collection_mode,
        "maxSharedItems": args.max_shared_items,
        "maxSharedItemsEnforced": max_shared_items_enforced,
        "warnings": warnings,
        "objectiveWeights": {
            stat: round(weight, 4)
            for stat, weight in sorted(objective_weights.items())
            if abs(weight) > 0.0001
        },
    }
    if best_state:
        response["build"] = serialize_build(best_state, sets)
        response["effectiveScoringStats"] = effective_scoring_stats(best_state)
        response["candidateSummaries"] = [
            build_summary(state)
            for state in ranked_candidates[: args.summary_limit]
        ]
        response["builds"] = [
            serialize_build(state, sets)
            for state in ranked_candidates[: args.output_build_limit]
        ]
    if warnings:
        response["warnings"] = warnings
    return response


def query_from_args(args: argparse.Namespace) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        level=args.level,
        elements=(args.element,),
        ap_target=args.target_ap,
        mp_target=args.target_mp,
        range_target=args.target_range,
        budget_tier=args.budget_tier,
        exo_policy=args.exo_policy,
        limit=args.output_build_limit,
        max_shared_items=args.max_shared_items,
        generic_damage_weight=args.generic_damage_weight,
    )


def solve_once(args: argparse.Namespace) -> dict[str, Any]:
    return solve_query(query_from_args(args), args)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--time-limit-seconds", type=float, default=DEFAULT_TIME_LIMIT_SECONDS)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--max-attempts", type=int, default=40)
    parser.add_argument("--candidate-limit", type=int, default=20)
    parser.add_argument("--summary-limit", type=int, default=10)
    parser.add_argument("--output-build-limit", type=int, default=5)
    parser.add_argument("--collection-mode", choices=("callback", "repeated"), default="callback")
    parser.add_argument("--level", type=int, default=200)
    parser.add_argument("--element", choices=("agility", "chance", "intelligence", "strength"), default="strength")
    parser.add_argument("--target-ap", "--ap", type=int, default=12)
    parser.add_argument("--target-mp", "--mp", type=int, default=6)
    parser.add_argument("--target-range", "--range", type=parse_optional_range_target, default=0)
    parser.add_argument("--budget-tier", type=int, default=4)
    parser.add_argument("--exo-policy", choices=("none", "allow", "opti"), default="allow")
    parser.add_argument("--objective-mode", choices=("stat-linear", "final-linear"), default="final-linear")
    parser.add_argument("--generic-damage-weight", type=float, default=0.45)
    parser.add_argument(
        "--max-shared-items",
        type=int,
        default=None,
        help="When set, each accepted candidate adds a diversity cut limiting future candidates to this many shared items.",
    )
    args = parser.parse_args()
    print(json.dumps(solve_once(args), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
