#!/usr/bin/env python3
"""
Generate a search-oriented build discovery index from the synced database.

Generate from local synced JSON by default:
    python -m oneoff.generate_build_discovery_index

Generate from the database only when explicitly requested:
    python -m oneoff.generate_build_discovery_index --source db
"""

from __future__ import annotations

import argparse
import json
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any

# The generator is the source of the artifact, so it must read synced DB data
# even if an older generated index already exists.
os.environ["BUILD_DISCOVERY_INDEX_PATH"] = ""

from oneoff.build_discovery_prototype import (
    ACTION_STATS,
    BUILD_DISCOVERY_INDEX_SCHEMA_VERSION,
    EXO_ELIGIBLE_ITEM_TYPES,
    get_name,
    normalize_stats,
)

LEVEL_BUCKETS: tuple[tuple[str, int, int], ...] = (
    ("1-99", 1, 99),
    ("100-149", 100, 149),
    ("150-179", 150, 179),
    ("180-200", 180, 200),
)

SEPARATE_POOL_ITEM_TYPES = {"Dofus", "Trophy", "Prysmaradite", "Pet", "Petsmount", "Mount"}
DOFUS_LIKE_ITEM_TYPES = {"Dofus", "Trophy", "Prysmaradite"}
PET_MOUNT_ITEM_TYPES = {"Pet", "Petsmount", "Mount"}
SOURCE_ITEM_FILES = ("items.json", "weapons.json", "pets.json", "mounts.json")
SOURCE_WEAPON_EFFECT_TYPES = {
    "neutral damage": "NEUTRAL_DAMAGE",
    "neutral steal": "NEUTRAL_STEAL",
    "earth damage": "EARTH_DAMAGE",
    "earth steal": "EARTH_STEAL",
    "fire damage": "FIRE_DAMAGE",
    "fire steal": "FIRE_STEAL",
    "water damage": "WATER_DAMAGE",
    "water steal": "WATER_STEAL",
    "air damage": "AIR_DAMAGE",
    "air steal": "AIR_STEAL",
    "best element damage": "BEST_ELEMENT_DAMAGE",
    "best element steal": "BEST_ELEMENT_STEAL",
}

# Items that prod data shows are useful outside normal level-band filtering.
EVERGREEN_ITEM_IDS = {
    # Core Dofus.
    "694",  # Crimson Dofus
    "7115",  # Ivory Dofus
    "7754",  # Ochre Dofus
    "739",  # Turquoise Dofus
    "7043",  # Ice Dofus
    "6980",  # Vulbis Dofus
    "18043",  # Abyssal Dofus
    "737",  # Emerald Dofus
    "13344",  # Dolmanax
    "8698",  # Cloudy Dofus
    "7112",  # Black-Spotted Dofus
    "7114",  # Ebony Dofus
    "972",  # Cawwot Dofus
    "17078",  # Dokoko
    "20286",  # Sparkling Silver Dofus
    "29136",  # Sylvan Dofus
    # Common action/stat trophies.
    "16333",  # Shaker
    "16335",  # Nomad
    "13830",  # Voyager
    "13829",  # Jackanapes
    "16332",  # Major Vigour
    "13759",  # Major Goliath
    "13828",  # Major Powerhouse
    "16204",  # Major Intellectual
    "16196",  # Major Rabid
    "16248",  # Major Luckster
    "16245",  # Major Stunter
    "16254",  # Major Earth Devastator
    "16260",  # Major Fire Devastator
    "16264",  # Major Water Devastator
    "16267",  # Major Air Devastator
    # Low-level gear that still appears in high-level builds.
    "2469",  # Gelano
    "180",  # Limbo Wand
    "8287",  # Dreggon Helmet
    "8414",  # Dreggon Daggers
    "18678",  # Earth Dial
    "18677",  # Water Dial
    "18679",  # Air Dial
    "18680",  # Fire Dial
    "8695",  # Sword Hikk
}


def level_bucket_name(level: int) -> str | None:
    for bucket_name, min_level, max_level in LEVEL_BUCKETS:
        if min_level <= level <= max_level:
            return bucket_name
    return None


def sorted_unique(values: list[str]) -> list[str]:
    return sorted(set(values), key=lambda value: (len(value), value))


def item_id(item: dict[str, Any]) -> str:
    return str(item["dofusID"])


def source_data_dir() -> str:
    app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(app_root, "app", "database", "data")


def load_source_json(filename: str) -> Any:
    with open(os.path.join(source_data_dir(), filename), encoding="utf-8") as file:
        return json.load(file)


def normalize_source_conditions(conditions: dict[str, Any] | None) -> dict[str, Any]:
    if not conditions:
        return {"conditions": {}, "customConditions": {}}

    return {
        "conditions": conditions.get("conditions") or {},
        "customConditions": conditions.get("customConditions") or {},
    }


def normalize_source_weapon_effect(effect: dict[str, Any]) -> dict[str, Any] | None:
    effect_type = effect.get("effectType")
    if not effect_type:
        effect_type = SOURCE_WEAPON_EFFECT_TYPES.get(str(effect.get("stat", "")).lower())
    if not effect_type:
        return None

    return {
        "effectType": effect_type,
        "minDamage": effect.get("minDamage", effect.get("minStat")) or 0,
        "maxDamage": effect.get("maxDamage", effect.get("maxStat")) or 0,
    }


def normalize_source_weapon_stats(weapon_stats: dict[str, Any] | None) -> dict[str, Any] | None:
    if not weapon_stats:
        return weapon_stats

    normalized = dict(weapon_stats)
    raw_effects = normalized.pop("weapon_effects", normalized.get("weaponEffects", []))
    normalized["weaponEffects"] = [
        effect
        for effect in (normalize_source_weapon_effect(effect) for effect in raw_effects)
        if effect is not None
    ]
    return normalized


def normalize_source_item(item: dict[str, Any], source_filename: str) -> dict[str, Any]:
    normalized = dict(item)
    if source_filename == "mounts.json":
        normalized["dofusID"] = str(normalized.get("mountDofusID"))
        normalized.setdefault("setID", None)
    elif normalized.get("dofusID") is not None:
        normalized["dofusID"] = str(normalized["dofusID"])

    if normalized.get("setID") is not None:
        normalized["setID"] = str(normalized["setID"])

    normalized["buffs"] = normalized.get("buffs") or []
    normalized["conditions"] = normalize_source_conditions(normalized.get("conditions"))
    normalized["weaponStats"] = normalize_source_weapon_stats(normalized.get("weaponStats"))
    return normalized


def load_source_item_records() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for filename in SOURCE_ITEM_FILES:
        items.extend(
            normalize_source_item(item, filename)
            for item in load_source_json(filename)
        )
    return items


def load_source_sets() -> dict[str, dict[str, Any]]:
    return {
        str(set_obj["id"]): set_obj
        for set_obj in load_source_json("sets.json")
    }


def clear_prototype_data_caches(prototype: Any) -> None:
    for function_name in ("load_build_discovery_index", "load_all_item_records", "load_sets"):
        cache_clear = getattr(getattr(prototype, function_name, None), "cache_clear", None)
        if cache_clear:
            cache_clear()


@contextmanager
def prototype_db_source() -> Any:
    from oneoff import build_discovery_prototype as prototype

    original_index_path = prototype.BUILD_DISCOVERY_INDEX_PATH
    prototype.BUILD_DISCOVERY_INDEX_PATH = ""
    clear_prototype_data_caches(prototype)
    try:
        yield prototype
    finally:
        prototype.BUILD_DISCOVERY_INDEX_PATH = original_index_path
        clear_prototype_data_caches(prototype)


def load_db_item_records() -> tuple[dict[str, Any], ...]:
    with prototype_db_source() as prototype:
        return prototype.load_all_item_records()


def load_db_sets() -> dict[str, dict[str, Any]]:
    with prototype_db_source() as prototype:
        return prototype.load_sets()



def item_flags(item: dict[str, Any]) -> dict[str, Any]:
    stats = item.get("_stats") or normalize_stats(item.get("stats", []))
    item_type = item.get("itemType")
    return {
        "givesAP": stats.get("AP", 0) > 0,
        "givesMP": stats.get("MP", 0) > 0,
        "givesRange": stats.get("Range", 0) > 0,
        "hasNegativeAP": stats.get("AP", 0) < 0,
        "hasNegativeMP": stats.get("MP", 0) < 0,
        "hasNegativeRange": stats.get("Range", 0) < 0,
        "isDofusLike": item_type in DOFUS_LIKE_ITEM_TYPES,
        "isPetMount": item_type in PET_MOUNT_ITEM_TYPES,
        "isWeapon": bool(item.get("weaponStats")),
        "isExoEligible": item_type in EXO_ELIGIBLE_ITEM_TYPES,
        "actionStats": {
            stat: stats.get(stat, 0)
            for stat in ACTION_STATS
            if stats.get(stat, 0)
        },
    }


def serializable_item(item: dict[str, Any]) -> dict[str, Any]:
    stats = item.get("_stats") or normalize_stats(item.get("stats", []))
    return {
        "id": item_id(item),
        "name": get_name(item),
        "itemType": item.get("itemType"),
        "level": item.get("level"),
        "setID": item.get("setID"),
        "stats": item.get("stats", []),
        "normalizedStats": stats,
        "buffs": item.get("buffs", []),
        "weaponStats": item.get("weaponStats"),
        "conditions": item.get("conditions") or {"conditions": {}, "customConditions": {}},
        "flags": item_flags(item),
    }


def build_item_indexes(items: list[dict[str, Any]]) -> dict[str, Any]:
    normal_gear_by_bucket: dict[str, list[str]] = {bucket: [] for bucket, _, _ in LEVEL_BUCKETS}
    dofus_like_by_bucket: dict[str, list[str]] = {bucket: [] for bucket, _, _ in LEVEL_BUCKETS}
    pet_mount_ids: list[str] = []
    evergreen_ids: list[str] = []

    for item in items:
        current_id = item_id(item)
        item_type = item.get("itemType")
        bucket = level_bucket_name(item.get("level", 0))
        if current_id in EVERGREEN_ITEM_IDS:
            evergreen_ids.append(current_id)
        if item_type in PET_MOUNT_ITEM_TYPES:
            pet_mount_ids.append(current_id)
        elif item_type in DOFUS_LIKE_ITEM_TYPES:
            if bucket:
                dofus_like_by_bucket[bucket].append(current_id)
        elif item_type not in SEPARATE_POOL_ITEM_TYPES and bucket:
            normal_gear_by_bucket[bucket].append(current_id)

    return {
        "normalGearByLevelBucket": {
            bucket: sorted_unique(ids)
            for bucket, ids in normal_gear_by_bucket.items()
        },
        "dofusTrophyPrysmaraditeByLevelBucket": {
            bucket: sorted_unique(ids)
            for bucket, ids in dofus_like_by_bucket.items()
        },
        "petMountIds": sorted_unique(pet_mount_ids),
        "evergreenItemIds": sorted_unique(evergreen_ids),
        "configuredEvergreenItemIds": sorted_unique(list(EVERGREEN_ITEM_IDS)),
    }


def serializable_set(set_obj: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(set_obj["id"]),
        "name": get_name(set_obj),
        "bonuses": set_obj.get("bonuses", {}),
        "excluded": bool(set_obj.get("_excluded")),
    }


def build_index(source: str = "json") -> dict[str, Any]:
    if source == "json":
        items = load_source_item_records()
        sets = load_source_sets()
    elif source == "db":
        items = list(load_db_item_records())
        sets = load_db_sets()
    else:
        raise ValueError(f"Unsupported build discovery index source: {source}")

    generated_at = datetime.now(timezone.utc).isoformat()
    return {
        "schemaVersion": BUILD_DISCOVERY_INDEX_SCHEMA_VERSION,
        "generatedAt": generated_at,
        "datasetVersion": generated_at,
        "levelBuckets": [
            {"name": name, "minLevel": min_level, "maxLevel": max_level}
            for name, min_level, max_level in LEVEL_BUCKETS
        ],
        "items": [serializable_item(item) for item in items],
        "sets": {
            set_id: serializable_set(set_obj)
            for set_id, set_obj in sets.items()
        },
        "indexes": build_item_indexes(items),
    }


def default_output_path() -> str:
    app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(app_root, "app", "database", "data", "build_discovery_index.json")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=default_output_path())
    parser.add_argument("--source", choices=("db", "json"), default="json")
    args = parser.parse_args()

    write_index(args.output, source=args.source)


def write_index(output_path: str | None = None, source: str = "json") -> dict[str, Any]:
    output_path = output_path or default_output_path()
    index = build_index(source=source)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(index, file, indent=2, sort_keys=True)
        file.write("\n")

    print(
        f"Wrote build discovery index to {output_path} "
        f"({len(index['items'])} items, {len(index['sets'])} sets)."
    )
    return index


if __name__ == "__main__":
    main()
