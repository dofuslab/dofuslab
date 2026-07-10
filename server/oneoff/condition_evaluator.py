"""Condition evaluation for build-discovery prototypes.

The structure mirrors the frontend condition traversal in client/common/utils.tsx,
but operates on the static JSON shape used by the one-off solver.
"""

from __future__ import annotations

from typing import Any


CONDITION_STAT_TO_STAT_NAME = {
    "AP": "AP",
    "MP": "MP",
    "RANGE": "Range",
    "VITALITY": "Vitality",
    "WISDOM": "Wisdom",
    "STRENGTH": "Strength",
    "INTELLIGENCE": "Intelligence",
    "CHANCE": "Chance",
    "AGILITY": "Agility",
    "CRITICAL": "Critical",
    "DODGE": "Dodge",
    "LOCK": "Lock",
    "POWER": "Power",
    "DAMAGE": "Damage",
    "EARTH_DAMAGE": "Earth Damage",
    "NEUTRAL_DAMAGE": "Neutral Damage",
    "FIRE_DAMAGE": "Fire Damage",
    "WATER_DAMAGE": "Water Damage",
    "AIR_DAMAGE": "Air Damage",
}


def set_bonus_count(set_counts: dict[str, int]) -> int:
    return sum(max(count - 1, 0) for count in set_counts.values())


def stat_value_for_condition(
    stat: str,
    stats: dict[str, int],
    set_counts: dict[str, int],
) -> int:
    if stat == "SET_BONUS":
        return set_bonus_count(set_counts)

    stat_name = CONDITION_STAT_TO_STAT_NAME.get(stat)
    if not stat_name:
        return 0
    return stats.get(stat_name, 0)


def evaluate_leaf_condition(
    condition: dict[str, Any],
    stats: dict[str, int],
    set_counts: dict[str, int],
) -> bool:
    value = stat_value_for_condition(condition["stat"], stats, set_counts)
    target = condition["value"]
    operator = condition["operator"]

    if operator == "<":
        return value < target
    if operator == ">":
        return value > target

    return True


def is_leaf_condition(condition_obj: dict[str, Any]) -> bool:
    return bool(
        condition_obj.get("operator")
        and condition_obj.get("stat")
        and condition_obj.get("value") is not None
    )


def traverse_conditions(
    condition_obj: dict[str, Any],
    stats: dict[str, int],
    set_counts: dict[str, int],
) -> bool:
    if not condition_obj:
        return True
    if is_leaf_condition(condition_obj):
        return evaluate_leaf_condition(condition_obj, stats, set_counts)
    if condition_obj.get("and"):
        return all(
            traverse_conditions(child, stats, set_counts)
            for child in condition_obj["and"]
        )
    if condition_obj.get("or"):
        return any(
            traverse_conditions(child, stats, set_counts)
            for child in condition_obj["or"]
        )
    return True


def unmet_item_conditions(state) -> list[dict[str, Any]]:
    failures = []
    for slot_name, item in state.slots.items():
        conditions = item.get("conditions", {}).get("conditions", {})
        if conditions and not traverse_conditions(conditions, state.stats, state.set_counts):
            failures.append(
                {
                    "slot": slot_name,
                    "itemId": item["dofusID"],
                    "itemName": item.get("_name"),
                    "conditions": conditions,
                }
            )
    return failures


def condition_can_pass_at_target(
    condition_obj: dict[str, Any],
    target_stats: dict[str, int],
) -> bool:
    """Return whether a condition is compatible with required final stats.

    This is intentionally conservative and only reasons about explicit target
    minimums such as AP/MP/range. If a stat is not part of the target, the
    condition is allowed through for normal final-state evaluation.
    """
    if not condition_obj:
        return True
    if is_leaf_condition(condition_obj):
        stat_name = CONDITION_STAT_TO_STAT_NAME.get(condition_obj["stat"])
        if not stat_name or stat_name not in target_stats:
            return True
        target_value = target_stats[stat_name]
        operator = condition_obj["operator"]
        condition_value = condition_obj["value"]
        if operator == "<":
            return target_value < condition_value
        if operator == ">":
            return target_value > condition_value
        return True
    if condition_obj.get("and"):
        return all(
            condition_can_pass_at_target(child, target_stats)
            for child in condition_obj["and"]
        )
    if condition_obj.get("or"):
        return any(
            condition_can_pass_at_target(child, target_stats)
            for child in condition_obj["or"]
        )
    return True


def condition_is_target_forced(
    condition_obj: dict[str, Any],
    target_stats: dict[str, int],
) -> bool:
    if not condition_obj:
        return False
    if is_leaf_condition(condition_obj):
        if condition_obj["stat"] == "SET_BONUS":
            return True
        stat_name = CONDITION_STAT_TO_STAT_NAME.get(condition_obj["stat"])
        return bool(stat_name and stat_name in target_stats)
    if condition_obj.get("and"):
        return all(
            condition_is_target_forced(child, target_stats)
            for child in condition_obj["and"]
        )
    if condition_obj.get("or"):
        return all(
            condition_is_target_forced(child, target_stats)
            for child in condition_obj["or"]
        )
    return False


def forced_target_condition_holds(
    condition_obj: dict[str, Any],
    stats: dict[str, int],
    set_counts: dict[str, int],
    target_stats: dict[str, int],
) -> bool:
    """Check target-forced condition branches against the current state.

    Example: for an item condition `AP < 12 OR MP < 6`, a target of 11/6
    makes `MP < 6` impossible in the final build, so `AP < 12` becomes a
    mandatory branch. If a partial build with that item reaches 12 AP, it can
    be pruned immediately.
    """
    if not condition_obj:
        return True
    if is_leaf_condition(condition_obj):
        if condition_obj["stat"] == "SET_BONUS" and condition_obj["operator"] == "<":
            return traverse_conditions(condition_obj, stats, set_counts)
        return True
    if condition_obj.get("and"):
        return all(
            forced_target_condition_holds(child, stats, set_counts, target_stats)
            for child in condition_obj["and"]
        )
    if condition_obj.get("or"):
        compatible_children = [
            child
            for child in condition_obj["or"]
            if condition_can_pass_at_target(child, target_stats)
        ]
        if len(compatible_children) == 1:
            forced_child = compatible_children[0]
            if condition_is_target_forced(forced_child, target_stats):
                return traverse_conditions(forced_child, stats, set_counts)
        return True
    return True


def target_forced_conditions_hold(state, target_stats: dict[str, int]) -> bool:
    for item in state.slots.values():
        conditions = item.get("conditions", {}).get("conditions", {})
        if not forced_target_condition_holds(
            conditions,
            state.stats,
            state.set_counts,
            target_stats,
        ):
            return False
    return True
