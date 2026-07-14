"""Shared Build Discovery domain, scoring, and indexed-data helpers.

The production search implementation lives in ``build_discovery_cpsat_solver``.
This module intentionally contains no beam search or search orchestration.
"""


from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
from collections import defaultdict
from dataclasses import dataclass, field
from functools import cached_property, lru_cache
from itertools import combinations, product
from typing import Any, Iterable

from oneoff.build_discovery_scoring import (
    BASE_STAT_WEIGHTS,
    DAMAGE_BUFF_EXPECTED_STACK_RATIO,
    DAMAGE_SCORING_STATS,
    DOMINANCE_STATS,
    ELEMENT_DAMAGE_STAT_NAMES,
    FLAT_RESISTANCE_STATS,
    GENERIC_INCOMING_CRIT_RATE,
    GENERIC_INCOMING_HIT,
    GENERIC_INCOMING_PUSHBACK_RATE,
    GENERIC_INCOMING_RANGED_RATE,
    ITEM_DAMAGE_BUFF_EXPECTED_STACK_RATIO_BY_DOFUS_ID,
    ITEM_EXPECTED_EFFECT_STATS_BY_DOFUS_ID,
    LEVEL_200_WISDOM_WEIGHT,
    PERCENT_RESISTANCE_STATS,
    PERCENT_RESISTANCE_WEIGHT,
    PRE_200_WISDOM_WEIGHT,
    PRIMARY_STAT_NAMES,
    RANGE_SOFT_WEIGHT_FALLBACK,
    RANGE_SOFT_WEIGHT_MARGINAL,
    RANGE_SOFT_WEIGHT_NEARLY_USELESS,
    RANGE_SOFT_WEIGHT_USEFUL,
    RANGE_SOFT_WEIGHT_VITAL,
    SORTED_ELEMENT_EHP_WEIGHTS,
    SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID,
    STAT_SCORE_CAPS,
    STAT_WEIGHTS,
    SURVIVABILITY_SCORE_WEIGHT,
    SURVIVABILITY_SCORING_STATS,
    score_stats_with_weights,
    utility_stat_weights,
    wisdom_weight_for_level,
)
from oneoff.condition_evaluator import (
    condition_can_pass_with_stat_bounds,
    set_bonus_count,
    target_forced_conditions_hold,
    unmet_item_conditions,
)
from oneoff.damage_calculator import DamageLine, profile_damage

TARGET_LEVEL = 200


BUILD_DISCOVERY_INDEX_PATH = os.getenv(
    "BUILD_DISCOVERY_INDEX_PATH",
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "app",
        "database",
        "data",
        "build_discovery_index.json",
    ),
)


BUILD_DISCOVERY_INDEX_SCHEMA_VERSION = 1


BUILD_DISCOVERY_REFERENCE_ANCHORS_PATH = os.getenv(
    "BUILD_DISCOVERY_REFERENCE_ANCHORS_PATH",
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "fixtures",
        "build_discovery_reference_anchors.json",
    ),
)


def base_ap_for_level(level: int) -> int:
    return 7 if level >= 100 else 6


@lru_cache(maxsize=1)
def load_reference_anchors() -> dict[int, dict[str, int]]:
    with open(BUILD_DISCOVERY_REFERENCE_ANCHORS_PATH, encoding="utf-8") as file:
        payload = json.load(file)
    return {
        int(level): anchor["stats"]
        for level, anchor in payload.get("anchors", {}).items()
        if anchor.get("stats")
    }


def reference_anchor_for_level(level: int) -> dict[str, int]:
    anchors = load_reference_anchors()
    for anchor_level in sorted(anchors):
        if level <= anchor_level:
            return anchors[anchor_level]
    return anchors[max(anchors)]


def normalize_range_target(range_target: int | None) -> int:
    return MIN_RANGE if range_target is None else range_target


BASE_AP = base_ap_for_level(TARGET_LEVEL)


BASE_MP = 3


REQUIRED_AP = 11


REQUIRED_MP = 6


REQUIRED_RANGE = 0


MIN_AP = BASE_AP


MIN_MP = BASE_MP


MIN_RANGE = 0


MAX_AP = 12


MAX_MP = 6


MAX_RANGE = 6


ACTION_STATS = ("AP", "MP", "Range")


LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL = 19


GENERIC_DAMAGE_WEIGHT = 0.45


WEAPON_DAMAGE_WEIGHT = 0.20


PROFILE_DAMAGE_REFERENCE_SCORE = 3000


PROFILE_DAMAGE_REFERENCE_PRIMARY_STAT = 1000


PROFILE_DAMAGE_REFERENCE_POWER = 200


PROFILE_DAMAGE_REFERENCE_ELEMENTAL_DAMAGE = 100


PROFILE_DAMAGE_REFERENCE_CRITICAL = 50


PROFILE_DAMAGE_REFERENCE_CRITICAL_DAMAGE = 100


GENERIC_STRENGTH_DAMAGE_PROFILE = [
    DamageLine(element="earth", base_min=30, base_max=34, crit_chance=15, weight=1.0),
    DamageLine(element="earth", base_min=42, base_max=48, crit_chance=15, weight=0.75),
    DamageLine(element="earth", base_min=18, base_max=22, crit_chance=25, weight=1.25),
]


GENERIC_DAMAGE_PROFILE_LINES = (
    (30, 34, 15, 1.0),
    (42, 48, 15, 0.75),
    (18, 22, 25, 1.25),
)


SUPPORTED_CLASS_NAMES = (
    "Cra",
    "Ecaflip",
    "Eliotrope",
    "Eniripsa",
    "Enutrof",
    "Feca",
    "Foggernaut",
    "Forgelance",
    "Huppermage",
    "Iop",
    "Masqueraider",
    "Osamodas",
    "Ouginak",
    "Pandawa",
    "Rogue",
    "Sacrier",
    "Sadida",
    "Sram",
    "Xelor",
)


DEFAULT_SPELL_PROFILE_CLASS_NAME = "Iop"


SPELL_DAMAGE_PROFILE_TURN_AP = 10


SPELL_DAMAGE_PROFILE_TURNS = 7


IOP_WRATH_SPELL_NAME = "Iop's Wrath"


IOP_WRATH_CAST_TURNS = (1, 4, 7)


ACCUMULATION_SPELL_NAME = "Accumulation"


ACCUMULATION_BUFF_DURATION_TURNS = 3


WEAPON_EFFECT_ELEMENTS = {
    "NEUTRAL_DAMAGE": "neutral",
    "NEUTRAL_STEAL": "neutral",
    "EARTH_DAMAGE": "earth",
    "EARTH_STEAL": "earth",
    "FIRE_DAMAGE": "fire",
    "FIRE_STEAL": "fire",
    "WATER_DAMAGE": "water",
    "WATER_STEAL": "water",
    "AIR_DAMAGE": "air",
    "AIR_STEAL": "air",
    "BEST_ELEMENT_DAMAGE": "earth",
    "BEST_ELEMENT_STEAL": "earth",
}


EXO_ELIGIBLE_ITEM_TYPES = {
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


BASE_CHARACTERISTIC_POINTS_PER_LEVEL = 5


SCROLLED_BASE_STAT = 100


BASE_STRENGTH_ALLOCATION_OPTIONS = (0, 300, 398)


ACTIVE_TARGET_LEVEL = TARGET_LEVEL


def characteristic_points_for_level(level: int) -> int:
    if not 1 <= level <= TARGET_LEVEL:
        raise ValueError(f"Level must be between 1 and {TARGET_LEVEL}.")
    return BASE_CHARACTERISTIC_POINTS_PER_LEVEL * (level - 1)


def base_stats_for_level(level: int) -> dict[str, int]:
    characteristic_points = characteristic_points_for_level(level)
    return {
        "AP": base_ap_for_level(level),
        "MP": BASE_MP,
        "Vitality": SCROLLED_BASE_STAT + characteristic_points,
        "Wisdom": SCROLLED_BASE_STAT,
        "Strength": SCROLLED_BASE_STAT,
        "Intelligence": SCROLLED_BASE_STAT,
        "Chance": SCROLLED_BASE_STAT,
        "Agility": SCROLLED_BASE_STAT,
    }


def active_base_stats() -> dict[str, int]:
    return base_stats_for_level(ACTIVE_TARGET_LEVEL)


class target_level_context:
    def __init__(self, level: int):
        self.level = level
        self.previous_level = TARGET_LEVEL

    def __enter__(self) -> None:
        global ACTIVE_TARGET_LEVEL
        self.previous_level = ACTIVE_TARGET_LEVEL
        ACTIVE_TARGET_LEVEL = self.level

    def __exit__(self, exc_type, exc, traceback) -> None:
        global ACTIVE_TARGET_LEVEL
        ACTIVE_TARGET_LEVEL = self.previous_level


SLOTS: list[tuple[str, tuple[str, ...]]] = [
    ("amulet", ("Amulet",)),
    ("belt", ("Belt",)),
    (
        "weapon",
        (
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
        ),
    ),
    ("shield", ("Shield",)),
    ("ring_1", ("Ring",)),
    ("ring_2", ("Ring",)),
    ("boots", ("Boots",)),
    ("hat", ("Hat",)),
    ("cloak", ("Cloak",)),
    ("pet", ("Pet", "Petsmount", "Mount")),
    ("dofus_1", ("Dofus", "Trophy", "Prysmaradite")),
    ("dofus_2", ("Dofus", "Trophy", "Prysmaradite")),
    ("dofus_3", ("Dofus", "Trophy", "Prysmaradite")),
    ("dofus_4", ("Dofus", "Trophy", "Prysmaradite")),
    ("dofus_5", ("Dofus", "Trophy", "Prysmaradite")),
    ("dofus_6", ("Dofus", "Trophy", "Prysmaradite")),
]


def active_stat_weights() -> dict[str, float]:
    weights = dict(STAT_WEIGHTS)
    weights["Wisdom"] = wisdom_weight_for_level(ACTIVE_TARGET_LEVEL, TARGET_LEVEL)
    weights["Range"] = active_range_soft_weight()
    return weights


def active_final_utility_stat_weights() -> dict[str, float]:
    return utility_stat_weights(active_stat_weights())


def configure_damage_profile(
    profile_name: str,
    class_name: str = DEFAULT_SPELL_PROFILE_CLASS_NAME,
) -> DamageProfile:
    global ACTIVE_DAMAGE_PROFILE, ACTIVE_SPELL_PROFILE_CLASS_NAME, STAT_WEIGHTS

    profile = ELEMENT_PROFILES[profile_name]
    ACTIVE_DAMAGE_PROFILE = profile
    ACTIVE_SPELL_PROFILE_CLASS_NAME = class_name
    next_weights = dict(BASE_STAT_WEIGHTS)
    for stat in PRIMARY_STAT_NAMES:
        next_weights[stat] = 1.0 if stat == profile.primary_stat else 0.0
    for stat in ELEMENT_DAMAGE_STAT_NAMES:
        next_weights[stat] = 0.0
    next_weights[profile.damage_stat] = 4.0
    for stat, weight in profile.secondary_damage_weights.items():
        next_weights[stat] = weight
    STAT_WEIGHTS = next_weights
    active_spell_candidates.cache_clear()
    active_spell_damage_profile.cache_clear()
    active_range_soft_weight.cache_clear()
    active_profile_spell_damage_baseline.cache_clear()
    cheap_profile_damage_baseline.cache_clear()
    return profile


def generic_damage_profile() -> tuple[DamageLine, ...]:
    if ACTIVE_DAMAGE_PROFILE.name == "strength":
        return tuple(GENERIC_STRENGTH_DAMAGE_PROFILE)
    return tuple(
        DamageLine(
            element=ACTIVE_DAMAGE_PROFILE.element,
            base_min=base_min,
            base_max=base_max,
            crit_chance=crit_chance,
            weight=weight,
        )
        for base_min, base_max, crit_chance, weight in GENERIC_DAMAGE_PROFILE_LINES
    )


def spell_profile_elements_for_profile(profile: DamageProfile) -> dict[str, str]:
    return {
        "NEUTRAL_DAMAGE": "neutral" if profile.name == "strength" else "",
        "NEUTRAL_STEAL": "neutral" if profile.name == "strength" else "",
        "EARTH_DAMAGE": "earth" if profile.element == "earth" else "",
        "EARTH_STEAL": "earth" if profile.element == "earth" else "",
        "FIRE_DAMAGE": "fire" if profile.element == "fire" else "",
        "FIRE_STEAL": "fire" if profile.element == "fire" else "",
        "WATER_DAMAGE": "water" if profile.element == "water" else "",
        "WATER_STEAL": "water" if profile.element == "water" else "",
        "AIR_DAMAGE": "air" if profile.element == "air" else "",
        "AIR_STEAL": "air" if profile.element == "air" else "",
        "BEST_ELEMENT_DAMAGE": profile.element,
        "BEST_ELEMENT_STEAL": profile.element,
    }


EXCLUDED_SET_NAME_PARTS = ("Khardboard",)


DB_STAT_NAMES = {
    "VITALITY": "Vitality",
    "AP": "AP",
    "MP": "MP",
    "INITIATIVE": "Initiative",
    "PROSPECTING": "Prospecting",
    "RANGE": "Range",
    "SUMMON": "Summons",
    "WISDOM": "Wisdom",
    "STRENGTH": "Strength",
    "INTELLIGENCE": "Intelligence",
    "CHANCE": "Chance",
    "AGILITY": "Agility",
    "AP_PARRY": "AP Parry",
    "AP_REDUCTION": "AP Reduction",
    "MP_PARRY": "MP Parry",
    "MP_REDUCTION": "MP Reduction",
    "CRITICAL": "Critical",
    "HEALS": "Heals",
    "LOCK": "Lock",
    "DODGE": "Dodge",
    "PCT_FINAL_DAMAGE": "% Final Damage",
    "POWER": "Power",
    "DAMAGE": "Damage",
    "CRITICAL_DAMAGE": "Critical Damage",
    "NEUTRAL_DAMAGE": "Neutral Damage",
    "EARTH_DAMAGE": "Earth Damage",
    "FIRE_DAMAGE": "Fire Damage",
    "WATER_DAMAGE": "Water Damage",
    "AIR_DAMAGE": "Air Damage",
    "REFLECT": "Reflect",
    "TRAP_DAMAGE": "Trap Damage",
    "TRAP_POWER": "Trap Power",
    "PUSHBACK_DAMAGE": "Pushback Damage",
    "PCT_SPELL_DAMAGE": "% Spell Damage",
    "PCT_WEAPON_DAMAGE": "% Weapon Damage",
    "PCT_RANGED_DAMAGE": "% Ranged Damage",
    "PCT_MELEE_DAMAGE": "% Melee Damage",
    "NEUTRAL_RES": "Neutral Resistance",
    "PCT_NEUTRAL_RES": "% Neutral Resistance",
    "EARTH_RES": "Earth Resistance",
    "PCT_EARTH_RES": "% Earth Resistance",
    "FIRE_RES": "Fire Resistance",
    "PCT_FIRE_RES": "% Fire Resistance",
    "WATER_RES": "Water Resistance",
    "PCT_WATER_RES": "% Water Resistance",
    "AIR_RES": "Air Resistance",
    "PCT_AIR_RES": "% Air Resistance",
    "CRITICAL_RES": "Critical Resistance",
    "PUSHBACK_RES": "Pushback Resistance",
    "PCT_RANGED_RES": "% Ranged Resistance",
    "PCT_MELEE_RES": "% Melee Resistance",
    "PODS": "Pods",
}


@dataclass(frozen=True)
class DamageProfile:
    name: str
    primary_stat: str
    element: str
    damage_stat: str
    secondary_damage_weights: dict[str, float] = field(default_factory=dict)


ELEMENT_PROFILES = {
    "strength": DamageProfile(
        name="strength",
        primary_stat="Strength",
        element="earth",
        damage_stat="Earth Damage",
        secondary_damage_weights={"Neutral Damage": 1.0},
    ),
    "intelligence": DamageProfile(
        name="intelligence",
        primary_stat="Intelligence",
        element="fire",
        damage_stat="Fire Damage",
    ),
    "chance": DamageProfile(
        name="chance",
        primary_stat="Chance",
        element="water",
        damage_stat="Water Damage",
    ),
    "agility": DamageProfile(
        name="agility",
        primary_stat="Agility",
        element="air",
        damage_stat="Air Damage",
    ),
}


ACTIVE_DAMAGE_PROFILE = ELEMENT_PROFILES["strength"]


ACTIVE_SPELL_PROFILE_CLASS_NAME = DEFAULT_SPELL_PROFILE_CLASS_NAME


@dataclass(frozen=True)
class BuildTarget:
    ap: int = REQUIRED_AP
    mp: int = REQUIRED_MP
    range: int = REQUIRED_RANGE
    level: int = TARGET_LEVEL
    min_ap: int = MIN_AP
    range_required: bool = True

    def __post_init__(self) -> None:
        if self.ap < self.min_ap:
            raise ValueError(f"Target AP cannot be below {self.min_ap}.")
        if self.mp < MIN_MP:
            raise ValueError(f"Target MP cannot be below {MIN_MP}.")
        if self.range < MIN_RANGE:
            raise ValueError(f"Target Range cannot be below {MIN_RANGE}.")
        if self.ap > MAX_AP:
            raise ValueError(f"Target AP cannot exceed {MAX_AP}.")
        if self.mp > MAX_MP:
            raise ValueError(f"Target MP cannot exceed {MAX_MP}.")
        if self.range > MAX_RANGE:
            raise ValueError(f"Target Range cannot exceed {MAX_RANGE}.")

    @property
    def condition_stats(self) -> dict[str, int]:
        stats = {"AP": self.ap, "MP": self.mp}
        if self.range_required:
            stats["Range"] = self.range
        return stats


DEFAULT_TARGET = BuildTarget()


DEFAULT_MAX_SHARED_ITEMS = 12


@dataclass(frozen=True)
class DamageSurvivabilityPreset:
    generic_damage_weight: float
    survivability_weight: float
    negative_resistance_penalty_weight: float


DAMAGE_SURVIVABILITY_PRESETS = {
    1: DamageSurvivabilityPreset(
        generic_damage_weight=0.15,
        survivability_weight=2.5,
        negative_resistance_penalty_weight=0.0,
    ),
    2: DamageSurvivabilityPreset(
        generic_damage_weight=0.25,
        survivability_weight=1.8,
        negative_resistance_penalty_weight=0.0,
    ),
    3: DamageSurvivabilityPreset(
        generic_damage_weight=0.45,
        survivability_weight=1.0,
        negative_resistance_penalty_weight=0.0,
    ),
    4: DamageSurvivabilityPreset(
        generic_damage_weight=0.60,
        survivability_weight=0.7,
        negative_resistance_penalty_weight=0.0,
    ),
}


@dataclass(frozen=True)
class BuildDiscoveryQuery:
    class_name: str = "Iop"
    level: int = TARGET_LEVEL
    elements: tuple[str, ...] = ("strength",)
    mode: str = "pvm"
    ap_target: int = REQUIRED_AP
    mp_target: int = REQUIRED_MP
    range_target: int | None = REQUIRED_RANGE
    damage_survivability_preset: int = 4
    budget_tier: int = 2
    exo_policy: str = "allow"
    weapon_policy: str = "stat_stick_allowed"
    locked_item_ids: tuple[str, ...] = ()
    avoided_item_ids: tuple[str, ...] = ()
    limit: int = 5
    max_shared_items: int | None = DEFAULT_MAX_SHARED_ITEMS
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT

    @property
    def primary_element(self) -> str:
        if len(self.elements) != 1:
            raise ValueError("Build Discovery v1 only supports one element at a time.")
        return self.elements[0]

    @property
    def target(self) -> BuildTarget:
        return BuildTarget(
            ap=self.ap_target,
            mp=self.mp_target,
            range=normalize_range_target(self.range_target),
            level=self.level,
            min_ap=base_ap_for_level(self.level),
            range_required=self.range_target is not None,
        )

    def validate(self) -> None:
        if self.class_name not in SUPPORTED_CLASS_NAMES:
            supported = ", ".join(SUPPORTED_CLASS_NAMES)
            raise ValueError(
                f"Unsupported class: {self.class_name}. Supported classes: {supported}."
            )
        if not 1 <= self.level <= TARGET_LEVEL:
            raise ValueError(f"Build Discovery supports levels 1-{TARGET_LEVEL}.")
        if self.mode != "pvm":
            raise ValueError("Build Discovery v1 currently supports PvM only.")
        if self.primary_element not in ELEMENT_PROFILES:
            raise ValueError(f"Unsupported element: {self.primary_element}.")
        if not 1 <= self.damage_survivability_preset <= 4:
            raise ValueError("damage_survivability_preset must be between 1 and 4.")
        if not 1 <= self.budget_tier <= 4:
            raise ValueError("budget_tier must be between 1 and 4.")
        if self.exo_policy not in {"none", "allow", "opti"}:
            raise ValueError("exo_policy must be one of: none, allow, opti.")
        if self.weapon_policy not in {
            "stat_stick_allowed",
            "weapon_damage_allowed",
        }:
            raise ValueError(
                "weapon_policy must be one of: stat_stick_allowed, "
                "weapon_damage_allowed."
            )
        self.target
        overlap = set(self.locked_item_ids) & set(self.avoided_item_ids)
        if overlap:
            raise ValueError(
                f"Items cannot be both locked and avoided: {', '.join(sorted(overlap))}."
            )


def query_summary(query: BuildDiscoveryQuery) -> dict[str, Any]:
    return {
        "className": query.class_name,
        "level": query.level,
        "elements": list(query.elements),
        "mode": query.mode,
        "apTarget": query.ap_target,
        "mpTarget": query.mp_target,
        "rangeTarget": query.range_target,
        "damageSurvivabilityPreset": query.damage_survivability_preset,
        "budgetTier": query.budget_tier,
        "exoPolicy": query.exo_policy,
        "weaponPolicy": query.weapon_policy,
        "lockedItemIds": list(query.locked_item_ids),
        "avoidedItemIds": list(query.avoided_item_ids),
        "resultLimit": query.limit,
        "maxSharedItems": query.max_shared_items,
    }


def query_cache_identity(query: BuildDiscoveryQuery) -> dict[str, Any]:
    return {
        "className": query.class_name,
        "level": query.level,
        "elements": list(query.elements),
        "mode": query.mode,
        "apTarget": query.ap_target,
        "mpTarget": query.mp_target,
        "rangeTarget": query.range_target,
        "damageSurvivabilityPreset": query.damage_survivability_preset,
        "budgetTier": query.budget_tier,
        "exoPolicy": query.exo_policy,
        "weaponPolicy": query.weapon_policy,
        "lockedItemIds": list(query.locked_item_ids),
        "avoidedItemIds": list(query.avoided_item_ids),
        "limit": query.limit,
        "maxSharedItems": query.max_shared_items,
        "genericDamageWeight": query.generic_damage_weight,
        "weaponDamageWeight": query.weapon_damage_weight,
    }


def damage_survivability_preset(
    query: BuildDiscoveryQuery,
) -> DamageSurvivabilityPreset:
    return DAMAGE_SURVIVABILITY_PRESETS[query.damage_survivability_preset]


def effective_generic_damage_weight(query: BuildDiscoveryQuery) -> float:
    if query.generic_damage_weight != GENERIC_DAMAGE_WEIGHT:
        return query.generic_damage_weight
    return damage_survivability_preset(query).generic_damage_weight


def effective_survivability_weight(query: BuildDiscoveryQuery) -> float:
    return damage_survivability_preset(query).survivability_weight


def effective_negative_resistance_penalty_weight(query: BuildDiscoveryQuery) -> float:
    return damage_survivability_preset(query).negative_resistance_penalty_weight


def effective_exo_policy(query: BuildDiscoveryQuery) -> str:
    """Apply availability rules before the solver models exomages."""
    if query.budget_tier < 3:
        return "none"
    return query.exo_policy


def availability_tier_for_item(item: dict[str, Any]) -> int:
    item_type = item.get("itemType") or item.get("type")
    item_id = item.get("dofusID") or item.get("id")
    if item_id in OPTI_DOFUS_IDS:
        return 4
    if item_type == "Prysmaradite":
        return 3
    if item_type == "Dofus":
        return 2 if item_id in ACCESSIBLE_DOFUS_IDS else 3
    if item_type == "Trophy":
        return 1
    if item_type in {"Pet", "Petsmount"}:
        return 2
    if item_type == "Mount":
        return 1
    if item.get("buffs"):
        return 4
    return 1


def item_allowed_by_budget(item: dict[str, Any], budget_tier: int) -> bool:
    return availability_tier_for_item(item) <= budget_tier


OCHRE_DOFUS_ID = "7754"


VULBIS_DOFUS_ID = "6980"


ACCESSIBLE_DOFUS_IDS = {
    "694",  # Crimson Dofus
    "737",  # Emerald Dofus
    "739",  # Turquoise Dofus
    "7043",  # Ice Dofus
    "13344",  # Dolmanax
}


OPTI_DOFUS_IDS = {
    OCHRE_DOFUS_ID,
    VULBIS_DOFUS_ID,
}


@dataclass
class BuildState:
    slots: dict[str, dict[str, Any]] = field(default_factory=dict)
    stats: dict[str, int] = field(default_factory=active_base_stats)
    set_counts: dict[str, int] = field(default_factory=dict)
    used_item_ids: set[str] = field(default_factory=set)
    exos: dict[str, str] = field(default_factory=dict)
    base_allocation: dict[str, int] = field(
        default_factory=lambda: {
            ACTIVE_DAMAGE_PROFILE.primary_stat: 300,
            "Vitality": 395,
        }
    )
    ap_strategy: str | None = None
    score: float = 0.0
    condition_failures: list[dict[str, Any]] = field(default_factory=list)

    def clone(self) -> "BuildState":
        return BuildState(
            slots=dict(self.slots),
            stats=dict(self.stats),
            set_counts=dict(self.set_counts),
            used_item_ids=set(self.used_item_ids),
            exos=dict(self.exos),
            base_allocation=dict(self.base_allocation),
            ap_strategy=self.ap_strategy,
            score=self.score,
            condition_failures=list(self.condition_failures),
        )


@dataclass(frozen=True)
class SpellDamageCandidate:
    name: str
    variant_pair_id: str
    ap_cost: int
    cooldown: int | None
    casts_per_turn: int | None
    casts_per_target: int | None
    base_crit_chance: int
    damage_lines: tuple[DamageLine, ...]
    damage_increase: int = 0
    crit_damage_increase: int = 0
    max_damage_increase_stacks: int = 0
    is_weapon: bool = False
    min_range: int | None = None
    max_range: int | None = None
    has_modifiable_range: bool = False


@dataclass(frozen=True)
class RotationDamageResult:
    normalized_damage: float
    total_damage: float
    weakest_filler_damage_per_ap: float


@dataclass(frozen=True)
class FillerSequenceResult:
    total_damage: float
    weakest_damage_per_ap: float
    cast_names: tuple[str, ...]
    turn_cast_counts: tuple[tuple[str, int], ...]
    last_cast_turns: tuple[tuple[str, int], ...]
    stack_counts: tuple[tuple[str, int], ...]


def normalize_stats(lines: Iterable[dict[str, Any]]) -> dict[str, int]:
    stats: dict[str, int] = defaultdict(int)
    for line in lines:
        stat = line.get("stat")
        value = line.get("maxStat", line.get("value"))
        if stat and value:
            stats[stat] += int(value)
    return dict(stats)


def get_name(entity: dict[str, Any]) -> str:
    name = entity.get("name")
    if isinstance(name, dict):
        return name.get("en") or next(iter(name.values()))
    return str(name)


def db_stat_name(stat: Any) -> str | None:
    if stat is None:
        return None
    stat_key = getattr(stat, "name", str(stat))
    if "." in stat_key:
        stat_key = stat_key.rsplit(".", 1)[-1]
    return DB_STAT_NAMES.get(stat_key, stat_key)


def translated_name(translations: Iterable[Any], default: str) -> str:
    translations = list(translations)
    english = next(
        (translation for translation in translations if translation.locale == "en"),
        None,
    )
    return (english or translations[0]).name if translations else default


def item_stats_from_db(stats: Iterable[Any]) -> list[dict[str, Any]]:
    stat_lines = []
    for stat in sorted(stats, key=lambda item_stat: item_stat.order):
        stat_name = db_stat_name(stat.stat)
        if stat_name:
            stat_lines.append(
                {
                    "stat": stat_name,
                    "minStat": stat.min_value,
                    "maxStat": stat.max_value,
                }
            )
    return stat_lines


def item_buffs_from_db(buffs: Iterable[Any]) -> list[dict[str, Any]]:
    buff_lines = []
    for buff in buffs:
        stat_name = db_stat_name(buff.stat)
        if stat_name:
            buff_lines.append(
                {
                    "stat": stat_name,
                    "incrementBy": buff.increment_by or 0,
                    "maxStacks": buff.max_stacks or 1,
                }
            )
    return buff_lines


def int_or_zero(value: Any) -> int:
    if isinstance(value, tuple):
        value = value[0] if value else 0
    return int(value or 0)


def effect_type_key(effect_type: Any) -> str:
    key = getattr(effect_type, "name", str(effect_type))
    return key.rsplit(".", 1)[-1]


def weapon_stats_from_db(weapon_stats: Any) -> dict[str, Any] | None:
    if not weapon_stats:
        return None
    return {
        "apCost": weapon_stats.ap_cost,
        "usesPerTurn": weapon_stats.uses_per_turn,
        "minRange": weapon_stats.min_range,
        "maxRange": weapon_stats.max_range,
        "baseCritChance": int_or_zero(weapon_stats.base_crit_chance),
        "critBonusDamage": int_or_zero(weapon_stats.crit_bonus_damage),
        "weaponEffects": [
            {
                "effectType": effect_type_key(effect.effect_type),
                "minDamage": int_or_zero(effect.min_damage),
                "maxDamage": int_or_zero(effect.max_damage),
            }
            for effect in weapon_stats.weapon_effects
        ],
    }


def set_bonuses_from_db(bonuses: Iterable[Any]) -> dict[str, list[dict[str, Any]]]:
    bonus_lines_by_count: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for bonus in sorted(bonuses, key=lambda set_bonus: set_bonus.num_items):
        stat_name = db_stat_name(bonus.stat)
        if stat_name:
            bonus_lines_by_count[str(bonus.num_items)].append(
                {
                    "stat": stat_name,
                    "value": bonus.value,
                }
            )
    return dict(bonus_lines_by_count)


def normalized_set_bonuses(
    bonuses: dict[str, list[dict[str, Any]]]
) -> dict[str, dict[str, int]]:
    return {
        count: normalize_stats(bonus_lines) for count, bonus_lines in bonuses.items()
    }


def set_bonus_stats(set_obj: dict[str, Any]) -> dict[str, dict[str, int]]:
    bonus_stats = set_obj.get("_bonus_stats")
    if bonus_stats is not None:
        return bonus_stats
    return normalized_set_bonuses(set_obj.get("bonuses", {}))


def score_stats(stats: dict[str, int]) -> float:
    return score_stats_with_weights(stats, active_stat_weights())


def final_utility_score(stats: dict[str, int]) -> float:
    return score_stats_with_weights(stats, active_final_utility_stat_weights())


def item_score(item: dict[str, Any]) -> float:
    stats: dict[str, float] = defaultdict(float, normalize_stats(item.get("stats", [])))
    for stat, value in expected_item_effect_stats(item).items():
        stats[stat] += value
    return score_stats(dict(stats))


def active_profile_item_score(item: dict[str, Any]) -> float:
    score_by_profile = item.setdefault("_score_by_profile", {})
    profile_name = f"{ACTIVE_SPELL_PROFILE_CLASS_NAME}:{ACTIVE_DAMAGE_PROFILE.name}"
    if profile_name not in score_by_profile:
        score_by_profile[profile_name] = item_score(item)
    return score_by_profile[profile_name]


def expected_item_effect_stats(item: dict[str, Any]) -> dict[str, float]:
    stats: dict[str, float] = defaultdict(float)
    item_id = item.get("dofusID")
    if item_id in ITEM_EXPECTED_EFFECT_STATS_BY_DOFUS_ID:
        stats.update(ITEM_EXPECTED_EFFECT_STATS_BY_DOFUS_ID[item_id])
        for stat, value in SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID.get(
            item_id, {}
        ).items():
            stats[stat] += value
        return dict(stats)
    damage_buff_expected_stack_ratio = (
        ITEM_DAMAGE_BUFF_EXPECTED_STACK_RATIO_BY_DOFUS_ID.get(
            item_id,
            DAMAGE_BUFF_EXPECTED_STACK_RATIO,
        )
    )
    for buff in item.get("buffs", []):
        stat = buff.get("stat")
        if not stat:
            continue
        stats[stat] += (
            (buff.get("incrementBy") or 0)
            * (buff.get("maxStacks") or 1)
            * damage_buff_expected_stack_ratio
        )
    for stat, value in SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID.get(
        item_id, {}
    ).items():
        stats[stat] += value
    return dict(stats)


def effective_scoring_stats(state: BuildState) -> dict[str, float]:
    stats: dict[str, float] = defaultdict(float, state.stats)
    for item in state.slots.values():
        for stat, value in expected_item_effect_stats(item).items():
            stats[stat] += value
    return dict(stats)


def db_item_dofus_id(item: Any) -> str | None:
    return item.dofus_db_id or item.dofus_db_mount_id


_BUILD_DISCOVERY_INDEX_CACHE: dict[str, Any] | None = None
_BUILD_DISCOVERY_INDEX_SIGNATURE: tuple[int, int] | None = None


def clear_index_dependent_caches() -> None:
    for name in (
        "load_all_item_records",
        "load_sets",
        "indexed_spell_profile",
        "spell_candidates_for_profile",
        "active_spell_candidates",
        "active_spell_damage_profile",
        "active_range_soft_weight",
        "active_profile_spell_damage_baseline",
        "cheap_profile_damage_baseline",
    ):
        cached = globals().get(name)
        if cached is not None and hasattr(cached, "cache_clear"):
            cached.cache_clear()


def load_build_discovery_index() -> dict[str, Any] | None:
    global _BUILD_DISCOVERY_INDEX_CACHE, _BUILD_DISCOVERY_INDEX_SIGNATURE
    if not os.path.exists(BUILD_DISCOVERY_INDEX_PATH):
        if _BUILD_DISCOVERY_INDEX_SIGNATURE is not None:
            _BUILD_DISCOVERY_INDEX_CACHE = None
            _BUILD_DISCOVERY_INDEX_SIGNATURE = None
            clear_index_dependent_caches()
        return None
    stat = os.stat(BUILD_DISCOVERY_INDEX_PATH)
    signature = (stat.st_mtime_ns, stat.st_size)
    if signature == _BUILD_DISCOVERY_INDEX_SIGNATURE:
        return _BUILD_DISCOVERY_INDEX_CACHE
    with open(BUILD_DISCOVERY_INDEX_PATH, encoding="utf-8") as file:
        generated_index = json.load(file)
    schema_version = generated_index.get("schemaVersion")
    if schema_version != BUILD_DISCOVERY_INDEX_SCHEMA_VERSION:
        raise ValueError(
            "Unsupported build discovery index schemaVersion "
            f"{schema_version}; expected {BUILD_DISCOVERY_INDEX_SCHEMA_VERSION}."
        )
    changed = _BUILD_DISCOVERY_INDEX_SIGNATURE is not None
    _BUILD_DISCOVERY_INDEX_CACHE = generated_index
    _BUILD_DISCOVERY_INDEX_SIGNATURE = signature
    if changed:
        clear_index_dependent_caches()
    return generated_index


def dataset_version() -> str:
    generated_index = load_build_discovery_index()
    if generated_index is None:
        return "unindexed-db"
    return (
        generated_index.get("datasetVersion")
        or generated_index.get("generatedAt")
        or "indexed-unknown"
    )


def item_record_from_index(
    item: dict[str, Any], *, score_item: bool = True
) -> dict[str, Any]:
    record = {
        "uuid": item.get("internalId") or item.get("uuid"),
        "dofusID": item["id"],
        "name": item.get("name") or item["id"],
        "itemType": item.get("itemType"),
        "setID": item.get("setID"),
        "level": item.get("level"),
        "stats": item.get("stats", []),
        "buffs": item.get("buffs", []),
        "weaponStats": item.get("weaponStats"),
        "conditions": item.get("conditions")
        or {"conditions": {}, "customConditions": {}},
    }
    record["_name"] = get_name(record)
    record["_stats"] = item.get("normalizedStats") or normalize_stats(
        record.get("stats", [])
    )
    if score_item:
        record["_score"] = item_score(record)
    return record


def set_record_from_index(set_id: str, set_obj: dict[str, Any]) -> dict[str, Any]:
    bonuses = set_obj.get("bonuses", {})
    return {
        "id": set_obj.get("id", set_id),
        "name": set_obj.get("name", set_id),
        "bonuses": bonuses,
        "_bonus_stats": normalized_set_bonuses(bonuses),
        "_name": set_obj.get("name", set_id),
        "_excluded": bool(set_obj.get("excluded")),
    }


def normal_gear_bucket_names_for_target(target_level: int) -> tuple[str, ...]:
    generated_index = load_build_discovery_index()
    if generated_index is None:
        return tuple()

    buckets = sorted(
        generated_index.get("levelBuckets", []),
        key=lambda bucket: bucket["minLevel"],
    )
    for index, bucket in enumerate(buckets):
        if bucket["minLevel"] <= target_level <= bucket["maxLevel"]:
            bucket_names = [bucket["name"]]
            if index > 0:
                bucket_names.append(buckets[index - 1]["name"])
            return tuple(bucket_names)
    return tuple()


def indexed_candidate_item_ids(target_level: int = TARGET_LEVEL) -> set[str] | None:
    generated_index = load_build_discovery_index()
    if generated_index is None:
        return None

    indexes = generated_index.get("indexes", {})
    item_ids: set[str] = set(indexes.get("evergreenItemIds", []))
    item_ids.update(indexes.get("petMountIds", []))

    normal_by_bucket = indexes.get("normalGearByLevelBucket", {})
    for bucket_name in normal_gear_bucket_names_for_target(target_level):
        item_ids.update(normal_by_bucket.get(bucket_name, []))

    dofus_like_by_bucket = indexes.get("dofusTrophyPrysmaraditeByLevelBucket", {})
    buckets_by_name = {
        bucket["name"]: bucket for bucket in generated_index.get("levelBuckets", [])
    }
    for bucket_name, ids in dofus_like_by_bucket.items():
        if (
            buckets_by_name.get(bucket_name, {}).get("minLevel", target_level + 1)
            <= target_level
        ):
            item_ids.update(ids)

    return item_ids


@lru_cache(maxsize=1)
def load_all_item_records(*, score_items: bool = True) -> tuple[dict[str, Any], ...]:
    generated_index = load_build_discovery_index()
    if generated_index is not None:
        return tuple(
            item_record_from_index(item, score_item=score_items)
            for item in generated_index.get("items", [])
        )

    from sqlalchemy import or_
    from sqlalchemy.orm import selectinload

    from app import session_scope
    from app.database.model_item import ModelItem
    from app.database.model_item_type import ModelItemType
    from app.database.model_weapon_stat import ModelWeaponStat

    with session_scope() as db_session:
        db_items = (
            db_session.query(ModelItem)
            .join(ModelItem.item_type)
            .options(
                selectinload(ModelItem.item_translations),
                selectinload(ModelItem.stats),
                selectinload(ModelItem.buffs),
                selectinload(ModelItem.item_type).selectinload(
                    ModelItemType.item_type_translation
                ),
                selectinload(ModelItem.weapon_stats).selectinload(
                    ModelWeaponStat.weapon_effects
                ),
            )
            .filter(ModelItem.level <= TARGET_LEVEL)
            .filter(
                or_(
                    ModelItem.dofus_db_id.isnot(None),
                    ModelItem.dofus_db_mount_id.isnot(None),
                )
            )
            .all()
        )
        items = tuple(
            {
                "uuid": str(item.uuid),
                "dofusID": db_item_dofus_id(item),
                "name": translated_name(
                    item.item_translations, db_item_dofus_id(item) or ""
                ),
                "itemType": translated_name(
                    item.item_type.item_type_translation, str(item.item_type_id)
                ),
                "setID": str(item.set_id) if item.set_id else None,
                "level": item.level,
                "stats": item_stats_from_db(item.stats),
                "buffs": item_buffs_from_db(item.buffs),
                "weaponStats": weapon_stats_from_db(item.weapon_stats),
                "conditions": item.conditions
                or {"conditions": {}, "customConditions": {}},
            }
            for item in db_items
        )
    for item in items:
        item["_name"] = get_name(item)
        item["_stats"] = normalize_stats(item.get("stats", []))
        if score_items:
            item["_score"] = active_profile_item_score(item)
    return items


def load_items(
    target: BuildTarget = DEFAULT_TARGET,
    excluded_item_ids: set[str] | None = None,
    budget_tier: int = 4,
    *,
    score_items: bool = True,
) -> list[dict[str, Any]]:
    excluded_item_ids = excluded_item_ids or set()
    items = load_all_item_records(score_items=score_items)
    indexed_item_ids = indexed_candidate_item_ids(target.level)
    if score_items:
        for item in items:
            item["_score"] = active_profile_item_score(item)
    condition_stat_bounds = {
        "AP": (target.ap, MAX_AP),
        "MP": (target.mp, MAX_MP),
    }
    if target.range_required:
        condition_stat_bounds["Range"] = (target.range, MAX_RANGE)
    candidates = [
        item
        for item in items
        if item.get("level", 0) <= target.level
        and (indexed_item_ids is None or item.get("dofusID") in indexed_item_ids)
        and item.get("dofusID") not in excluded_item_ids
        and item_allowed_by_budget(item, budget_tier)
        and condition_can_pass_with_stat_bounds(
            item.get("conditions", {}).get("conditions", {}),
            condition_stat_bounds,
        )
    ]
    return candidates


@lru_cache(maxsize=1)
def load_sets() -> dict[str, dict[str, Any]]:
    generated_index = load_build_discovery_index()
    if generated_index is not None:
        return {
            set_id: set_record_from_index(set_id, set_obj)
            for set_id, set_obj in generated_index.get("sets", {}).items()
        }

    from sqlalchemy.orm import joinedload

    from app import session_scope
    from app.database.model_set import ModelSet

    with session_scope() as db_session:
        db_sets = (
            db_session.query(ModelSet)
            .options(joinedload(ModelSet.set_translation), joinedload(ModelSet.bonuses))
            .all()
        )
        sets = {
            str(set_obj.uuid): {
                "id": str(set_obj.uuid),
                "name": translated_name(set_obj.set_translation, set_obj.dofus_db_id),
                "bonuses": set_bonuses_from_db(set_obj.bonuses),
            }
            for set_obj in db_sets
        }
    for set_obj in sets.values():
        set_obj["_name"] = get_name(set_obj)
        set_obj["_bonus_stats"] = normalized_set_bonuses(set_obj.get("bonuses", {}))
        set_obj["_excluded"] = any(
            part in set_obj["_name"] for part in EXCLUDED_SET_NAME_PARTS
        )
    return sets


def apply_stat_delta(
    stats: dict[str, int], stat_values: dict[str, int], multiplier: int = 1
) -> None:
    for stat, value in stat_values.items():
        stats[stat] = stats.get(stat, 0) + (value * multiplier)


def action_stats_meet_target(state: BuildState, target: BuildTarget) -> bool:
    range_value = state.stats.get("Range", 0)
    range_ok = (
        range_value <= MAX_RANGE
        if not target.range_required
        else target.range <= range_value <= MAX_RANGE
    )
    return (
        target.ap <= state.stats.get("AP", 0) <= MAX_AP
        and target.mp <= state.stats.get("MP", 0) <= MAX_MP
        and range_ok
    )


def weapon_damage_lines(item: dict[str, Any]) -> list[DamageLine]:
    weapon_stats = item.get("weaponStats")
    if not weapon_stats:
        return []

    crit_chance = weapon_stats.get("baseCritChance") or 0
    crit_bonus_damage = weapon_stats.get("critBonusDamage") or 0
    lines = []
    for effect in weapon_stats.get("weaponEffects", []):
        effect_type = effect.get("effectType")
        if effect_type in {"BEST_ELEMENT_DAMAGE", "BEST_ELEMENT_STEAL"}:
            element = ACTIVE_DAMAGE_PROFILE.element
        else:
            element = WEAPON_EFFECT_ELEMENTS.get(effect_type)
        if not element:
            continue
        lines.append(
            DamageLine(
                element=element,
                base_min=effect.get("minDamage") or effect.get("maxDamage") or 0,
                base_max=effect.get("maxDamage") or 0,
                crit_chance=crit_chance,
                crit_bonus_damage=crit_bonus_damage,
                is_weapon=True,
                weight=1.0,
            )
        )
    return lines


def state_weapon_damage(
    state: BuildState, stats: dict[str, float] | None = None
) -> float:
    weapon = state.slots.get("weapon")
    if not weapon:
        return 0.0
    weapon_stats = weapon.get("weaponStats") or {}
    ap_cost = weapon_stats.get("apCost") or 1
    return profile_damage(weapon_damage_lines(weapon), stats or state.stats) / ap_cost


def weapon_rotation_candidate(state: BuildState | None) -> SpellDamageCandidate | None:
    if state is None:
        return None
    weapon = state.slots.get("weapon")
    if not weapon:
        return None
    weapon_stats = weapon.get("weaponStats") or {}
    damage_lines = tuple(weapon_damage_lines(weapon))
    if not damage_lines:
        return None
    return SpellDamageCandidate(
        name=f"Weapon: {weapon.get('_name', weapon.get('name', 'Weapon'))}",
        variant_pair_id=f"weapon:{weapon.get('dofusID', 'unknown')}",
        ap_cost=max(weapon_stats.get("apCost") or 1, 1),
        cooldown=None,
        casts_per_turn=weapon_stats.get("usesPerTurn") or 1,
        casts_per_target=None,
        base_crit_chance=int_or_zero(weapon_stats.get("baseCritChance")),
        damage_lines=damage_lines,
        is_weapon=True,
        min_range=weapon_stats.get("minRange"),
        max_range=weapon_stats.get("maxRange"),
        has_modifiable_range=False,
    )


def english_conditions(effect: Any) -> tuple[str, ...]:
    return tuple(
        condition.condition
        for condition in getattr(effect, "condition", [])
        if getattr(condition, "locale", None) == "en"
    )


def target_count_condition(conditions: Iterable[str]) -> int | None:
    for condition in conditions:
        words = condition.strip().lower().split()
        if len(words) >= 2 and words[1].startswith("target"):
            try:
                return int(words[0])
            except ValueError:
                continue
    return None


BASE_SINGLE_TARGET_CONDITIONS = {
    "base",
    "enemies",
    "on an enemy",
    "on non-summons",
    "on the target",
    "1 target",
}


def is_base_single_target_effect(conditions: Iterable[str]) -> bool:
    normalized_conditions = {condition.strip().lower() for condition in conditions}
    if not normalized_conditions:
        return True
    return normalized_conditions.issubset(BASE_SINGLE_TARGET_CONDITIONS)


def collapse_single_target_spell_effects(
    effects: Iterable[Any],
    profile_elements: dict[str, str],
    base_crit_chance: int,
    is_trap: bool = False,
) -> tuple[DamageLine, ...]:
    lines_by_order: dict[int, tuple[int | None, DamageLine]] = {}
    for effect in effects:
        element = profile_elements.get(effect_type_key(effect.effect_type))
        if not element or effect.min_damage is None:
            continue
        conditions = english_conditions(effect)
        target_count = target_count_condition(conditions)
        if target_count is not None and target_count != 1:
            continue
        if not is_base_single_target_effect(conditions):
            continue

        line = DamageLine(
            element=element,
            base_min=int_or_zero(effect.min_damage),
            base_max=int_or_zero(effect.max_damage),
            crit_base_min=(
                int_or_zero(effect.crit_min_damage)
                if effect.crit_min_damage is not None
                else None
            ),
            crit_base_max=(
                int_or_zero(effect.crit_max_damage)
                if effect.crit_max_damage is not None
                else None
            ),
            crit_chance=base_crit_chance,
            is_trap=is_trap,
            weight=1.0,
        )
        order = int_or_zero(effect.order)
        existing = lines_by_order.get(order)
        if existing is None or (existing[0] is not None and target_count is None):
            lines_by_order[order] = (target_count, line)

    return tuple(
        line
        for _, line in sorted(
            lines_by_order.values(), key=lambda entry: entry[1].base_min
        )
    )


def spell_damage_per_cast(
    spell: SpellDamageCandidate, stats: dict[str, int], stacks: int = 0
) -> float:
    if spell.name == ACCUMULATION_SPELL_NAME and stacks <= 0:
        return 0.0
    stack_count = min(max(stacks, 0), spell.max_damage_increase_stacks)
    lines = [
        DamageLine(
            element=line.element,
            base_min=line.base_min + spell.damage_increase * stack_count,
            base_max=line.base_max + spell.damage_increase * stack_count,
            crit_base_min=(
                line.crit_base_min + spell.crit_damage_increase * stack_count
                if line.crit_base_min is not None
                else None
            ),
            crit_base_max=(
                line.crit_base_max + spell.crit_damage_increase * stack_count
                if line.crit_base_max is not None
                else None
            ),
            crit_chance=line.crit_chance,
            crit_bonus_damage=line.crit_bonus_damage,
            is_weapon=line.is_weapon,
            is_trap=line.is_trap,
            weight=line.weight,
            distance=line.distance,
        )
        for line in spell.damage_lines
    ]
    return profile_damage(lines, stats)


def spell_damage_per_ap(
    spell: SpellDamageCandidate, stats: dict[str, int], stacks: int = 0
) -> float:
    return spell_damage_per_cast(spell, stats, stacks=stacks) / max(spell.ap_cost, 1)


def select_variant_spells(
    candidates: Iterable[SpellDamageCandidate],
    stats: dict[str, int],
) -> tuple[SpellDamageCandidate, ...]:
    best_by_variant_pair: dict[str, SpellDamageCandidate] = {}
    for spell in candidates:
        current = best_by_variant_pair.get(spell.variant_pair_id)
        if current is None or spell_damage_per_ap(spell, stats) > spell_damage_per_ap(
            current, stats
        ):
            best_by_variant_pair[spell.variant_pair_id] = spell
    return tuple(best_by_variant_pair.values())


def spell_range_evidence_weight(spell: SpellDamageCandidate) -> float:
    line_weight = sum(
        ((line.base_min + line.base_max) / 2) * line.weight
        for line in spell.damage_lines
    )
    return line_weight / max(spell.ap_cost, 1)


@lru_cache(maxsize=1)
def active_range_soft_weight() -> float:
    candidates = active_spell_candidates()
    if not candidates:
        return RANGE_SOFT_WEIGHT_FALLBACK

    selected = select_variant_spells(candidates, active_base_stats())
    evidence = [
        (spell, spell_range_evidence_weight(spell))
        for spell in selected
        if spell.damage_lines and spell_range_evidence_weight(spell) > 0
    ]
    total_weight = sum(weight for _, weight in evidence)
    if total_weight <= 0:
        return RANGE_SOFT_WEIGHT_FALLBACK

    high_modifiable_weight = sum(
        weight
        for spell, weight in evidence
        if spell.has_modifiable_range and (spell.max_range or 0) >= 4
    )
    short_locked_weight = sum(
        weight
        for spell, weight in evidence
        if not spell.has_modifiable_range and (spell.max_range or 0) <= 2
    )
    high_modifiable_share = high_modifiable_weight / total_weight
    short_locked_share = short_locked_weight / total_weight

    if short_locked_share >= 0.75:
        return RANGE_SOFT_WEIGHT_NEARLY_USELESS
    if high_modifiable_share >= 0.75:
        return RANGE_SOFT_WEIGHT_VITAL
    if high_modifiable_share >= 0.5:
        return RANGE_SOFT_WEIGHT_USEFUL
    if high_modifiable_share >= 0.25:
        return RANGE_SOFT_WEIGHT_MARGINAL
    return RANGE_SOFT_WEIGHT_NEARLY_USELESS


def filler_cast_count_for_turn(
    spell: SpellDamageCandidate, turn_cast_counts: dict[str, int]
) -> int:
    cast_limits = [
        limit for limit in (spell.casts_per_turn, spell.casts_per_target) if limit
    ]
    max_casts = min(cast_limits) if cast_limits else 99
    used_casts = turn_cast_counts.get(spell.name, 0)
    return max(max_casts - used_casts, 0)


def filler_casts_available_for_state(
    spell: SpellDamageCandidate,
    turn_cast_counts: dict[str, int],
    stack_counts: dict[str, int],
) -> int:
    if spell.name != ACCUMULATION_SPELL_NAME:
        return filler_cast_count_for_turn(spell, turn_cast_counts)

    total_casts = turn_cast_counts.get(
        f"{ACCUMULATION_SPELL_NAME}:buff", 0
    ) + turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:damage", 0)
    if spell.casts_per_turn and total_casts >= spell.casts_per_turn:
        return 0
    if spell_active_stacks(spell, stack_counts):
        used_damage_casts = turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:damage", 0)
        damage_cast_limit = spell.casts_per_target or spell.casts_per_turn or 99
        return max(damage_cast_limit - used_damage_casts, 0)
    return 0 if turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:buff", 0) else 1


def filler_cast_count_key(
    spell: SpellDamageCandidate, stack_counts: dict[str, int]
) -> str:
    if spell.name == ACCUMULATION_SPELL_NAME:
        return (
            f"{ACCUMULATION_SPELL_NAME}:damage"
            if spell_active_stacks(spell, stack_counts)
            else f"{ACCUMULATION_SPELL_NAME}:buff"
        )
    return spell.name


def mapping_key(values: dict[str, int]) -> tuple[tuple[str, int], ...]:
    return tuple(sorted((key, value) for key, value in values.items() if value))


def spell_active_stacks(
    spell: SpellDamageCandidate, stack_counts: dict[str, int]
) -> int:
    if spell.name == ACCUMULATION_SPELL_NAME:
        return 1 if stack_counts.get(spell.name, 0) > 0 else 0
    return stack_counts.get(spell.name, 0)


def next_stack_counts_after_cast(
    spell: SpellDamageCandidate,
    stack_counts: dict[str, int],
) -> dict[str, int]:
    next_stacks = dict(stack_counts)
    if spell.name == ACCUMULATION_SPELL_NAME:
        if not spell_active_stacks(spell, stack_counts):
            next_stacks[spell.name] = ACCUMULATION_BUFF_DURATION_TURNS
    elif spell.damage_increase and spell.max_damage_increase_stacks:
        next_stacks[spell.name] = min(
            next_stacks.get(spell.name, 0) + 1,
            spell.max_damage_increase_stacks,
        )
    return next_stacks


def decrement_timed_spell_buffs(stack_counts: dict[str, int]) -> dict[str, int]:
    next_counts = dict(stack_counts)
    if next_counts.get(ACCUMULATION_SPELL_NAME, 0) > 0:
        next_counts[ACCUMULATION_SPELL_NAME] -= 1
    return {key: value for key, value in next_counts.items() if value}


def best_filler_sequence(
    filler_spells: tuple[SpellDamageCandidate, ...],
    stats: dict[str, int],
    remaining_ap: int,
    turn_cast_counts: dict[str, int],
    turn: int,
    last_cast_turns: dict[str, int],
    stack_counts: dict[str, int],
) -> FillerSequenceResult:
    @lru_cache(maxsize=None)
    def search(
        ap_left: int,
        counts_key: tuple[tuple[str, int], ...],
        last_key: tuple[tuple[str, int], ...],
        stacks_key: tuple[tuple[str, int], ...],
    ) -> FillerSequenceResult:
        counts = dict(counts_key)
        last_casts = dict(last_key)
        stacks = dict(stacks_key)
        best = FillerSequenceResult(
            total_damage=0.0,
            weakest_damage_per_ap=float("inf"),
            cast_names=tuple(),
            turn_cast_counts=counts_key,
            last_cast_turns=last_key,
            stack_counts=stacks_key,
        )
        for spell in filler_spells:
            if spell.ap_cost > ap_left:
                continue
            if filler_casts_available_for_state(spell, counts, stacks) <= 0:
                continue
            if (
                spell.cooldown
                and spell.name in last_casts
                and turn - last_casts[spell.name] < spell.cooldown
            ):
                continue

            spell_stacks = spell_active_stacks(spell, stacks)
            damage = spell_damage_per_cast(spell, stats, stacks=spell_stacks)
            damage_per_ap = damage / max(spell.ap_cost, 1)
            next_counts = dict(counts)
            count_key = filler_cast_count_key(spell, stacks)
            next_counts[count_key] = next_counts.get(count_key, 0) + 1
            next_last_casts = dict(last_casts)
            next_last_casts[spell.name] = turn
            next_stacks = next_stack_counts_after_cast(spell, stacks)

            tail = search(
                ap_left - spell.ap_cost,
                mapping_key(next_counts),
                mapping_key(next_last_casts),
                mapping_key(next_stacks),
            )
            total_damage = damage + tail.total_damage
            if total_damage > best.total_damage:
                weakest_damage_per_ap = (
                    tail.weakest_damage_per_ap
                    if damage <= 0
                    else min(damage_per_ap, tail.weakest_damage_per_ap)
                )
                best = FillerSequenceResult(
                    total_damage=total_damage,
                    weakest_damage_per_ap=weakest_damage_per_ap,
                    cast_names=(spell.name,) + tail.cast_names,
                    turn_cast_counts=tail.turn_cast_counts,
                    last_cast_turns=tail.last_cast_turns,
                    stack_counts=tail.stack_counts,
                )
        return best

    return search(
        remaining_ap,
        mapping_key(turn_cast_counts),
        mapping_key(last_cast_turns),
        mapping_key(stack_counts),
    )


def iop_spell_rotation_result(stats: dict[str, int]) -> RotationDamageResult:
    candidates = strength_spell_candidates()
    if not candidates:
        fallback_damage = profile_damage(list(GENERIC_STRENGTH_DAMAGE_PROFILE), stats)
        return RotationDamageResult(
            normalized_damage=fallback_damage,
            total_damage=fallback_damage,
            weakest_filler_damage_per_ap=fallback_damage
            / max(SPELL_DAMAGE_PROFILE_TURN_AP, 1),
        )

    selected_spells = select_variant_spells(candidates, stats)
    wrath = next(
        (spell for spell in selected_spells if spell.name == IOP_WRATH_SPELL_NAME), None
    )
    accumulation = next(
        (spell for spell in selected_spells if spell.name == ACCUMULATION_SPELL_NAME),
        None,
    )
    filler_spells = tuple(
        spell for spell in selected_spells if spell.name != IOP_WRATH_SPELL_NAME
    )
    if not filler_spells:
        fallback_damage = profile_damage(list(GENERIC_STRENGTH_DAMAGE_PROFILE), stats)
        return RotationDamageResult(
            normalized_damage=fallback_damage,
            total_damage=fallback_damage,
            weakest_filler_damage_per_ap=fallback_damage
            / max(SPELL_DAMAGE_PROFILE_TURN_AP, 1),
        )

    target_ap = min(max(stats.get("AP", REQUIRED_AP), REQUIRED_AP), MAX_AP)
    total_ap_budget = SPELL_DAMAGE_PROFILE_TURNS * target_ap
    total_damage = 0.0
    last_cast_turns: dict[str, int] = {}
    stack_counts: dict[str, int] = defaultdict(int)
    weakest_filler_damage_per_ap = float("inf")

    for turn in range(1, SPELL_DAMAGE_PROFILE_TURNS + 1):
        remaining_ap = target_ap
        turn_cast_counts: dict[str, int] = {}
        if wrath and turn in IOP_WRATH_CAST_TURNS and wrath.ap_cost <= remaining_ap:
            stacks = min(
                IOP_WRATH_CAST_TURNS.index(turn), wrath.max_damage_increase_stacks
            )
            total_damage += spell_damage_per_cast(wrath, stats, stacks=stacks)
            remaining_ap -= wrath.ap_cost
            turn_cast_counts[wrath.name] = turn_cast_counts.get(wrath.name, 0) + 1
            last_cast_turns[wrath.name] = turn
            stack_counts[wrath.name] = stacks

        if (
            accumulation
            and stack_counts.get(ACCUMULATION_SPELL_NAME, 0) <= 0
            and turn < SPELL_DAMAGE_PROFILE_TURNS
            and accumulation.ap_cost <= remaining_ap
        ):
            remaining_ap -= accumulation.ap_cost
            turn_cast_counts[f"{ACCUMULATION_SPELL_NAME}:buff"] = (
                turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:buff", 0) + 1
            )
            last_cast_turns[ACCUMULATION_SPELL_NAME] = turn
            stack_counts[ACCUMULATION_SPELL_NAME] = ACCUMULATION_BUFF_DURATION_TURNS

        filler_sequence = best_filler_sequence(
            filler_spells,
            stats,
            remaining_ap,
            turn_cast_counts,
            turn,
            last_cast_turns,
            stack_counts,
        )
        total_damage += filler_sequence.total_damage
        weakest_filler_damage_per_ap = min(
            weakest_filler_damage_per_ap,
            filler_sequence.weakest_damage_per_ap,
        )
        turn_cast_counts = dict(filler_sequence.turn_cast_counts)
        last_cast_turns = dict(filler_sequence.last_cast_turns)
        stack_counts = defaultdict(int, dict(filler_sequence.stack_counts))
        stack_counts = defaultdict(int, decrement_timed_spell_buffs(stack_counts))

    normalized_damage = (
        total_damage / max(total_ap_budget, 1) * SPELL_DAMAGE_PROFILE_TURN_AP
    )
    if weakest_filler_damage_per_ap == float("inf"):
        weakest_filler_damage_per_ap = normalized_damage / max(
            SPELL_DAMAGE_PROFILE_TURN_AP, 1
        )
    return RotationDamageResult(
        normalized_damage=normalized_damage,
        total_damage=total_damage,
        weakest_filler_damage_per_ap=weakest_filler_damage_per_ap,
    )


def weapon_rotation_uplift(
    state: BuildState | None,
    stats: dict[str, int],
    spell_rotation: RotationDamageResult,
) -> float:
    weapon_action = weapon_rotation_candidate(state)
    if weapon_action is None:
        return 0.0
    weapon_damage_per_ap = spell_damage_per_ap(weapon_action, stats)
    if weapon_damage_per_ap <= spell_rotation.weakest_filler_damage_per_ap:
        return 0.0
    uses_per_turn = weapon_action.casts_per_turn or 1
    weapon_ap_over_profile = min(
        weapon_action.ap_cost * uses_per_turn * SPELL_DAMAGE_PROFILE_TURNS,
        SPELL_DAMAGE_PROFILE_TURNS
        * min(max(stats.get("AP", REQUIRED_AP), REQUIRED_AP), MAX_AP),
    )
    total_uplift = (
        weapon_damage_per_ap - spell_rotation.weakest_filler_damage_per_ap
    ) * weapon_ap_over_profile
    total_ap_budget = SPELL_DAMAGE_PROFILE_TURNS * min(
        max(stats.get("AP", REQUIRED_AP), REQUIRED_AP), MAX_AP
    )
    return total_uplift / max(total_ap_budget, 1) * SPELL_DAMAGE_PROFILE_TURN_AP


def iop_rotation_damage(
    stats: dict[str, int], state: BuildState | None = None
) -> float:
    spell_rotation = iop_spell_rotation_result(stats)
    return spell_rotation.normalized_damage + weapon_rotation_uplift(
        state, stats, spell_rotation
    )


def profile_rotation_damage(
    stats: dict[str, int], state: BuildState | None = None
) -> float:
    if (
        ACTIVE_SPELL_PROFILE_CLASS_NAME == "Iop"
        and ACTIVE_DAMAGE_PROFILE.name == "strength"
    ):
        return iop_rotation_damage(stats, state)
    # Non-reviewed class profiles use weighted spell candidates as a scoring
    # prior. Do not run them through the Iop-specific turn planner.
    return profile_damage(active_spell_damage_profile(), stats)


def active_rotation_model_name() -> str:
    if (
        ACTIVE_SPELL_PROFILE_CLASS_NAME == "Iop"
        and ACTIVE_DAMAGE_PROFILE.name == "strength"
    ):
        return "reviewed_iop_strength_rotation"
    return "spell_profile_v0_weighted_candidates"


def active_damage_profile_confidence() -> str:
    if active_rotation_model_name() == "reviewed_iop_strength_rotation":
        return "high"
    return "medium"


def indexed_spell_profile(
    class_name: str,
    profile_name: str,
    level: int,
) -> dict[str, Any] | None:
    generated_index = load_build_discovery_index()
    spell_profiles = generated_index.get("spellProfiles") if generated_index else None
    profiles = (
        spell_profiles.get("profiles") if isinstance(spell_profiles, dict) else None
    )
    if not isinstance(profiles, list):
        return None

    matches = [
        profile
        for profile in profiles
        if isinstance(profile, dict)
        and profile.get("className") == class_name
        and profile.get("element") == profile_name
        and isinstance(profile.get("level"), int)
    ]
    if not matches:
        return None
    eligible = [profile for profile in matches if profile["level"] <= level]
    if eligible:
        return max(eligible, key=lambda profile: profile["level"])
    return min(matches, key=lambda profile: profile["level"])


def hydrate_indexed_spell_candidates(
    profile: dict[str, Any],
) -> tuple[SpellDamageCandidate, ...] | None:
    try:
        selected_spells = profile["spellProfile"]["selectedSpells"]
        if not isinstance(selected_spells, list):
            return None
        candidates = []
        for spell in selected_spells:
            lines = spell["damageLines"]
            if not isinstance(lines, list) or not lines:
                return None
            damage_lines = tuple(
                DamageLine(
                    element=line["element"],
                    base_min=int(line["baseMin"]),
                    base_max=int(line["baseMax"]),
                    crit_base_min=(
                        int(line["critBaseMin"])
                        if line["critBaseMin"] is not None
                        else None
                    ),
                    crit_base_max=(
                        int(line["critBaseMax"])
                        if line["critBaseMax"] is not None
                        else None
                    ),
                    crit_chance=int(line["critChance"]),
                    crit_bonus_damage=int(line["critBonusDamage"]),
                    is_weapon=bool(line["isWeapon"]),
                    is_trap=bool(line["isTrap"]),
                    weight=float(line["weight"]),
                    distance=line["distance"],
                )
                for line in lines
            )
            candidates.append(
                SpellDamageCandidate(
                    name=str(spell["name"]),
                    variant_pair_id=str(spell["variantPairId"]),
                    ap_cost=int(spell["apCost"]),
                    cooldown=spell["cooldown"],
                    casts_per_turn=spell["castsPerTurn"],
                    casts_per_target=spell["castsPerTarget"],
                    base_crit_chance=int(spell["baseCritChance"]),
                    damage_lines=damage_lines,
                    damage_increase=int(spell["damageIncrease"]),
                    crit_damage_increase=int(spell["critDamageIncrease"]),
                    max_damage_increase_stacks=int(spell["maxDamageIncreaseStacks"]),
                    is_weapon=bool(spell["isWeapon"]),
                    min_range=spell["minRange"],
                    max_range=spell["maxRange"],
                    has_modifiable_range=bool(spell["hasModifiableRange"]),
                )
            )
        return tuple(candidates)
    except (KeyError, TypeError, ValueError):
        return None


def db_spell_candidates_for_profile(
    class_name: str,
    profile_name: str,
    level: int,
) -> tuple[SpellDamageCandidate, ...]:
    try:
        from sqlalchemy.orm import joinedload

        from app import session_scope
        from app.database.model_class import ModelClass
        from app.database.model_class_translation import ModelClassTranslation
        from app.database.model_spell import ModelSpell
        from app.database.model_spell_effect import ModelSpellEffect
        from app.database.model_spell_stats import ModelSpellStats
        from app.database.model_spell_translation import ModelSpellTranslation
        from app.database.model_spell_variant_pair import ModelSpellVariantPair
    except Exception:
        return tuple()

    profile = ELEMENT_PROFILES[profile_name]
    try:
        with session_scope() as db_session:
            spell_stats = (
                db_session.query(
                    ModelSpellStats,
                    ModelSpellTranslation.name,
                    ModelSpell.spell_variant_pair_id,
                    ModelSpell.is_trap,
                )
                .join(ModelSpell, ModelSpellStats.spell_id == ModelSpell.uuid)
                .join(
                    ModelSpellVariantPair,
                    ModelSpell.spell_variant_pair_id == ModelSpellVariantPair.uuid,
                )
                .join(ModelClass, ModelSpellVariantPair.class_id == ModelClass.uuid)
                .join(
                    ModelClassTranslation,
                    ModelClassTranslation.class_id == ModelClass.uuid,
                )
                .join(
                    ModelSpellTranslation,
                    ModelSpellTranslation.spell_id == ModelSpell.uuid,
                )
                .options(
                    joinedload(ModelSpellStats.spell_effects).joinedload(
                        ModelSpellEffect.condition
                    ),
                    joinedload(ModelSpellStats.spell_damage_increase),
                )
                .filter(
                    ModelClassTranslation.locale == "en",
                    ModelClassTranslation.name == class_name,
                    ModelSpellTranslation.locale == "en",
                    ModelSpellStats.level <= level,
                )
                .order_by(ModelSpellTranslation.name, ModelSpellStats.level.desc())
                .all()
            )
    except Exception:
        return tuple()

    highest_stats_by_spell_id: dict[str, tuple[Any, str, Any, bool]] = {}
    for spell_stat, spell_name, variant_pair_id, is_trap in spell_stats:
        spell_id = str(spell_stat.spell_id)
        if spell_id not in highest_stats_by_spell_id:
            highest_stats_by_spell_id[spell_id] = (
                spell_stat,
                spell_name,
                variant_pair_id,
                is_trap,
            )

    profile_elements = spell_profile_elements_for_profile(profile)
    candidates = []
    for (
        spell_stat,
        spell_name,
        variant_pair_id,
        is_trap,
    ) in highest_stats_by_spell_id.values():
        spell_lines = collapse_single_target_spell_effects(
            spell_stat.spell_effects,
            profile_elements,
            int_or_zero(spell_stat.base_crit_chance),
            is_trap=is_trap,
        )
        if not spell_lines:
            continue
        damage_increase = spell_stat.spell_damage_increase
        candidates.append(
            SpellDamageCandidate(
                name=spell_name,
                variant_pair_id=str(variant_pair_id),
                ap_cost=max(spell_stat.ap_cost or 1, 1),
                cooldown=spell_stat.cooldown,
                casts_per_turn=spell_stat.casts_per_turn,
                casts_per_target=spell_stat.casts_per_target,
                base_crit_chance=int_or_zero(spell_stat.base_crit_chance),
                damage_lines=spell_lines,
                damage_increase=int_or_zero(
                    getattr(damage_increase, "base_increase", 0)
                ),
                crit_damage_increase=int_or_zero(
                    getattr(damage_increase, "crit_base_increase", 0)
                ),
                max_damage_increase_stacks=int_or_zero(
                    getattr(damage_increase, "max_stacks", 0)
                ),
                min_range=spell_stat.min_range,
                max_range=spell_stat.max_range,
                has_modifiable_range=bool(spell_stat.has_modifiable_range),
            )
        )

    return tuple(candidates)


@lru_cache(maxsize=None)
def spell_candidates_for_profile(
    class_name: str,
    profile_name: str,
    level: int,
) -> tuple[SpellDamageCandidate, ...]:
    indexed_profile = indexed_spell_profile(class_name, profile_name, level)
    if indexed_profile is not None:
        indexed_candidates = hydrate_indexed_spell_candidates(indexed_profile)
        if indexed_candidates is not None:
            return indexed_candidates
    return db_spell_candidates_for_profile(class_name, profile_name, level)


@lru_cache(maxsize=1)
def active_spell_candidates() -> tuple[SpellDamageCandidate, ...]:
    return spell_candidates_for_profile(
        ACTIVE_SPELL_PROFILE_CLASS_NAME,
        ACTIVE_DAMAGE_PROFILE.name,
        ACTIVE_TARGET_LEVEL,
    )


@lru_cache(maxsize=1)
def active_spell_damage_profile() -> tuple[DamageLine, ...]:
    candidates = active_spell_candidates()
    if not candidates:
        return generic_damage_profile()
    selected = select_variant_spells(candidates, active_base_stats())
    filler_spells = [spell for spell in selected if spell.name != IOP_WRATH_SPELL_NAME]
    if not filler_spells:
        return generic_damage_profile()
    return tuple(
        DamageLine(
            element=line.element,
            base_min=line.base_min,
            base_max=line.base_max,
            crit_base_min=line.crit_base_min,
            crit_base_max=line.crit_base_max,
            crit_chance=line.crit_chance,
            crit_bonus_damage=line.crit_bonus_damage,
            is_weapon=line.is_weapon,
            is_trap=line.is_trap,
            weight=line.weight / max(spell.ap_cost, 1),
            distance=line.distance,
        )
        for spell in filler_spells
        for line in spell.damage_lines
    )


def strength_spell_candidates() -> tuple[SpellDamageCandidate, ...]:
    return spell_candidates_for_profile("Iop", "strength", ACTIVE_TARGET_LEVEL)


def clear_spell_damage_profile_caches() -> None:
    active_spell_candidates.cache_clear()
    active_spell_damage_profile.cache_clear()
    spell_candidates_for_profile.cache_clear()
    active_range_soft_weight.cache_clear()
    active_profile_spell_damage_baseline.cache_clear()
    cheap_profile_damage_baseline.cache_clear()


def profile_damage_reference_stats() -> dict[str, int]:
    """Stable reference used to normalize final damage scores across queries."""
    return {
        **active_base_stats(),
        "AP": MAX_AP,
        ACTIVE_DAMAGE_PROFILE.primary_stat: PROFILE_DAMAGE_REFERENCE_PRIMARY_STAT,
        "Power": PROFILE_DAMAGE_REFERENCE_POWER,
        ACTIVE_DAMAGE_PROFILE.damage_stat: PROFILE_DAMAGE_REFERENCE_ELEMENTAL_DAMAGE,
        "Critical": PROFILE_DAMAGE_REFERENCE_CRITICAL,
        "Critical Damage": PROFILE_DAMAGE_REFERENCE_CRITICAL_DAMAGE,
    }


def objective_linearization_reference_stats() -> dict[str, int]:
    """Realistic level-specific point for CP-SAT marginal score weights."""
    anchor = reference_anchor_for_level(ACTIVE_TARGET_LEVEL)
    return {
        **active_base_stats(),
        "AP": anchor["AP"],
        ACTIVE_DAMAGE_PROFILE.primary_stat: anchor["PrimaryStat"],
        "Power": anchor["Power"],
        ACTIVE_DAMAGE_PROFILE.damage_stat: anchor["ElementalDamage"],
        "Critical": anchor["Critical"],
        "Critical Damage": anchor["CriticalDamage"],
    }


@lru_cache(maxsize=1)
def active_profile_spell_damage_baseline() -> float:
    return max(profile_rotation_damage(profile_damage_reference_stats()), 1.0)


@lru_cache(maxsize=1)
def cheap_profile_damage_baseline() -> float:
    return max(
        profile_damage(active_spell_damage_profile(), profile_damage_reference_stats()),
        1.0,
    )


def cheap_profile_damage_score(stats: dict[str, int]) -> float:
    return (
        profile_damage(active_spell_damage_profile(), stats)
        / cheap_profile_damage_baseline()
        * PROFILE_DAMAGE_REFERENCE_SCORE
    )


def normalized_profile_damage_score(
    stats: dict[str, int], state: BuildState | None = None
) -> float:
    return (
        profile_rotation_damage(stats, state)
        / active_profile_spell_damage_baseline()
        * PROFILE_DAMAGE_REFERENCE_SCORE
    )


def expected_incoming_damage(
    stats: dict[str, int], percent_res_stat: str, flat_res_stat: str
) -> float:
    base_hit = GENERIC_INCOMING_HIT
    flat_reduction = (
        stats.get(flat_res_stat, 0)
        + stats.get("Critical Resistance", 0) * GENERIC_INCOMING_CRIT_RATE
        + stats.get("Pushback Resistance", 0) * GENERIC_INCOMING_PUSHBACK_RATE
    )
    damage_after_flat = max(base_hit - flat_reduction, 1)
    element_res = min(stats.get(percent_res_stat, 0), STAT_SCORE_CAPS[percent_res_stat])
    ranged_res = stats.get("% Ranged Resistance", 0)
    melee_res = stats.get("% Melee Resistance", 0)
    positional_res = ranged_res * GENERIC_INCOMING_RANGED_RATE + melee_res * (
        1 - GENERIC_INCOMING_RANGED_RATE
    )
    total_percent_res = min(element_res + positional_res, 50)
    return damage_after_flat * (1 - total_percent_res / 100)


def elemental_effective_hp(stats: dict[str, int]) -> list[float]:
    vitality = max(stats.get("Vitality", 0), 0)
    return [
        vitality
        / expected_incoming_damage(stats, percent_res_stat, flat_res_stat)
        * GENERIC_INCOMING_HIT
        for percent_res_stat, flat_res_stat in zip(
            PERCENT_RESISTANCE_STATS, FLAT_RESISTANCE_STATS
        )
    ]


def survivability_score(stats: dict[str, int]) -> float:
    effective_hp_values = elemental_effective_hp(stats)
    if not effective_hp_values:
        return 0.0
    sorted_ehp_values = sorted(effective_hp_values)
    weighted_ehp = sum(
        ehp * weight
        for ehp, weight in zip(sorted_ehp_values, SORTED_ELEMENT_EHP_WEIGHTS)
    )
    return weighted_ehp * SURVIVABILITY_SCORE_WEIGHT


def negative_resistance_penalty(stats: dict[str, int]) -> float:
    penalty_stats = (
        *PERCENT_RESISTANCE_STATS,
        "% Ranged Resistance",
        "% Melee Resistance",
    )
    return float(sum(max(0, -stats.get(stat, 0)) for stat in penalty_stats))


def characteristic_point_cost(base_points: int) -> int:
    if base_points < 0:
        raise ValueError("Base characteristic allocation cannot be negative.")
    first = min(base_points, 100)
    second = min(max(base_points - 100, 0), 100) * 2
    third = min(max(base_points - 200, 0), 100) * 3
    fourth = max(base_points - 300, 0) * 4
    return first + second + third + fourth


def max_base_points_for_available_characteristic_points(available_points: int) -> int:
    if available_points < 0:
        raise ValueError("Available characteristic points cannot be negative.")
    base_points = 0
    while characteristic_point_cost(base_points + 1) <= available_points:
        base_points += 1
    return base_points


def legal_base_allocation_options(level: int) -> tuple[int, ...]:
    available_points = characteristic_points_for_level(level)
    max_legal_base_points = max_base_points_for_available_characteristic_points(
        available_points
    )
    options = {
        base_points
        for base_points in BASE_STRENGTH_ALLOCATION_OPTIONS
        if characteristic_point_cost(base_points) <= available_points
    }
    options.add(max_legal_base_points)
    return tuple(sorted(options))


def base_stats_for_primary_allocation(
    base_points: int,
    primary_stat: str | None = None,
    target_level: int | None = None,
) -> dict[str, int]:
    primary_stat = primary_stat or ACTIVE_DAMAGE_PROFILE.primary_stat
    level = target_level if target_level is not None else ACTIVE_TARGET_LEVEL
    cost = characteristic_point_cost(base_points)
    available_points = characteristic_points_for_level(level)
    if cost > available_points:
        raise ValueError(
            f"Base {primary_stat} allocation exceeds available points: {base_points}"
        )
    base_vitality = available_points - cost
    allocated_stats = {
        **base_stats_for_level(level),
        **{stat: SCROLLED_BASE_STAT for stat in PRIMARY_STAT_NAMES},
    }
    return {
        **allocated_stats,
        primary_stat: SCROLLED_BASE_STAT + base_points,
        "Vitality": SCROLLED_BASE_STAT + base_vitality,
    }


def state_with_base_allocation(
    state: BuildState,
    base_points: int,
    primary_stat: str | None = None,
    target_level: int | None = None,
) -> BuildState:
    primary_stat = primary_stat or ACTIVE_DAMAGE_PROFILE.primary_stat
    level = target_level if target_level is not None else ACTIVE_TARGET_LEVEL
    allocated_base_stats = base_stats_for_primary_allocation(
        base_points, primary_stat, level
    )
    next_state = state.clone()
    next_state.base_allocation = {
        primary_stat: base_points,
        "Vitality": allocated_base_stats["Vitality"] - SCROLLED_BASE_STAT,
    }
    for stat, allocated_value in allocated_base_stats.items():
        current_base_value = base_stats_for_level(level).get(stat, 0)
        next_state.stats[stat] = (
            next_state.stats.get(stat, 0) - current_base_value + allocated_value
        )
    return next_state


def optimize_base_allocation(
    state: BuildState,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
    primary_stat: str | None = None,
    target_level: int | None = None,
) -> BuildState:
    primary_stat = primary_stat or ACTIVE_DAMAGE_PROFILE.primary_stat
    level = target_level if target_level is not None else ACTIVE_TARGET_LEVEL
    best_state: BuildState | None = None
    for base_points in legal_base_allocation_options(level):
        allocated_state = state_with_base_allocation(
            state, base_points, primary_stat, level
        )
        if unmet_item_conditions(allocated_state):
            continue
        allocated_state.score = final_score_state(
            allocated_state,
            generic_damage_weight=generic_damage_weight,
            weapon_damage_weight=weapon_damage_weight,
            survivability_weight=survivability_weight,
            negative_resistance_penalty_weight=negative_resistance_penalty_weight,
        )
        if best_state is None or allocated_state.score > best_state.score:
            best_state = allocated_state
    if best_state is None:
        raise RuntimeError("No legal base stat allocation satisfies item conditions.")
    return best_state


def final_score_state(
    state: BuildState,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
) -> float:
    stats = effective_scoring_stats(state)
    return (
        final_utility_score(stats)
        + normalized_profile_damage_score(stats, state) * generic_damage_weight
        + survivability_score(stats) * survivability_weight
        - negative_resistance_penalty(stats) * negative_resistance_penalty_weight
    )


def is_dofus_slot(slot_name: str) -> bool:
    return slot_name.startswith("dofus_")


def optional_slot_choice(slot_name: str, target_level: int = TARGET_LEVEL) -> bool:
    return is_dofus_slot(slot_name) or target_level <= LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL


def serialize_build(
    state: BuildState, sets: dict[str, dict[str, Any]]
) -> dict[str, Any]:
    scoring_stats = effective_scoring_stats(state)
    total_stats = {
        "AP": state.stats.get("AP", 0),
        "MP": state.stats.get("MP", 0),
        "Range": state.stats.get("Range", 0),
        ACTIVE_DAMAGE_PROFILE.primary_stat: state.stats.get(
            ACTIVE_DAMAGE_PROFILE.primary_stat, 0
        ),
        "Power": state.stats.get("Power", 0),
        "Vitality": state.stats.get("Vitality", 0),
        "Damage": state.stats.get("Damage", 0),
        ACTIVE_DAMAGE_PROFILE.damage_stat: state.stats.get(
            ACTIVE_DAMAGE_PROFILE.damage_stat, 0
        ),
        "Critical": state.stats.get("Critical", 0),
        "Critical Damage": state.stats.get("Critical Damage", 0),
    }
    for stat in ACTIVE_DAMAGE_PROFILE.secondary_damage_weights:
        total_stats[stat] = state.stats.get(stat, 0)
    used_sets = {
        sets[set_id]["_name"]: count
        for set_id, count in sorted(state.set_counts.items())
        if count > 1 and set_id in sets
    }
    raw_rotation_damage = profile_rotation_damage(scoring_stats, state)
    spell_only_damage = profile_damage(active_spell_damage_profile(), scoring_stats)
    profile_baseline_damage = active_profile_spell_damage_baseline()
    return {
        "score": round(state.score, 2),
        "weightedStatScore": round(score_stats(state.stats), 2),
        "utilityStatScore": round(final_utility_score(scoring_stats), 2),
        "genericDamageScore": round(
            normalized_profile_damage_score(scoring_stats, state), 2
        ),
        "rawRotationDamageScore": round(raw_rotation_damage, 2),
        "spellDamageScore": round(spell_only_damage, 2),
        "profileBaselineDamageScore": round(profile_baseline_damage, 2),
        "profileRelativeDamage": round(
            raw_rotation_damage / profile_baseline_damage, 4
        ),
        "weaponDamageScore": round(state_weapon_damage(state, scoring_stats), 2),
        "survivabilityScore": round(survivability_score(scoring_stats), 2),
        "negativeResistancePenalty": round(
            negative_resistance_penalty(scoring_stats), 2
        ),
        "weakestElementEhp": round(min(elemental_effective_hp(scoring_stats)), 2),
        "apStrategy": state.ap_strategy,
        "baseAllocation": state.base_allocation,
        "conditionFailures": state.condition_failures,
        "totals": total_stats,
        "sets": used_sets,
        "exos": {
            stat: {
                "itemId": item_id,
                "slot": next(
                    (
                        slot
                        for slot, item in state.slots.items()
                        if item["dofusID"] == item_id
                    ),
                    None,
                ),
            }
            for stat, item_id in sorted(state.exos.items())
        },
        "items": {
            slot: {
                "id": item["dofusID"],
                "internalId": item.get("uuid"),
                "name": item["_name"],
                "type": item["itemType"],
                "level": item.get("level"),
                "set": sets.get(item.get("setID"), {}).get("_name")
                if item.get("setID")
                else None,
            }
            for slot, item in state.slots.items()
        },
    }


def parse_optional_range_target(value: str) -> int | None:
    if value.lower() in {"none", "any"}:
        return None
    return int(value)
