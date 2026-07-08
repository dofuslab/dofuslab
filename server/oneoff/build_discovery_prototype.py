"""Narrow build-discovery prototype for DofusLab.

This reads the local database and prints candidate Level 200 Strength PvM builds
without touching GraphQL. The goal is to make the search/ranking loop easy to
inspect before wiring it into product code.

Known prototype limitations:
- trophy/dofus exclusivity rules are not modeled
- scoring is a rough stat proxy, not real spell/weapon damage
"""

from __future__ import annotations

import argparse
import json
import time
from collections import defaultdict
from dataclasses import dataclass, field
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
GENERIC_DAMAGE_WEIGHT = 0.35
WEAPON_DAMAGE_WEIGHT = 0.15
GENERIC_STRENGTH_DAMAGE_PROFILE = [
    DamageLine(element="earth", base_min=30, base_max=34, crit_chance=15, weight=1.0),
    DamageLine(element="earth", base_min=42, base_max=48, crit_chance=15, weight=0.75),
    DamageLine(element="earth", base_min=18, base_max=22, crit_chance=25, weight=1.25),
]
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
    ("pet", ("Pet",)),
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
SURVIVABILITY_SCORE_WEIGHT = 0.22
SORTED_ELEMENT_EHP_WEIGHTS = (0.4, 0.25, 0.15, 0.1, 0.1)
GENERIC_INCOMING_HIT = 350
GENERIC_INCOMING_CRIT_RATE = 0.2
GENERIC_INCOMING_PUSHBACK_RATE = 0.02
GENERIC_INCOMING_RANGED_RATE = 0.7
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
    "Critical Damage": 4.0,
    "Critical": 6.0,
    "Vitality": 0.3,
    "Wisdom": 0.15,
    "Initiative": 0.005,
    "Prospecting": 0.033,
    "AP Parry": 0.167,
    "MP Parry": 0.167,
    "Lock": 0.667,
    "Dodge": 0.667,
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


@dataclass
class BuildState:
    slots: dict[str, dict[str, Any]] = field(default_factory=dict)
    stats: dict[str, int] = field(default_factory=lambda: dict(BASE_STATS))
    set_counts: dict[str, int] = field(default_factory=dict)
    used_item_ids: set[str] = field(default_factory=set)
    exos: dict[str, str] = field(default_factory=dict)
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
            ap_strategy=self.ap_strategy,
            score=self.score,
            condition_failures=list(self.condition_failures),
        )


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


def load_items(
    target: BuildTarget = DEFAULT_TARGET,
    excluded_item_ids: set[str] | None = None,
) -> list[dict[str, Any]]:
    excluded_item_ids = excluded_item_ids or set()
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
                joinedload(ModelItem.item_type).joinedload(ModelItemType.item_type_translation),
                joinedload(ModelItem.weapon_stats).joinedload(ModelWeaponStat.weapon_effects),
            )
            .filter(ModelItem.level <= TARGET_LEVEL)
            .filter(or_(ModelItem.dofus_db_id.isnot(None), ModelItem.dofus_db_mount_id.isnot(None)))
            .all()
        )
        items = [
            {
                "dofusID": db_item_dofus_id(item),
                "name": translated_name(item.item_translations, db_item_dofus_id(item) or ""),
                "itemType": translated_name(item.item_type.item_type_translation, str(item.item_type_id)),
                "setID": str(item.set_id) if item.set_id else None,
                "level": item.level,
                "stats": item_stats_from_db(item.stats),
                "weaponStats": weapon_stats_from_db(item.weapon_stats),
                "conditions": item.conditions or {"conditions": {}, "customConditions": {}},
            }
            for item in db_items
        ]
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
    for item in candidates:
        item["_name"] = get_name(item)
        item["_stats"] = normalize_stats(item.get("stats", []))
        item["_score"] = score_stats(item["_stats"])
    return candidates


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
    compatible = [item for item in items if item.get("itemType") in slot_types]
    relevant_set_items = [
        item
        for item in compatible
        if item.get("setID") in relevant_sets
        and item.get("level", 0) >= RELEVANT_SET_ITEM_MIN_LEVEL
    ]
    search_compatible = compatible
    if not is_dofus_slot:
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


def state_weapon_damage(state: BuildState) -> float:
    weapon = state.slots.get("weapon")
    if not weapon:
        return 0.0
    weapon_stats = weapon.get("weaponStats") or {}
    ap_cost = weapon_stats.get("apCost") or 1
    return profile_damage(weapon_damage_lines(weapon), state.stats) / ap_cost


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


def final_score_state(
    state: BuildState,
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> float:
    return (
        final_utility_score(state.stats)
        + profile_damage(GENERIC_STRENGTH_DAMAGE_PROFILE, state.stats) * generic_damage_weight
        + state_weapon_damage(state) * weapon_damage_weight
        + survivability_score(state.stats)
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
        state_with_exos.score = final_score_state(
            state_with_exos,
            generic_damage_weight=generic_damage_weight,
            weapon_damage_weight=weapon_damage_weight,
        )
        valid_final_states.append(state_with_exos)
    return valid_final_states


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
    generic_damage_weight: float = GENERIC_DAMAGE_WEIGHT,
    weapon_damage_weight: float = WEAPON_DAMAGE_WEIGHT,
) -> list[BuildState]:
    beam = (
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
    items = load_items(target, excluded_item_ids)
    sets = load_sets()
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

    valid_final_states = []
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
                    generic_damage_weight=generic_damage_weight,
                    weapon_damage_weight=weapon_damage_weight,
                )
            )
    ranked_states = dedupe_builds(sorted(valid_final_states, key=lambda s: s.score, reverse=True))
    return diversify_builds(ranked_states, max_shared_items)


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
    used_sets = {
        sets[set_id]["_name"]: count
        for set_id, count in sorted(state.set_counts.items())
        if count > 1 and set_id in sets
    }
    return {
        "score": round(state.score, 2),
        "weightedStatScore": round(score_stats(state.stats), 2),
        "utilityStatScore": round(final_utility_score(state.stats), 2),
        "genericDamageScore": round(profile_damage(GENERIC_STRENGTH_DAMAGE_PROFILE, state.stats), 2),
        "weaponDamageScore": round(state_weapon_damage(state), 2),
        "survivabilityScore": round(survivability_score(state.stats), 2),
        "weakestElementEhp": round(min(elemental_effective_hp(state.stats)), 2),
        "apStrategy": state.ap_strategy,
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
        "resultCount": len(builds),
        "builds": [serialize_build(build, sets) for build in builds],
    }
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
