"""Derive anonymized level reference anchors from bounded production samples."""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_core import (  # noqa: E402
    DB_STAT_NAMES,
    GENERIC_DAMAGE_PROFILE_LINES,
    PROFILE_DAMAGE_REFERENCE_CRITICAL,
    PROFILE_DAMAGE_REFERENCE_CRITICAL_DAMAGE,
    PROFILE_DAMAGE_REFERENCE_ELEMENTAL_DAMAGE,
    PROFILE_DAMAGE_REFERENCE_POWER,
    PROFILE_DAMAGE_REFERENCE_PRIMARY_STAT,
    REFERENCE_LEVEL_BUCKETS,
    apply_stat_delta,
    base_ap_for_level,
    load_all_item_records,
    load_sets,
    reference_anchor_level,
    set_bonus_stats,
)
from oneoff.damage_calculator import DamageLine, profile_damage  # noqa: E402


REPORT_VERSION = "build-discovery-reference-anchors-v1"
ANCHOR_LEVELS = tuple(bucket[0] for bucket in REFERENCE_LEVEL_BUCKETS)
ELEMENTS = ("strength", "intelligence", "chance", "agility")
PRIMARY_STAT = {
    "strength": "Strength",
    "intelligence": "Intelligence",
    "chance": "Chance",
    "agility": "Agility",
}
ELEMENT_DAMAGE = {
    "strength": "Earth Damage",
    "intelligence": "Fire Damage",
    "chance": "Water Damage",
    "agility": "Air Damage",
}
ELEMENT_NAME = {
    "strength": "earth",
    "intelligence": "fire",
    "chance": "water",
    "agility": "air",
}
SLOT_BY_ORDER = {
    0: "hat",
    1: "cloak",
    2: "amulet",
    3: "ring_1",
    4: "ring_2",
    5: "belt",
    6: "boots",
    7: "weapon",
    8: "shield",
    9: "pet",
    10: "dofus_1",
    11: "dofus_2",
    12: "dofus_3",
    13: "dofus_4",
    14: "dofus_5",
    15: "dofus_6",
}
MIN_COMPLETE_SLOTS = 16
MONO_ELEMENT_SHARE = 0.70
TOP_FRACTION = 0.10
DEFAULT_CANDIDATE_LIMIT = 1500
DEFAULT_SAMPLE_LIMIT = 300
DEFAULT_STATEMENT_TIMEOUT_MS = 25000


def anchor_level(level: int) -> int:
    return reference_anchor_level(level)


def median(values: list[int]) -> int:
    ordered = sorted(values)
    return round((ordered[(len(ordered) - 1) // 2] + ordered[len(ordered) // 2]) / 2)


def fetch_rows(
    database_url: str,
    *,
    candidate_limit: int,
    sample_limit: int,
    statement_timeout_ms: int,
) -> list[dict[str, Any]]:
    anchor_case = "\n".join(
        f"WHEN cs.level BETWEEN {minimum} AND {maximum} THEN {anchor}"
        for anchor, minimum, maximum in REFERENCE_LEVEL_BUCKETS
    )
    query = text(
        f"""
        WITH raw_candidates AS (
            SELECT
                cs.uuid,
                cs.level,
                cs.last_modified,
                CASE
                    {anchor_case}
                END AS anchor_level
            FROM custom_set cs
            WHERE cs.level BETWEEN 1 AND 200
              AND cs.default_class_id IS NOT NULL
              AND (
                  cs.level <= 40
                  OR cs.last_modified >= CURRENT_TIMESTAMP - INTERVAL '1 year'
              )
        ),
        ranked_candidates AS (
            SELECT *, ROW_NUMBER() OVER (
                PARTITION BY anchor_level ORDER BY last_modified DESC
            ) AS candidate_rank
            FROM raw_candidates
        ),
        complete_candidates AS (
            SELECT rc.uuid, rc.level, rc.anchor_level, rc.last_modified
            FROM ranked_candidates rc
            JOIN equipped_item ei ON ei.custom_set_id = rc.uuid
            WHERE rc.candidate_rank <= :candidate_limit
            GROUP BY rc.uuid, rc.level, rc.anchor_level, rc.last_modified
            HAVING COUNT(DISTINCT ei.item_slot_id) >= :min_slots
        ),
        selected AS (
            SELECT *, ROW_NUMBER() OVER (
                PARTITION BY anchor_level ORDER BY last_modified DESC
            ) AS sample_rank
            FROM complete_candidates
        )
        SELECT
            selected.uuid::text AS build_key,
            selected.level,
            selected.anchor_level,
            item_slot."order" AS slot_order,
            COALESCE(item.dofus_db_id, item.dofus_db_mount_id) AS dofus_id,
            equipped_item_exo.stat::text AS exo_stat,
            equipped_item_exo.value AS exo_value,
            custom_set_stat.base_vitality,
            custom_set_stat.base_wisdom,
            custom_set_stat.base_strength,
            custom_set_stat.base_intelligence,
            custom_set_stat.base_chance,
            custom_set_stat.base_agility,
            custom_set_stat.scrolled_vitality,
            custom_set_stat.scrolled_wisdom,
            custom_set_stat.scrolled_strength,
            custom_set_stat.scrolled_intelligence,
            custom_set_stat.scrolled_chance,
            custom_set_stat.scrolled_agility
        FROM selected
        JOIN equipped_item ON equipped_item.custom_set_id = selected.uuid
        JOIN item ON item.uuid = equipped_item.item_id
        JOIN item_slot ON item_slot.uuid = equipped_item.item_slot_id
        LEFT JOIN equipped_item_exo
          ON equipped_item_exo.equipped_item_id = equipped_item.uuid
        LEFT JOIN custom_set_stat
          ON custom_set_stat.custom_set_id = selected.uuid
        WHERE selected.sample_rank <= :sample_limit
        ORDER BY selected.anchor_level, selected.uuid, item_slot."order"
        """
    )
    engine = create_engine(database_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(text("SET TRANSACTION READ ONLY"))
                connection.execute(
                    text("SET LOCAL statement_timeout = :timeout_ms"),
                    {"timeout_ms": statement_timeout_ms},
                )
                return [
                    dict(row)
                    for row in connection.execute(
                        query,
                        {
                            "candidate_limit": candidate_limit,
                            "sample_limit": sample_limit,
                            "min_slots": MIN_COMPLETE_SLOTS,
                        },
                    )
                ]
    finally:
        engine.dispose()


def initial_stats(row: dict[str, Any]) -> dict[str, int]:
    stats = {"AP": base_ap_for_level(row["level"]), "MP": 3}
    for key, stat in (
        ("vitality", "Vitality"),
        ("wisdom", "Wisdom"),
        ("strength", "Strength"),
        ("intelligence", "Intelligence"),
        ("chance", "Chance"),
        ("agility", "Agility"),
    ):
        stats[stat] = int(row.get(f"base_{key}") or 0) + int(
            row.get(f"scrolled_{key}") or 0
        )
    return stats


def mono_element(stats: dict[str, int]) -> str | None:
    characteristic_floor = min(stats.get(stat, 0) for stat in PRIMARY_STAT.values())
    signals = {
        element: max(stats.get(PRIMARY_STAT[element], 0) - characteristic_floor, 0)
        + 4 * max(stats.get(ELEMENT_DAMAGE[element], 0), 0)
        for element in ELEMENTS
    }
    total = sum(signals.values())
    element, strongest = max(signals.items(), key=lambda item: item[1])
    if strongest < 30 or not total or strongest / total < MONO_ELEMENT_SHARE:
        return None
    return element


def damage_score(stats: dict[str, int], element: str) -> float:
    lines = [
        DamageLine(
            element=ELEMENT_NAME[element],
            base_min=minimum,
            base_max=maximum,
            crit_chance=critical,
            weight=weight,
        )
        for minimum, maximum, critical, weight in GENERIC_DAMAGE_PROFILE_LINES
    ]
    return profile_damage(lines, stats)


def normalize_builds(
    rows: list[dict[str, Any]]
) -> tuple[dict[int, list[dict]], Counter]:
    items = {item["dofusID"]: item for item in load_all_item_records(score_items=False)}
    sets = load_sets()
    grouped: dict[str, dict[str, Any]] = {}
    for row in rows:
        slot = SLOT_BY_ORDER.get(row["slot_order"])
        item_id = row.get("dofus_id")
        if slot is None or item_id is None:
            continue
        build = grouped.setdefault(row["build_key"], {"row": row, "slots": {}})
        equipped = build["slots"].setdefault(
            slot, {"item_id": str(item_id), "exos": []}
        )
        if row.get("exo_stat") in DB_STAT_NAMES and row.get("exo_value"):
            equipped["exos"].append(
                (DB_STAT_NAMES[row["exo_stat"]], int(row["exo_value"]))
            )

    normalized: dict[int, list[dict]] = defaultdict(list)
    rejection_counts: Counter = Counter()
    for build in grouped.values():
        row = build["row"]
        anchor = anchor_level(row["level"])
        if len(build["slots"]) < MIN_COMPLETE_SLOTS:
            rejection_counts[(anchor, "incomplete")] += 1
            continue
        stats = initial_stats(row)
        set_counts: Counter = Counter()
        valid = True
        for equipped in build["slots"].values():
            item = items.get(equipped["item_id"])
            if item is None:
                valid = False
                break
            apply_stat_delta(stats, item.get("_stats") or {})
            if item.get("setID"):
                set_counts[item["setID"]] += 1
            for stat, value in equipped["exos"]:
                stats[stat] = stats.get(stat, 0) + value
        if not valid:
            rejection_counts[(anchor, "missing_item")] += 1
            continue
        for set_id, count in set_counts.items():
            apply_stat_delta(
                stats,
                set_bonus_stats(sets.get(set_id, {})).get(str(count), {}),
            )
        element = mono_element(stats)
        if element is None:
            rejection_counts[(anchor, "not_mono")] += 1
            continue
        normalized[anchor].append(
            {
                "element": element,
                "damageScore": damage_score(stats, element),
                "AP": stats.get("AP", 0),
                "PrimaryStat": stats.get(PRIMARY_STAT[element], 0),
                "Power": stats.get("Power", 0),
                "ElementalDamage": stats.get(ELEMENT_DAMAGE[element], 0),
                "Critical": stats.get("Critical", 0),
                "CriticalDamage": stats.get("Critical Damage", 0),
            }
        )
    return normalized, rejection_counts


def extrapolated_low_level_anchor(
    representative_level: int, level_60_bucket: dict[str, int]
) -> dict[str, int]:
    ratio = representative_level / 79
    baseline = {
        "AP": 6,
        "PrimaryStat": 0,
        "Power": 0,
        "ElementalDamage": 0,
        "Critical": 0,
        "CriticalDamage": 0,
    }
    return {
        stat: round(baseline[stat] + (level_60_bucket[stat] - baseline[stat]) * ratio)
        for stat in baseline
    }


def build_report(rows: list[dict[str, Any]]) -> dict[str, Any]:
    builds, rejection_counts = normalize_builds(rows)
    anchors = {}
    for level in ANCHOR_LEVELS:
        candidates = sorted(
            builds.get(level, []), key=lambda build: build["damageScore"], reverse=True
        )
        selected_count = (
            max(math.ceil(len(candidates) * TOP_FRACTION), 1) if candidates else 0
        )
        selected = candidates[:selected_count]
        anchors[str(level)] = {
            "source": "production_top_damage_decile",
            "sampleCount": len(candidates),
            "selectedCount": selected_count,
            "elementCounts": dict(Counter(build["element"] for build in candidates)),
            "stats": {
                stat: median([build[stat] for build in selected])
                for stat in (
                    "AP",
                    "PrimaryStat",
                    "Power",
                    "ElementalDamage",
                    "Critical",
                    "CriticalDamage",
                )
            }
            if selected
            else None,
        }
    level_60_bucket = anchors["60"]["stats"]
    for anchor, representative_level in ((20, 20), (21, 39), (40, 59)):
        if anchors[str(anchor)]["sampleCount"] < 10:
            anchors[str(anchor)]["source"] = "level_60_bucket_linear_fallback"
            anchors[str(anchor)]["stats"] = extrapolated_low_level_anchor(
                representative_level, level_60_bucket
            )
    observed_level_200_stats = anchors["200"]["stats"]
    anchors["200"].update(
        {
            "source": "quality_calibrated_existing_reference",
            "observedProductionStats": observed_level_200_stats,
            "stats": {
                "AP": 12,
                "PrimaryStat": PROFILE_DAMAGE_REFERENCE_PRIMARY_STAT,
                "Power": PROFILE_DAMAGE_REFERENCE_POWER,
                "ElementalDamage": PROFILE_DAMAGE_REFERENCE_ELEMENTAL_DAMAGE,
                "Critical": PROFILE_DAMAGE_REFERENCE_CRITICAL,
                "CriticalDamage": PROFILE_DAMAGE_REFERENCE_CRITICAL_DAMAGE,
            },
        }
    )
    return {
        "reportVersion": REPORT_VERSION,
        "method": {
            "recentWindow": "1 year (all-time fallback candidates at levels 1-40)",
            "completeSlotMinimum": MIN_COMPLETE_SLOTS,
            "monoElementMinimumShare": MONO_ELEMENT_SHARE,
            "topDamageFraction": TOP_FRACTION,
            "summary": "median stat line among the top generic-damage decile",
            "levelBuckets": [
                f"{minimum}-{maximum}"
                for _anchor, minimum, maximum in REFERENCE_LEVEL_BUCKETS
            ],
            "level200Policy": (
                "retain the quality-calibrated reference and report the production "
                "median separately"
            ),
            "retainedProductionIdentifiers": False,
        },
        "anchors": anchors,
        "rejections": {
            str(level): {
                reason: rejection_counts[(level, reason)]
                for reason in ("incomplete", "missing_item", "not_mono")
            }
            for level in ANCHOR_LEVELS
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--candidate-limit", type=int, default=DEFAULT_CANDIDATE_LIMIT)
    parser.add_argument("--sample-limit", type=int, default=DEFAULT_SAMPLE_LIMIT)
    parser.add_argument(
        "--statement-timeout-ms", type=int, default=DEFAULT_STATEMENT_TIMEOUT_MS
    )
    args = parser.parse_args()
    database_url = os.getenv("DOFUSLAB_READONLY_DATABASE_URL")
    if not database_url:
        raise ValueError("DOFUSLAB_READONLY_DATABASE_URL is required")
    rows = fetch_rows(
        database_url,
        candidate_limit=args.candidate_limit,
        sample_limit=args.sample_limit,
        statement_timeout_ms=args.statement_timeout_ms,
    )
    report = build_report(rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"anchors": report["anchors"]}, indent=2))


if __name__ == "__main__":
    main()
