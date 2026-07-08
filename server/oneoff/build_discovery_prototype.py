"""Narrow build-discovery prototype for DofusLab.

This reads the local database and prints candidate Level 200 Strength PvM builds
without touching GraphQL. The goal is to make the search/ranking loop easy to
inspect before wiring it into product code.

Known prototype limitations:
- trophy/dofus exclusivity rules are not modeled
- scoring uses old local spell data where available and a generic fallback
"""

from __future__ import annotations

import argparse
import json
import time
from collections import defaultdict
from dataclasses import dataclass, field
from functools import lru_cache
from itertools import combinations, product
from typing import Any, Iterable

from oneoff.condition_evaluator import (
    condition_can_pass_at_target,
    target_forced_conditions_hold,
    unmet_item_conditions,
)
from oneoff.damage_calculator import DamageLine, profile_damage

TARGET_LEVEL = 200
RELEVANT_SET_ITEM_MIN_LEVEL = 180
BASE_AP = 7 if TARGET_LEVEL >= 100 else 6
BASE_MP = 3
REQUIRED_AP = 11
REQUIRED_MP = 6
REQUIRED_RANGE = 0
MAX_AP = 12
MAX_MP = 6
ACTION_STATS = ("AP", "MP", "Range")
ACTION_STAT_SOURCE_LIMIT = 4
ACTION_STAT_SOURCE_MIN_LEVEL = 180
DOFUS_ACTION_STAT_SOURCE_LIMIT = 1
DOFUS_AP_SOURCE_LIMIT = 2
DOFUS_ZERO_SCORE_FILLER_LIMIT = 4
AP_SET_BONUS_SEED_LIMIT = 80
AP_SET_BONUS_SEED_LIMIT_PER_SET = 12
SET_PACKAGE_SIZES = (2, 3)
SET_PACKAGE_KEEP_PER_SET_SIZE = 10
SET_PACKAGE_GLOBAL_LIMIT = 500
SET_PACKAGE_PAIR_SEED_LIMIT = 800
SET_PACKAGE_TRIPLE_SOURCE_LIMIT = 250
SET_PACKAGE_TRIPLE_SEED_LIMIT = 300
SET_PACKAGE_DIVERSE_TRIPLE_SEED_LIMIT = 700
SET_PACKAGE_TOTAL_SEED_LIMIT = 1500
DIRECT_COMPLETION_MIN_FILLED_GEAR_SLOTS = 8
DIRECT_COMPLETION_SEED_LIMIT = 700
DIRECT_COMPLETION_NON_DOFUS_BEAM_WIDTH = 20
DIRECT_COMPLETION_DOFUS_POOL_LIMIT = 22
DIRECT_COMPLETION_GEAR_STATE_LIMIT = 300
DIRECT_COMPLETION_GEAR_STATE_PER_SIGNATURE_CAP = 6
DIRECT_COMPLETION_DOFUS_COMBO_LIMIT = 500
DIRECT_COMPLETION_SPECIAL_DOFUS_IDS = {"7754", "8698", "6980"}
GENERIC_DAMAGE_WEIGHT = 0.45
WEAPON_DAMAGE_WEIGHT = 0.20
GENERIC_STRENGTH_DAMAGE_PROFILE = [
    DamageLine(element="earth", base_min=30, base_max=34, crit_chance=15, weight=1.0),
    DamageLine(element="earth", base_min=42, base_max=48, crit_chance=15, weight=0.75),
    DamageLine(element="earth", base_min=18, base_max=22, crit_chance=25, weight=1.25),
]
SPELL_PROFILE_CLASS_NAME = "Iop"
SPELL_DAMAGE_PROFILE_TURN_AP = 10
SPELL_PROFILE_ELEMENTS = {
    "NEUTRAL_DAMAGE": "neutral",
    "NEUTRAL_STEAL": "neutral",
    "EARTH_DAMAGE": "earth",
    "EARTH_STEAL": "earth",
    "BEST_ELEMENT_DAMAGE": "earth",
    "BEST_ELEMENT_STEAL": "earth",
}
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
BASE_STATS = {
    "AP": BASE_AP,
    "MP": BASE_MP,
    "Vitality": 495,
    "Wisdom": 100,
    "Strength": 400,
    "Intelligence": 100,
    "Chance": 100,
    "Agility": 100,
}
BASE_CHARACTERISTIC_POINTS = 995
SCROLLED_BASE_STAT = 100
BASE_STRENGTH_ALLOCATION_OPTIONS = (0, 100, 200, 250, 300, 350, 375, 398)

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

PERCENT_RESISTANCE_WEIGHT = 2.0
SURVIVABILITY_SCORE_WEIGHT = 0.03
SORTED_ELEMENT_EHP_WEIGHTS = (0.4, 0.25, 0.15, 0.1, 0.1)
GENERIC_INCOMING_HIT = 350
GENERIC_INCOMING_CRIT_RATE = 0.2
GENERIC_INCOMING_PUSHBACK_RATE = 0.02
GENERIC_INCOMING_RANGED_RATE = 0.7
DAMAGE_BUFF_EXPECTED_STACK_RATIO = 0.4
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
    "Lock": 0.5,
    "Dodge": 1.0,
    "% Final Damage": 8.0,
    "% Spell Damage": 6.0,
    "% Weapon Damage": 2.0,
    "% Melee Damage": 3.2,
    "% Ranged Damage": 4.8,
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
DAMAGE_SCORING_STATS = {
    "Strength",
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
FINAL_UTILITY_STAT_WEIGHTS = {
    stat: weight
    for stat, weight in STAT_WEIGHTS.items()
    if stat not in DAMAGE_SCORING_STATS and stat not in SURVIVABILITY_SCORING_STATS
}
DOMINANCE_STATS = ("AP", "MP", "Range")

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
class BuildTarget:
    ap: int = REQUIRED_AP
    mp: int = REQUIRED_MP
    range: int = REQUIRED_RANGE

    def __post_init__(self) -> None:
        if self.ap > MAX_AP:
            raise ValueError(f"Target AP cannot exceed {MAX_AP}.")
        if self.mp > MAX_MP:
            raise ValueError(f"Target MP cannot exceed {MAX_MP}.")

    @property
    def condition_stats(self) -> dict[str, int]:
        return {"AP": self.ap, "MP": self.mp, "Range": self.range}


DEFAULT_TARGET = BuildTarget()
DEFAULT_MAX_SHARED_ITEMS = 10
LAST_FIND_BUILD_TIMINGS: dict[str, float] = {}


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
SHAKER_TROPHY_ID = "16333"
MANDATORY_DOFUS_CANDIDATE_IDS = {OCHRE_DOFUS_ID}
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


def exo_search_target(final_target: BuildTarget) -> BuildTarget:
    return BuildTarget(
        ap=max(BASE_AP, final_target.ap - 1),
        mp=max(BASE_MP, final_target.mp - 1),
        range=max(0, final_target.range - 1),
    )


def exo_natural_cap_target(final_target: BuildTarget) -> BuildTarget:
    return BuildTarget(
        ap=max(BASE_AP, final_target.ap - 1),
        mp=final_target.mp,
        range=final_target.range,
    )


def pending_dofus_search_target(final_target: BuildTarget) -> BuildTarget:
    return BuildTarget(
        ap=max(BASE_AP, final_target.ap - 2),
        mp=max(BASE_MP, final_target.mp - 2),
        range=max(0, final_target.range - 1),
    )


@dataclass
class BuildState:
    slots: dict[str, dict[str, Any]] = field(default_factory=dict)
    stats: dict[str, int] = field(default_factory=lambda: dict(BASE_STATS))
    set_counts: dict[str, int] = field(default_factory=dict)
    used_item_ids: set[str] = field(default_factory=set)
    exos: dict[str, str] = field(default_factory=dict)
    base_allocation: dict[str, int] = field(default_factory=lambda: {"Strength": 300, "Vitality": 395})
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

    @property
    def slots(self) -> frozenset[str]:
        return frozenset(slot_name for slot_name, _ in self.entries)

    @property
    def item_ids(self) -> frozenset[str]:
        return frozenset(item["dofusID"] for _, item in self.entries)


@dataclass(frozen=True)
class PackageIndex:
    packages: tuple[PackageCandidate, ...]

    @property
    def by_set_signature(self) -> dict[tuple[str, ...], list[PackageCandidate]]:
        buckets: dict[tuple[str, ...], list[PackageCandidate]] = defaultdict(list)
        for package in self.packages:
            buckets[package_group_set_signature((package,))].append(package)
        return buckets


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


def score_stats_with_weights(stats: dict[str, int], weights: dict[str, float]) -> float:
    return sum(
        min(stats.get(stat, 0), STAT_SCORE_CAPS.get(stat, float("inf"))) * weight
        for stat, weight in weights.items()
    )


def score_stats(stats: dict[str, int]) -> float:
    return score_stats_with_weights(stats, STAT_WEIGHTS)


def final_utility_score(stats: dict[str, int]) -> float:
    return score_stats_with_weights(stats, FINAL_UTILITY_STAT_WEIGHTS)


def item_score(item: dict[str, Any]) -> float:
    return score_stats(normalize_stats(item.get("stats", [])))


def expected_item_effect_stats(item: dict[str, Any]) -> dict[str, float]:
    stats: dict[str, float] = defaultdict(float)
    for buff in item.get("buffs", []):
        stat = buff.get("stat")
        if not stat:
            continue
        stats[stat] += (
            (buff.get("incrementBy") or 0)
            * (buff.get("maxStacks") or 1)
            * DAMAGE_BUFF_EXPECTED_STACK_RATIO
        )
    for stat, value in SPECIAL_EFFECT_EXPECTED_STATS_BY_DOFUS_ID.get(item.get("dofusID"), {}).items():
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
        (score_stats(normalize_stats(bonus_lines)) for bonus_lines in set_obj.get("bonuses", {}).values()),
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
def load_all_item_records() -> tuple[dict[str, Any], ...]:
    from sqlalchemy import or_
    from sqlalchemy.orm import joinedload

    from app import session_scope
    from app.database.model_item import ModelItem
    from app.database.model_item_type import ModelItemType
    from app.database.model_weapon_stat import ModelWeaponStat

    with session_scope() as db_session:
        db_items = (
            db_session.query(ModelItem)
            .join(ModelItem.item_type)
            .options(
                joinedload(ModelItem.item_translations),
                joinedload(ModelItem.stats),
                joinedload(ModelItem.buffs),
                joinedload(ModelItem.item_type).joinedload(ModelItemType.item_type_translation),
                joinedload(ModelItem.weapon_stats).joinedload(ModelWeaponStat.weapon_effects),
            )
            .filter(ModelItem.level <= TARGET_LEVEL)
            .filter(or_(ModelItem.dofus_db_id.isnot(None), ModelItem.dofus_db_mount_id.isnot(None)))
            .all()
        )
        items = tuple(
            {
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
        item["_score"] = score_stats(item["_stats"])
    return items


def load_items(
    target: BuildTarget = DEFAULT_TARGET,
    excluded_item_ids: set[str] | None = None,
) -> list[dict[str, Any]]:
    excluded_item_ids = excluded_item_ids or set()
    items = load_all_item_records()
    candidates = [
        item
        for item in items
        if item.get("level", 0) <= TARGET_LEVEL
        and item.get("dofusID") not in excluded_item_ids
        and condition_can_pass_at_target(
            item.get("conditions", {}).get("conditions", {}),
            target.condition_stats,
        )
    ]
    return candidates


@lru_cache(maxsize=1)
def load_sets() -> dict[str, dict[str, Any]]:
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
) -> list[dict[str, Any]]:
    is_dofus_slot = all(slot_type in {"Dofus", "Trophy", "Prysmaradite"} for slot_type in slot_types)
    is_pet_slot = any(slot_type in {"Pet", "Petsmount", "Mount"} for slot_type in slot_types)
    compatible = [item for item in items if item.get("itemType") in slot_types]
    relevant_set_items = [
        item
        for item in compatible
        if item.get("setID") in relevant_sets
        and item.get("level", 0) >= RELEVANT_SET_ITEM_MIN_LEVEL
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
            for item in search_compatible
            if item["_stats"].get(stat, 0) > 0
            and (is_dofus_slot or item.get("level", 0) >= ACTION_STAT_SOURCE_MIN_LEVEL)
        ]
        for item in sorted(
            stat_sources,
            key=lambda i: (i["_score"], i.get("level", 0)),
            reverse=True,
        )[:stat_source_limit]:
            selected[item["dofusID"]] = item

    for item in relevant_set_items:
        selected[item["dofusID"]] = item

    return sorted(selected.values(), key=lambda i: i["_score"], reverse=True)


def apply_stat_delta(stats: dict[str, int], stat_lines: Iterable[dict[str, Any]], multiplier: int = 1) -> None:
    for stat, value in normalize_stats(stat_lines).items():
        stats[stat] = stats.get(stat, 0) + (value * multiplier)


def add_item_to_state(
    state: BuildState,
    slot_name: str,
    item: dict[str, Any],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget = DEFAULT_TARGET,
    condition_target: BuildTarget | None = None,
    cap_target: BuildTarget | None = None,
) -> BuildState | None:
    condition_target = condition_target or target
    cap_target = cap_target or target
    if item["dofusID"] in state.used_item_ids:
        return None

    next_state = state.clone()
    next_state.slots[slot_name] = item
    next_state.used_item_ids.add(item["dofusID"])
    apply_stat_delta(next_state.stats, item.get("stats", []))

    set_id = item.get("setID")
    if set_id and set_id in sets:
        previous_count = next_state.set_counts.get(set_id, 0)
        next_count = previous_count + 1
        next_state.set_counts[set_id] = next_count
        previous_bonus = sets[set_id].get("bonuses", {}).get(str(previous_count), [])
        bonus = sets[set_id].get("bonuses", {}).get(str(next_count), [])
        apply_stat_delta(next_state.stats, previous_bonus, multiplier=-1)
        apply_stat_delta(next_state.stats, bonus)

    if next_state.stats.get("AP", 0) > cap_target.ap or next_state.stats.get("MP", 0) > cap_target.mp:
        return None

    next_state.score = score_state(next_state, sets, target, final=False)
    if not target_forced_conditions_hold(next_state, condition_target.condition_stats):
        return None
    return next_state


def eligible_for_exo(item: dict[str, Any], stat: str) -> bool:
    item_stats = item.get("_stats") or normalize_stats(item.get("stats", []))
    return item.get("itemType") in EXO_ELIGIBLE_ITEM_TYPES and item_stats.get(stat, 0) == 0


def apply_missing_exos(state: BuildState, target: BuildTarget) -> BuildState | None:
    next_state = state.clone()
    for stat, target_value in (("AP", target.ap), ("MP", target.mp), ("Range", target.range)):
        missing = target_value - next_state.stats.get(stat, 0)
        if missing <= 0:
            continue
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
        next_bonus = sets.get(set_id, {}).get("bonuses", {}).get(str(count + 1))
        if next_bonus:
            potential += 0.25 * score_stats(normalize_stats(next_bonus))
    return potential


def score_state(
    state: BuildState,
    sets: dict[str, dict[str, Any]],
    target: BuildTarget = DEFAULT_TARGET,
    final: bool = False,
) -> float:
    score = score_stats(state.stats)
    ap_gap = max(target.ap - state.stats.get("AP", 0), 0)
    mp_gap = max(target.mp - state.stats.get("MP", 0), 0)
    range_gap = max(target.range - state.stats.get("Range", 0), 0)
    score -= ap_gap * 500
    score -= mp_gap * 75
    score -= range_gap * 25
    if not final:
        score += potential_set_bonus_score(state, sets)
    return score


def weapon_damage_lines(item: dict[str, Any]) -> list[DamageLine]:
    weapon_stats = item.get("weaponStats")
    if not weapon_stats:
        return []

    crit_chance = weapon_stats.get("baseCritChance") or 0
    crit_bonus_damage = weapon_stats.get("critBonusDamage") or 0
    lines = []
    for effect in weapon_stats.get("weaponEffects", []):
        element = WEAPON_EFFECT_ELEMENTS.get(effect.get("effectType"))
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


@lru_cache(maxsize=1)
def strength_spell_damage_profile() -> tuple[DamageLine, ...]:
    try:
        from sqlalchemy.orm import joinedload

        from app import session_scope
        from app.database.model_class import ModelClass
        from app.database.model_class_translation import ModelClassTranslation
        from app.database.model_spell import ModelSpell
        from app.database.model_spell_stats import ModelSpellStats
        from app.database.model_spell_translation import ModelSpellTranslation
        from app.database.model_spell_variant_pair import ModelSpellVariantPair
    except Exception:
        return tuple(GENERIC_STRENGTH_DAMAGE_PROFILE)

    try:
        with session_scope() as db_session:
            spell_stats = (
                db_session.query(ModelSpellStats)
                .join(ModelSpell, ModelSpellStats.spell_id == ModelSpell.uuid)
                .join(ModelSpellVariantPair, ModelSpell.spell_variant_pair_id == ModelSpellVariantPair.uuid)
                .join(ModelClass, ModelSpellVariantPair.class_id == ModelClass.uuid)
                .join(ModelClassTranslation, ModelClassTranslation.class_id == ModelClass.uuid)
                .join(ModelSpellTranslation, ModelSpellTranslation.spell_id == ModelSpell.uuid)
                .options(joinedload(ModelSpellStats.spell_effects))
                .filter(
                    ModelClassTranslation.locale == "en",
                    ModelClassTranslation.name == SPELL_PROFILE_CLASS_NAME,
                    ModelSpellTranslation.locale == "en",
                    ModelSpellStats.level <= TARGET_LEVEL,
                )
                .order_by(ModelSpellTranslation.name, ModelSpellStats.level.desc())
                .all()
            )
    except Exception:
        return tuple(GENERIC_STRENGTH_DAMAGE_PROFILE)

    highest_stats_by_spell_id: dict[str, Any] = {}
    for spell_stat in spell_stats:
        spell_id = str(spell_stat.spell_id)
        if spell_id not in highest_stats_by_spell_id:
            highest_stats_by_spell_id[spell_id] = spell_stat

    lines: list[DamageLine] = []
    spell_count = 0
    for spell_stat in highest_stats_by_spell_id.values():
        spell_lines: list[DamageLine] = []
        for effect in spell_stat.spell_effects:
            element = SPELL_PROFILE_ELEMENTS.get(effect_type_key(effect.effect_type))
            if not element or effect.min_damage is None:
                continue
            spell_lines.append(
                DamageLine(
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
                    crit_chance=int_or_zero(spell_stat.base_crit_chance),
                    weight=1 / max(spell_stat.ap_cost or 1, 1),
                )
            )
        if spell_lines:
            spell_count += 1
            lines.extend(spell_lines)

    if not lines or spell_count == 0:
        return tuple(GENERIC_STRENGTH_DAMAGE_PROFILE)

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
            weight=line.weight * SPELL_DAMAGE_PROFILE_TURN_AP / spell_count,
        )
        for line in lines
    )


def strength_spell_damage(stats: dict[str, int]) -> float:
    return profile_damage(list(strength_spell_damage_profile()), stats)


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


def strength_point_cost(base_strength: int) -> int:
    if base_strength < 0:
        raise ValueError("Base strength cannot be negative.")
    first = min(base_strength, 100)
    second = min(max(base_strength - 100, 0), 100) * 2
    third = min(max(base_strength - 200, 0), 100) * 3
    fourth = max(base_strength - 300, 0) * 4
    return first + second + third + fourth


def base_stats_for_strength_allocation(base_strength: int) -> dict[str, int]:
    cost = strength_point_cost(base_strength)
    if cost > BASE_CHARACTERISTIC_POINTS:
        raise ValueError(f"Base strength allocation exceeds available points: {base_strength}")
    base_vitality = BASE_CHARACTERISTIC_POINTS - cost
    return {
        **BASE_STATS,
        "Strength": SCROLLED_BASE_STAT + base_strength,
        "Vitality": SCROLLED_BASE_STAT + base_vitality,
    }


def state_with_base_allocation(state: BuildState, base_strength: int) -> BuildState:
    allocated_base_stats = base_stats_for_strength_allocation(base_strength)
    next_state = state.clone()
    next_state.base_allocation = {
        "Strength": base_strength,
        "Vitality": allocated_base_stats["Vitality"] - SCROLLED_BASE_STAT,
    }
    for stat, allocated_value in allocated_base_stats.items():
        current_base_value = BASE_STATS.get(stat, 0)
        next_state.stats[stat] = next_state.stats.get(stat, 0) - current_base_value + allocated_value
    return next_state


def optimize_base_allocation(
    state: BuildState,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> BuildState:
    best_state: BuildState | None = None
    for base_strength in BASE_STRENGTH_ALLOCATION_OPTIONS:
        allocated_state = state_with_base_allocation(state, base_strength)
        allocated_state.score = final_score_state(
            allocated_state,
            generic_damage_weight=generic_damage_weight,
            weapon_damage_weight=weapon_damage_weight,
        )
        if best_state is None or allocated_state.score > best_state.score:
            best_state = allocated_state
    if best_state is None:
        raise RuntimeError("No legal base stat allocation found.")
    return best_state


def final_score_state(
    state: BuildState,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> float:
    stats = effective_scoring_stats(state)
    return (
        final_utility_score(stats)
        + strength_spell_damage(stats) * generic_damage_weight
        + state_weapon_damage(state, stats) * weapon_damage_weight
        + survivability_score(stats)
    )


def item_stat_total(state: BuildState, stat: str) -> int:
    return sum(item["_stats"].get(stat, 0) for item in state.slots.values())


def set_stat_total(state: BuildState, stat: str) -> int:
    exo_total = 1 if stat in state.exos else 0
    return state.stats.get(stat, 0) - BASE_STATS.get(stat, 0) - item_stat_total(state, stat) - exo_total


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
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> list[BuildState]:
    valid_final_states = []
    for state in beam:
        state_with_exos = apply_missing_exos(state, target)
        if state_with_exos is None:
            continue
        if (
            state_with_exos.stats.get("AP", 0) != target.ap
            or state_with_exos.stats.get("MP", 0) != target.mp
            or state_with_exos.stats.get("Range", 0) < target.range
        ):
            continue
        state_with_exos.condition_failures = unmet_item_conditions(state_with_exos)
        if state_with_exos.condition_failures:
            continue
        if ap_strategy and not ap_strategy_matches(state_with_exos, ap_strategy):
            continue
        if ap_strategy:
            state_with_exos.ap_strategy = ap_strategy.name
        state_with_exos = optimize_base_allocation(
            state_with_exos,
            generic_damage_weight=generic_damage_weight,
            weapon_damage_weight=weapon_damage_weight,
        )
        valid_final_states.append(state_with_exos)
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
        stat: value - BASE_STATS.get(stat, 0)
        for stat, value in state.stats.items()
        if value != BASE_STATS.get(stat, 0)
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
    for package_group in combinations(packages[:SET_PACKAGE_TRIPLE_SOURCE_LIMIT], 3):
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


def direct_completion_seed_candidates(seeds: list[BuildState]) -> list[BuildState]:
    gear_slots = {slot_name for slot_name, _ in SLOTS if not is_dofus_slot(slot_name)}
    candidates = [
        seed
        for seed in seeds
        if len(gear_slots & set(seed.slots)) >= DIRECT_COMPLETION_MIN_FILLED_GEAR_SLOTS
    ]
    diverse_by_signature: dict[tuple[tuple[str, int], ...], BuildState] = {}
    for seed in sorted(candidates, key=lambda state: state.score, reverse=True):
        diverse_by_signature.setdefault(set_signature(seed), seed)
    return list(diverse_by_signature.values())[:DIRECT_COMPLETION_SEED_LIMIT]


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
        next_states: list[BuildState] = []
        for state in beam:
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
        beam = dedupe_builds(sorted(next_states, key=lambda state: state.score, reverse=True))[
            :DIRECT_COMPLETION_NON_DOFUS_BEAM_WIDTH
        ]
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
    return sorted(selected.values(), key=lambda item: item["_score"], reverse=True)


def ranked_dofus_combinations(
    dofus_pool: list[dict[str, Any]],
    combo_size: int,
) -> list[tuple[dict[str, Any], ...]]:
    if combo_size == 0:
        return [()]

    scored_combinations = [
        (sum(item["_score"] for item in combo), combo)
        for combo in combinations(dofus_pool, combo_size)
    ]
    sorted_combinations = sorted(scored_combinations, key=lambda entry: entry[0], reverse=True)
    multi_special_combinations = [
        combo
        for _, combo in sorted_combinations
        if sum(item["dofusID"] in DIRECT_COMPLETION_SPECIAL_DOFUS_IDS for item in combo) >= 2
    ][:DIRECT_COMPLETION_DOFUS_COMBO_LIMIT]
    special_combinations = [
        combo
        for _, combo in sorted_combinations
        if any(item["dofusID"] in DIRECT_COMPLETION_SPECIAL_DOFUS_IDS for item in combo)
    ][:DIRECT_COMPLETION_DOFUS_COMBO_LIMIT]
    top_combinations = [
        combo
        for _, combo in sorted_combinations[:DIRECT_COMPLETION_DOFUS_COMBO_LIMIT]
    ]

    seen: set[tuple[str, ...]] = set()
    ranked = []
    for combo in multi_special_combinations + special_combinations + top_combinations:
        signature = tuple(sorted(item["dofusID"] for item in combo))
        if signature in seen:
            continue
        seen.add(signature)
        ranked.append(combo)
        if len(ranked) >= DIRECT_COMPLETION_DOFUS_COMBO_LIMIT:
            break
    return ranked


def complete_dofus_combination(
    state: BuildState,
    dofus_items: tuple[dict[str, Any], ...],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    natural_cap_target: BuildTarget,
) -> BuildState | None:
    next_state = state
    open_slots = [slot_name for slot_name, _ in SLOTS if is_dofus_slot(slot_name) and slot_name not in state.slots]
    if len(open_slots) != len(dofus_items):
        return None
    for slot_name, item in zip(open_slots, dofus_items):
        next_state = add_item_to_state(
            next_state,
            slot_name,
            item,
            sets,
            target,
            condition_target=target,
            cap_target=natural_cap_target,
        )
        if next_state is None:
            return None
    return next_state


def direct_valid_completed_state(
    state: BuildState,
    target: BuildTarget,
    ap_strategies: tuple[ApStrategy, ...],
    generic_damage_weight: float,
    weapon_damage_weight: float,
) -> BuildState | None:
    state_with_exos = apply_missing_exos(state, target)
    if state_with_exos is None:
        return None
    if (
        state_with_exos.stats.get("AP", 0) != target.ap
        or state_with_exos.stats.get("MP", 0) != target.mp
        or state_with_exos.stats.get("Range", 0) < target.range
    ):
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
    state_with_exos = optimize_base_allocation(
        state_with_exos,
        generic_damage_weight=generic_damage_weight,
        weapon_damage_weight=weapon_damage_weight,
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
) -> list[BuildState]:
    dofus_pool = dofus_completion_pool(pools)
    ranked_combinations_by_size: dict[int, list[tuple[dict[str, Any], ...]]] = {}
    completed_gear_states: list[BuildState] = []
    valid_final_states: list[BuildState] = []
    for seed in direct_completion_seed_candidates(seeds):
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
        DIRECT_COMPLETION_GEAR_STATE_LIMIT,
        DIRECT_COMPLETION_GEAR_STATE_PER_SIGNATURE_CAP,
    )
    for non_dofus_state in completed_gear_states:
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
            )
        for dofus_items in ranked_combinations_by_size[combo_size]:
            if any(item["dofusID"] in non_dofus_state.used_item_ids for item in dofus_items):
                continue
            completed = complete_dofus_combination(
                non_dofus_state,
                dofus_items,
                sets,
                target,
                natural_cap_target,
            )
            if completed is None:
                continue
            valid_state = direct_valid_completed_state(
                completed,
                target,
                ap_strategies,
                generic_damage_weight,
                weapon_damage_weight,
            )
            if valid_state is not None:
                valid_final_states.append(valid_state)

    return dedupe_builds(sorted(valid_final_states, key=lambda state: state.score, reverse=True))


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
    initial_seeds: list[BuildState] | None = None,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> list[BuildState]:
    strategy_seeds = (
        ap_set_bonus_seed_states(
            pools,
            sets,
            target,
            search_target,
            natural_cap_target,
        )
        if ap_strategy and ap_strategy.require_ap_set_bonus
        else [BuildState()]
    )
    beam = dedupe_builds(sorted(strategy_seeds + (initial_seeds or []), key=lambda state: state.score, reverse=True))
    for slot_name in slot_order:
        next_states: list[BuildState] = []
        for state in beam:
            if slot_name in state.slots:
                next_states.append(state)
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
        beam = trim_beam(next_states, beam_width, per_signature_cap)

    return completed_valid_builds(
        beam,
        target,
        ap_strategy,
        generic_damage_weight=generic_damage_weight,
        weapon_damage_weight=weapon_damage_weight,
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
    slot_orders: list[tuple[str, ...]] = DEFAULT_SLOT_ORDERS,
    ap_strategies: tuple[ApStrategy, ...] = DEFAULT_AP_STRATEGIES,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> list[BuildState]:
    timings: dict[str, float] = {}
    started_at = time.perf_counter()
    items = load_items(target, excluded_item_ids)
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
        slot_name: candidate_pool_for_slot(slot_types, items, relevant_sets, top_k)
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
    timings["packageIndexMs"] = (time.perf_counter() - phase_started) * 1000

    phase_started = time.perf_counter()
    initial_seeds = package_seed_states(
        pools,
        sets,
        target,
        search_target,
        natural_cap_target,
        package_index=package_index,
    )
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
        )
    )
    timings["directCompletionMs"] = (time.perf_counter() - phase_started) * 1000

    phase_started = time.perf_counter()
    for ap_strategy in ap_strategies:
        for slot_order in slot_orders:
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
                    ap_strategy=ap_strategy,
                    initial_seeds=initial_seeds,
                    generic_damage_weight=generic_damage_weight,
                    weapon_damage_weight=weapon_damage_weight,
                )
            )
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
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> list[BuildState]:
    candidates = find_builds(
        top_k=top_k,
        beam_width=beam_width,
        per_signature_cap=per_signature_cap,
        relevant_set_limit=relevant_set_limit,
        target=target,
        max_shared_items=None,
        generic_damage_weight=generic_damage_weight,
        weapon_damage_weight=weapon_damage_weight,
    )

    selected: list[BuildState] = []
    seen_item_signatures: set[tuple[str, ...]] = set()
    seen_approaches: set[tuple[str | None, ...]] = set()
    for candidate in candidates:
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

    return selected


def serialize_build(state: BuildState, sets: dict[str, dict[str, Any]]) -> dict[str, Any]:
    scoring_stats = effective_scoring_stats(state)
    used_sets = {
        sets[set_id]["_name"]: count
        for set_id, count in sorted(state.set_counts.items())
        if count > 1 and set_id in sets
    }
    return {
        "score": round(state.score, 2),
        "weightedStatScore": round(score_stats(state.stats), 2),
        "utilityStatScore": round(final_utility_score(scoring_stats), 2),
        "genericDamageScore": round(strength_spell_damage(scoring_stats), 2),
        "weaponDamageScore": round(state_weapon_damage(state, scoring_stats), 2),
        "survivabilityScore": round(survivability_score(scoring_stats), 2),
        "weakestElementEhp": round(min(elemental_effective_hp(scoring_stats)), 2),
        "apStrategy": state.ap_strategy,
        "baseAllocation": state.base_allocation,
        "conditionFailures": state.condition_failures,
        "totals": {
            "AP": state.stats.get("AP", 0),
            "MP": state.stats.get("MP", 0),
            "Range": state.stats.get("Range", 0),
            "Strength": state.stats.get("Strength", 0),
            "Power": state.stats.get("Power", 0),
            "Vitality": state.stats.get("Vitality", 0),
            "Damage": state.stats.get("Damage", 0),
            "Earth Damage": state.stats.get("Earth Damage", 0),
            "Critical": state.stats.get("Critical", 0),
            "Critical Damage": state.stats.get("Critical Damage", 0),
        },
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
                "name": item["_name"],
                "type": item["itemType"],
                "level": item.get("level"),
                "set": sets.get(item.get("setID"), {}).get("_name") if item.get("setID") else None,
            }
            for slot, item in state.slots.items()
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--top-k", type=int, default=25)
    parser.add_argument("--beam-width", type=int, default=250)
    parser.add_argument("--per-signature-cap", type=int, default=40)
    parser.add_argument("--relevant-set-limit", type=int, default=60)
    parser.add_argument("--target-ap", type=int, default=DEFAULT_TARGET.ap)
    parser.add_argument("--target-mp", type=int, default=DEFAULT_TARGET.mp)
    parser.add_argument("--target-range", type=int, default=DEFAULT_TARGET.range)
    parser.add_argument("--max-shared-items", type=int, default=DEFAULT_MAX_SHARED_ITEMS)
    parser.add_argument("--generic-damage-weight", type=float, default=GENERIC_DAMAGE_WEIGHT)
    parser.add_argument("--weapon-damage-weight", type=float, default=WEAPON_DAMAGE_WEIGHT)
    args = parser.parse_args()

    target = BuildTarget(ap=args.target_ap, mp=args.target_mp, range=args.target_range)
    start = time.perf_counter()
    builds = find_diverse_builds(
        limit=args.limit,
        top_k=args.top_k,
        beam_width=args.beam_width,
        per_signature_cap=args.per_signature_cap,
        relevant_set_limit=args.relevant_set_limit,
        target=target,
        max_shared_items=args.max_shared_items,
        generic_damage_weight=args.generic_damage_weight,
        weapon_damage_weight=args.weapon_damage_weight,
    )
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    sets = load_sets()

    output = {
        "prototype": "level_200_strength_pvm_generalist",
        "target": {"level": TARGET_LEVEL, "AP": target.ap, "MP": target.mp, "Range": target.range},
        "scoring": {
            "genericDamageWeight": args.generic_damage_weight,
            "weaponDamageWeight": args.weapon_damage_weight,
        },
        "elapsedMs": elapsed_ms,
        "timings": {key: round(value, 1) for key, value in LAST_FIND_BUILD_TIMINGS.items()},
        "resultCount": len(builds),
        "builds": [serialize_build(build, sets) for build in builds],
    }
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
