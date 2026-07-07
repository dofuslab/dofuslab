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
from typing import Any, Iterable

from oneoff.condition_evaluator import (
    condition_can_pass_at_target,
    target_forced_conditions_hold,
    unmet_item_conditions,
)
from oneoff.damage_calculator import STRENGTH_PVM_PROFILE, profile_damage

TARGET_LEVEL = 200
BASE_AP = 7 if TARGET_LEVEL >= 100 else 6
BASE_MP = 3
REQUIRED_AP = 11
REQUIRED_MP = 6
REQUIRED_RANGE = 0
MAX_AP = 12
MAX_MP = 6
ACTION_STATS = ("AP", "MP", "Range")
ACTION_STAT_SOURCE_LIMIT = 4
DOFUS_ACTION_STAT_SOURCE_LIMIT = 1
DOFUS_ZERO_SCORE_FILLER_LIMIT = 4
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

STAT_WEIGHTS = {
    "Strength": 1.0,
    "Power": 0.85,
    "Earth Damage": 4.0,
    "Neutral Damage": 1.0,
    "Damage": 6.0,
    "Critical Damage": 4.0,
    "Critical": 6.0,
    "Vitality": 0.3,
    "Wisdom": 0.15,
    "% Earth Resistance": 2.0,
    "% Neutral Resistance": 1.5,
    "% Fire Resistance": 1.0,
    "% Water Resistance": 1.0,
    "% Air Resistance": 1.0,
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


def exo_search_target(final_target: BuildTarget) -> BuildTarget:
    return BuildTarget(
        ap=max(BASE_AP, final_target.ap - 1),
        mp=max(BASE_MP, final_target.mp - 1),
        range=max(0, final_target.range - 1),
    )


@dataclass
class BuildState:
    slots: dict[str, dict[str, Any]] = field(default_factory=dict)
    stats: dict[str, int] = field(default_factory=lambda: dict(BASE_STATS))
    set_counts: dict[str, int] = field(default_factory=dict)
    used_item_ids: set[str] = field(default_factory=set)
    exos: dict[str, str] = field(default_factory=dict)
    score: float = 0.0
    condition_failures: list[dict[str, Any]] = field(default_factory=list)

    def clone(self) -> "BuildState":
        return BuildState(
            slots=dict(self.slots),
            stats=dict(self.stats),
            set_counts=dict(self.set_counts),
            used_item_ids=set(self.used_item_ids),
            exos=dict(self.exos),
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


def score_stats(stats: dict[str, int]) -> float:
    return sum(stats.get(stat, 0) * weight for stat, weight in STAT_WEIGHTS.items())


def item_score(item: dict[str, Any]) -> float:
    return score_stats(normalize_stats(item.get("stats", [])))


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
    from sqlalchemy.orm import joinedload

    from app import session_scope
    from app.database.model_item import ModelItem
    from app.database.model_item_type import ModelItemType

    with session_scope() as db_session:
        db_items = (
            db_session.query(ModelItem)
            .join(ModelItem.item_type)
            .options(
                joinedload(ModelItem.item_translations),
                joinedload(ModelItem.stats),
                joinedload(ModelItem.item_type).joinedload(ModelItemType.item_type_translation),
            )
            .filter(ModelItem.level <= TARGET_LEVEL)
            .filter(ModelItem.dofus_db_id.isnot(None))
            .all()
        )
        items = [
            {
                "dofusID": item.dofus_db_id,
                "name": translated_name(item.item_translations, item.dofus_db_id),
                "itemType": translated_name(item.item_type.item_type_translation, str(item.item_type_id)),
                "setID": str(item.set_id) if item.set_id else None,
                "level": item.level,
                "stats": item_stats_from_db(item.stats),
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
    if not is_dofus_slot:
        compatible = prune_dominated_items(compatible)
    selected: dict[str, dict[str, Any]] = {}

    top_score_candidates = compatible
    if is_dofus_slot:
        top_score_candidates = [item for item in compatible if item["_score"] > 0]
    for item in sorted(top_score_candidates, key=lambda i: i["_score"], reverse=True)[:top_k]:
        selected[item["dofusID"]] = item

    if is_dofus_slot:
        zero_score_fillers = [
            item
            for item in compatible
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
        stat_sources = [
            item
            for item in compatible
            if item["_stats"].get(stat, 0) > 0
        ]
        for item in sorted(
            stat_sources,
            key=lambda i: (i["_score"], i.get("level", 0)),
            reverse=True,
        )[:action_source_limit]:
            selected[item["dofusID"]] = item

    for item in compatible:
        if item.get("setID") in relevant_sets:
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
    score -= mp_gap * 450
    score -= range_gap * 150
    if not final:
        score += potential_set_bonus_score(state, sets)
    return score


def survivability_score(stats: dict[str, int]) -> float:
    elemental_res = [
        stats.get("% Earth Resistance", 0),
        stats.get("% Fire Resistance", 0),
        stats.get("% Water Resistance", 0),
        stats.get("% Air Resistance", 0),
        stats.get("% Neutral Resistance", 0) * 0.7,
    ]
    return stats.get("Vitality", 0) * 0.25 + sum(elemental_res) * 12


def final_score_state(state: BuildState) -> float:
    damage = profile_damage(STRENGTH_PVM_PROFILE, state.stats)
    return damage * 2.0 + survivability_score(state.stats)


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
        state_with_exos.score = final_score_state(state_with_exos)
        valid_final_states.append(state_with_exos)
    return valid_final_states


def search_slot_order(
    slot_order: tuple[str, ...],
    pools: dict[str, list[dict[str, Any]]],
    sets: dict[str, dict[str, Any]],
    target: BuildTarget,
    search_target: BuildTarget,
    beam_width: int,
    per_signature_cap: int,
) -> list[BuildState]:
    beam = [BuildState()]
    for slot_name in slot_order:
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
                    cap_target=target,
                )
                if next_state:
                    next_states.append(next_state)
        beam = trim_beam(next_states, beam_width, per_signature_cap)

    return completed_valid_builds(beam, target)


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
    pools = {
        slot_name: candidate_pool_for_slot(slot_types, items, relevant_sets, top_k)
        for slot_name, slot_types in SLOTS
    }

    valid_final_states = []
    for slot_order in slot_orders:
        valid_final_states.extend(
            search_slot_order(
                slot_order=slot_order,
                pools=pools,
                sets=sets,
                target=target,
                search_target=search_target,
                beam_width=beam_width,
                per_signature_cap=per_signature_cap,
            )
        )
    ranked_states = dedupe_builds(sorted(valid_final_states, key=lambda s: s.score, reverse=True))
    return diversify_builds(ranked_states, max_shared_items)


def approach_item_ids(state: BuildState) -> set[str]:
    key_slots = ("amulet", "weapon", "shield")
    return {
        state.slots[slot]["dofusID"]
        for slot in key_slots
        if slot in state.slots
    }


def approach_key(state: BuildState) -> tuple[str | None, ...]:
    key_slots = ("amulet", "weapon", "shield")
    return tuple(state.slots.get(slot, {}).get("dofusID") for slot in key_slots)


def find_diverse_builds(
    limit: int,
    top_k: int,
    beam_width: int,
    per_signature_cap: int,
    relevant_set_limit: int,
    target: BuildTarget = DEFAULT_TARGET,
    max_shared_items: int | None = DEFAULT_MAX_SHARED_ITEMS,
) -> list[BuildState]:
    selected: list[BuildState] = []
    exclusion_batches: list[set[str]] = [set()]
    seen_exclusion_batches: set[tuple[str, ...]] = {tuple()}

    while len(selected) < limit:
        made_progress = False
        for excluded_item_ids in list(exclusion_batches):
            if len(selected) >= limit:
                break
            if selected and not excluded_item_ids:
                continue

            candidates = find_builds(
                top_k=top_k,
                beam_width=beam_width,
                per_signature_cap=per_signature_cap,
                relevant_set_limit=relevant_set_limit,
                target=target,
                max_shared_items=None,
                excluded_item_ids=excluded_item_ids,
            )
            next_build = next(
                (
                    candidate
                    for candidate in candidates
                    if all(candidate.used_item_ids != existing.used_item_ids for existing in selected)
                    and all(approach_key(candidate) != approach_key(existing) for existing in selected)
                    and (
                        not selected
                        or max_shared_items is None
                        or all(
                            len(candidate.used_item_ids & existing.used_item_ids) <= max_shared_items
                            for existing in selected
                        )
                    )
                ),
                None,
            )
            if next_build is None:
                continue

            selected.append(next_build)
            new_exclusion = approach_item_ids(next_build)
            exclusion_key = tuple(sorted(new_exclusion))
            if exclusion_key not in seen_exclusion_batches:
                exclusion_batches.append(new_exclusion)
                seen_exclusion_batches.add(exclusion_key)
            made_progress = True

        if not made_progress:
            break

    return sorted(selected, key=lambda state: state.score, reverse=True)


def serialize_build(state: BuildState, sets: dict[str, dict[str, Any]]) -> dict[str, Any]:
    used_sets = {
        sets[set_id]["_name"]: count
        for set_id, count in sorted(state.set_counts.items())
        if count > 1 and set_id in sets
    }
    return {
        "score": round(state.score, 2),
        "damageProfileScore": round(profile_damage(STRENGTH_PVM_PROFILE, state.stats), 2),
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
    )
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    sets = load_sets()

    output = {
        "prototype": "level_200_strength_pvm_generalist",
        "target": {"level": TARGET_LEVEL, "AP": target.ap, "MP": target.mp, "Range": target.range},
        "elapsedMs": elapsed_ms,
        "resultCount": len(builds),
        "builds": [serialize_build(build, sets) for build in builds],
    }
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
