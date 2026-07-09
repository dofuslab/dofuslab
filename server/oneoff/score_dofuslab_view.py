"""Score a public DofusLab view URL with optional mage normalization.

This is a benchmark helper for build discovery. It reconstructs items from the
local item database by name, then applies equipped-item mage stats from the
public page only when requested.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import urllib.request
from collections import defaultdict
from typing import Any
from urllib.parse import urlparse

from oneoff.build_discovery_prototype import (
    ACTION_STATS,
    BASE_AP,
    BASE_MP,
    BASE_STATS,
    DB_STAT_NAMES,
    DEFAULT_AP_STRATEGIES,
    DEFAULT_TARGET,
    BuildState,
    BuildTarget,
    add_item_to_state,
    ap_strategy_matches,
    final_score_state,
    hard_cap_target,
    load_items,
    load_sets,
    unmet_item_conditions,
)


SLOT_NAMES = {
    "Hat": "hat",
    "Cloak": "cloak",
    "Amulet": "amulet",
    "Belt": "belt",
    "Boots": "boots",
    "Weapon": "weapon",
    "Shield": "shield",
    "Pet": "pet",
}


def fetch_next_data(url: str) -> dict[str, Any]:
    body = urllib.request.urlopen(url, timeout=30).read().decode("utf-8")
    match = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        body,
    )
    if not match:
        raise RuntimeError("Could not find embedded Next.js data.")
    return json.loads(html.unescape(match.group(1)))


def custom_set_id_from_url(url: str) -> str:
    parts = [part for part in urlparse(url).path.split("/") if part]
    if not parts:
        raise ValueError(f"Could not parse custom set id from URL: {url}")
    return parts[-1]


def deref(apollo_state: dict[str, Any], ref_obj: dict[str, str]) -> dict[str, Any]:
    return apollo_state[ref_obj["__ref"]]


def stat_name(stat_key: str) -> str:
    return DB_STAT_NAMES.get(stat_key, stat_key)


def base_stats_from_custom_set(custom_set_stats: dict[str, Any]) -> dict[str, int]:
    return {
        "AP": BASE_AP,
        "MP": BASE_MP,
        "Vitality": custom_set_stats.get("baseVitality", 0)
        + custom_set_stats.get("scrolledVitality", 0),
        "Wisdom": custom_set_stats.get("baseWisdom", 0)
        + custom_set_stats.get("scrolledWisdom", 0),
        "Strength": custom_set_stats.get("baseStrength", 0)
        + custom_set_stats.get("scrolledStrength", 0),
        "Intelligence": custom_set_stats.get("baseIntelligence", 0)
        + custom_set_stats.get("scrolledIntelligence", 0),
        "Chance": custom_set_stats.get("baseChance", 0)
        + custom_set_stats.get("scrolledChance", 0),
        "Agility": custom_set_stats.get("baseAgility", 0)
        + custom_set_stats.get("scrolledAgility", 0),
    }


def slot_name_for_equipped_item(
    equipped_item: dict[str, Any],
    apollo_state: dict[str, Any],
    slot_counts: dict[str, int],
) -> str:
    slot = deref(apollo_state, equipped_item["slot"])
    en_name = slot["enName"]
    if en_name == "Ring":
        slot_counts["ring"] += 1
        return f"ring_{slot_counts['ring']}"
    if en_name == "Dofus":
        slot_counts["dofus"] += 1
        return f"dofus_{slot_counts['dofus']}"
    if en_name not in SLOT_NAMES:
        raise ValueError(f"Unsupported slot name: {en_name}")
    return SLOT_NAMES[en_name]


def equipped_entries_from_view(url: str) -> tuple[str, dict[str, int], list[dict[str, Any]]]:
    next_data = fetch_next_data(url)
    apollo_state = next_data["props"]["pageProps"]["apolloState"]
    custom_set_id = custom_set_id_from_url(url)
    custom_set = apollo_state[f"CustomSet:{custom_set_id}"]
    custom_set_stats = deref(apollo_state, custom_set["stats"])
    slot_counts: dict[str, int] = defaultdict(int)

    entries = []
    equipped_items = [
        deref(apollo_state, ref)
        for ref in custom_set["equippedItems"]
    ]
    equipped_items.sort(key=lambda equipped: deref(apollo_state, equipped["slot"])["order"])
    for equipped_item in equipped_items:
        item = deref(apollo_state, equipped_item["item"])
        item_type = deref(apollo_state, item["itemType"])
        exos = [deref(apollo_state, ref) for ref in equipped_item.get("exos", [])]
        entries.append(
            {
                "slot": slot_name_for_equipped_item(equipped_item, apollo_state, slot_counts),
                "name": item["name"],
                "itemType": item_type["name"],
                "exos": [
                    {"stat": stat_name(exo["stat"]), "value": exo["value"]}
                    for exo in exos
                ],
            }
        )
    return custom_set["name"], base_stats_from_custom_set(custom_set_stats), entries


def local_items_by_name_and_type(target: BuildTarget) -> dict[tuple[str, str], dict[str, Any]]:
    items_by_key = {}
    for item in load_items(target):
        key = (item["name"], item["itemType"])
        items_by_key.setdefault(key, item)
    return items_by_key


def action_stats_within_hard_caps(state: BuildState) -> bool:
    hard_caps = hard_cap_target()
    return (
        state.stats.get("AP", 0) <= hard_caps.ap
        and state.stats.get("MP", 0) <= hard_caps.mp
        and state.stats.get("Range", 0) <= hard_caps.range
    )


def build_state_from_entries(
    entries: list[dict[str, Any]],
    base_stats: dict[str, int],
    include_all_mages: bool,
    target: BuildTarget,
    items_by_key: dict[tuple[str, str], dict[str, Any]],
    sets: dict[str, dict[str, Any]],
) -> BuildState:
    state = BuildState(stats=dict(base_stats))
    missing = [
        f"{entry['name']} ({entry['itemType']})"
        for entry in entries
        if (entry["name"], entry["itemType"]) not in items_by_key
    ]
    if missing:
        raise RuntimeError(f"Missing local item matches: {', '.join(missing)}")

    for entry in entries:
        item = items_by_key[(entry["name"], entry["itemType"])]
        state = add_item_to_state(
            state,
            entry["slot"],
            item,
            sets,
            target,
            condition_target=target,
            cap_target=hard_cap_target(),
        )
        if state is None:
            raise RuntimeError(f"Could not equip {entry['name']} in {entry['slot']}")
        item_id = item["dofusID"]
        for exo in entry["exos"]:
            stat = exo["stat"]
            if not include_all_mages and stat not in ACTION_STATS:
                continue
            value = exo["value"]
            state.stats[stat] = state.stats.get(stat, 0) + value
            if stat in ACTION_STATS:
                state.exos[stat] = item_id
                if not action_stats_within_hard_caps(state):
                    raise RuntimeError(
                        f"{entry['name']} {stat} exo exceeds build discovery hard caps"
                    )

    state.condition_failures = unmet_item_conditions(state)
    matched_strategy = next(
        (strategy for strategy in DEFAULT_AP_STRATEGIES if ap_strategy_matches(state, strategy)),
        None,
    )
    state.ap_strategy = matched_strategy.name if matched_strategy else None
    state.score = final_score_state(state)
    return state


def score_view(url: str, target: BuildTarget) -> dict[str, Any]:
    name, source_base_stats, entries = equipped_entries_from_view(url)
    items_by_key = local_items_by_name_and_type(target)
    sets = load_sets()
    raw_source_base = build_state_from_entries(
        entries, source_base_stats, True, target, items_by_key, sets
    )
    normalized_source_base = build_state_from_entries(
        entries, source_base_stats, False, target, items_by_key, sets
    )
    normalized_prototype_base = build_state_from_entries(
        entries, dict(BASE_STATS), False, target, items_by_key, sets
    )
    return {
        "name": name,
        "entries": entries,
        "scores": {
            "rawSourceBase": raw_source_base,
            "normalizedSourceBase": normalized_source_base,
            "normalizedPrototypeBase": normalized_prototype_base,
        },
    }


def state_summary(state: BuildState) -> dict[str, Any]:
    return {
        "score": round(state.score, 2),
        "apStrategy": state.ap_strategy,
        "conditionFailureCount": len(state.condition_failures),
        "totals": {
            stat: state.stats.get(stat, 0)
            for stat in (
                "AP",
                "MP",
                "Range",
                "Strength",
                "Power",
                "Vitality",
                "Earth Damage",
                "Critical",
                "Critical Damage",
                "% Spell Damage",
                "% Ranged Damage",
            )
        },
        "exos": state.exos,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("--target-ap", type=int, default=DEFAULT_TARGET.ap)
    parser.add_argument("--target-mp", type=int, default=DEFAULT_TARGET.mp)
    parser.add_argument("--target-range", type=int, default=DEFAULT_TARGET.range)
    args = parser.parse_args()

    target = BuildTarget(ap=args.target_ap, mp=args.target_mp, range=args.target_range)
    result = score_view(args.url, target)
    print(json.dumps({
        "name": result["name"],
        "scores": {
            key: state_summary(state)
            for key, state in result["scores"].items()
        },
    }, indent=2))


if __name__ == "__main__":
    main()
