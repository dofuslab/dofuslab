"""Discover common AP/MP/Range targets by level from prod custom sets.

The output is aggregate-only and intended to choose level-diversity benchmark
targets. It is deliberately bounded and read-only.
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


REPORT_VERSION = "build-discovery-prod-level-target-discovery-v1"
DEFAULT_SAMPLE_LIMIT = 300
MAX_SAMPLE_LIMIT = 10000
DEFAULT_TOP_TARGETS = 8
MAX_TOP_TARGETS = 30
DEFAULT_STATEMENT_TIMEOUT_MS = 5000
TARGET_STATS = ("AP", "MP", "RANGE")


def preflight_status() -> dict[str, Any]:
    return {
        "reportVersion": REPORT_VERSION,
        "mode": "preflight",
        "environment": {
            "readonlyDatabaseUrlPresent": bool(os.getenv("DOFUSLAB_READONLY_DATABASE_URL")),
            "sqlalchemyAvailable": create_engine is not None and text is not None,
        },
        "safety": {
            "opensDatabaseConnection": False,
            "printsDatabaseUrl": False,
            "aggregateOnly": True,
        },
    }


def prod_database_url() -> str:
    database_url = os.getenv("DOFUSLAB_READONLY_DATABASE_URL")
    if not database_url:
        raise SystemExit("DOFUSLAB_READONLY_DATABASE_URL is required for prod level target discovery.")
    return database_url


def require_sqlalchemy():
    if create_engine is None or text is None:
        raise SystemExit("SQLAlchemy is required. Run this helper inside the server runtime/container.")
    return create_engine, text


def enforce_bounds(sample_limit: int, top_targets: int, statement_timeout_ms: int) -> None:
    if sample_limit < 1 or sample_limit > MAX_SAMPLE_LIMIT:
        raise ValueError(f"--sample-limit must be between 1 and {MAX_SAMPLE_LIMIT}.")
    if top_targets < 1 or top_targets > MAX_TOP_TARGETS:
        raise ValueError(f"--top-targets must be between 1 and {MAX_TOP_TARGETS}.")
    if statement_timeout_ms < 100 or statement_timeout_ms > 30000:
        raise ValueError("--statement-timeout-ms must be between 100 and 30000.")


def level_bucket(level: int, bucket_size: int) -> str:
    start = ((max(level, 1) - 1) // bucket_size) * bucket_size + 1
    end = min(start + bucket_size - 1, 200)
    return f"{start}-{end}"


def base_ap_for_level(level: int) -> int:
    return 7 if level >= 100 else 6


def recent_target_rows(
    connection,
    *,
    sample_limit: int,
    locale: str,
    class_name: str | None,
    min_level: int,
    max_level: int,
) -> list[dict[str, Any]]:
    _, sql_text = require_sqlalchemy()
    query = sql_text(
        """
        WITH recent_sets AS (
            SELECT
                cs.uuid,
                cs.level,
                cs.last_modified,
                ct.name AS class_name
            FROM custom_set cs
            LEFT JOIN class_translation ct
                ON ct.class_id = cs.default_class_id AND ct.locale = :locale
            WHERE cs.level BETWEEN :min_level AND :max_level
              AND (:class_name IS NULL OR ct.name = :class_name)
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
        set_counts AS (
            SELECT
                rs.uuid AS custom_set_id,
                item.set_id,
                COUNT(*) AS equipped_count
            FROM recent_sets rs
            JOIN equipped_item ei
                ON ei.custom_set_id = rs.uuid
            JOIN item
                ON item.uuid = ei.item_id
            WHERE item.set_id IS NOT NULL
            GROUP BY rs.uuid, item.set_id
        ),
        set_bonus_totals AS (
            SELECT
                sc.custom_set_id,
                sb.stat::text AS stat,
                COALESCE(SUM(sb.value), 0) AS set_bonus_total
            FROM set_counts sc
            JOIN set_bonus sb
                ON sb.set_id = sc.set_id AND sb.num_items = sc.equipped_count
            WHERE sb.stat::text = ANY(:target_stats)
            GROUP BY sc.custom_set_id, sb.stat
        )
        SELECT
            rs.level,
            rs.class_name,
            COUNT(*) OVER (PARTITION BY rs.level) AS level_sample_count,
            (CASE WHEN rs.level >= 100 THEN 7 ELSE 6 END)
                + COALESCE(ap.item_total, 0)
                + COALESCE(ap_exo.exo_total, 0)
                + COALESCE(ap_set.set_bonus_total, 0) AS ap,
            3
                + COALESCE(mp.item_total, 0)
                + COALESCE(mp_exo.exo_total, 0)
                + COALESCE(mp_set.set_bonus_total, 0) AS mp,
            COALESCE(range_stat.item_total, 0)
                + COALESCE(range_exo.exo_total, 0)
                + COALESCE(range_set.set_bonus_total, 0) AS range
        FROM recent_sets rs
        LEFT JOIN item_stat_totals ap
            ON ap.custom_set_id = rs.uuid AND ap.stat = 'AP'
        LEFT JOIN exo_totals ap_exo
            ON ap_exo.custom_set_id = rs.uuid AND ap_exo.stat = 'AP'
        LEFT JOIN set_bonus_totals ap_set
            ON ap_set.custom_set_id = rs.uuid AND ap_set.stat = 'AP'
        LEFT JOIN item_stat_totals mp
            ON mp.custom_set_id = rs.uuid AND mp.stat = 'MP'
        LEFT JOIN exo_totals mp_exo
            ON mp_exo.custom_set_id = rs.uuid AND mp_exo.stat = 'MP'
        LEFT JOIN set_bonus_totals mp_set
            ON mp_set.custom_set_id = rs.uuid AND mp_set.stat = 'MP'
        LEFT JOIN item_stat_totals range_stat
            ON range_stat.custom_set_id = rs.uuid AND range_stat.stat = 'RANGE'
        LEFT JOIN exo_totals range_exo
            ON range_exo.custom_set_id = rs.uuid AND range_exo.stat = 'RANGE'
        LEFT JOIN set_bonus_totals range_set
            ON range_set.custom_set_id = rs.uuid AND range_set.stat = 'RANGE'
        ORDER BY rs.last_modified DESC NULLS LAST
        """
    )
    result = connection.execute(
        query,
        {
            "sample_limit": sample_limit,
            "locale": locale,
            "class_name": class_name,
            "min_level": min_level,
            "max_level": max_level,
            "target_stats": list(TARGET_STATS),
        },
    )
    return [dict(row) for row in result]


def summarize_rows(rows: list[dict[str, Any]], *, bucket_size: int, top_targets: int) -> dict[str, Any]:
    exact_counts: dict[int, Counter[tuple[int, int, int]]] = defaultdict(Counter)
    bucket_counts: dict[str, Counter[tuple[int, int, int]]] = defaultdict(Counter)
    bucket_levels: dict[str, Counter[int]] = defaultdict(Counter)

    for row in rows:
        level = int(row["level"])
        target = (int(row["ap"] or 0), int(row["mp"] or 0), int(row["range"] or 0))
        bucket = level_bucket(level, bucket_size)
        exact_counts[level][target] += 1
        bucket_counts[bucket][target] += 1
        bucket_levels[bucket][level] += 1

    exact_level_targets = []
    for level in sorted(exact_counts):
        total = sum(exact_counts[level].values())
        exact_level_targets.append(
            {
                "level": level,
                "sampleCount": total,
                "baseAP": base_ap_for_level(level),
                "topTargets": [
                    {"ap": ap, "mp": mp, "range": range_value, "sampleCount": count}
                    for (ap, mp, range_value), count in exact_counts[level].most_common(top_targets)
                ],
            }
        )

    bucket_targets = []
    for bucket in sorted(bucket_counts, key=lambda value: int(value.split("-")[0])):
        total = sum(bucket_counts[bucket].values())
        representative_level = bucket_levels[bucket].most_common(1)[0][0]
        bucket_targets.append(
            {
                "bucket": bucket,
                "representativeLevel": representative_level,
                "sampleCount": total,
                "topTargets": [
                    {"ap": ap, "mp": mp, "range": range_value, "sampleCount": count}
                    for (ap, mp, range_value), count in bucket_counts[bucket].most_common(top_targets)
                ],
            }
        )

    return {
        "rowCount": len(rows),
        "bucketTargets": bucket_targets,
        "exactLevelTargets": exact_level_targets,
    }


def discover_prod_level_targets(
    database_url: str,
    *,
    sample_limit: int = DEFAULT_SAMPLE_LIMIT,
    top_targets: int = DEFAULT_TOP_TARGETS,
    locale: str = "en",
    class_name: str | None = "Iop",
    min_level: int = 1,
    max_level: int = 200,
    bucket_size: int = 20,
    statement_timeout_ms: int = DEFAULT_STATEMENT_TIMEOUT_MS,
) -> dict[str, Any]:
    enforce_bounds(sample_limit, top_targets, statement_timeout_ms)
    engine_factory, sql_text = require_sqlalchemy()
    engine = engine_factory(database_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(sql_text("SET TRANSACTION READ ONLY"))
                connection.execute(sql_text("SET LOCAL statement_timeout = :timeout_ms"), {"timeout_ms": statement_timeout_ms})
                rows = recent_target_rows(
                    connection,
                    sample_limit=sample_limit,
                    locale=locale,
                    class_name=class_name,
                    min_level=min_level,
                    max_level=max_level,
                )
    finally:
        engine.dispose()

    return {
        "reportVersion": REPORT_VERSION,
        "source": "prod_readonly_recent_custom_set_level_target_sample",
        "assumptions": [
            "AP includes level baseline AP, equipped item AP, exos, and exact active set bonus AP.",
            "MP includes base 3 MP, equipped item MP, exos, and exact active set bonus MP.",
            "Range includes equipped item Range, exos, and exact active set bonus Range.",
            "Rows are recent custom_set records, not popularity-weighted usage.",
            "Report output is aggregate-only and intentionally omits custom set IDs, names, and owners.",
        ],
        "limits": {
            "sampleLimit": sample_limit,
            "topTargets": top_targets,
            "locale": locale,
            "className": class_name,
            "minLevel": min_level,
            "maxLevel": max_level,
            "bucketSize": bucket_size,
            "statementTimeoutMs": statement_timeout_ms,
        },
        **summarize_rows(rows, bucket_size=bucket_size, top_targets=top_targets),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample-limit", type=int, default=DEFAULT_SAMPLE_LIMIT)
    parser.add_argument("--top-targets", type=int, default=DEFAULT_TOP_TARGETS)
    parser.add_argument("--locale", default="en")
    parser.add_argument("--class-name", default="Iop")
    parser.add_argument("--all-classes", action="store_true")
    parser.add_argument("--min-level", type=int, default=1)
    parser.add_argument("--max-level", type=int, default=200)
    parser.add_argument("--bucket-size", type=int, default=20)
    parser.add_argument("--statement-timeout-ms", type=int, default=DEFAULT_STATEMENT_TIMEOUT_MS)
    parser.add_argument(
        "--check-env",
        action="store_true",
        help="Print non-secret environment/runtime readiness without connecting to prod.",
    )
    args = parser.parse_args()
    if args.check_env:
        print(json.dumps(preflight_status(), indent=2))
        return
    try:
        report = discover_prod_level_targets(
            prod_database_url(),
            sample_limit=args.sample_limit,
            top_targets=args.top_targets,
            locale=args.locale,
            class_name=None if args.all_classes else args.class_name,
            min_level=args.min_level,
            max_level=args.max_level,
            bucket_size=args.bucket_size,
            statement_timeout_ms=args.statement_timeout_ms,
        )
    except ValueError as error:
        parser.error(str(error))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
