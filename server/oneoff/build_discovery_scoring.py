"""Shared scoring constants and pure helpers for Build Discovery."""

from __future__ import annotations


PERCENT_RESISTANCE_WEIGHT = 2.0
SURVIVABILITY_SCORE_WEIGHT = 0.03
SORTED_ELEMENT_EHP_WEIGHTS = (0.4, 0.25, 0.15, 0.1, 0.1)
GENERIC_INCOMING_HIT = 350
GENERIC_INCOMING_CRIT_RATE = 0.2
GENERIC_INCOMING_PUSHBACK_RATE = 0.02
GENERIC_INCOMING_RANGED_RATE = 0.7
DAMAGE_BUFF_EXPECTED_STACK_RATIO = 0.4
ITEM_DAMAGE_BUFF_EXPECTED_STACK_RATIO_BY_DOFUS_ID = {
    # Vulbis Dofus: +10% final damage while the bearer has not taken damage.
    # General PvM should not assume high uptime, but the buff is not worthless.
    "6980": 0.1,
}
ITEM_EXPECTED_EFFECT_STATS_BY_DOFUS_ID = {
    # Cloudy Dofus alternates +20% and -10% final damage. A 7-turn window
    # overstates the value because it ends on an extra +20% turn; use a fixed
    # conservative expectation near the 6/8-turn average instead.
    "8698": {"% Final Damage": 5.5},
    # AP prysmaradites have a static AP line plus a temporary AP effect bought
    # with final damage. Model the text effect as its 7-turn expected value.
    # Pryssure-O-Mat: -10% final damage for 3 turns, +1 AP for 3 turns.
    "21996": {"% Final Damage": -30 / 7, "Temporary AP": 3 / 7},
    # Shiny Pryssure: -35% final damage for 2 turns, +2 AP for 2 turns.
    "21997": {"% Final Damage": -70 / 7, "Temporary AP": 4 / 7},
    # Iridescent Pryssure: -50% final damage for 1 turn, +3 AP for 1 turn.
    "21998": {"% Final Damage": -50 / 7, "Temporary AP": 3 / 7},
}
SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID = {
    # Ochre Yellow: if untouched, +1 AP for the turn; otherwise +20 Dodge.
    # Temporary AP happens after static AP targets, so score it separately from real AP.
    "7754": {"Temporary AP": 1, "Dodge": 10},
    # Elemental Assimilation: repeated elemental hits build resistance in that element.
    # Model the generic PvM expectation as one shared stack spread across each element.
    "20362": {
        "% Neutral Resistance": 4,
        "% Earth Resistance": 4,
        "% Fire Resistance": 4,
        "% Water Resistance": 4,
        "% Air Resistance": 4,
    },
}
PERCENT_RESISTANCE_STATS = (
    "% Neutral Resistance",
    "% Earth Resistance",
    "% Fire Resistance",
    "% Water Resistance",
    "% Air Resistance",
)
FLAT_RESISTANCE_STATS = (
    "Neutral Resistance",
    "Earth Resistance",
    "Fire Resistance",
    "Water Resistance",
    "Air Resistance",
)

STAT_SCORE_CAPS = {
    "AP": 12,
    "MP": 6,
    "Range": 6,
    "Temporary AP": 1,
    "% Earth Resistance": 50,
    "% Neutral Resistance": 50,
    "% Fire Resistance": 50,
    "% Water Resistance": 50,
    "% Air Resistance": 50,
}

STAT_WEIGHTS = {
    "AP": 12.0,
    "MP": 10.0,
    "Range": 8.0,
    "Strength": 1.0,
    "Power": 1.0,
    "Earth Damage": 4.0,
    "Neutral Damage": 1.0,
    "Fire Damage": 0.0,
    "Water Damage": 0.0,
    "Air Damage": 0.0,
    "Damage": 6.0,
    "Temporary AP": 60.0,
    "Critical Damage": 4.0,
    "Critical": 6.0,
    "Vitality": 0.3,
    "Wisdom": 0.15,
    "Initiative": 0.005,
    "Prospecting": 0.033,
    "AP Parry": 0.167,
    "MP Parry": 0.167,
    "Lock": 0.15,
    "Dodge": 0.4,
    "% Final Damage": 8.0,
    "% Spell Damage": 6.0,
    "% Weapon Damage": 2.0,
    # These are only valuable when the spell/weapon plan actually happens at
    # that distance. Keep unconditional weight at zero until range context is
    # derived from spell data.
    "% Melee Damage": 0.0,
    "% Ranged Damage": 0.0,
    "% Earth Resistance": PERCENT_RESISTANCE_WEIGHT,
    "% Neutral Resistance": PERCENT_RESISTANCE_WEIGHT,
    "% Fire Resistance": PERCENT_RESISTANCE_WEIGHT,
    "% Water Resistance": PERCENT_RESISTANCE_WEIGHT,
    "% Air Resistance": PERCENT_RESISTANCE_WEIGHT,
    "Earth Resistance": 0.167,
    "Neutral Resistance": 0.167,
    "Fire Resistance": 0.167,
    "Water Resistance": 0.167,
    "Air Resistance": 0.167,
    "Critical Resistance": 0.033,
    "Pushback Resistance": 0.017,
    "% Ranged Resistance": 7.0,
    "% Melee Resistance": 3.0,
}
BASE_STAT_WEIGHTS = dict(STAT_WEIGHTS)
RANGE_SOFT_WEIGHT_FALLBACK = 2.0
RANGE_SOFT_WEIGHT_NEARLY_USELESS = 0.5
RANGE_SOFT_WEIGHT_MARGINAL = 12.0
RANGE_SOFT_WEIGHT_USEFUL = 24.0
RANGE_SOFT_WEIGHT_VITAL = 40.0
PRE_200_WISDOM_WEIGHT = 0.15
LEVEL_200_WISDOM_WEIGHT = 0.0
PRIMARY_STAT_NAMES = ("Strength", "Intelligence", "Chance", "Agility")
ELEMENT_DAMAGE_STAT_NAMES = (
    "Neutral Damage",
    "Earth Damage",
    "Fire Damage",
    "Water Damage",
    "Air Damage",
)
DAMAGE_SCORING_STATS = {
    *PRIMARY_STAT_NAMES,
    "Power",
    "Earth Damage",
    "Neutral Damage",
    "Fire Damage",
    "Water Damage",
    "Air Damage",
    "Damage",
    "Critical Damage",
    "Critical",
    "% Final Damage",
    "% Spell Damage",
    "% Weapon Damage",
    "% Melee Damage",
    "% Ranged Damage",
}
SURVIVABILITY_SCORING_STATS = {
    "Vitality",
    *PERCENT_RESISTANCE_STATS,
    *FLAT_RESISTANCE_STATS,
    "Critical Resistance",
    "Pushback Resistance",
    "% Ranged Resistance",
    "% Melee Resistance",
}
DOMINANCE_STATS = ("AP", "MP", "Range")


def wisdom_weight_for_level(level: int, target_level: int = 200) -> float:
    if level >= target_level:
        return LEVEL_200_WISDOM_WEIGHT
    return PRE_200_WISDOM_WEIGHT


def score_stats_with_weights(stats: dict[str, int], weights: dict[str, float]) -> float:
    return sum(
        min(stats.get(stat, 0), STAT_SCORE_CAPS.get(stat, float("inf"))) * weight
        for stat, weight in weights.items()
    )


def utility_stat_weights(weights: dict[str, float]) -> dict[str, float]:
    return {
        stat: weight
        for stat, weight in weights.items()
        if stat not in DAMAGE_SCORING_STATS and stat not in SURVIVABILITY_SCORING_STATS
    }
