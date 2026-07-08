"""Backend damage helpers matching the frontend damage formula.

This module intentionally uses the human-readable stat names from the static
JSON files so the build discovery prototype can use it without importing Flask,
GraphQL enums, or database models.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import floor


ELEMENT_STATS = {
    "neutral": ("Strength", "Neutral Damage"),
    "earth": ("Strength", "Earth Damage"),
    "fire": ("Intelligence", "Fire Damage"),
    "water": ("Chance", "Water Damage"),
    "air": ("Agility", "Air Damage"),
}


@dataclass(frozen=True)
class DamageLine:
    element: str
    base_min: int
    base_max: int
    crit_chance: int = 15
    crit_bonus_damage: int = 0
    is_weapon: bool = False
    is_trap: bool = False
    weight: float = 1.0


def get_stat(stats: dict[str, int], stat: str) -> int:
    return stats.get(stat, 0)


def calc_damage(
    base_damage: int,
    element: str,
    stats: dict[str, int],
    *,
    is_crit: bool = False,
    is_trap: bool = False,
    is_weapon: bool = False,
    weapon_skill_power: int = 0,
    crit_bonus_damage: int = 0,
) -> dict[str, int]:
    multiplier_stat, damage_stat = ELEMENT_STATS[element]
    multiplier_value = get_stat(stats, multiplier_stat) + get_stat(stats, "Power")
    damage_value = get_stat(stats, damage_stat) + get_stat(stats, "Damage")

    if is_trap:
        multiplier_value += get_stat(stats, "Trap Power")
        damage_value += get_stat(stats, "Trap Damage")
    if is_crit:
        damage_value += get_stat(stats, "Critical Damage") + crit_bonus_damage
    if is_weapon:
        multiplier_value += weapon_skill_power

    calculated_damage = floor(base_damage * (1 + multiplier_value / 100) + damage_value)

    final_damage_mod = 1 + get_stat(stats, "% Final Damage") / 100
    if is_weapon:
        final_damage_mod *= 1 + get_stat(stats, "% Weapon Damage") / 100
    else:
        final_damage_mod *= 1 + get_stat(stats, "% Spell Damage") / 100

    return {
        "melee": floor(
            calculated_damage
            * (final_damage_mod * (1 + get_stat(stats, "% Melee Damage") / 100))
        ),
        "ranged": floor(
            calculated_damage
            * (final_damage_mod * (1 + get_stat(stats, "% Ranged Damage") / 100))
        ),
    }


def average_line_damage(line: DamageLine, stats: dict[str, int]) -> float:
    noncrit_min = calc_damage(
        line.base_min,
        line.element,
        stats,
        is_trap=line.is_trap,
        is_weapon=line.is_weapon,
    )
    noncrit_max = calc_damage(
        line.base_max,
        line.element,
        stats,
        is_trap=line.is_trap,
        is_weapon=line.is_weapon,
    )
    crit_min = calc_damage(
        line.base_min,
        line.element,
        stats,
        is_crit=True,
        is_trap=line.is_trap,
        is_weapon=line.is_weapon,
        crit_bonus_damage=line.crit_bonus_damage,
    )
    crit_max = calc_damage(
        line.base_max,
        line.element,
        stats,
        is_crit=True,
        is_trap=line.is_trap,
        is_weapon=line.is_weapon,
        crit_bonus_damage=line.crit_bonus_damage,
    )

    noncrit_average = (noncrit_min["ranged"] + noncrit_max["ranged"]) / 2
    crit_average = (crit_min["ranged"] + crit_max["ranged"]) / 2
    crit_rate = min(max(line.crit_chance + get_stat(stats, "Critical"), 0), 100) / 100
    return line.weight * (crit_average * crit_rate + noncrit_average * (1 - crit_rate))


def profile_damage(lines: list[DamageLine], stats: dict[str, int]) -> float:
    return sum(average_line_damage(line, stats) for line in lines)


STRENGTH_PVM_PROFILE = [
    DamageLine(element="earth", base_min=31, base_max=35, crit_chance=15, weight=1.0),
    DamageLine(element="earth", base_min=46, base_max=52, crit_chance=15, weight=0.8),
    DamageLine(element="earth", base_min=18, base_max=22, crit_chance=25, weight=1.8),
]
