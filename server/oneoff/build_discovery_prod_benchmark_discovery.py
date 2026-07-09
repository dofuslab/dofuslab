"""Discover bounded prod benchmark candidates for Build Discovery.

This script is intentionally read-only and sample-limited. It summarizes recent
level-200 saved builds so benchmark choices can be grounded in production data
without running broad exploratory queries.
"""

from __future__ import annotations

import argparse
import json
import os
from collections import Counter, defaultdict
from typing import Any

try:
    from sqlalchemy import create_engine, text
except ImportError:
    create_engine = None
    text = None


REPORT_VERSION = "build-discovery-prod-benchmark-discovery-v1"
DEFAULT_SAMPLE_LIMIT = 500
MAX_SAMPLE_LIMIT = 2000
DEFAULT_TOP_ITEMS = 12
MAX_TOP_ITEMS = 50
MIN_PROFILE_SAMPLE_COUNT = 3
DEFAULT_STATEMENT_TIMEOUT_MS = 5000
TARGET_STATS = ("AP", "MP", "RANGE", "STRENGTH", "INTELLIGENCE", "CHANCE", "AGILITY")
def prod_database_url() -> str:
    database_url = os.getenv("DOFUSLAB_READONLY_DATABASE_URL")
    if not database_url:
        raise SystemExit("DOFUSLAB_READONLY_DATABASE_URL is required for prod benchmark discovery.")
    return database_url


def require_sqlalchemy():
    if create_engine is None or text is None:
        raise SystemExit("SQLAlchemy is required. Run this helper inside the server runtime/container.")
    return create_engine, text


def validate_bounds(parser: argparse.ArgumentParser, args: argparse.Namespace) -> None:
    try:
        enforce_bounds(args.sample_limit, args.top_items, args.statement_timeout_ms)
    except ValueError as error:
        parser.error(str(error))


def enforce_bounds(sample_limit: int, top_items: int, statement_timeout_ms: int) -> None:
    if sample_limit < 1 or sample_limit > MAX_SAMPLE_LIMIT:
        raise ValueError(f"--sample-limit must be between 1 and {MAX_SAMPLE_LIMIT}.")
    if top_items < 1 or top_items > MAX_TOP_ITEMS:
        raise ValueError(f"--top-items must be between 1 and {MAX_TOP_ITEMS}.")
    if statement_timeout_ms < 100 or statement_timeout_ms > 30000:
        raise ValueError("--statement-timeout-ms must be between 100 and 30000.")


def recent_build_rows(connection, sample_limit: int, locale: str) -> list[dict[str, Any]]:
    _, sql_text = require_sqlalchemy()
    query = sql_text(
        """
        WITH recent_sets AS (
            SELECT
                cs.uuid,
                cs.level,
                cs.last_modified,
                ct.name AS class_name,
                COALESCE(css.base_strength, 0) + COALESCE(css.scrolled_strength, 0) AS strength_points,
                COALESCE(css.base_intelligence, 0) + COALESCE(css.scrolled_intelligence, 0) AS intelligence_points,
                COALESCE(css.base_chance, 0) + COALESCE(css.scrolled_chance, 0) AS chance_points,
                COALESCE(css.base_agility, 0) + COALESCE(css.scrolled_agility, 0) AS agility_points
            FROM custom_set cs
            LEFT JOIN class_translation ct
                ON ct.class_id = cs.default_class_id AND ct.locale = :locale
            LEFT JOIN custom_set_stat css
                ON css.custom_set_id = cs.uuid
            WHERE cs.level = 200
            ORDER BY cs.last_modified DESC NULLS LAST
            LIMIT :sample_limit
        ),
        item_stat_totals AS (
            SELECT
                rs.uuid AS custom_set_id,
                ist.stat::text AS stat,
                COALESCE(SUM(ist.max_value), 0) AS item_total
            FROM recent_sets rs
            JOIN equipped_item ei
                ON ei.custom_set_id = rs.uuid
            JOIN item_stat ist
                ON ist.item_id = ei.item_id
            WHERE ist.stat::text = ANY(:target_stats)
            GROUP BY rs.uuid, ist.stat
        ),
        exo_totals AS (
            SELECT
                rs.uuid AS custom_set_id,
                eix.stat::text AS stat,
                COALESCE(SUM(eix.value), 0) AS exo_total
            FROM recent_sets rs
            JOIN equipped_item ei
                ON ei.custom_set_id = rs.uuid
            JOIN equipped_item_exo eix
                ON eix.equipped_item_id = ei.uuid
            WHERE eix.stat::text = ANY(:target_stats)
            GROUP BY rs.uuid, eix.stat
        ),
        item_names AS (
            SELECT
                rs.uuid AS custom_set_id,
                ARRAY_AGG(COALESCE(it.name, item.dofus_db_id, item.dofus_db_mount_id) ORDER BY itslot."order") AS equipped_item_names
            FROM recent_sets rs
            JOIN equipped_item ei
                ON ei.custom_set_id = rs.uuid
            JOIN item
                ON item.uuid = ei.item_id
            JOIN item_slot itslot
                ON itslot.uuid = ei.item_slot_id
            LEFT JOIN item_translation it
                ON it.item_id = item.uuid AND it.locale = :locale
            GROUP BY rs.uuid
        )
        SELECT
            rs.uuid::text AS custom_set_id,
            rs.level,
            rs.class_name,
            rs.last_modified,
            rs.strength_points,
            rs.intelligence_points,
            rs.chance_points,
            rs.agility_points,
            COALESCE(ap.item_total, 0) + COALESCE(ap_exo.exo_total, 0) AS ap,
            COALESCE(mp.item_total, 0) + COALESCE(mp_exo.exo_total, 0) AS mp,
            COALESCE(range_stat.item_total, 0) + COALESCE(range_exo.exo_total, 0) AS range,
            COALESCE(strength_stat.item_total, 0) AS item_strength,
            COALESCE(intelligence_stat.item_total, 0) AS item_intelligence,
            COALESCE(chance_stat.item_total, 0) AS item_chance,
            COALESCE(agility_stat.item_total, 0) AS item_agility,
            COALESCE(item_names.equipped_item_names, ARRAY[]::text[]) AS equipped_item_names
        FROM recent_sets rs
        LEFT JOIN item_stat_totals ap
            ON ap.custom_set_id = rs.uuid AND ap.stat = 'AP'
        LEFT JOIN exo_totals ap_exo
            ON ap_exo.custom_set_id = rs.uuid AND ap_exo.stat = 'AP'
        LEFT JOIN item_stat_totals mp
            ON mp.custom_set_id = rs.uuid AND mp.stat = 'MP'
        LEFT JOIN exo_totals mp_exo
            ON mp_exo.custom_set_id = rs.uuid AND mp_exo.stat = 'MP'
        LEFT JOIN item_stat_totals range_stat
            ON range_stat.custom_set_id = rs.uuid AND range_stat.stat = 'RANGE'
        LEFT JOIN exo_totals range_exo
            ON range_exo.custom_set_id = rs.uuid AND range_exo.stat = 'RANGE'
        LEFT JOIN item_stat_totals strength_stat
            ON strength_stat.custom_set_id = rs.uuid AND strength_stat.stat = 'STRENGTH'
        LEFT JOIN item_stat_totals intelligence_stat
            ON intelligence_stat.custom_set_id = rs.uuid AND intelligence_stat.stat = 'INTELLIGENCE'
        LEFT JOIN item_stat_totals chance_stat
            ON chance_stat.custom_set_id = rs.uuid AND chance_stat.stat = 'CHANCE'
        LEFT JOIN item_stat_totals agility_stat
            ON agility_stat.custom_set_id = rs.uuid AND agility_stat.stat = 'AGILITY'
        LEFT JOIN item_names
            ON item_names.custom_set_id = rs.uuid
        ORDER BY rs.last_modified DESC NULLS LAST
        """
    )
    result = connection.execute(
        query,
        {
            "sample_limit": sample_limit,
            "locale": locale,
            "target_stats": list(TARGET_STATS),
        },
    )
    return [dict(row) for row in result]


def dominant_element(row: dict[str, Any]) -> str:
    element_scores = {
        "strength": row.get("strength_points", 0) + row.get("item_strength", 0),
        "intelligence": row.get("intelligence_points", 0) + row.get("item_intelligence", 0),
        "chance": row.get("chance_points", 0) + row.get("item_chance", 0),
        "agility": row.get("agility_points", 0) + row.get("item_agility", 0),
    }
    return max(element_scores, key=element_scores.get)


def bucket_key(row: dict[str, Any]) -> tuple[str, str, int, int, int]:
    return (
        row.get("class_name") or "unknown",
        dominant_element(row),
        int(row.get("ap") or 0),
        int(row.get("mp") or 0),
        int(row.get("range") or 0),
    )


def summarize_rows(rows: list[dict[str, Any]], top_items: int) -> dict[str, Any]:
    class_counts = Counter(row.get("class_name") or "unknown" for row in rows)
    profile_counts = Counter(bucket_key(row) for row in rows)
    item_counts_by_profile: dict[tuple[str, str, int, int, int], Counter[str]] = defaultdict(Counter)
    for row in rows:
        key = bucket_key(row)
        item_counts_by_profile[key].update(row.get("equipped_item_names") or [])

    profiles = []
    for key, count in profile_counts.most_common(20):
        if count < MIN_PROFILE_SAMPLE_COUNT:
            continue
        class_name, element, ap, mp, range_value = key
        profiles.append(
            {
                "className": class_name,
                "element": element,
                "ap": ap,
                "mp": mp,
                "range": range_value,
                "sampleCount": count,
                "commonItems": [
                    {"name": name, "sampleCount": item_count}
                    for name, item_count in item_counts_by_profile[key].most_common(top_items)
                ],
            }
        )

    return {
        "classDistribution": [
            {"className": class_name, "sampleCount": count}
            for class_name, count in class_counts.most_common()
        ],
        "profiles": profiles,
    }


def discover_prod_benchmarks(
    database_url: str,
    sample_limit: int = DEFAULT_SAMPLE_LIMIT,
    top_items: int = DEFAULT_TOP_ITEMS,
    locale: str = "en",
    statement_timeout_ms: int = DEFAULT_STATEMENT_TIMEOUT_MS,
) -> dict[str, Any]:
    enforce_bounds(sample_limit, top_items, statement_timeout_ms)
    engine_factory, sql_text = require_sqlalchemy()
    engine = engine_factory(database_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(sql_text("SET TRANSACTION READ ONLY"))
                connection.execute(sql_text("SET LOCAL statement_timeout = :timeout_ms"), {"timeout_ms": statement_timeout_ms})
                rows = recent_build_rows(connection, sample_limit=sample_limit, locale=locale)
    finally:
        engine.dispose()

    summary = summarize_rows(rows, top_items=top_items)
    return {
        "reportVersion": REPORT_VERSION,
        "source": "prod_readonly_recent_custom_set_sample",
        "assumptions": [
            "custom_set has no explicit popularity metric in the local model, so sampleCount means frequency within the bounded recent level-200 sample.",
            "dominant element is inferred from base/scrolled points plus equipped item primary stats.",
            "AP/MP/Range totals use equipped item max stats plus recorded exos; set bonuses are not included in this discovery report.",
            "Report output is aggregate-only and intentionally omits custom set IDs, names, and owner identifiers.",
        ],
        "limits": {
            "sampleLimit": sample_limit,
            "topItems": top_items,
            "minProfileSampleCount": MIN_PROFILE_SAMPLE_COUNT,
            "statementTimeoutMs": statement_timeout_ms,
            "locale": locale,
        },
        "sample": {
            "rowCount": len(rows),
        },
        **summary,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample-limit", type=int, default=DEFAULT_SAMPLE_LIMIT)
    parser.add_argument("--top-items", type=int, default=DEFAULT_TOP_ITEMS)
    parser.add_argument("--locale", default="en")
    parser.add_argument("--statement-timeout-ms", type=int, default=DEFAULT_STATEMENT_TIMEOUT_MS)
    args = parser.parse_args()
    validate_bounds(parser, args)
    report = discover_prod_benchmarks(
        prod_database_url(),
        sample_limit=args.sample_limit,
        top_items=args.top_items,
        locale=args.locale,
        statement_timeout_ms=args.statement_timeout_ms,
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
