"""Narrow build-discovery prototype for DofusLab.

This is intentionally standalone: it reads the static game-data JSON files and
prints candidate Level 200 Strength PvM builds without touching Flask, GraphQL,
or the database. The goal is to make the search/ranking loop easy to inspect
before wiring it into product code.

Known prototype limitations:
- item conditions are ignored
- trophy/dofus exclusivity rules are not modeled
- scoring is a rough stat proxy, not real spell/weapon damage
"""

from __future__ import annotations

import argparse
import json
import time
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

from oneoff.condition_evaluator import condition_can_pass_at_target, unmet_item_conditions
from oneoff.damage_calculator import STRENGTH_PVM_PROFILE, profile_damage


SERVER_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = SERVER_ROOT / "app" / "database" / "data"

TARGET_LEVEL = 200
BASE_AP = 7 if TARGET_LEVEL >= 100 else 6
BASE_MP = 3
REQUIRED_AP = 11
REQUIRED_MP = 6
REQUIRED_RANGE = 0
TARGET_CONDITION_STATS = {"AP": REQUIRED_AP, "MP": REQUIRED_MP, "Range": REQUIRED_RANGE}
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

STAT_WEIGHTS = {
    "Strength": 1.0,
    "Power": 0.85,
    "Earth Damage": 8.0,
    "Neutral Damage": 1.0,
    "Damage": 6.0,
    "Critical Damage": 4.0,
    "Critical": 6.0,
    "AP": 120.0,
    "MP": 90.0,
    "Range": 35.0,
    "Vitality": 0.3,
    "Wisdom": 0.15,
    "% Earth Resistance": 2.0,
    "% Neutral Resistance": 1.5,
    "% Fire Resistance": 1.0,
    "% Water Resistance": 1.0,
    "% Air Resistance": 1.0,
}

EXCLUDED_SET_NAME_PARTS = ("Khardboard",)


@dataclass
class BuildState:
    slots: dict[str, dict[str, Any]] = field(default_factory=dict)
    stats: dict[str, int] = field(default_factory=lambda: dict(BASE_STATS))
    set_counts: dict[str, int] = field(default_factory=dict)
    used_item_ids: set[str] = field(default_factory=set)
    score: float = 0.0
    condition_failures: list[dict[str, Any]] = field(default_factory=list)

    def clone(self) -> "BuildState":
        return BuildState(
            slots=dict(self.slots),
            stats=dict(self.stats),
            set_counts=dict(self.set_counts),
            used_item_ids=set(self.used_item_ids),
            score=self.score,
            condition_failures=list(self.condition_failures),
        )


def load_json(filename: str) -> Any:
    with (DATA_DIR / filename).open(encoding="utf-8") as f:
        return json.load(f)


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


def score_stats(stats: dict[str, int]) -> float:
    return sum(stats.get(stat, 0) * weight for stat, weight in STAT_WEIGHTS.items())


def item_score(item: dict[str, Any]) -> float:
    return score_stats(normalize_stats(item.get("stats", [])))


def set_bonus_score(set_obj: dict[str, Any]) -> float:
    return max(
        (score_stats(normalize_stats(bonus_lines)) for bonus_lines in set_obj.get("bonuses", {}).values()),
        default=0.0,
    )


def load_items() -> list[dict[str, Any]]:
    items = load_json("items.json") + load_json("weapons.json") + load_json("pets.json")
    candidates = [
        item
        for item in items
        if item.get("level", 0) <= TARGET_LEVEL
        and condition_can_pass_at_target(
            item.get("conditions", {}).get("conditions", {}),
            TARGET_CONDITION_STATS,
        )
    ]
    for item in candidates:
        item["_name"] = get_name(item)
        item["_stats"] = normalize_stats(item.get("stats", []))
        item["_score"] = score_stats(item["_stats"])
    return candidates


def load_sets() -> dict[str, dict[str, Any]]:
    sets = {set_obj["id"]: set_obj for set_obj in load_json("sets.json")}
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
    compatible = [item for item in items if item.get("itemType") in slot_types]
    selected: dict[str, dict[str, Any]] = {}

    for item in sorted(compatible, key=lambda i: i["_score"], reverse=True)[:top_k]:
        selected[item["dofusID"]] = item

    for item in compatible:
        stats = item["_stats"]
        if stats.get("AP") or stats.get("MP") or stats.get("Range"):
            selected[item["dofusID"]] = item
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
) -> BuildState | None:
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

    next_state.score = score_state(next_state, sets, final=False)
    return next_state


def potential_set_bonus_score(state: BuildState, sets: dict[str, dict[str, Any]]) -> float:
    potential = 0.0
    for set_id, count in state.set_counts.items():
        next_bonus = sets.get(set_id, {}).get("bonuses", {}).get(str(count + 1))
        if next_bonus:
            potential += 0.25 * score_stats(normalize_stats(next_bonus))
    return potential


def score_state(state: BuildState, sets: dict[str, dict[str, Any]], final: bool) -> float:
    score = score_stats(state.stats)
    score -= max(state.stats.get("AP", 0) - REQUIRED_AP, 0) * 80
    score -= max(state.stats.get("MP", 0) - REQUIRED_MP, 0) * 70
    ap_gap = max(REQUIRED_AP - state.stats.get("AP", 0), 0)
    mp_gap = max(REQUIRED_MP - state.stats.get("MP", 0), 0)
    range_gap = max(REQUIRED_RANGE - state.stats.get("Range", 0), 0)
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
    comfort = state.stats.get("Range", 0) * 20 + state.stats.get("MP", 0) * 25
    return damage * 2.0 + survivability_score(state.stats) + comfort


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


def find_builds(top_k: int, beam_width: int, per_signature_cap: int, relevant_set_limit: int) -> list[BuildState]:
    items = load_items()
    sets = load_sets()
    items = [
        item
        for item in items
        if not item.get("setID") or not sets.get(item["setID"], {}).get("_excluded")
    ]
    relevant_sets = relevant_set_ids(items, sets, relevant_set_limit)
    pools = {
        slot_name: candidate_pool_for_slot(slot_types, items, relevant_sets, top_k)
        for slot_name, slot_types in SLOTS
    }

    beam = [BuildState()]
    for slot_name, _ in SLOTS:
        next_states: list[BuildState] = []
        for state in beam:
            for item in pools[slot_name]:
                next_state = add_item_to_state(state, slot_name, item, sets)
                if next_state:
                    next_states.append(next_state)
        beam = trim_beam(next_states, beam_width, per_signature_cap)

    final_states = [
        state
        for state in beam
        if state.stats.get("AP", 0) >= REQUIRED_AP and state.stats.get("MP", 0) >= REQUIRED_MP
    ]
    valid_final_states = []
    for state in final_states:
        state.condition_failures = unmet_item_conditions(state)
        if state.condition_failures:
            continue
        state.score = final_score_state(state)
        valid_final_states.append(state)
    return dedupe_builds(sorted(valid_final_states, key=lambda s: s.score, reverse=True))


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
    args = parser.parse_args()

    start = time.perf_counter()
    builds = find_builds(
        top_k=args.top_k,
        beam_width=args.beam_width,
        per_signature_cap=args.per_signature_cap,
        relevant_set_limit=args.relevant_set_limit,
    )
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    sets = load_sets()

    output = {
        "prototype": "level_200_strength_pvm_generalist",
        "target": {"level": TARGET_LEVEL, "AP": REQUIRED_AP, "MP": REQUIRED_MP, "Range": REQUIRED_RANGE},
        "elapsedMs": elapsed_ms,
        "resultCount": len(builds),
        "builds": [serialize_build(build, sets) for build in builds[: args.limit]],
    }
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
