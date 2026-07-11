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


def scaled_score(value: float) -> int:
    return int(round(value * SCALE))


def slot_candidates(items: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    return {
        slot_name: [
            item
            for item in items
            if item.get("itemType") in slot_types
        ]
        for slot_name, slot_types in SLOTS
    }


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


def collect_objective_stats(items: list[dict[str, Any]], sets: dict[str, dict[str, Any]]) -> set[str]:
    stats = set(STAT_WEIGHTS)
    for item in items:
        stats.update((item.get("_stats") or normalize_stats(item.get("stats", []))).keys())
        stats.update(expected_item_effect_stats(item).keys())
    for set_obj in sets.values():
        for bonus_stats in set_bonus_stats(set_obj).values():
            stats.update(bonus_stats.keys())
    return stats


def linearized_final_score_weights(
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    generic_damage_weight: float,
) -> dict[str, float]:
    reference_stats = profile_damage_reference_stats()
    for stat in collect_objective_stats(items, sets):
        reference_stats.setdefault(stat, active_base_stats().get(stat, 0))
    baseline = cheap_final_score_for_stats(reference_stats, generic_damage_weight)
    weights: dict[str, float] = {}
    for stat in collect_objective_stats(items, sets):
        step = 100 if stat in {"Strength", "Intelligence", "Chance", "Agility", "Power", "Vitality", "Initiative"} else 1
        next_stats = dict(reference_stats)
        next_stats[stat] = next_stats.get(stat, 0) + step
        weights[stat] = (cheap_final_score_for_stats(next_stats, generic_damage_weight) - baseline) / step
    for stat in ACTION_STATS:
        weights[stat] = STAT_WEIGHTS.get(stat, 0.0)
    return weights


def objective_weights_for_mode(
    mode: str,
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    generic_damage_weight: float,
) -> dict[str, float]:
    if mode == "stat-linear":
        return dict(STAT_WEIGHTS)
    if mode == "final-linear":
        return linearized_final_score_weights(items, sets, generic_damage_weight)
    raise ValueError(f"Unsupported objective mode: {mode}")


def objective_item_score(item: dict[str, Any], weights: dict[str, float]) -> int:
    stats: dict[str, float] = defaultdict(float)
    for stat, value in normalize_stats(item.get("stats", [])).items():
        stats[stat] += value
    for stat, value in expected_item_effect_stats(item).items():
        stats[stat] += value
    return scaled_score(score_stat_lines(dict(stats), weights))


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


def selected_set_ids(items: list[dict[str, Any]]) -> set[str]:
    return {
        item["setID"]
        for item in items
        if item.get("setID")
    }


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
) -> tuple[
    cp_model.CpModel,
    dict[tuple[str, str], cp_model.IntVar],
    dict[tuple[str, str], cp_model.IntVar],
]:
    model = cp_model.CpModel()
    candidates_by_slot = slot_candidates(items)
    item_by_id = items_by_id(items)

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
        if slot_name.startswith("dofus_") or slot_name == "pet":
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
    max_set_counts: dict[str, int] = defaultdict(int)
    for item in items:
        set_id = item.get("setID")
        if set_id:
            max_set_counts[set_id] += 1

    item_terms_by_set: dict[str, list[cp_model.IntVar]] = defaultdict(list)
    slots_by_set: dict[str, set[str]] = defaultdict(set)
    item_ids_by_set: dict[str, set[str]] = defaultdict(set)
    for (slot_name, item_id), var in slot_item_vars.items():
        set_id = item_by_id[item_id].get("setID")
        if set_id:
            item_terms_by_set[set_id].append(var)
            slots_by_set[set_id].add(slot_name)
            item_ids_by_set[set_id].add(item_id)

    for set_id in sorted(selected_set_ids(items)):
        item_terms = item_terms_by_set[set_id]
        if not item_terms:
            continue
        max_count = min(
            max_set_counts[set_id],
            len(slots_by_set[set_id]),
            len(item_ids_by_set[set_id]),
        )
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
            set_obj = sets.get(set_id)
            if not set_obj:
                continue
            expr += set_bonus_stats(set_obj).get(str(count), {}).get(stat, 0) * var
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

    def add_condition_constraints(condition_obj: dict[str, Any], presence: cp_model.IntVar) -> None:
        if not condition_obj:
            return
        if is_leaf_condition(condition_obj):
            expr = condition_expr(condition_obj["stat"])
            if expr is None:
                return
            value = int(condition_obj["value"])
            operator = condition_obj["operator"]
            if operator == "<":
                model.Add(expr <= value - 1).OnlyEnforceIf(presence)
            elif operator == ">":
                model.Add(expr >= value + 1).OnlyEnforceIf(presence)
            return
        if condition_obj.get("and"):
            for child in condition_obj["and"]:
                add_condition_constraints(child, presence)

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
        item = item_by_id[item_id]
        objective_terms.append(objective_item_score(item, objective_weights) * var)
    for (set_id, count), var in exact_set_count_vars.items():
        set_obj = sets.get(set_id)
        if set_obj:
            objective_terms.append(
                objective_set_bonus_score(set_bonus_stats(set_obj).get(str(count), {}), objective_weights) * var
            )
    for (slot_name, stat), var in exo_vars.items():
        objective_terms.append(scaled_score(objective_weights.get(stat, 0.0)) * var)
    model.Maximize(sum(objective_terms))

    return model, slot_item_vars, exo_vars


def next_item_by_id(items: list[dict[str, Any]], item_id: str) -> dict[str, Any]:
    # Kept simple for experiment readability; the item pool is small enough.
    for item in items:
        if item["dofusID"] == item_id:
            return item
    raise KeyError(item_id)


def state_signature(state: BuildState) -> frozenset[str]:
    return frozenset(item["dofusID"] for item in state.slots.values())


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
        selected = [
            item_id
            for (var_slot, item_id), var in slot_item_vars.items()
            if var_slot == slot_name and solver.BooleanValue(var)
        ]
        if len(selected) != 1:
            return None, {"reason": "slot_selection_count", "slot": slot_name, "selected": selected}
        selected_by_slot[slot_name] = item_by_id[selected[0]]

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
    objective_weights = objective_weights_for_mode(
        args.objective_mode,
        items,
        sets,
        args.generic_damage_weight,
    )
    load_ms = (time.perf_counter() - load_start) * 1000

    forbidden: list[frozenset[str]] = []
    max_shared_item_cuts: list[frozenset[str]] = []
    attempts = []
    candidates: list[BuildState] = []
    seen_valid_signatures: set[frozenset[str]] = set()
    best_solver_status = None
    total_start = time.perf_counter()

    for attempt_index in range(args.max_attempts):
        if len(candidates) >= args.candidate_limit:
            break
        model_start = time.perf_counter()
        model, slot_item_vars, exo_vars = build_model(
            items,
            sets,
            target,
            forbidden_signatures=forbidden,
            max_shared_item_cuts=max_shared_item_cuts,
            max_shared_items=args.max_shared_items,
            objective_weights=objective_weights,
            exo_policy=query.exo_policy,
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
            "status": best_solver_status,
            "modelMs": round(model_ms, 1),
            "solveMs": round(solve_ms, 1),
            "objective": solver.ObjectiveValue() / SCALE if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else None,
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
            signature = state_signature(state)
            if signature not in seen_valid_signatures:
                candidates.append(state)
                seen_valid_signatures.add(signature)
                if args.max_shared_items is not None:
                    max_shared_item_cuts.append(signature)
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
    best_state = ranked_candidates[0] if ranked_candidates else None
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
        "candidateCount": len(candidates),
        "requestedCandidateLimit": args.candidate_limit,
        "maxSharedItems": args.max_shared_items,
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
