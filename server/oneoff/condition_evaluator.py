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
