"""Narrow build-discovery prototype for DofusLab.

This reads the local database and prints candidate Level 200 PvM builds
without touching GraphQL. The goal is to make the search/ranking loop easy to
inspect before wiring it into product code.

Known prototype limitations:
- trophy/dofus exclusivity rules are not modeled
- scoring uses old local spell data where available and a generic fallback
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

from oneoff.condition_evaluator import (
    condition_can_pass_at_target,
    set_bonus_count,
    target_forced_conditions_hold,
    unmet_item_conditions,
)
from oneoff.damage_calculator import DamageLine, profile_damage
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
SOLVER_VERSION = "build-discovery-prototype-v1"
BUILD_DISCOVERY_INDEX_SCHEMA_VERSION = 1
RELEVANT_SET_ITEM_MIN_LEVEL = 180
def base_ap_for_level(level: int) -> int:
    return 7 if level >= 100 else 6


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
ACTION_STAT_SOURCE_LIMIT = 4
ACTION_STAT_SOURCE_MIN_LEVEL = 180
ACTION_STAT_VECTOR_SOURCE_LIMIT = 3
DOFUS_ACTION_STAT_SOURCE_LIMIT = 2
DOFUS_AP_SOURCE_LIMIT = 2
DOFUS_ZERO_SCORE_FILLER_LIMIT = 4
LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL = 19
UNCOMMON_AP_SOURCE_IDS = frozenset(
    {
        "11738",  # Awmigawd Band
        "12108",  # Professor Xa's Cloak
        "12110",  # Professor Xa's Boots
        "12112",  # Professor Xa's Shovel
        "13194",  # Mad Chatter
        "13657",  # Cushtycloak
        "13658",  # Slothful Slippers
        "13659",  # Shabby Shoes
        "14063",  # Creaking Tree Hat
        "14130",  # Jolly Good Belt
        "14937",  # Vigilante Cape
        "15692",  # Baleenaboots
        "15693",  # Pathogastrics
        "15694",  # Kideebonnet
        "15696",  # Whailtail
        "15699",  # Belteen
        "18000",  # Koutoulou Mask
        "18002",  # Merdiodon Cloak
        "18006",  # Ockloth
        "18009",  # Menobelt
        "18439",  # The Dorado
        "19595",  # Scapu Helm
        "19596",  # Suspender Belt
        "19607",  # Absoluti Cape
        "19610",  # Boot Boots
        "20360",  # Ganymede's Diadem
        "21223",  # Crocoring
        "21996",  # Pryssure-O-Mat
        "21997",  # Shiny Pryssure
        "21998",  # Iridescent Pryssure
        "22011",  # Prysipitate-O-Mat
        "22012",  # Shiny Prysipitate
        "22013",  # Iridescent Prysipitate
        "25221",  # Wings of Chaos
        "31774",  # Oktapodas Helm
        "32121",  # Meriana's Clairvoyance
    }
)
UNCOMMON_MP_SOURCE_IDS = frozenset(
    {
        "11720",  # Celestial Bearbarian Amulet
        "12109",  # Professor Xa's Ring
        "12111",  # Professor Xa's Amulet
        "12117",  # Fuji Snowfoux Cloak
        "13127",  # Lethaline's Cloak
        "14162",  # Epeni's Belt
        "14168",  # Cloak of a Thousand Excuses
        "14170",  # Bzzzinga Headband
        "15496",  # Queen of Thieves' Sword
        "15695",  # Maskrobial
        "15697",  # Kapmeba
        "15698",  # Pawl Ouatnos' Ring
        "15700",  # Protozash
        "15701",  # Pawl Ouatnos' Amulet
        "19608",  # Celebring
        "19609",  # Hirofant Necklace
        "20956",  # Chokao Mask
        "21995",  # Sprynt
        "22007",  # Prycapture
        "22215",  # Vulture's Finery
        "26011",  # Chaotic Scythe
        "30858",  # Mama Ayuto's Parasail
        "32116",  # Menalt's Lightning Spear
        "32229",  # Vinnie the Bearbarian Amulet
    }
)
UNCOMMON_ACTION_STAT_SOURCE_IDS = UNCOMMON_AP_SOURCE_IDS | UNCOMMON_MP_SOURCE_IDS
AP_SET_BONUS_SEED_LIMIT = 80
AP_SET_BONUS_SEED_LIMIT_PER_SET = 12
SET_PACKAGE_SIZES = (2, 3)
SET_PACKAGE_KEEP_PER_SET_SIZE = 10
SET_PACKAGE_GLOBAL_LIMIT = 500
ACTION_SET_PACKAGE_KEEP_PER_SET = 8
ACTION_SET_PACKAGE_GLOBAL_LIMIT = 180
SET_PACKAGE_PAIR_SEED_LIMIT = 800
SET_PACKAGE_TRIPLE_SOURCE_LIMIT = 250
SET_PACKAGE_TRIPLE_CANDIDATE_SCAN_LIMIT = 3000000
SET_PACKAGE_TRIPLE_SEED_LIMIT = 300
SET_PACKAGE_DIVERSE_TRIPLE_SEED_LIMIT = 700
SET_PACKAGE_TOTAL_SEED_LIMIT = 1500
DIRECT_COMPLETION_MIN_FILLED_GEAR_SLOTS = 3
DIRECT_COMPLETION_SEED_LIMIT = 700
DIRECT_COMPLETION_NON_DOFUS_BEAM_WIDTH = 80
DIRECT_COMPLETION_DOFUS_POOL_LIMIT = 22
DIRECT_COMPLETION_GEAR_STATE_LIMIT = 300
DIRECT_COMPLETION_GEAR_STATE_PER_SIGNATURE_CAP = 30
DIRECT_COMPLETION_DOFUS_COMBO_LIMIT = 500
DIRECT_COMPLETION_FINAL_SCORE_LIMIT = 1000
BUDGET_ACTION_TROPHY_COMBO_SEED_LIMIT = 40
BUDGET_ACTION_GEAR_SEED_LIMIT = 160
BUDGET_ACTION_GEAR_SLOT_LIMIT = 6
BUDGET_ACTION_GEAR_VECTOR_CAP = 4
ACTION_STAT_WITNESS_SEED_LIMIT = 12
ACTION_STAT_WITNESS_MAX_STATES_PER_SLOT = 5000
DIRECT_COMPLETION_SPECIAL_DOFUS_IDS = {"7754", "8698", "6980"}
DIRECT_COMPLETION_CORE_DOFUS_IDS = {
    "694",  # Crimson Dofus
    "737",  # Emerald Dofus
    "739",  # Turquoise Dofus
    "7043",  # Ice Dofus
    "7754",  # Ochre Dofus
    "8698",  # Cloudy Dofus
    "13344",  # Dolmanax
    "22004",  # Prynyang
    "22020",  # Prywitchment
}
BEAM_FINAL_SCORE_LIMIT = 60
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
BASE_CHARACTERISTIC_POINTS = BASE_CHARACTERISTIC_POINTS_PER_LEVEL * (TARGET_LEVEL - 1)
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


BASE_STATS = base_stats_for_level(TARGET_LEVEL)


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
    ("weapon", ("Sword", "Hammer", "Staff", "Dagger", "Wand", "Bow", "Axe", "Shovel", "Lance", "Scythe")),
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
DEFAULT_SLOT_ORDERS: list[tuple[str, ...]] = [
    tuple(slot_name for slot_name, _ in SLOTS),
    (
        "dofus_1",
        "dofus_2",
        "dofus_3",
        "dofus_4",
        "dofus_5",
        "dofus_6",
        "amulet",
        "ring_1",
        "ring_2",
        "belt",
        "boots",
        "weapon",
        "shield",
        "hat",
        "cloak",
        "pet",
    ),
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


def spell_profile_elements() -> dict[str, str]:
    return spell_profile_elements_for_profile(ACTIVE_DAMAGE_PROFILE)


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
DEFAULT_MAX_SHARED_ITEMS = 10
LAST_FIND_BUILD_TIMINGS: dict[str, float] = {}
LAST_FIND_BUILD_FALLBACK: dict[str, int] = {}
BUILD_DISCOVERY_RESPONSE_CACHE: dict[str, dict[str, Any]] = {}


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
    top_k: int = 25
    beam_width: int = 250
    per_signature_cap: int = 40
    relevant_set_limit: int = 60
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
            raise ValueError(f"Unsupported class: {self.class_name}. Supported classes: {supported}.")
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
        self.target
        overlap = set(self.locked_item_ids) & set(self.avoided_item_ids)
        if overlap:
            raise ValueError(f"Items cannot be both locked and avoided: {', '.join(sorted(overlap))}.")


@dataclass(frozen=True)
class SearchSeedStage:
    name: str
    states: tuple[BuildState, ...]
    used_for_beam_fallback: bool = False


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
        "topK": query.top_k,
        "beamWidth": query.beam_width,
        "perSignatureCap": query.per_signature_cap,
        "relevantSetLimit": query.relevant_set_limit,
        "maxSharedItems": query.max_shared_items,
        "genericDamageWeight": query.generic_damage_weight,
        "weaponDamageWeight": query.weapon_damage_weight,
    }


def effective_exo_policy(query: BuildDiscoveryQuery) -> str:
    if query.budget_tier < 3 and query.exo_policy in {"allow", "opti"}:
        return "none"
    return query.exo_policy


def damage_survivability_preset(query: BuildDiscoveryQuery) -> DamageSurvivabilityPreset:
    return DAMAGE_SURVIVABILITY_PRESETS[query.damage_survivability_preset]


def effective_generic_damage_weight(query: BuildDiscoveryQuery) -> float:
    if query.generic_damage_weight != GENERIC_DAMAGE_WEIGHT:
        return query.generic_damage_weight
    return damage_survivability_preset(query).generic_damage_weight


def effective_survivability_weight(query: BuildDiscoveryQuery) -> float:
    return damage_survivability_preset(query).survivability_weight


def effective_negative_resistance_penalty_weight(query: BuildDiscoveryQuery) -> float:
    return damage_survivability_preset(query).negative_resistance_penalty_weight


def target_semantics_response() -> dict[str, Any]:
    return {
        "type": "minimum_with_hard_caps",
        "targets": {"AP": "minimum", "MP": "minimum", "Range": "minimum_when_requested"},
        "minimums": {
            "AP": {"1-99": base_ap_for_level(1), "100-200": base_ap_for_level(100)},
            "MP": MIN_MP,
            "Range": MIN_RANGE,
            "RangeNone": "unconstrained_lower_bound",
        },
        "caps": {"AP": MAX_AP, "MP": MAX_MP, "Range": MAX_RANGE},
        "surplusScoring": "light_reward_with_cap",
    }


def query_cache_key(query: BuildDiscoveryQuery, current_dataset_version: str) -> str:
    payload = {
        "datasetVersion": current_dataset_version,
        "solverVersion": SOLVER_VERSION,
        "query": query_cache_identity(query),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def clone_response(response: dict[str, Any]) -> dict[str, Any]:
    return json.loads(json.dumps(response))


def clear_build_discovery_response_cache() -> None:
    BUILD_DISCOVERY_RESPONSE_CACHE.clear()


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


def hard_cap_target(level: int = TARGET_LEVEL) -> BuildTarget:
    return BuildTarget(
        ap=MAX_AP,
        mp=MAX_MP,
        range=MAX_RANGE,
        level=level,
        min_ap=base_ap_for_level(level),
    )


@dataclass(frozen=True)
class ApStrategy:
    name: str
    require_amulet_ap: bool = True
    require_ap_exo: bool = True
    require_ochre: bool = False
    disallow_ochre: bool = False
    require_ap_set_bonus: bool = False
    disallow_ap_set_bonus: bool = False
    disallow_ap_weapon: bool = False
    min_secondary_ap_sources: int = 2


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
SHAKER_TROPHY_ID = "16333"
NOMAD_TROPHY_ID = "16335"
JACKANAPES_TROPHY_ID = "13829"
VOYAGER_TROPHY_ID = "13830"
MANDATORY_DOFUS_CANDIDATE_IDS = {
    OCHRE_DOFUS_ID,
    SHAKER_TROPHY_ID,
    NOMAD_TROPHY_ID,
    JACKANAPES_TROPHY_ID,
    VOYAGER_TROPHY_ID,
}
DEFAULT_AP_STRATEGIES = (
    ApStrategy(name="ochre_plus_one", require_ochre=True, min_secondary_ap_sources=2),
    ApStrategy(
        name="set_bonus_ap",
        require_ap_set_bonus=True,
        disallow_ap_weapon=True,
        min_secondary_ap_sources=1,
    ),
    ApStrategy(
        name="no_set_bonus_ap",
        disallow_ap_set_bonus=True,
        min_secondary_ap_sources=1,
    ),
    ApStrategy(name="no_ochre", disallow_ochre=True, min_secondary_ap_sources=1),
    ApStrategy(name="flexible_two_sources", min_secondary_ap_sources=2),
)
DEFAULT_NO_EXO_AP_STRATEGIES = (
    ApStrategy(
        name="budget_no_exo_set_bonus",
        require_ap_exo=False,
        require_ap_set_bonus=True,
        disallow_ochre=True,
        min_secondary_ap_sources=2,
    ),
    ApStrategy(
        name="budget_no_exo_no_ochre",
        require_ap_exo=False,
        disallow_ochre=True,
        min_secondary_ap_sources=2,
    ),
    ApStrategy(
        name="budget_no_exo_flexible",
        require_ap_exo=False,
        min_secondary_ap_sources=2,
    ),
)
BASE_AP_STRATEGIES = (
    ApStrategy(
        name="base_ap",
        require_amulet_ap=False,
        require_ap_exo=False,
        min_secondary_ap_sources=0,
    ),
)
LEVEL_DIVERSITY_AP_STRATEGIES = (
    ApStrategy(
        name="level_diversity_flexible_ap",
        require_amulet_ap=False,
        require_ap_exo=False,
        min_secondary_ap_sources=1,
    ),
)


def effective_ap_strategies_for_target(
    target: BuildTarget,
    ap_strategies: tuple[ApStrategy, ...],
) -> tuple[ApStrategy, ...]:
    if target.ap <= target.min_ap:
        return BASE_AP_STRATEGIES + ap_strategies
    if target.level <= RELEVANT_SET_ITEM_MIN_LEVEL:
        return LEVEL_DIVERSITY_AP_STRATEGIES + ap_strategies
    return ap_strategies


def exo_search_target(final_target: BuildTarget) -> BuildTarget:
    return BuildTarget(
        ap=max(final_target.min_ap, final_target.ap - 1),
        mp=max(BASE_MP, final_target.mp - 1),
        range=max(0, final_target.range - 1),
        level=final_target.level,
        min_ap=final_target.min_ap,
        range_required=final_target.range_required,
    )


def exo_natural_cap_target(final_target: BuildTarget) -> BuildTarget:
    return hard_cap_target(final_target.level)


def pending_dofus_search_target(final_target: BuildTarget) -> BuildTarget:
    return BuildTarget(
        ap=max(final_target.min_ap, final_target.ap - 2),
        mp=max(BASE_MP, final_target.mp - 2),
        range=max(0, final_target.range - 1),
        level=final_target.level,
        min_ap=final_target.min_ap,
        range_required=final_target.range_required,
    )


@dataclass
class BuildState:
    slots: dict[str, dict[str, Any]] = field(default_factory=dict)
    stats: dict[str, int] = field(default_factory=active_base_stats)
    set_counts: dict[str, int] = field(default_factory=dict)
    used_item_ids: set[str] = field(default_factory=set)
    exos: dict[str, str] = field(default_factory=dict)
    base_allocation: dict[str, int] = field(
        default_factory=lambda: {ACTIVE_DAMAGE_PROFILE.primary_stat: 300, "Vitality": 395}
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
class PackageCandidate:
    entries: tuple[tuple[str, dict[str, Any]], ...]
    score: float

    @cached_property
    def slots(self) -> frozenset[str]:
        return frozenset(slot_name for slot_name, _ in self.entries)

    @cached_property
    def item_ids(self) -> frozenset[str]:
        return frozenset(item["dofusID"] for _, item in self.entries)


@dataclass(frozen=True)
class DofusCombinationCandidate:
    items: tuple[dict[str, Any], ...]
    item_ids: frozenset[str]
    stats: dict[str, int]
    score: float


@dataclass(frozen=True)
class PackageIndex:
    packages: tuple[PackageCandidate, ...]

    @property
    def by_set_signature(self) -> dict[tuple[str, ...], list[PackageCandidate]]:
        buckets: dict[tuple[str, ...], list[PackageCandidate]] = defaultdict(list)
        for package in self.packages:
            buckets[package_group_set_signature((package,))].append(package)
        return buckets


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
    english = next((translation for translation in translations if translation.locale == "en"), None)
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


def normalized_set_bonuses(bonuses: dict[str, list[dict[str, Any]]]) -> dict[str, dict[str, int]]:
    return {
        count: normalize_stats(bonus_lines)
        for count, bonus_lines in bonuses.items()
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
        for stat, value in SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID.get(item_id, {}).items():
            stats[stat] += value
        return dict(stats)
    damage_buff_expected_stack_ratio = ITEM_DAMAGE_BUFF_EXPECTED_STACK_RATIO_BY_DOFUS_ID.get(
        item_id,
        DAMAGE_BUFF_EXPECTED_STACK_RATIO,
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
    for stat, value in SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID.get(item_id, {}).items():
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


def set_bonus_score(set_obj: dict[str, Any]) -> float:
    return max(
        (score_stats(stats) for stats in set_bonus_stats(set_obj).values()),
        default=0.0,
    )


def dominance_value(item: dict[str, Any], stat: str) -> int:
    if stat == "level":
        return item.get("level", 0)
    return item["_stats"].get(stat, 0)


def dominates_item(left: dict[str, Any], right: dict[str, Any]) -> bool:
    if left.get("itemType") != right.get("itemType"):
        return False

    dimensions = DOMINANCE_STATS + ("level",)
    return (
        left["_score"] >= right["_score"]
        and all(dominance_value(left, stat) >= dominance_value(right, stat) for stat in dimensions)
        and (
            left["_score"] > right["_score"]
            or any(dominance_value(left, stat) > dominance_value(right, stat) for stat in dimensions)
        )
    )


def prune_dominated_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    kept = []
    for item in items:
        if any(dominates_item(other, item) for other in items if other is not item):
            continue
        kept.append(item)
    return kept


def has_negative_action_stat(item: dict[str, Any]) -> bool:
    stats = normalize_stats(item.get("stats", []))
    return stats.get("AP", 0) < 0 or stats.get("MP", 0) < 0 or stats.get("Range", 0) < 0


@lru_cache(maxsize=1)
def load_build_discovery_index() -> dict[str, Any] | None:
    if not os.path.exists(BUILD_DISCOVERY_INDEX_PATH):
        return None
    with open(BUILD_DISCOVERY_INDEX_PATH, encoding="utf-8") as file:
        generated_index = json.load(file)
    schema_version = generated_index.get("schemaVersion")
    if schema_version != BUILD_DISCOVERY_INDEX_SCHEMA_VERSION:
        raise ValueError(
            "Unsupported build discovery index schemaVersion "
            f"{schema_version}; expected {BUILD_DISCOVERY_INDEX_SCHEMA_VERSION}."
        )
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


def item_record_from_index(item: dict[str, Any]) -> dict[str, Any]:
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
        "conditions": item.get("conditions") or {"conditions": {}, "customConditions": {}},
    }
    record["_name"] = get_name(record)
    record["_stats"] = item.get("normalizedStats") or normalize_stats(record.get("stats", []))
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


def target_level_bucket_name(target_level: int) -> str | None:
    generated_index = load_build_discovery_index()
    if generated_index is None:
        return None
    for bucket in generated_index.get("levelBuckets", []):
        if bucket["minLevel"] <= target_level <= bucket["maxLevel"]:
            return bucket["name"]
    return None


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
        bucket["name"]: bucket
        for bucket in generated_index.get("levelBuckets", [])
    }
    for bucket_name, ids in dofus_like_by_bucket.items():
        if buckets_by_name.get(bucket_name, {}).get("minLevel", target_level + 1) <= target_level:
            item_ids.update(ids)

    return item_ids


@lru_cache(maxsize=1)
def load_all_item_records() -> tuple[dict[str, Any], ...]:
    generated_index = load_build_discovery_index()
    if generated_index is not None:
        return tuple(item_record_from_index(item) for item in generated_index.get("items", []))

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
                selectinload(ModelItem.item_type).selectinload(ModelItemType.item_type_translation),
                selectinload(ModelItem.weapon_stats).selectinload(ModelWeaponStat.weapon_effects),
            )
            .filter(ModelItem.level <= TARGET_LEVEL)
            .filter(or_(ModelItem.dofus_db_id.isnot(None), ModelItem.dofus_db_mount_id.isnot(None)))
            .all()
        )
        items = tuple(
            {
                "uuid": str(item.uuid),
                "dofusID": db_item_dofus_id(item),
                "name": translated_name(item.item_translations, db_item_dofus_id(item) or ""),
                "itemType": translated_name(item.item_type.item_type_translation, str(item.item_type_id)),
                "setID": str(item.set_id) if item.set_id else None,
                "level": item.level,
                "stats": item_stats_from_db(item.stats),
                "buffs": item_buffs_from_db(item.buffs),
                "weaponStats": weapon_stats_from_db(item.weapon_stats),
                "conditions": item.conditions or {"conditions": {}, "customConditions": {}},
            }
            for item in db_items
        )
    for item in items:
        item["_name"] = get_name(item)
        item["_stats"] = normalize_stats(item.get("stats", []))
        item["_score"] = active_profile_item_score(item)
    return items


def load_items(
    target: BuildTarget = DEFAULT_TARGET,
    excluded_item_ids: set[str] | None = None,
    budget_tier: int = 4,
) -> list[dict[str, Any]]:
    excluded_item_ids = excluded_item_ids or set()
    items = load_all_item_records()
    indexed_item_ids = indexed_candidate_item_ids(target.level)
    for item in items:
        item["_score"] = active_profile_item_score(item)
    candidates = [
        item
        for item in items
        if item.get("level", 0) <= target.level
        and (indexed_item_ids is None or item.get("dofusID") in indexed_item_ids)
        and item.get("dofusID") not in excluded_item_ids
        and item_allowed_by_budget(item, budget_tier)
        and condition_can_pass_at_target(
            item.get("conditions", {}).get("conditions", {}),
            target.condition_stats,
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
        set_obj["_excluded"] = any(part in set_obj["_name"] for part in EXCLUDED_SET_NAME_PARTS)
    return sets


def relevant_set_ids(items: list[dict[str, Any]], sets: dict[str, dict[str, Any]], limit: int) -> set[str]:
    item_score_by_set: dict[str, float] = defaultdict(float)
    for item in items:
        if item.get("setID"):
            item_score_by_set[item["setID"]] += item["_score"]

    scored_sets = []
    for set_id, set_obj in sets.items():
        if set_obj.get("_excluded"):
            continue
        score = item_score_by_set.get(set_id, 0.0) + set_bonus_score(set_obj)
        if score > 0:
            scored_sets.append((score, set_id))
    return {set_id for _, set_id in sorted(scored_sets, reverse=True)[:limit]}


def candidate_pool_for_slot(
    slot_types: tuple[str, ...],
    items: list[dict[str, Any]],
    relevant_sets: set[str],
    top_k: int,
    required_item_ids: set[str] | None = None,
    target_level: int = TARGET_LEVEL,
) -> list[dict[str, Any]]:
    required_item_ids = required_item_ids or set()
    is_dofus_slot = all(slot_type in {"Dofus", "Trophy", "Prysmaradite"} for slot_type in slot_types)
    is_pet_slot = any(slot_type in {"Pet", "Petsmount", "Mount"} for slot_type in slot_types)
    compatible = [item for item in items if item.get("itemType") in slot_types]
    relevant_set_items = [
        item
        for item in compatible
        if item.get("setID") in relevant_sets
        and (
            target_level < RELEVANT_SET_ITEM_MIN_LEVEL
            or item.get("level", 0) >= RELEVANT_SET_ITEM_MIN_LEVEL
        )
    ]
    search_compatible = compatible
    if not is_dofus_slot and not is_pet_slot:
        search_compatible = prune_dominated_items(
            [item for item in compatible if item.get("setID") not in relevant_sets]
        ) + relevant_set_items
    selected: dict[str, dict[str, Any]] = {}

    top_score_candidates = search_compatible
    if is_dofus_slot:
        top_score_candidates = [item for item in search_compatible if item["_score"] > 0]
    for item in sorted(top_score_candidates, key=lambda i: i["_score"], reverse=True)[:top_k]:
        selected[item["dofusID"]] = item

    if is_dofus_slot:
        zero_score_fillers = [
            item
            for item in search_compatible
            if item["_score"] == 0
            and all(item["_stats"].get(stat, 0) == 0 for stat in ACTION_STATS)
        ]
        for item in sorted(zero_score_fillers, key=lambda i: i.get("level", 0), reverse=True)[
            :DOFUS_ZERO_SCORE_FILLER_LIMIT
        ]:
            selected[item["dofusID"]] = item

        for item in search_compatible:
            if item["dofusID"] in MANDATORY_DOFUS_CANDIDATE_IDS:
                selected[item["dofusID"]] = item

    for item in search_compatible:
        if item["dofusID"] in UNCOMMON_ACTION_STAT_SOURCE_IDS:
            selected[item["dofusID"]] = item

    for item in search_compatible:
        if item["dofusID"] in required_item_ids:
            selected[item["dofusID"]] = item

    action_source_limit = (
        DOFUS_ACTION_STAT_SOURCE_LIMIT
        if is_dofus_slot
        else ACTION_STAT_SOURCE_LIMIT
    )
    for stat in ACTION_STATS:
        stat_source_limit = action_source_limit
        if is_dofus_slot and stat == "AP":
            stat_source_limit = DOFUS_AP_SOURCE_LIMIT
        stat_sources = [
            item
            for item in compatible
            if item["_stats"].get(stat, 0) > 0
            and (is_dofus_slot or target_level < ACTION_STAT_SOURCE_MIN_LEVEL or item.get("level", 0) >= ACTION_STAT_SOURCE_MIN_LEVEL)
        ]
        retained_stat_sources = (
            stat_sources
            if not is_dofus_slot and target_level < ACTION_STAT_SOURCE_MIN_LEVEL
            else sorted(
                stat_sources,
                key=lambda i: (i["_score"], i.get("level", 0)),
                reverse=True,
            )[:stat_source_limit]
        )
        for item in retained_stat_sources:
            selected[item["dofusID"]] = item

    if not is_dofus_slot:
        vector_representatives: dict[tuple[int, int, int], list[dict[str, Any]]] = defaultdict(list)
        for item in search_compatible:
            if target_level >= ACTION_STAT_SOURCE_MIN_LEVEL and item.get("level", 0) < ACTION_STAT_SOURCE_MIN_LEVEL:
                continue
            vector = tuple(max(0, item["_stats"].get(stat, 0)) for stat in ACTION_STATS)
            if not any(vector):
                continue
            vector_representatives[vector].append(item)
        for vector_items in vector_representatives.values():
            for item in sorted(
                vector_items,
                key=lambda i: (i["_score"], i.get("level", 0)),
                reverse=True,
            )[:ACTION_STAT_VECTOR_SOURCE_LIMIT]:
                selected[item["dofusID"]] = item

    for item in relevant_set_items:
        selected[item["dofusID"]] = item

    return sorted(selected.values(), key=lambda i: i["_score"], reverse=True)


def apply_stat_delta(stats: dict[str, int], stat_values: dict[str, int], multiplier: int = 1) -> None:
    for stat, value in stat_values.items():
        stats[stat] = stats.get(stat, 0) + (value * multiplier)


def add_item_to_state(
    state: BuildState,
    slot_name: str,
    item: dict[str, Any],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget = DEFAULT_TARGET,
    condition_target: BuildTarget | None = None,
    cap_target: BuildTarget | None = None,
    include_potential_score: bool = True,
) -> BuildState | None:
    condition_target = condition_target or target
    cap_target = cap_target or hard_cap_target()
    if item["dofusID"] in state.used_item_ids:
        return None

    next_state = state.clone()
    next_state.slots[slot_name] = item
    next_state.used_item_ids.add(item["dofusID"])
    apply_stat_delta(next_state.stats, item.get("_stats") or normalize_stats(item.get("stats", [])))

    set_id = item.get("setID")
    if set_id and set_id in sets:
        previous_count = next_state.set_counts.get(set_id, 0)
        next_count = previous_count + 1
        next_state.set_counts[set_id] = next_count
        bonus_stats = set_bonus_stats(sets[set_id])
        previous_bonus = bonus_stats.get(str(previous_count), {})
        bonus = bonus_stats.get(str(next_count), {})
        apply_stat_delta(next_state.stats, previous_bonus, multiplier=-1)
        apply_stat_delta(next_state.stats, bonus)

    if (
        next_state.stats.get("AP", 0) > cap_target.ap
        or next_state.stats.get("MP", 0) > cap_target.mp
        or next_state.stats.get("Range", 0) > cap_target.range
    ):
        return None

    next_state.score = score_state(
        next_state,
        sets,
        target,
        final=False,
        include_potential=include_potential_score,
    )
    if not target_forced_conditions_hold(next_state, condition_target.condition_stats):
        return None
    return next_state


def compatible_slots_for_item(item: dict[str, Any]) -> list[str]:
    item_type = item.get("itemType")
    return [
        slot_name
        for slot_name, slot_types in SLOTS
        if item_type in slot_types
    ]


def required_item_seed_states(
    required_item_ids: set[str],
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> list[BuildState]:
    if not required_item_ids:
        return []

    items_by_id = {
        item["dofusID"]: item
        for item in items
        if item["dofusID"] in required_item_ids
    }
    if set(items_by_id) != required_item_ids:
        return []

    ordered_items = sorted(
        items_by_id.values(),
        key=lambda item: len(compatible_slots_for_item(item)),
    )
    seeds: list[BuildState] = []

    def place_required_item(index: int, state: BuildState) -> None:
        if index >= len(ordered_items):
            seeds.append(state)
            return

        item = ordered_items[index]
        for slot_name in compatible_slots_for_item(item):
            if slot_name in state.slots:
                continue
            next_state = add_item_to_state(
                state,
                slot_name,
                item,
                sets,
                search_target,
                condition_target=target,
                cap_target=natural_cap_target,
            )
            if next_state is not None:
                place_required_item(index + 1, next_state)

    place_required_item(0, BuildState())
    return dedupe_builds(sorted(seeds, key=lambda state: state.score, reverse=True))


def budget_action_trophy_seed_states(
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> list[BuildState]:
    seeds: list[BuildState] = []
    available_mandatory_ids = {
        item["dofusID"]
        for item in items
        if item["dofusID"] in MANDATORY_DOFUS_CANDIDATE_IDS
    }
    for item_id in available_mandatory_ids:
        seeds.extend(
            required_item_seed_states(
                {item_id},
                items,
                sets,
                target,
                search_target,
                natural_cap_target,
            )
        )
    action_dofus_items = [
        item
        for item in items
        if item.get("itemType") in {"Dofus", "Trophy", "Prysmaradite"}
        and (
            item["dofusID"] in MANDATORY_DOFUS_CANDIDATE_IDS
            or any(item["_stats"].get(stat, 0) for stat in ACTION_STATS)
        )
    ]
    for combo in ranked_dofus_combinations(
        action_dofus_items,
        len([slot_name for slot_name, _ in SLOTS if is_dofus_slot(slot_name)]),
        BUDGET_ACTION_TROPHY_COMBO_SEED_LIMIT,
    ):
        completed = complete_dofus_combination(
            BuildState(),
            combo,
            sets,
            target,
            natural_cap_target,
        )
        if completed is not None:
            seeds.append(completed)
    return dedupe_builds(sorted(seeds, key=lambda state: state.score, reverse=True))


def action_gear_seed_signature(state: BuildState, target: BuildTarget) -> tuple[Any, ...]:
    return (
        min(state.stats.get("AP", 0), target.ap),
        min(state.stats.get("MP", 0), target.mp),
        min(state.stats.get("Range", 0), target.range) if target.range_required else 0,
        tuple(sorted(state.slots)),
    )


def trim_action_gear_seeds(
    states: list[BuildState],
    target: BuildTarget,
    limit: int,
) -> list[BuildState]:
    buckets: dict[tuple[Any, ...], list[BuildState]] = defaultdict(list)
    for state in sorted(states, key=lambda s: s.score, reverse=True):
        bucket = buckets[action_gear_seed_signature(state, target)]
        if len(bucket) < BUDGET_ACTION_GEAR_VECTOR_CAP:
            bucket.append(state)
    diversified = [state for bucket in buckets.values() for state in bucket]
    return sorted(diversified, key=lambda state: state.score, reverse=True)[:limit]


def budget_action_gear_seed_states(
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    limit: int = BUDGET_ACTION_GEAR_SEED_LIMIT,
) -> list[BuildState]:
    action_slots: list[tuple[str, list[dict[str, Any]]]] = []
    for slot_name, slot_types in SLOTS:
        if is_dofus_slot(slot_name):
            continue
        candidates = [
            item
            for item in pools.get(slot_name, [])
            if any(item["_stats"].get(stat, 0) > 0 for stat in ACTION_STATS)
        ]
        if not candidates:
            continue
        action_slots.append(
            (
                slot_name,
                sorted(
                    candidates,
                    key=lambda item: (
                        item["_stats"].get("AP", 0),
                        item["_stats"].get("MP", 0),
                        item["_stats"].get("Range", 0),
                        item["_score"],
                        item.get("level", 0),
                    ),
                    reverse=True,
                )[:BUDGET_ACTION_GEAR_SLOT_LIMIT],
            )
        )

    seeds = [BuildState()]
    for slot_name, candidates in action_slots:
        next_states = list(seeds)
        for state in seeds:
            if slot_name in state.slots:
                continue
            for item in candidates:
                next_state = add_item_to_state(
                    state,
                    slot_name,
                    item,
                    sets,
                    search_target,
                    condition_target=target,
                    cap_target=natural_cap_target,
                )
                if next_state is not None:
                    next_states.append(next_state)
        seeds = trim_action_gear_seeds(next_states, target, limit)

    seeds = [
        seed
        for seed in seeds
        if seed.used_item_ids and any(seed.stats.get(stat, 0) > active_base_stats().get(stat, 0) for stat in ACTION_STATS)
    ]
    seeds = [seed for seed in seeds if not unmet_item_conditions(seed)]
    return dedupe_builds(sorted(seeds, key=lambda state: state.score, reverse=True))[:limit]


def action_stat_witness_seed_needed(target: BuildTarget) -> bool:
    return (
        target.ap > base_ap_for_level(target.level)
        or target.mp > MIN_MP
        or (target.range_required and target.range > 0)
    )


def action_stat_witness_seed_choices(
    slot_name: str,
    pools: dict[str, list[dict[str, Any]]],
    action_set_ids: set[str],
    target_level: int,
) -> list[dict[str, Any] | None]:
    candidates = [
        item
        for item in pools.get(slot_name, [])
        if any(item["_stats"].get(stat, 0) > 0 for stat in ACTION_STATS)
        or item.get("setID") in action_set_ids
    ]
    if optional_slot_choice(slot_name, target_level) or slot_name == "pet" or is_dofus_slot(slot_name):
        return [None] + candidates
    return candidates


def action_stat_witness_seed_states(
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    *,
    exo_policy: str = "allow",
    limit: int = ACTION_STAT_WITNESS_SEED_LIMIT,
    max_states_per_slot: int = ACTION_STAT_WITNESS_MAX_STATES_PER_SLOT,
) -> list[BuildState]:
    if not action_stat_witness_seed_needed(target):
        return []

    action_set_ids = {
        set_id
        for set_id, set_obj in sets.items()
        for stats in set_bonus_stats(set_obj).values()
        if any(stats.get(stat, 0) > 0 for stat in ACTION_STATS)
    }
    slot_choices = [
        (
            slot_name,
            action_stat_witness_seed_choices(slot_name, pools, action_set_ids, target.level),
        )
        for slot_name, _ in SLOTS
    ]
    if any(not choices for _, choices in slot_choices):
        return []

    with target_level_context(target.level):
        states = [BuildState()]
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
                        search_target,
                        condition_target=target,
                        cap_target=natural_cap_target,
                        include_potential_score=False,
                    )
                    if next_state is not None:
                        next_states.append(next_state)

            buckets: dict[tuple[Any, ...], BuildState] = {}
            for state in next_states:
                key = (
                    min(state.stats.get("AP", 0), target.ap),
                    min(state.stats.get("MP", 0), target.mp),
                    min(state.stats.get("Range", 0), target.range) if target.range_required else 0,
                    tuple(sorted((set_id, min(count, 8)) for set_id, count in state.set_counts.items() if set_id in action_set_ids)),
                    tuple(sorted(state.slots)),
                )
                current = buckets.get(key)
                if current is None or state.score > current.score:
                    buckets[key] = state
            states = sorted(
                buckets.values(),
                key=lambda state: action_stat_progress_key(state, target)[:-1] + (len(state.slots), state.score),
                reverse=True,
            )[:max_states_per_slot]

        valid_seeds = []
        for state in states:
            state_with_exos = apply_missing_exos(state, target, exo_policy)
            if state_with_exos and action_stats_meet_target(state_with_exos, target):
                valid_seeds.append(state_with_exos)

    valid_seeds = [seed for seed in valid_seeds if not unmet_item_conditions(seed)]
    return dedupe_builds(sorted(valid_seeds, key=lambda state: state.score, reverse=True))[:limit]


def eligible_for_exo(item: dict[str, Any], stat: str) -> bool:
    item_stats = item.get("_stats") or normalize_stats(item.get("stats", []))
    return item.get("itemType") in EXO_ELIGIBLE_ITEM_TYPES and item_stats.get(stat, 0) == 0


def apply_missing_exos(
    state: BuildState,
    target: BuildTarget,
    exo_policy: str = "allow",
) -> BuildState | None:
    next_state = state.clone()
    target_stats = [("AP", target.ap), ("MP", target.mp)]
    if target.range_required:
        target_stats.append(("Range", target.range))
    for stat, target_value in target_stats:
        missing = target_value - next_state.stats.get(stat, 0)
        if missing <= 0:
            continue
        if exo_policy == "none":
            return None
        if missing > 1:
            return None

        exo_item = next(
            (
                item
                for item in next_state.slots.values()
                if eligible_for_exo(item, stat)
                and item["dofusID"] not in next_state.exos.values()
            ),
            None,
        )
        if exo_item is None:
            return None

        next_state.stats[stat] = next_state.stats.get(stat, 0) + 1
        next_state.exos[stat] = exo_item["dofusID"]

    return next_state


def potential_set_bonus_score(state: BuildState, sets: dict[str, dict[str, Any]]) -> float:
    potential = 0.0
    for set_id, count in state.set_counts.items():
        next_bonus = set_bonus_stats(sets.get(set_id, {})).get(str(count + 1))
        if next_bonus:
            potential += 0.25 * score_stats(next_bonus)
    return potential


def score_state(
    state: BuildState,
    sets: dict[str, dict[str, Any]],
    target: BuildTarget = DEFAULT_TARGET,
    final: bool = False,
    include_potential: bool = True,
) -> float:
    score = score_stats(state.stats)
    ap_gap = max(target.ap - state.stats.get("AP", 0), 0)
    mp_gap = max(target.mp - state.stats.get("MP", 0), 0)
    range_gap = max(target.range - state.stats.get("Range", 0), 0) if target.range_required else 0
    score -= ap_gap * 500
    score -= mp_gap * 75
    score -= range_gap * 25
    if include_potential and not final:
        score += potential_set_bonus_score(state, sets)
    return score


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


def action_stat_progress_values(state: BuildState, target: BuildTarget) -> tuple[int, int, int]:
    return (
        min(state.stats.get("AP", 0), target.ap),
        min(state.stats.get("MP", 0), target.mp),
        min(state.stats.get("Range", 0), target.range) if target.range_required else 0,
    )


def action_stat_deficit_total(state: BuildState, target: BuildTarget) -> int:
    return (
        max(target.ap - state.stats.get("AP", 0), 0)
        + max(target.mp - state.stats.get("MP", 0), 0)
        + (max(target.range - state.stats.get("Range", 0), 0) if target.range_required else 0)
    )


def action_stat_progress_key(state: BuildState, target: BuildTarget) -> tuple[int, int, int, int, int, float]:
    ap_progress, mp_progress, range_progress = action_stat_progress_values(state, target)
    return (
        -action_stat_deficit_total(state, target),
        ap_progress + mp_progress + range_progress,
        ap_progress,
        mp_progress,
        range_progress,
        state.score,
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


def state_weapon_damage(state: BuildState, stats: dict[str, float] | None = None) -> float:
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

    return tuple(line for _, line in sorted(lines_by_order.values(), key=lambda entry: entry[1].base_min))


def spell_damage_per_cast(spell: SpellDamageCandidate, stats: dict[str, int], stacks: int = 0) -> float:
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


def spell_damage_per_ap(spell: SpellDamageCandidate, stats: dict[str, int], stacks: int = 0) -> float:
    return spell_damage_per_cast(spell, stats, stacks=stacks) / max(spell.ap_cost, 1)


def select_variant_spells(
    candidates: Iterable[SpellDamageCandidate],
    stats: dict[str, int],
) -> tuple[SpellDamageCandidate, ...]:
    best_by_variant_pair: dict[str, SpellDamageCandidate] = {}
    for spell in candidates:
        current = best_by_variant_pair.get(spell.variant_pair_id)
        if current is None or spell_damage_per_ap(spell, stats) > spell_damage_per_ap(current, stats):
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


def filler_cast_count_for_turn(spell: SpellDamageCandidate, turn_cast_counts: dict[str, int]) -> int:
    cast_limits = [limit for limit in (spell.casts_per_turn, spell.casts_per_target) if limit]
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

    total_casts = (
        turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:buff", 0)
        + turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:damage", 0)
    )
    if spell.casts_per_turn and total_casts >= spell.casts_per_turn:
        return 0
    if spell_active_stacks(spell, stack_counts):
        used_damage_casts = turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:damage", 0)
        damage_cast_limit = spell.casts_per_target or spell.casts_per_turn or 99
        return max(damage_cast_limit - used_damage_casts, 0)
    return 0 if turn_cast_counts.get(f"{ACCUMULATION_SPELL_NAME}:buff", 0) else 1


def filler_cast_count_key(spell: SpellDamageCandidate, stack_counts: dict[str, int]) -> str:
    if spell.name == ACCUMULATION_SPELL_NAME:
        return (
            f"{ACCUMULATION_SPELL_NAME}:damage"
            if spell_active_stacks(spell, stack_counts)
            else f"{ACCUMULATION_SPELL_NAME}:buff"
        )
    return spell.name


def best_filler_spell(
    filler_spells: Iterable[SpellDamageCandidate],
    stats: dict[str, int],
    remaining_ap: int,
    turn_cast_counts: dict[str, int],
    turn: int | None = None,
    last_cast_turns: dict[str, int] | None = None,
    stack_counts: dict[str, int] | None = None,
) -> SpellDamageCandidate | None:
    last_cast_turns = last_cast_turns or {}
    stack_counts = stack_counts or {}
    affordable = [
        spell
        for spell in filler_spells
        if spell.ap_cost <= remaining_ap
        and filler_casts_available_for_state(spell, turn_cast_counts, stack_counts) > 0
        and (
            not spell.cooldown
            or turn is None
            or spell.name not in last_cast_turns
            or turn - last_cast_turns[spell.name] >= spell.cooldown
        )
    ]
    if not affordable:
        return None
    return max(
        affordable,
        key=lambda spell: spell_damage_per_ap(spell, stats, stacks=stack_counts.get(spell.name, 0)),
    )


def mapping_key(values: dict[str, int]) -> tuple[tuple[str, int], ...]:
    return tuple(sorted((key, value) for key, value in values.items() if value))


def spell_active_stacks(spell: SpellDamageCandidate, stack_counts: dict[str, int]) -> int:
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
            weakest_filler_damage_per_ap=fallback_damage / max(SPELL_DAMAGE_PROFILE_TURN_AP, 1),
        )

    selected_spells = select_variant_spells(candidates, stats)
    wrath = next((spell for spell in selected_spells if spell.name == IOP_WRATH_SPELL_NAME), None)
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
            weakest_filler_damage_per_ap=fallback_damage / max(SPELL_DAMAGE_PROFILE_TURN_AP, 1),
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
            stacks = min(IOP_WRATH_CAST_TURNS.index(turn), wrath.max_damage_increase_stacks)
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

    normalized_damage = total_damage / max(total_ap_budget, 1) * SPELL_DAMAGE_PROFILE_TURN_AP
    if weakest_filler_damage_per_ap == float("inf"):
        weakest_filler_damage_per_ap = normalized_damage / max(SPELL_DAMAGE_PROFILE_TURN_AP, 1)
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
        SPELL_DAMAGE_PROFILE_TURNS * min(max(stats.get("AP", REQUIRED_AP), REQUIRED_AP), MAX_AP),
    )
    total_uplift = (
        weapon_damage_per_ap - spell_rotation.weakest_filler_damage_per_ap
    ) * weapon_ap_over_profile
    total_ap_budget = SPELL_DAMAGE_PROFILE_TURNS * min(max(stats.get("AP", REQUIRED_AP), REQUIRED_AP), MAX_AP)
    return total_uplift / max(total_ap_budget, 1) * SPELL_DAMAGE_PROFILE_TURN_AP


def iop_rotation_damage(stats: dict[str, int], state: BuildState | None = None) -> float:
    spell_rotation = iop_spell_rotation_result(stats)
    return spell_rotation.normalized_damage + weapon_rotation_uplift(state, stats, spell_rotation)


def profile_rotation_damage(stats: dict[str, int], state: BuildState | None = None) -> float:
    if ACTIVE_SPELL_PROFILE_CLASS_NAME == "Iop" and ACTIVE_DAMAGE_PROFILE.name == "strength":
        return iop_rotation_damage(stats, state)
    # Non-reviewed class profiles use weighted spell candidates as a scoring
    # prior. Do not run them through the Iop-specific turn planner.
    return profile_damage(active_spell_damage_profile(), stats)


def active_rotation_model_name() -> str:
    if ACTIVE_SPELL_PROFILE_CLASS_NAME == "Iop" and ACTIVE_DAMAGE_PROFILE.name == "strength":
        return "reviewed_iop_strength_rotation"
    return "spell_profile_v0_weighted_candidates"


def active_damage_profile_confidence() -> str:
    if active_rotation_model_name() == "reviewed_iop_strength_rotation":
        return "high"
    return "medium"


def strength_iop_rotation_damage(stats: dict[str, int]) -> float:
    return iop_rotation_damage(stats)


@lru_cache(maxsize=None)
def spell_candidates_for_profile(
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
                db_session.query(ModelSpellStats, ModelSpellTranslation.name, ModelSpell.spell_variant_pair_id, ModelSpell.is_trap)
                .join(ModelSpell, ModelSpellStats.spell_id == ModelSpell.uuid)
                .join(ModelSpellVariantPair, ModelSpell.spell_variant_pair_id == ModelSpellVariantPair.uuid)
                .join(ModelClass, ModelSpellVariantPair.class_id == ModelClass.uuid)
                .join(ModelClassTranslation, ModelClassTranslation.class_id == ModelClass.uuid)
                .join(ModelSpellTranslation, ModelSpellTranslation.spell_id == ModelSpell.uuid)
                .options(
                    joinedload(ModelSpellStats.spell_effects).joinedload(ModelSpellEffect.condition),
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
            highest_stats_by_spell_id[spell_id] = (spell_stat, spell_name, variant_pair_id, is_trap)

    profile_elements = spell_profile_elements_for_profile(profile)
    candidates = []
    for spell_stat, spell_name, variant_pair_id, is_trap in highest_stats_by_spell_id.values():
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
                damage_increase=int_or_zero(getattr(damage_increase, "base_increase", 0)),
                crit_damage_increase=int_or_zero(getattr(damage_increase, "crit_base_increase", 0)),
                max_damage_increase_stacks=int_or_zero(getattr(damage_increase, "max_stacks", 0)),
                min_range=spell_stat.min_range,
                max_range=spell_stat.max_range,
                has_modifiable_range=bool(spell_stat.has_modifiable_range),
            )
        )

    return tuple(candidates)


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


def strength_spell_damage_profile() -> tuple[DamageLine, ...]:
    return active_spell_damage_profile()


def clear_spell_damage_profile_caches() -> None:
    active_spell_candidates.cache_clear()
    active_spell_damage_profile.cache_clear()
    spell_candidates_for_profile.cache_clear()
    active_range_soft_weight.cache_clear()
    active_profile_spell_damage_baseline.cache_clear()
    cheap_profile_damage_baseline.cache_clear()


strength_spell_damage_profile.cache_clear = clear_spell_damage_profile_caches  # type: ignore[attr-defined]


def strength_spell_damage(stats: dict[str, int]) -> float:
    return profile_rotation_damage(stats)


def profile_damage_reference_stats() -> dict[str, int]:
    return {
        **active_base_stats(),
        "AP": MAX_AP,
        ACTIVE_DAMAGE_PROFILE.primary_stat: PROFILE_DAMAGE_REFERENCE_PRIMARY_STAT,
        "Power": PROFILE_DAMAGE_REFERENCE_POWER,
        ACTIVE_DAMAGE_PROFILE.damage_stat: PROFILE_DAMAGE_REFERENCE_ELEMENTAL_DAMAGE,
        "Critical": PROFILE_DAMAGE_REFERENCE_CRITICAL,
        "Critical Damage": PROFILE_DAMAGE_REFERENCE_CRITICAL_DAMAGE,
    }


@lru_cache(maxsize=1)
def active_profile_spell_damage_baseline() -> float:
    return max(profile_rotation_damage(profile_damage_reference_stats()), 1.0)


@lru_cache(maxsize=1)
def cheap_profile_damage_baseline() -> float:
    return max(
        profile_damage(strength_spell_damage_profile(), profile_damage_reference_stats()),
        1.0,
    )


def cheap_profile_damage_score(stats: dict[str, int]) -> float:
    return (
        profile_damage(active_spell_damage_profile(), stats)
        / cheap_profile_damage_baseline()
        * PROFILE_DAMAGE_REFERENCE_SCORE
    )


def normalized_profile_damage_score(stats: dict[str, int], state: BuildState | None = None) -> float:
    return (
        profile_rotation_damage(stats, state)
        / active_profile_spell_damage_baseline()
        * PROFILE_DAMAGE_REFERENCE_SCORE
    )


def expected_incoming_damage(stats: dict[str, int], percent_res_stat: str, flat_res_stat: str) -> float:
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
    positional_res = (
        ranged_res * GENERIC_INCOMING_RANGED_RATE
        + melee_res * (1 - GENERIC_INCOMING_RANGED_RATE)
    )
    total_percent_res = min(element_res + positional_res, 50)
    return damage_after_flat * (1 - total_percent_res / 100)


def elemental_effective_hp(stats: dict[str, int]) -> list[float]:
    vitality = max(stats.get("Vitality", 0), 0)
    return [
        vitality / expected_incoming_damage(stats, percent_res_stat, flat_res_stat) * GENERIC_INCOMING_HIT
        for percent_res_stat, flat_res_stat in zip(PERCENT_RESISTANCE_STATS, FLAT_RESISTANCE_STATS)
    ]


def survivability_score(stats: dict[str, int]) -> float:
    effective_hp_values = elemental_effective_hp(stats)
    if not effective_hp_values:
        return 0.0
    sorted_ehp_values = sorted(effective_hp_values)
    weighted_ehp = sum(
        ehp * weight for ehp, weight in zip(sorted_ehp_values, SORTED_ELEMENT_EHP_WEIGHTS)
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


def strength_point_cost(base_strength: int) -> int:
    return characteristic_point_cost(base_strength)


def max_base_points_for_available_characteristic_points(available_points: int) -> int:
    if available_points < 0:
        raise ValueError("Available characteristic points cannot be negative.")
    base_points = 0
    while characteristic_point_cost(base_points + 1) <= available_points:
        base_points += 1
    return base_points


def legal_base_allocation_options(level: int) -> tuple[int, ...]:
    available_points = characteristic_points_for_level(level)
    max_legal_base_points = max_base_points_for_available_characteristic_points(available_points)
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
        raise ValueError(f"Base {primary_stat} allocation exceeds available points: {base_points}")
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


def base_stats_for_strength_allocation(base_strength: int) -> dict[str, int]:
    return base_stats_for_primary_allocation(base_strength, "Strength")


def state_with_base_allocation(
    state: BuildState,
    base_points: int,
    primary_stat: str | None = None,
    target_level: int | None = None,
) -> BuildState:
    primary_stat = primary_stat or ACTIVE_DAMAGE_PROFILE.primary_stat
    level = target_level if target_level is not None else ACTIVE_TARGET_LEVEL
    allocated_base_stats = base_stats_for_primary_allocation(base_points, primary_stat, level)
    next_state = state.clone()
    next_state.base_allocation = {
        primary_stat: base_points,
        "Vitality": allocated_base_stats["Vitality"] - SCROLLED_BASE_STAT,
    }
    for stat, allocated_value in allocated_base_stats.items():
        current_base_value = base_stats_for_level(level).get(stat, 0)
        next_state.stats[stat] = next_state.stats.get(stat, 0) - current_base_value + allocated_value
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
        allocated_state = state_with_base_allocation(state, base_points, primary_stat, level)
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


def cheap_final_score_state(
    state: BuildState,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
) -> float:
    stats = effective_scoring_stats(state)
    return (
        final_utility_score(stats)
        + cheap_profile_damage_score(stats) * generic_damage_weight
        + survivability_score(stats) * survivability_weight
        - negative_resistance_penalty(stats) * negative_resistance_penalty_weight
    )


def item_stat_total(state: BuildState, stat: str) -> int:
    return sum(item["_stats"].get(stat, 0) for item in state.slots.values())


def set_stat_total(state: BuildState, stat: str) -> int:
    exo_total = 1 if stat in state.exos else 0
    return state.stats.get(stat, 0) - active_base_stats().get(stat, 0) - item_stat_total(state, stat) - exo_total


def has_amulet_ap(state: BuildState) -> bool:
    return state.slots.get("amulet", {}).get("_stats", {}).get("AP", 0) > 0


def has_ap_weapon(state: BuildState) -> bool:
    return state.slots.get("weapon", {}).get("_stats", {}).get("AP", 0) > 0


def has_ap_set_bonus(state: BuildState) -> bool:
    return set_stat_total(state, "AP") > 0


def uncommon_ap_gear_slots(state: BuildState) -> set[str]:
    return {
        slot
        for slot, item in state.slots.items()
        if slot != "amulet"
        and not slot.startswith("dofus_")
        and item["_stats"].get("AP", 0) > 0
    }


def secondary_ap_source_count(state: BuildState) -> int:
    count = len(uncommon_ap_gear_slots(state))
    if OCHRE_DOFUS_ID in state.used_item_ids:
        count += 1
    if SHAKER_TROPHY_ID in state.used_item_ids:
        count += 1
    if has_ap_set_bonus(state):
        count += 1
    return count


def ap_strategy_matches(state: BuildState, strategy: ApStrategy) -> bool:
    if strategy.require_amulet_ap and not has_amulet_ap(state):
        return False
    if strategy.require_ap_exo and "AP" not in state.exos:
        return False
    if strategy.require_ochre and OCHRE_DOFUS_ID not in state.used_item_ids:
        return False
    if strategy.disallow_ochre and OCHRE_DOFUS_ID in state.used_item_ids:
        return False
    if strategy.require_ap_set_bonus and not has_ap_set_bonus(state):
        return False
    if strategy.disallow_ap_set_bonus and has_ap_set_bonus(state):
        return False
    if strategy.disallow_ap_weapon and has_ap_weapon(state):
        return False
    return secondary_ap_source_count(state) >= strategy.min_secondary_ap_sources


def set_signature(state: BuildState) -> tuple[tuple[str, int], ...]:
    return tuple(sorted((set_id, count) for set_id, count in state.set_counts.items() if count > 0))


def trim_beam(states: list[BuildState], beam_width: int, per_signature_cap: int) -> list[BuildState]:
    buckets: dict[tuple[tuple[str, int], ...], list[BuildState]] = defaultdict(list)
    for state in sorted(states, key=lambda s: s.score, reverse=True):
        bucket = buckets[set_signature(state)]
        if len(bucket) < per_signature_cap:
            bucket.append(state)

    diversified = [state for bucket in buckets.values() for state in bucket]
    return sorted(diversified, key=lambda s: s.score, reverse=True)[:beam_width]


def budget_beam_signature(state: BuildState, target: BuildTarget) -> tuple[Any, ...]:
    return (
        min(state.stats.get("AP", 0), target.ap),
        min(state.stats.get("MP", 0), target.mp),
        min(state.stats.get("Range", 0), max(target.range, 1)) if target.range_required else 0,
        min(set_bonus_count(state.set_counts), 3),
        set_signature(state),
    )


def trim_budget_beam(
    states: list[BuildState],
    target: BuildTarget,
    beam_width: int,
    per_signature_cap: int,
) -> list[BuildState]:
    buckets: dict[tuple[Any, ...], list[BuildState]] = defaultdict(list)
    budget_signature_cap = min(per_signature_cap, 2)
    for state in sorted(states, key=lambda s: s.score, reverse=True):
        bucket = buckets[budget_beam_signature(state, target)]
        if len(bucket) < budget_signature_cap:
            bucket.append(state)

    diversified = [state for bucket in buckets.values() for state in bucket]
    return sorted(diversified, key=lambda s: s.score, reverse=True)[:beam_width]


def trim_action_completion_beam(
    states: list[BuildState],
    target: BuildTarget,
    beam_width: int,
    per_signature_cap: int,
) -> list[BuildState]:
    buckets: dict[tuple[Any, ...], list[BuildState]] = defaultdict(list)
    for state in sorted(states, key=lambda s: s.score, reverse=True):
        bucket = buckets[budget_beam_signature(state, target)]
        if len(bucket) < per_signature_cap:
            bucket.append(state)

    diversified = [state for bucket in buckets.values() for state in bucket]
    return sorted(
        diversified,
        key=lambda state: action_stat_progress_key(state, target),
        reverse=True,
    )[:beam_width]


def trim_full_item_signatures(states: list[BuildState], limit: int) -> list[BuildState]:
    selected = []
    seen: set[tuple[str, ...]] = set()
    for state in sorted(states, key=lambda s: s.score, reverse=True):
        signature = tuple(sorted(state.used_item_ids))
        if signature in seen:
            continue
        seen.add(signature)
        selected.append(state)
        if len(selected) >= limit:
            break
    return selected


def dedupe_builds(states: list[BuildState]) -> list[BuildState]:
    seen: set[tuple[str, ...]] = set()
    unique = []
    for state in states:
        signature = tuple(sorted(state.used_item_ids))
        if signature in seen:
            continue
        seen.add(signature)
        unique.append(state)
    return unique


def completed_valid_builds(
    beam: list[BuildState],
    target: BuildTarget,
    ap_strategy: ApStrategy | None = None,
    ap_strategies: tuple[ApStrategy, ...] | None = None,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
    exo_policy: str = "allow",
) -> list[BuildState]:
    cheap_valid_states = []
    for state in beam:
        state_with_exos = apply_missing_exos(state, target, exo_policy)
        if state_with_exos is None:
            continue
        if not action_stats_meet_target(state_with_exos, target):
            continue
        state_with_exos.condition_failures = unmet_item_conditions(state_with_exos)
        if state_with_exos.condition_failures:
            continue
        if ap_strategy and not ap_strategy_matches(state_with_exos, ap_strategy):
            continue
        if ap_strategy:
            state_with_exos.ap_strategy = ap_strategy.name
        elif ap_strategies:
            matched_strategy = next(
                (
                    candidate_strategy
                    for candidate_strategy in ap_strategies
                    if ap_strategy_matches(state_with_exos, candidate_strategy)
                ),
                None,
            )
            if matched_strategy is None:
                continue
            state_with_exos.ap_strategy = matched_strategy.name
        state_with_exos.score = cheap_final_score_state(
            state_with_exos,
            generic_damage_weight=generic_damage_weight,
            survivability_weight=survivability_weight,
            negative_resistance_penalty_weight=negative_resistance_penalty_weight,
        )
        cheap_valid_states.append(state_with_exos)

    cheap_valid_states = trim_full_item_signatures(
        cheap_valid_states,
        BEAM_FINAL_SCORE_LIMIT,
    )
    valid_final_states = []
    for cheap_valid_state in cheap_valid_states:
        try:
            valid_final_states.append(
                optimize_base_allocation(
                    cheap_valid_state,
                    generic_damage_weight=generic_damage_weight,
                    weapon_damage_weight=weapon_damage_weight,
                    survivability_weight=survivability_weight,
                    negative_resistance_penalty_weight=negative_resistance_penalty_weight,
                    primary_stat=ACTIVE_DAMAGE_PROFILE.primary_stat,
                )
            )
        except RuntimeError:
            continue
    return valid_final_states


def state_from_entries(
    entries: Iterable[tuple[str, dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> BuildState | None:
    state = BuildState()
    slot_order = tuple(slot_name for slot_name, _ in SLOTS)
    for slot_name, item in sorted(entries, key=lambda entry: slot_order.index(entry[0])):
        state = add_item_to_state(
            state,
            slot_name,
            item,
            sets,
            search_target,
            condition_target=target,
            cap_target=natural_cap_target,
        )
        if state is None:
            return None
    return state


def package_delta_score(state: BuildState) -> float:
    delta_stats = {
        stat: value - active_base_stats().get(stat, 0)
        for stat, value in state.stats.items()
        if value != active_base_stats().get(stat, 0)
    }
    return score_stats(delta_stats)


def build_package_index(
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    keep_per_set_size: int = SET_PACKAGE_KEEP_PER_SET_SIZE,
    global_limit: int = SET_PACKAGE_GLOBAL_LIMIT,
) -> list[PackageCandidate]:
    slot_order = tuple(slot_name for slot_name, _ in SLOTS)
    items_by_set: dict[str, dict[str, tuple[dict[str, Any], set[str]]]] = defaultdict(dict)
    for slot_name, pool in pools.items():
        for item in pool:
            set_id = item.get("setID")
            if not set_id or item.get("level", 0) < RELEVANT_SET_ITEM_MIN_LEVEL:
                continue
            item_entry = items_by_set[set_id].setdefault(item["dofusID"], (item, set()))
            item_entry[1].add(slot_name)

    packages: list[PackageCandidate] = []
    for set_id, item_entries_by_id in items_by_set.items():
        set_items = list(item_entries_by_id.values())
        for package_size in SET_PACKAGE_SIZES:
            if len(set_items) < package_size:
                continue

            set_size_packages: list[PackageCandidate] = []
            for item_entries in combinations(set_items, package_size):
                slot_options = [
                    sorted(entry[1], key=slot_order.index)
                    for entry in item_entries
                ]
                for slots in product(*slot_options):
                    if len(set(slots)) != len(slots):
                        continue
                    entries = tuple(zip(slots, (entry[0] for entry in item_entries)))
                    state = state_from_entries(
                        entries,
                        sets,
                        target,
                        search_target,
                        natural_cap_target,
                    )
                    if state is None:
                        continue
                    set_size_packages.append(
                        PackageCandidate(entries=entries, score=package_delta_score(state))
                    )

            packages.extend(
                sorted(set_size_packages, key=lambda package: package.score, reverse=True)[
                    :keep_per_set_size
                ]
            )

    deduped: dict[tuple[tuple[str, str], ...], PackageCandidate] = {}
    for package in sorted(packages, key=lambda candidate: candidate.score, reverse=True):
        signature = tuple(sorted((slot, item["dofusID"]) for slot, item in package.entries))
        deduped.setdefault(signature, package)
    return PackageIndex(tuple(deduped.values())[:global_limit])


def action_set_bonus_thresholds(set_obj: dict[str, Any]) -> list[tuple[int, dict[str, int]]]:
    thresholds = []
    for count, stats in sorted(set_bonus_stats(set_obj).items(), key=lambda entry: int(entry[0])):
        action_stats = {stat: stats.get(stat, 0) for stat in ACTION_STATS if stats.get(stat, 0) > 0}
        if action_stats:
            thresholds.append((int(count), action_stats))
    return thresholds


def action_package_score(state: BuildState, threshold_stats: dict[str, int]) -> float:
    weights = active_stat_weights()
    action_score = sum(state.stats.get(stat, 0) * weights[stat] for stat in ACTION_STATS)
    threshold_score = sum(threshold_stats.get(stat, 0) * weights[stat] for stat in ACTION_STATS)
    return threshold_score * 1000 + action_score * 10 + package_delta_score(state)


def build_action_set_package_index(
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    keep_per_set: int = ACTION_SET_PACKAGE_KEEP_PER_SET,
    global_limit: int = ACTION_SET_PACKAGE_GLOBAL_LIMIT,
) -> PackageIndex:
    slot_order = tuple(slot_name for slot_name, _ in SLOTS)
    items_by_set: dict[str, dict[str, tuple[dict[str, Any], set[str]]]] = defaultdict(dict)
    for item in items:
        set_id = item.get("setID")
        if not set_id or set_id not in sets:
            continue
        item_slots = compatible_slots_for_item(item)
        if not item_slots:
            continue
        items_by_set[set_id][item["dofusID"]] = (item, set(item_slots))

    packages: list[PackageCandidate] = []
    for set_id, set_items_by_id in items_by_set.items():
        thresholds = action_set_bonus_thresholds(sets[set_id])
        if not thresholds:
            continue

        set_packages: list[PackageCandidate] = []
        for threshold, threshold_stats in thresholds:
            if len(set_items_by_id) < threshold:
                continue
            for item_entries in combinations(set_items_by_id.values(), threshold):
                slot_options = [sorted(entry[1], key=slot_order.index) for entry in item_entries]
                for slots in product(*slot_options):
                    if len(set(slots)) != len(slots):
                        continue
                    entries = tuple(zip(slots, (entry[0] for entry in item_entries)))
                    state = state_from_entries(
                        entries,
                        sets,
                        target,
                        search_target,
                        natural_cap_target,
                    )
                    if state is None:
                        continue
                    if not any(set_stat_total(state, stat) > 0 for stat in ACTION_STATS):
                        continue
                    set_packages.append(
                        PackageCandidate(entries=entries, score=action_package_score(state, threshold_stats))
                    )
        packages.extend(sorted(set_packages, key=lambda package: package.score, reverse=True)[:keep_per_set])

    deduped: dict[tuple[tuple[str, str], ...], PackageCandidate] = {}
    for package in sorted(packages, key=lambda candidate: candidate.score, reverse=True):
        signature = tuple(sorted((slot, item["dofusID"]) for slot, item in package.entries))
        deduped.setdefault(signature, package)
    return PackageIndex(tuple(deduped.values())[:global_limit])


def generate_set_core_packages(
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    keep_per_set_size: int = SET_PACKAGE_KEEP_PER_SET_SIZE,
    global_limit: int = SET_PACKAGE_GLOBAL_LIMIT,
) -> list[PackageCandidate]:
    return list(
        build_package_index(
            pools,
            sets,
            target,
            search_target,
            natural_cap_target,
            keep_per_set_size=keep_per_set_size,
            global_limit=global_limit,
        ).packages
    )


def packages_compatible(packages: Iterable[PackageCandidate]) -> bool:
    used_slots: set[str] = set()
    used_item_ids: set[str] = set()
    for package in packages:
        if used_slots & package.slots or used_item_ids & package.item_ids:
            return False
        used_slots.update(package.slots)
        used_item_ids.update(package.item_ids)
    return True


def combine_package_entries(packages: Iterable[PackageCandidate]) -> tuple[tuple[str, dict[str, Any]], ...]:
    entries = []
    for package in packages:
        entries.extend(package.entries)
    return tuple(entries)


def package_group_set_signature(packages: Iterable[PackageCandidate]) -> tuple[str, ...]:
    return tuple(
        sorted(
            {
                item["setID"]
                for package in packages
                for _, item in package.entries
                if item.get("setID")
            }
        )
    )


def package_seed_states(
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    package_index: PackageIndex | None = None,
) -> list[BuildState]:
    if package_index is None:
        package_index = build_package_index(pools, sets, target, search_target, natural_cap_target)
    packages = list(package_index.packages)
    seed_entries: list[tuple[float, tuple[tuple[str, dict[str, Any]], ...]]] = [
        (package.score, package.entries) for package in packages
    ]
    priority_seed_entries: list[tuple[float, tuple[tuple[str, dict[str, Any]], ...]]] = []

    pair_entries = []
    for left, right in combinations(packages, 2):
        if not packages_compatible((left, right)):
            continue
        pair_entries.append((left.score + right.score, combine_package_entries((left, right))))
    seed_entries.extend(
        sorted(pair_entries, key=lambda entry: entry[0], reverse=True)[:SET_PACKAGE_PAIR_SEED_LIMIT]
    )

    triple_entries = []
    triple_groups_scanned = 0
    for package_group in combinations(packages[:SET_PACKAGE_TRIPLE_SOURCE_LIMIT], 3):
        triple_groups_scanned += 1
        if triple_groups_scanned > SET_PACKAGE_TRIPLE_CANDIDATE_SCAN_LIMIT:
            break
        if not packages_compatible(package_group):
            continue
        triple_entries.append(
            (
                sum(package.score for package in package_group),
                combine_package_entries(package_group),
                package_group_set_signature(package_group),
            )
        )
    seed_entries.extend(
        (score, entries)
        for score, entries, _ in sorted(triple_entries, key=lambda entry: entry[0], reverse=True)[
            :SET_PACKAGE_TRIPLE_SEED_LIMIT
        ]
    )

    diverse_triples_by_signature: dict[tuple[str, ...], tuple[float, tuple[tuple[str, dict[str, Any]], ...]]] = {}
    for score, entries, signature in sorted(triple_entries, key=lambda entry: entry[0], reverse=True):
        diverse_triples_by_signature.setdefault(signature, (score, entries))
    priority_seed_entries.extend(
        sorted(diverse_triples_by_signature.values(), key=lambda entry: entry[0], reverse=True)[
            :SET_PACKAGE_DIVERSE_TRIPLE_SEED_LIMIT
        ]
    )

    seeds = []
    seen_entry_signatures: set[tuple[tuple[str, str], ...]] = set()
    ordered_seed_entries = priority_seed_entries + sorted(
        seed_entries,
        key=lambda entry: entry[0],
        reverse=True,
    )
    for _, entries in ordered_seed_entries:
        signature = tuple(sorted((slot, item["dofusID"]) for slot, item in entries))
        if signature in seen_entry_signatures:
            continue
        seen_entry_signatures.add(signature)
        state = state_from_entries(entries, sets, target, search_target, natural_cap_target)
        if state is not None:
            seeds.append(state)
        if len(seeds) >= SET_PACKAGE_TOTAL_SEED_LIMIT:
            break
    return dedupe_builds(sorted(seeds, key=lambda state: state.score, reverse=True))


def is_dofus_slot(slot_name: str) -> bool:
    return slot_name.startswith("dofus_")


def optional_empty_slot(
    slot_name: str,
    pools: dict[str, list[dict[str, Any]]],
    target_level: int = TARGET_LEVEL,
) -> bool:
    if pools.get(slot_name):
        return False
    return slot_name == "pet" or is_dofus_slot(slot_name) or target_level <= LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL


def optional_slot_choice(slot_name: str, target_level: int = TARGET_LEVEL) -> bool:
    return is_dofus_slot(slot_name) or target_level <= LOW_LEVEL_EMPTY_SLOT_MAX_LEVEL


def direct_completion_seed_candidates(
    seeds: list[BuildState],
    limit: int = DIRECT_COMPLETION_SEED_LIMIT,
) -> list[BuildState]:
    gear_slots = {slot_name for slot_name, _ in SLOTS if not is_dofus_slot(slot_name)}
    candidates = [
        seed
        for seed in seeds
        if len(gear_slots & set(seed.slots)) >= DIRECT_COMPLETION_MIN_FILLED_GEAR_SLOTS
    ]
    diverse_by_signature: dict[tuple[tuple[str, int], ...], BuildState] = {}
    for seed in sorted(candidates, key=lambda state: state.score, reverse=True):
        diverse_by_signature.setdefault(set_signature(seed), seed)
    return list(diverse_by_signature.values())[:limit]


def direct_non_dofus_completions(
    seed: BuildState,
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> list[BuildState]:
    remaining_slots = [
        slot_name
        for slot_name, _ in SLOTS
        if not is_dofus_slot(slot_name) and slot_name not in seed.slots
    ]
    beam = [seed]
    for slot_name in remaining_slots:
        if optional_empty_slot(slot_name, pools, target.level):
            continue
        next_states: list[BuildState] = []
        for state in beam:
            if optional_slot_choice(slot_name, target.level):
                next_states.append(state)
            for item in pools[slot_name]:
                next_state = add_item_to_state(
                    state,
                    slot_name,
                    item,
                    sets,
                    search_target,
                    condition_target=target,
                    cap_target=natural_cap_target,
                    include_potential_score=False,
                )
                if next_state:
                    next_states.append(next_state)
        beam = trim_action_completion_beam(
            next_states,
            target,
            DIRECT_COMPLETION_NON_DOFUS_BEAM_WIDTH,
            DIRECT_COMPLETION_GEAR_STATE_PER_SIGNATURE_CAP,
        )
        if not beam:
            break
    return beam


def dofus_completion_pool(pools: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    dofus_items: dict[str, dict[str, Any]] = {}
    for slot_name, _ in SLOTS:
        if not is_dofus_slot(slot_name):
            continue
        for item in pools[slot_name]:
            dofus_items[item["dofusID"]] = item

    sorted_items = sorted(dofus_items.values(), key=lambda item: item["_score"], reverse=True)
    selected = {item["dofusID"]: item for item in sorted_items[:DIRECT_COMPLETION_DOFUS_POOL_LIMIT]}
    for item in sorted_items:
        if item["dofusID"] in MANDATORY_DOFUS_CANDIDATE_IDS:
            selected[item["dofusID"]] = item
        if item["dofusID"] in DIRECT_COMPLETION_SPECIAL_DOFUS_IDS:
            selected[item["dofusID"]] = item
        if any(item["_stats"].get(stat, 0) for stat in ACTION_STATS):
            selected[item["dofusID"]] = item
    return sorted(selected.values(), key=lambda item: item["_score"], reverse=True)


def has_item_conditions(item: dict[str, Any]) -> bool:
    conditions = item.get("conditions") or {}
    return bool(conditions.get("conditions") or conditions.get("customConditions"))


def ranked_dofus_combinations(
    dofus_pool: list[dict[str, Any]],
    combo_size: int,
    limit: int = DIRECT_COMPLETION_DOFUS_COMBO_LIMIT,
) -> list[DofusCombinationCandidate]:
    def candidate(combo: tuple[dict[str, Any], ...]) -> DofusCombinationCandidate:
        stats: dict[str, int] = defaultdict(int)
        for item in combo:
            for stat, value in (item.get("_stats") or normalize_stats(item.get("stats", []))).items():
                stats[stat] += value
        return DofusCombinationCandidate(
            items=combo,
            item_ids=frozenset(item["dofusID"] for item in combo),
            stats=dict(stats),
            score=sum(item["_score"] for item in combo),
        )

    if combo_size == 0:
        return [candidate(tuple())]

    scored_combinations = [
        (sum(item["_score"] for item in combo), combo)
        for combo in combinations(dofus_pool, combo_size)
    ]
    sorted_combinations = sorted(scored_combinations, key=lambda entry: entry[0], reverse=True)
    top_combination_limit = max(1, limit // 2)
    priority_combination_limit = max(1, limit // 10)
    condition_light_limit = max(1, min(limit // 10, 10))
    condition_light_combinations = [
        combo
        for _, combo in sorted_combinations
        if all(not has_item_conditions(item) for item in combo)
    ][:condition_light_limit]
    core_items = [
        item
        for item in dofus_pool
        if item["dofusID"] in DIRECT_COMPLETION_CORE_DOFUS_IDS
    ]
    core_combinations = sorted(
        combinations(core_items, combo_size),
        key=lambda combo: sum(item["_score"] for item in combo),
        reverse=True,
    )
    action_combinations = sorted(
        (
            combo
            for combo in combinations(dofus_pool, combo_size)
            if any(item.get("_stats", {}).get(stat, 0) for item in combo for stat in ACTION_STATS)
        ),
        key=lambda combo: (
            sum(item["_stats"].get("AP", 0) for item in combo),
            sum(item["_stats"].get("MP", 0) for item in combo),
            sum(item["_stats"].get("Range", 0) for item in combo),
            sum(item["_score"] for item in combo),
        ),
        reverse=True,
    )[:priority_combination_limit]
    multi_special_combinations = [
        combo
        for _, combo in sorted_combinations
        if sum(item["dofusID"] in DIRECT_COMPLETION_SPECIAL_DOFUS_IDS for item in combo) >= 2
    ][:priority_combination_limit]
    special_combinations = [
        combo
        for _, combo in sorted_combinations
        if any(item["dofusID"] in DIRECT_COMPLETION_SPECIAL_DOFUS_IDS for item in combo)
    ][:priority_combination_limit]
    multi_mandatory_combinations = [
        combo
        for _, combo in sorted_combinations
        if sum(item["dofusID"] in MANDATORY_DOFUS_CANDIDATE_IDS for item in combo) >= 2
    ][:priority_combination_limit]
    mandatory_combinations = [
        combo
        for _, combo in sorted_combinations
        if any(item["dofusID"] in MANDATORY_DOFUS_CANDIDATE_IDS for item in combo)
    ][:priority_combination_limit]
    top_combinations = [
        combo
        for _, combo in sorted_combinations[:top_combination_limit]
    ]
    fill_combinations = [
        combo
        for _, combo in sorted_combinations[top_combination_limit:limit]
    ]

    seen: set[tuple[str, ...]] = set()
    ranked = []
    for combo in (
        top_combinations
        + condition_light_combinations
        + core_combinations
        + action_combinations
        + multi_special_combinations
        + special_combinations
        + multi_mandatory_combinations
        + mandatory_combinations
        + fill_combinations
    ):
        signature = tuple(sorted(item["dofusID"] for item in combo))
        if signature in seen:
            continue
        seen.add(signature)
        ranked.append(combo)
        if len(ranked) >= limit:
            break
    return [candidate(combo) for combo in ranked]


def dofus_combination_can_meet_target(
    state: BuildState,
    dofus_candidate: DofusCombinationCandidate,
    target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> bool:
    ap = state.stats.get("AP", 0) + dofus_candidate.stats.get("AP", 0)
    mp = state.stats.get("MP", 0) + dofus_candidate.stats.get("MP", 0)
    range_value = state.stats.get("Range", 0) + dofus_candidate.stats.get("Range", 0)
    return (
        ap <= natural_cap_target.ap
        and mp <= natural_cap_target.mp
        and ap >= target.ap - 1
        and mp >= target.mp - 1
        and (not target.range_required or range_value >= target.range - 1)
    )


def complete_dofus_combination(
    state: BuildState,
    dofus_candidate: DofusCombinationCandidate,
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> BuildState | None:
    open_slots = [slot_name for slot_name, _ in SLOTS if is_dofus_slot(slot_name) and slot_name not in state.slots]
    if len(open_slots) != len(dofus_candidate.items):
        return None
    next_state = state.clone()
    for slot_name, item in zip(open_slots, dofus_candidate.items):
        item_id = item["dofusID"]
        if item_id in next_state.used_item_ids:
            return None
        next_state.slots[slot_name] = item
        next_state.used_item_ids.add(item_id)
    for stat, value in dofus_candidate.stats.items():
        next_state.stats[stat] = next_state.stats.get(stat, 0) + value
    if next_state.stats.get("AP", 0) > natural_cap_target.ap or next_state.stats.get("MP", 0) > natural_cap_target.mp:
        return None
    next_state.score = state.score + dofus_candidate.score
    return next_state


def direct_valid_completed_state(
    state: BuildState,
    target: BuildTarget,
    ap_strategies: tuple[ApStrategy, ...],
    generic_damage_weight: float,
    weapon_damage_weight: float,
    survivability_weight: float,
    negative_resistance_penalty_weight: float,
    exo_policy: str = "allow",
) -> BuildState | None:
    state_with_exos = apply_missing_exos(state, target, exo_policy)
    if state_with_exos is None:
        return None
    if not action_stats_meet_target(state_with_exos, target):
        return None
    state_with_exos.condition_failures = unmet_item_conditions(state_with_exos)
    if state_with_exos.condition_failures:
        return None

    matched_strategy = next(
        (
            ap_strategy
            for ap_strategy in ap_strategies
            if ap_strategy_matches(state_with_exos, ap_strategy)
        ),
        None,
    )
    if matched_strategy is None:
        return None

    state_with_exos.ap_strategy = matched_strategy.name
    try:
        state_with_exos = optimize_base_allocation(
            state_with_exos,
            generic_damage_weight=generic_damage_weight,
            weapon_damage_weight=weapon_damage_weight,
            survivability_weight=survivability_weight,
            negative_resistance_penalty_weight=negative_resistance_penalty_weight,
            primary_stat=ACTIVE_DAMAGE_PROFILE.primary_stat,
        )
    except RuntimeError:
        return None
    return state_with_exos


def direct_cheap_valid_completed_state(
    state: BuildState,
    target: BuildTarget,
    ap_strategies: tuple[ApStrategy, ...],
    generic_damage_weight: float,
    survivability_weight: float,
    negative_resistance_penalty_weight: float,
    exo_policy: str = "allow",
) -> BuildState | None:
    state_with_exos = apply_missing_exos(state, target, exo_policy)
    if state_with_exos is None:
        return None
    if not action_stats_meet_target(state_with_exos, target):
        return None
    state_with_exos.condition_failures = unmet_item_conditions(state_with_exos)
    if state_with_exos.condition_failures:
        return None

    matched_strategy = next(
        (
            ap_strategy
            for ap_strategy in ap_strategies
            if ap_strategy_matches(state_with_exos, ap_strategy)
        ),
        None,
    )
    if matched_strategy is None:
        return None

    state_with_exos.ap_strategy = matched_strategy.name
    state_with_exos.score = cheap_final_score_state(
        state_with_exos,
        generic_damage_weight=generic_damage_weight,
        survivability_weight=survivability_weight,
        negative_resistance_penalty_weight=negative_resistance_penalty_weight,
    )
    return state_with_exos


def direct_complete_package_seeds(
    seeds: list[BuildState],
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    ap_strategies: tuple[ApStrategy, ...],
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
    exo_policy: str = "allow",
    seed_limit: int = DIRECT_COMPLETION_SEED_LIMIT,
    gear_state_limit: int = DIRECT_COMPLETION_GEAR_STATE_LIMIT,
    gear_state_per_signature_cap: int = DIRECT_COMPLETION_GEAR_STATE_PER_SIGNATURE_CAP,
    dofus_combo_limit: int = DIRECT_COMPLETION_DOFUS_COMBO_LIMIT,
    final_score_limit: int = DIRECT_COMPLETION_FINAL_SCORE_LIMIT,
) -> list[BuildState]:
    dofus_pool = dofus_completion_pool(pools)
    ranked_combinations_by_size: dict[int, list[tuple[dict[str, Any], ...]]] = {}
    completed_gear_states: list[BuildState] = []
    cheap_valid_states: list[BuildState] = []
    for seed in direct_completion_seed_candidates(seeds, seed_limit):
        completed_gear_states.extend(
            direct_non_dofus_completions(
                seed,
                pools,
                sets,
                target,
                pending_dofus_search_target(target),
                natural_cap_target,
            )
        )

    completed_gear_states = trim_beam(
        completed_gear_states,
        gear_state_limit,
        gear_state_per_signature_cap,
    )
    for non_dofus_state in completed_gear_states:
        cheap_valid_state = direct_cheap_valid_completed_state(
            non_dofus_state,
            target,
            ap_strategies,
            generic_damage_weight,
            survivability_weight,
            negative_resistance_penalty_weight,
            exo_policy=exo_policy,
        )
        if cheap_valid_state is not None:
            cheap_valid_states.append(cheap_valid_state)

        open_dofus_slots = [
            slot_name
            for slot_name, _ in SLOTS
            if is_dofus_slot(slot_name) and slot_name not in non_dofus_state.slots
        ]
        combo_size = len(open_dofus_slots)
        if combo_size not in ranked_combinations_by_size:
            ranked_combinations_by_size[combo_size] = ranked_dofus_combinations(
                dofus_pool,
                combo_size,
                dofus_combo_limit,
            )
        for dofus_candidate in ranked_combinations_by_size[combo_size]:
            if dofus_candidate.item_ids & non_dofus_state.used_item_ids:
                continue
            if not dofus_combination_can_meet_target(
                non_dofus_state,
                dofus_candidate,
                target,
                natural_cap_target,
            ):
                continue
            completed = complete_dofus_combination(
                non_dofus_state,
                dofus_candidate,
                sets,
                target,
                natural_cap_target,
            )
            if completed is None:
                continue
            cheap_valid_state = direct_cheap_valid_completed_state(
                completed,
                target,
                ap_strategies,
                generic_damage_weight,
                survivability_weight,
                negative_resistance_penalty_weight,
                exo_policy=exo_policy,
            )
            if cheap_valid_state is not None:
                cheap_valid_states.append(cheap_valid_state)

    cheap_valid_states = trim_full_item_signatures(
        cheap_valid_states,
        final_score_limit,
    )
    valid_final_states = [
        valid_state
        for valid_state in (
            direct_valid_completed_state(
                cheap_valid_state,
                target,
                ap_strategies,
                generic_damage_weight,
                weapon_damage_weight,
                survivability_weight,
                negative_resistance_penalty_weight,
                exo_policy=exo_policy,
            )
            for cheap_valid_state in cheap_valid_states
        )
        if valid_state is not None
    ]

    return dedupe_builds(sorted(valid_final_states, key=lambda state: state.score, reverse=True))


def collect_search_seed_stages(
    pools: dict[str, list[dict[str, Any]]],
    items: list[dict[str, Any]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    package_index: PackageIndex,
    action_package_index: PackageIndex,
    required_item_ids: set[str],
    exo_policy: str,
) -> tuple[SearchSeedStage, ...]:
    required_seeds = required_item_seed_states(
        required_item_ids,
        items,
        sets,
        target,
        search_target,
        natural_cap_target,
    )
    budget_action_trophy_seeds = (
        []
        if required_seeds
        else budget_action_trophy_seed_states(
            items,
            sets,
            target,
            search_target,
            natural_cap_target,
        )
    )
    budget_action_gear_seeds = (
        []
        if required_seeds
        else budget_action_gear_seed_states(
            pools,
            sets,
            target,
            search_target,
            natural_cap_target,
        )
    )
    action_stat_witness_seeds = (
        []
        if required_seeds
        else action_stat_witness_seed_states(
            pools,
            sets,
            target,
            search_target,
            natural_cap_target,
            exo_policy=exo_policy,
        )
    )
    set_package_seeds = package_seed_states(
        pools,
        sets,
        target,
        search_target,
        natural_cap_target,
        package_index=package_index,
    )
    action_package_seeds = package_seed_states(
        pools,
        sets,
        target,
        search_target,
        natural_cap_target,
        package_index=action_package_index,
    )
    ap_set_bonus_seeds = ap_set_bonus_seed_states(
        pools,
        sets,
        target,
        search_target,
        natural_cap_target,
    )
    return (
        SearchSeedStage("set_package", tuple(set_package_seeds)),
        SearchSeedStage("action_set_package", tuple(action_package_seeds), used_for_beam_fallback=True),
        SearchSeedStage("ap_set_bonus", tuple(ap_set_bonus_seeds)),
        SearchSeedStage("required_items", tuple(required_seeds), used_for_beam_fallback=bool(required_seeds)),
        SearchSeedStage("budget_action_trophy", tuple(budget_action_trophy_seeds), used_for_beam_fallback=True),
        SearchSeedStage("budget_action_gear", tuple(budget_action_gear_seeds), used_for_beam_fallback=True),
        SearchSeedStage("action_stat_witness", tuple(action_stat_witness_seeds)),
    )


def ap_set_bonus_seed_states(
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    limit: int = AP_SET_BONUS_SEED_LIMIT,
    limit_per_set: int = AP_SET_BONUS_SEED_LIMIT_PER_SET,
) -> list[BuildState]:
    seeds: list[BuildState] = []
    slot_order = tuple(slot_name for slot_name, _ in SLOTS)

    items_by_set: dict[str, dict[str, tuple[dict[str, Any], set[str]]]] = defaultdict(dict)
    for slot_name, pool in pools.items():
        for item in pool:
            set_id = item.get("setID")
            if not set_id:
                continue
            item_entry = items_by_set[set_id].setdefault(item["dofusID"], (item, set()))
            item_entry[1].add(slot_name)

    for set_id, set_data in sets.items():
        ap_thresholds = [
            int(count)
            for count, bonuses in set_data.get("bonuses", {}).items()
            if any(bonus.get("stat") == "AP" and bonus.get("value", 0) > 0 for bonus in bonuses)
        ]
        if not ap_thresholds or set_id not in items_by_set:
            continue

        threshold = min(ap_thresholds)
        set_items = [entry for entry in items_by_set[set_id].values()]
        if len(set_items) < threshold:
            continue

        set_seeds: list[BuildState] = []
        for item_entries in combinations(set_items, threshold):
            items = [entry[0] for entry in item_entries]
            slot_options = [
                sorted(entry[1], key=slot_order.index)
                for entry in item_entries
            ]
            for slots in product(*slot_options):
                if len(set(slots)) != len(slots):
                    continue

                state = BuildState()
                for slot_name, item in sorted(zip(slots, items), key=lambda pair: slot_order.index(pair[0])):
                    state = add_item_to_state(
                        state,
                        slot_name,
                        item,
                        sets,
                        search_target,
                        condition_target=target,
                        cap_target=natural_cap_target,
                    )
                    if state is None:
                        break
                if state is None or not has_ap_set_bonus(state):
                    continue
                set_seeds.append(state)

        set_seeds = dedupe_builds(sorted(set_seeds, key=lambda state: state.score, reverse=True))
        seeds.extend(set_seeds[:limit_per_set])

    return dedupe_builds(sorted(seeds, key=lambda state: state.score, reverse=True))[:limit]


def search_slot_order(
    slot_order: tuple[str, ...],
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    natural_cap_target: BuildTarget,
    beam_width: int,
    per_signature_cap: int,
    ap_strategy: ApStrategy | None = None,
    ap_strategies: tuple[ApStrategy, ...] | None = None,
    initial_seeds: list[BuildState] | None = None,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
    exo_policy: str = "allow",
) -> list[BuildState]:
    strategy_seeds = [BuildState()]
    if exo_policy == "none":
        seed_states = initial_seeds or strategy_seeds
    else:
        seed_states = strategy_seeds + (initial_seeds or [])
    beam = dedupe_builds(sorted(seed_states, key=lambda state: state.score, reverse=True))
    for slot_name in slot_order:
        if optional_empty_slot(slot_name, pools, target.level):
            continue
        next_states: list[BuildState] = []
        for state in beam:
            if slot_name in state.slots or optional_slot_choice(slot_name, target.level):
                next_states.append(state)
            if slot_name in state.slots:
                continue
            for item in pools[slot_name]:
                next_state = add_item_to_state(
                    state,
                    slot_name,
                    item,
                    sets,
                    search_target,
                    condition_target=target,
                    cap_target=natural_cap_target,
                )
                if next_state:
                    next_states.append(next_state)
        if exo_policy == "none":
            beam = trim_budget_beam(next_states, target, beam_width, per_signature_cap)
        else:
            beam = trim_beam(next_states, beam_width, per_signature_cap)

    return completed_valid_builds(
        beam,
        target,
        ap_strategy,
        ap_strategies=ap_strategies,
        generic_damage_weight=generic_damage_weight,
        weapon_damage_weight=weapon_damage_weight,
        survivability_weight=survivability_weight,
        negative_resistance_penalty_weight=negative_resistance_penalty_weight,
        exo_policy=exo_policy,
    )


def diversify_builds(states: list[BuildState], max_shared_items: int | None) -> list[BuildState]:
    if max_shared_items is None:
        return states

    diverse: list[BuildState] = []
    for state in states:
        if all(
            len(state.used_item_ids & selected.used_item_ids) <= max_shared_items
            for selected in diverse
        ):
            diverse.append(state)
    return diverse


def find_builds(
    top_k: int,
    beam_width: int,
    per_signature_cap: int,
    relevant_set_limit: int,
    target: BuildTarget = DEFAULT_TARGET,
    max_shared_items: int | None = DEFAULT_MAX_SHARED_ITEMS,
    excluded_item_ids: set[str] | None = None,
    required_item_ids: set[str] | None = None,
    budget_tier: int = 4,
    slot_orders: list[tuple[str, ...]] = DEFAULT_SLOT_ORDERS,
    ap_strategies: tuple[ApStrategy, ...] = DEFAULT_AP_STRATEGIES,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
    exo_policy: str = "allow",
    completion_target: int | None = None,
) -> list[BuildState]:
    required_item_ids = required_item_ids or set()
    if budget_tier < 3 and exo_policy in {"allow", "opti"}:
        exo_policy = "none"
    if exo_policy == "none" and ap_strategies == DEFAULT_AP_STRATEGIES:
        ap_strategies = DEFAULT_NO_EXO_AP_STRATEGIES
    ap_strategies = effective_ap_strategies_for_target(target, ap_strategies)
    completion_target = completion_target or top_k

    timings: dict[str, float] = {}
    started_at = time.perf_counter()
    items = load_items(target, excluded_item_ids, budget_tier)
    sets = load_sets()
    timings["loadDataMs"] = (time.perf_counter() - started_at) * 1000

    phase_started = time.perf_counter()
    items = [
        item
        for item in items
        if not item.get("setID") or not sets.get(item["setID"], {}).get("_excluded")
    ]
    relevant_sets = relevant_set_ids(items, sets, relevant_set_limit)
    search_target = exo_search_target(target)
    natural_cap_target = exo_natural_cap_target(target)
    pools = {
        slot_name: candidate_pool_for_slot(
            slot_types,
            items,
            relevant_sets,
            top_k,
            required_item_ids=required_item_ids,
            target_level=target.level,
        )
        for slot_name, slot_types in SLOTS
    }
    timings["candidatePoolsMs"] = (time.perf_counter() - phase_started) * 1000

    phase_started = time.perf_counter()
    package_index = build_package_index(
        pools,
        sets,
        target,
        search_target,
        natural_cap_target,
    )
    action_package_index = build_action_set_package_index(
        items,
        sets,
        target,
        search_target,
        natural_cap_target,
    )
    timings["packageIndexMs"] = (time.perf_counter() - phase_started) * 1000

    phase_started = time.perf_counter()
    seed_stages = collect_search_seed_stages(
        pools,
        items,
        sets,
        target,
        search_target,
        natural_cap_target,
        package_index,
        action_package_index,
        required_item_ids,
        exo_policy,
    )
    initial_seeds = dedupe_builds(
        sorted(
            [
                state
                for stage in seed_stages
                for state in stage.states
            ],
            key=lambda state: state.score,
            reverse=True,
        )
    )
    required_stage = next(stage for stage in seed_stages if stage.name == "required_items")
    required_seeds = list(required_stage.states)
    fallback_seed_stages = [
        stage
        for stage in seed_stages
        if stage.used_for_beam_fallback and stage.states
    ]

    direct_seed_limit = min(
        DIRECT_COMPLETION_SEED_LIMIT,
        max(top_k * 12, beam_width),
    )
    direct_gear_state_limit = min(
        DIRECT_COMPLETION_GEAR_STATE_LIMIT,
        max(top_k * 10, beam_width),
    )
    direct_dofus_combo_limit = DIRECT_COMPLETION_DOFUS_COMBO_LIMIT
    direct_final_score_limit = DIRECT_COMPLETION_FINAL_SCORE_LIMIT
    initial_seeds = initial_seeds[: max(direct_seed_limit, top_k * 20)]
    timings["packageSeedsMs"] = (time.perf_counter() - phase_started) * 1000

    valid_final_states = []
    phase_started = time.perf_counter()
    valid_final_states.extend(
        direct_complete_package_seeds(
            initial_seeds,
            pools,
            sets,
            target,
            search_target,
            natural_cap_target,
            ap_strategies,
            generic_damage_weight=generic_damage_weight,
            weapon_damage_weight=weapon_damage_weight,
            survivability_weight=survivability_weight,
            negative_resistance_penalty_weight=negative_resistance_penalty_weight,
            exo_policy=exo_policy,
            seed_limit=direct_seed_limit,
            gear_state_limit=direct_gear_state_limit,
            dofus_combo_limit=direct_dofus_combo_limit,
            final_score_limit=direct_final_score_limit,
        )
    )
    timings["directCompletionMs"] = (time.perf_counter() - phase_started) * 1000

    phase_started = time.perf_counter()
    if len(valid_final_states) < completion_target:
        if exo_policy == "none":
            beam_seed_groups = (
                [required_seeds]
                if required_seeds
                else [[]] + [list(stage.states) for stage in fallback_seed_stages]
            )
        else:
            beam_seed_groups = [initial_seeds]
        for slot_order in slot_orders:
            for beam_initial_seeds in beam_seed_groups:
                valid_final_states.extend(
                    search_slot_order(
                        slot_order=slot_order,
                        pools=pools,
                        sets=sets,
                        target=target,
                        search_target=search_target,
                        natural_cap_target=natural_cap_target,
                        beam_width=beam_width,
                        per_signature_cap=per_signature_cap,
                        ap_strategies=ap_strategies,
                        initial_seeds=beam_initial_seeds,
                        generic_damage_weight=generic_damage_weight,
                        weapon_damage_weight=weapon_damage_weight,
                        survivability_weight=survivability_weight,
                        negative_resistance_penalty_weight=negative_resistance_penalty_weight,
                        exo_policy=exo_policy,
                    )
                )
            if len(valid_final_states) >= completion_target and exo_policy != "none":
                break
    timings["beamSearchMs"] = (time.perf_counter() - phase_started) * 1000

    phase_started = time.perf_counter()
    ranked_states = dedupe_builds(sorted(valid_final_states, key=lambda s: s.score, reverse=True))
    diversified = diversify_builds(ranked_states, max_shared_items)
    timings["rankAndDiversifyMs"] = (time.perf_counter() - phase_started) * 1000
    timings["totalFindBuildsMs"] = (time.perf_counter() - started_at) * 1000
    LAST_FIND_BUILD_TIMINGS.clear()
    LAST_FIND_BUILD_TIMINGS.update(timings)
    return diversified


def approach_item_ids(state: BuildState) -> set[str]:
    key_slots = ("amulet", "belt", "weapon", "shield", "hat", "cloak")
    return {
        state.slots[slot]["dofusID"]
        for slot in key_slots
        if slot in state.slots
    } | {
        item["dofusID"]
        for item in state.slots.values()
        if item.get("setID")
        and state.set_counts.get(item["setID"], 0) >= 2
    }


def approach_key(state: BuildState) -> tuple[str | None, ...]:
    key_slots = ("amulet", "belt", "weapon", "shield", "hat", "cloak")
    used_sets = tuple(
        sorted(set_id for set_id, count in state.set_counts.items() if count >= 2)
    )
    return (
        state.ap_strategy,
        "ap_set_bonus" if has_ap_set_bonus(state) else "no_ap_set_bonus",
    ) + tuple(state.slots.get(slot, {}).get("dofusID") for slot in key_slots) + used_sets


def find_diverse_builds(
    limit: int,
    top_k: int,
    beam_width: int,
    per_signature_cap: int,
    relevant_set_limit: int,
    target: BuildTarget = DEFAULT_TARGET,
    max_shared_items: int | None = DEFAULT_MAX_SHARED_ITEMS,
    excluded_item_ids: set[str] | None = None,
    required_item_ids: set[str] | None = None,
    budget_tier: int = 4,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
    survivability_weight: float = 1.0,
    negative_resistance_penalty_weight: float = 0.0,
    exo_policy: str = "allow",
) -> list[BuildState]:
    if budget_tier < 3 and exo_policy in {"allow", "opti"}:
        exo_policy = "none"

    required_item_ids = required_item_ids or set()
    LAST_FIND_BUILD_FALLBACK.clear()
    candidates = find_builds(
        top_k=top_k,
        beam_width=beam_width,
        per_signature_cap=per_signature_cap,
        relevant_set_limit=relevant_set_limit,
        target=target,
        max_shared_items=None,
        excluded_item_ids=excluded_item_ids,
        required_item_ids=required_item_ids,
        budget_tier=budget_tier,
        generic_damage_weight=generic_damage_weight,
        weapon_damage_weight=weapon_damage_weight,
        survivability_weight=survivability_weight,
        negative_resistance_penalty_weight=negative_resistance_penalty_weight,
        exo_policy=exo_policy,
        completion_target=max(top_k, limit * 10),
    )
    selected_budget_tier = budget_tier
    if not candidates and budget_tier > 1:
        for fallback_budget_tier in range(budget_tier - 1, 0, -1):
            candidates = find_builds(
                top_k=top_k,
                beam_width=beam_width,
                per_signature_cap=per_signature_cap,
                relevant_set_limit=relevant_set_limit,
                target=target,
                max_shared_items=None,
                excluded_item_ids=excluded_item_ids,
                required_item_ids=required_item_ids,
                budget_tier=fallback_budget_tier,
                generic_damage_weight=generic_damage_weight,
                weapon_damage_weight=weapon_damage_weight,
                survivability_weight=survivability_weight,
                negative_resistance_penalty_weight=negative_resistance_penalty_weight,
                exo_policy=exo_policy,
                completion_target=max(top_k, limit * 10),
            )
            if candidates:
                selected_budget_tier = fallback_budget_tier
                LAST_FIND_BUILD_FALLBACK.update(
                    {
                        "requestedBudgetTier": budget_tier,
                        "usedBudgetTier": fallback_budget_tier,
                    }
                )
                break

    selected: list[BuildState] = []
    seen_item_signatures: set[tuple[str, ...]] = set()
    seen_approaches: set[tuple[str | None, ...]] = set()
    for candidate in candidates:
        if required_item_ids and not required_item_ids <= candidate.used_item_ids:
            continue
        item_signature = tuple(sorted(candidate.used_item_ids))
        if item_signature in seen_item_signatures:
            continue
        candidate_approach = approach_key(candidate)
        if candidate_approach in seen_approaches:
            continue
        if max_shared_items is not None and any(
            len(candidate.used_item_ids & existing.used_item_ids) > max_shared_items
            for existing in selected
        ):
            continue

        selected.append(candidate)
        seen_item_signatures.add(item_signature)
        seen_approaches.add(candidate_approach)
        if len(selected) >= limit:
            break

    if not selected and selected_budget_tier == budget_tier:
        LAST_FIND_BUILD_FALLBACK.clear()
    return selected


def query_warnings(query: BuildDiscoveryQuery) -> list[str]:
    warnings = []
    if not (query.class_name == "Iop" and query.primary_element == "strength"):
        warnings.append(
            "Class/element spell scoring is rotation-lite; only Strength Iop has a reviewed high-confidence rotation profile."
        )
    if query.locked_item_ids:
        warnings.append("lockedItemIds are used as search seeds and enforced as final result requirements.")
    if query.budget_tier < 3 and query.exo_policy in {"allow", "opti"}:
        warnings.append("Generated exos require budget tier 3 or higher; effective exo behavior is none.")
    if query.budget_tier != 4 and query.exo_policy == "opti":
        warnings.append("exoPolicy=opti may conflict with non-opti budget tiers.")
    return warnings


def fallback_budget_warning() -> str | None:
    if not LAST_FIND_BUILD_FALLBACK:
        return None
    return (
        "Requested budget tier search returned no builds; results were generated "
        f"from stricter budget tier {LAST_FIND_BUILD_FALLBACK['usedBudgetTier']}."
    )


def result_warnings(query: BuildDiscoveryQuery, builds: list[BuildState]) -> list[str]:
    warnings = query_warnings(query)
    if builds:
        return warnings

    if (
        effective_exo_policy(query) == "none"
        and query.ap_target == MAX_AP
        and query.mp_target == MAX_MP
        and query.range_target == MAX_RANGE
    ):
        warnings.append(
            "No builds found for max AP/MP/Range under no-exo constraints; this may be infeasible "
            "for the selected budget or a remaining search coverage gap."
        )
    else:
        warnings.append(
            "No builds found; this may be infeasible for the selected constraints or a remaining search coverage gap."
        )
    return warnings


def build_discovery_response(
    query: BuildDiscoveryQuery,
    use_cache: bool = True,
) -> dict[str, Any]:
    query.validate()
    with target_level_context(query.level):
        return build_discovery_response_for_active_level(query, use_cache)


def build_discovery_response_for_active_level(
    query: BuildDiscoveryQuery,
    use_cache: bool = True,
) -> dict[str, Any]:
    profile = configure_damage_profile(query.primary_element, query.class_name)
    generic_damage_weight = effective_generic_damage_weight(query)
    survivability_weight = effective_survivability_weight(query)
    negative_resistance_penalty_weight = effective_negative_resistance_penalty_weight(query)
    current_dataset_version = dataset_version()
    cache_key = query_cache_key(query, current_dataset_version)
    if use_cache and cache_key in BUILD_DISCOVERY_RESPONSE_CACHE:
        cached = clone_response(BUILD_DISCOVERY_RESPONSE_CACHE[cache_key])
        cached["cache"] = {
            "status": "hit",
            "storage": "process_memory",
        }
        cached.setdefault("diagnostics", {})["cacheHit"] = True
        cached["diagnostics"]["elapsedMs"] = 0.0
        return cached

    start = time.perf_counter()
    builds = find_diverse_builds(
        limit=query.limit,
        top_k=query.top_k,
        beam_width=query.beam_width,
        per_signature_cap=query.per_signature_cap,
        relevant_set_limit=query.relevant_set_limit,
        target=query.target,
        max_shared_items=query.max_shared_items,
        excluded_item_ids=set(query.avoided_item_ids),
        required_item_ids=set(query.locked_item_ids),
        budget_tier=query.budget_tier,
        generic_damage_weight=generic_damage_weight,
        weapon_damage_weight=query.weapon_damage_weight,
        survivability_weight=survivability_weight,
        negative_resistance_penalty_weight=negative_resistance_penalty_weight,
        exo_policy=effective_exo_policy(query),
    )
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    sets = load_sets()

    warnings = result_warnings(query, builds)
    fallback_warning = fallback_budget_warning()
    if fallback_warning:
        warnings.append(fallback_warning)

    response = {
        "datasetVersion": current_dataset_version,
        "solverVersion": SOLVER_VERSION,
        "cacheKey": cache_key,
        "cache": {
            "status": "miss",
            "storage": "process_memory",
        },
        "status": "complete",
        "query": query_summary(query),
        "targetSemantics": target_semantics_response(),
        "prototype": f"level_{query.level}_{query.class_name}_{profile.name}_pvm_generalist",
        "profile": {
            "className": query.class_name,
            "name": profile.name,
            "primaryStat": profile.primary_stat,
            "element": profile.element,
            "damageStat": profile.damage_stat,
            "confidence": active_damage_profile_confidence(),
            "rotationModel": active_rotation_model_name(),
            "spellCandidateCount": len(active_spell_candidates()),
        },
        "target": {"level": query.level, "AP": query.target.ap, "MP": query.target.mp, "Range": query.target.range},
        "scoring": {
            "damageSurvivabilityPreset": query.damage_survivability_preset,
            "genericDamageWeight": generic_damage_weight,
            "weaponDamageWeight": query.weapon_damage_weight,
            "survivabilityWeight": survivability_weight,
            "negativeResistancePenaltyWeight": negative_resistance_penalty_weight,
            "rangeSoftWeight": active_range_soft_weight(),
        },
        "warnings": warnings,
        "diagnostics": {
            "elapsedMs": elapsed_ms,
            "cacheHit": False,
            "timings": {key: round(value, 1) for key, value in LAST_FIND_BUILD_TIMINGS.items()},
            "resultCount": len(builds),
            "fallbackBudget": dict(LAST_FIND_BUILD_FALLBACK) if LAST_FIND_BUILD_FALLBACK else None,
        },
        "builds": [serialize_build(build, sets) for build in builds],
    }
    if use_cache:
        BUILD_DISCOVERY_RESPONSE_CACHE[cache_key] = clone_response(response)
    return response


def serialize_build(state: BuildState, sets: dict[str, dict[str, Any]]) -> dict[str, Any]:
    scoring_stats = effective_scoring_stats(state)
    total_stats = {
        "AP": state.stats.get("AP", 0),
        "MP": state.stats.get("MP", 0),
        "Range": state.stats.get("Range", 0),
        ACTIVE_DAMAGE_PROFILE.primary_stat: state.stats.get(ACTIVE_DAMAGE_PROFILE.primary_stat, 0),
        "Power": state.stats.get("Power", 0),
        "Vitality": state.stats.get("Vitality", 0),
        "Damage": state.stats.get("Damage", 0),
        ACTIVE_DAMAGE_PROFILE.damage_stat: state.stats.get(ACTIVE_DAMAGE_PROFILE.damage_stat, 0),
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
        "genericDamageScore": round(normalized_profile_damage_score(scoring_stats, state), 2),
        "rawRotationDamageScore": round(raw_rotation_damage, 2),
        "spellDamageScore": round(spell_only_damage, 2),
        "profileBaselineDamageScore": round(profile_baseline_damage, 2),
        "profileRelativeDamage": round(raw_rotation_damage / profile_baseline_damage, 4),
        "weaponDamageScore": round(state_weapon_damage(state, scoring_stats), 2),
        "survivabilityScore": round(survivability_score(scoring_stats), 2),
        "negativeResistancePenalty": round(negative_resistance_penalty(scoring_stats), 2),
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
                    (slot for slot, item in state.slots.items() if item["dofusID"] == item_id),
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
                "set": sets.get(item.get("setID"), {}).get("_name") if item.get("setID") else None,
            }
            for slot, item in state.slots.items()
        },
    }


def parse_optional_range_target(value: str) -> int | None:
    if value.lower() in {"none", "any"}:
        return None
    return int(value)


def build_query_from_cli_args(args: argparse.Namespace) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        class_name=args.class_name,
        level=args.level,
        elements=(args.element,),
        ap_target=args.target_ap,
        mp_target=args.target_mp,
        range_target=args.target_range,
        damage_survivability_preset=args.damage_survivability_preset,
        budget_tier=args.budget_tier,
        exo_policy=args.exo_policy,
        locked_item_ids=tuple(args.locked_item_id),
        avoided_item_ids=tuple(args.avoided_item_id),
        limit=args.limit,
        top_k=args.top_k,
        beam_width=args.beam_width,
        per_signature_cap=args.per_signature_cap,
        relevant_set_limit=args.relevant_set_limit,
        max_shared_items=args.max_shared_items,
        generic_damage_weight=args.generic_damage_weight,
        weapon_damage_weight=args.weapon_damage_weight,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--class-name", "--class", choices=SUPPORTED_CLASS_NAMES, default="Iop")
    parser.add_argument("--level", type=int, default=TARGET_LEVEL)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--top-k", type=int, default=25)
    parser.add_argument("--beam-width", type=int, default=250)
    parser.add_argument("--per-signature-cap", type=int, default=40)
    parser.add_argument("--relevant-set-limit", type=int, default=60)
    parser.add_argument("--target-ap", "--ap", dest="target_ap", type=int, default=DEFAULT_TARGET.ap)
    parser.add_argument("--target-mp", "--mp", dest="target_mp", type=int, default=DEFAULT_TARGET.mp)
    parser.add_argument(
        "--target-range",
        "--range",
        dest="target_range",
        type=parse_optional_range_target,
        default=DEFAULT_TARGET.range,
    )
    parser.add_argument("--element", choices=sorted(ELEMENT_PROFILES), default="strength")
    parser.add_argument("--damage-survivability-preset", type=int, default=4)
    parser.add_argument("--budget-tier", type=int, default=2)
    parser.add_argument("--exo-policy", choices=("none", "allow", "opti"), default="allow")
    parser.add_argument("--locked-item-id", action="append", default=[])
    parser.add_argument("--avoided-item-id", action="append", default=[])
    parser.add_argument("--max-shared-items", type=int, default=DEFAULT_MAX_SHARED_ITEMS)
    parser.add_argument("--generic-damage-weight", type=float, default=GENERIC_DAMAGE_WEIGHT)
    parser.add_argument("--weapon-damage-weight", type=float, default=WEAPON_DAMAGE_WEIGHT)
    args = parser.parse_args()

    query = build_query_from_cli_args(args)
    print(json.dumps(build_discovery_response(query), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
