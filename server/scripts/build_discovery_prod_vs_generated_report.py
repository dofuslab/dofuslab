"""Compare generated Build Discovery results with normalized recent prod builds.

The report is deliberately offline and read-only.  It does not expose custom-set,
user, or item-level production identifiers: production builds are used only as
anonymous scoring baselines for common query cohorts.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_cpsat_runner import (  # noqa: E402
    DEFAULT_FAST_TIME_LIMIT_SECONDS,
    build_cpsat_args,
    solve_cpsat_query,
)
from oneoff.build_discovery_core import (  # noqa: E402
    DB_STAT_NAMES,
    BuildDiscoveryQuery,
    BuildState,
    active_base_stats,
    apply_stat_delta,
    availability_tier_for_item,
    configure_damage_profile,
    effective_scoring_stats,
    final_score_state,
    load_all_item_records,
    load_sets,
    optimize_base_allocation,
    set_bonus_stats,
    SUPPORTED_CLASS_NAMES,
    target_level_context,
)


REPORT_VERSION = "build-discovery-prod-vs-generated-v1"
DEFAULT_BUILD_SAMPLE_LIMIT = 2000
MAX_BUILD_SAMPLE_LIMIT = 3000
DEFAULT_QUERY_LIMIT = 100
MAX_QUERY_LIMIT = 100
DEFAULT_STATEMENT_TIMEOUT_MS = 20000
MIN_EQUIPPED_SLOT_COUNT = 16
RECENT_WINDOW = "1 year"
DEFAULT_PRESET = 3
DEFAULT_BUDGET_TIER = 4
DEFAULT_EXO_POLICY = "opti"
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
ELEMENTS = ("strength", "intelligence", "chance", "agility")
PRIMARY_STAT_BY_ELEMENT = {
    "strength": "Strength",
    "intelligence": "Intelligence",
    "chance": "Chance",
    "agility": "Agility",
}


@dataclass(frozen=True)
class ProductionBuild:
    source_class: str
    slots: tuple[tuple[str, str, tuple[tuple[str, int], ...]], ...]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--build-sample-limit", type=int, default=DEFAULT_BUILD_SAMPLE_LIMIT)
    parser.add_argument("--query-limit", type=int, default=DEFAULT_QUERY_LIMIT)
    parser.add_argument("--statement-timeout-ms", type=int, default=DEFAULT_STATEMENT_TIMEOUT_MS)
    parser.add_argument("--solver-time-limit-seconds", type=float, default=DEFAULT_FAST_TIME_LIMIT_SECONDS)
    parser.add_argument("--solver-workers", type=int, default=2)
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if not 1 <= args.build_sample_limit <= MAX_BUILD_SAMPLE_LIMIT:
        raise ValueError(
            f"--build-sample-limit must be between 1 and {MAX_BUILD_SAMPLE_LIMIT}."
        )
    if not 1 <= args.query_limit <= MAX_QUERY_LIMIT:
        raise ValueError(f"--query-limit must be between 1 and {MAX_QUERY_LIMIT}.")
    if not 100 <= args.statement_timeout_ms <= 30000:
        raise ValueError("--statement-timeout-ms must be between 100 and 30000.")
    if args.solver_time_limit_seconds <= 0:
        raise ValueError("--solver-time-limit-seconds must be positive.")
    if args.solver_workers < 1:
        raise ValueError("--solver-workers must be positive.")


def readonly_database_url() -> str:
    value = os.getenv("DOFUSLAB_READONLY_DATABASE_URL")
    if not value:
        raise ValueError("DOFUSLAB_READONLY_DATABASE_URL is required.")
    return value


def fetch_recent_complete_builds(
    database_url: str,
    *,
    sample_limit: int,
    statement_timeout_ms: int,
) -> list[ProductionBuild]:
    """Load a bounded recent sample without returning names, owners, or IDs."""

    query = text(
        """
        WITH recent_candidates AS (
            SELECT cs.uuid, ct.name AS source_class
            FROM custom_set cs
            JOIN class_translation ct
              ON ct.class_id = cs.default_class_id AND ct.locale = 'en'
            WHERE cs.level = 200
              AND cs.last_modified >= CURRENT_TIMESTAMP - INTERVAL '1 year'
            ORDER BY cs.last_modified DESC
            LIMIT :candidate_limit
        ),
        complete_sets AS (
            SELECT rc.uuid, rc.source_class
            FROM recent_candidates rc
            JOIN equipped_item ei ON ei.custom_set_id = rc.uuid
            GROUP BY rc.uuid, rc.source_class
            HAVING COUNT(DISTINCT ei.item_slot_id) >= :min_slots
        ),
        selected_sets AS (
            SELECT uuid, source_class
            FROM complete_sets
            ORDER BY uuid
            LIMIT :sample_limit
        )
        SELECT
            ss.uuid::text AS build_key,
            ss.source_class,
            item_slot."order" AS slot_order,
            COALESCE(item.dofus_db_id, item.dofus_db_mount_id) AS dofus_id,
            equipped_item_exo.stat::text AS exo_stat,
            equipped_item_exo.value AS exo_value
        FROM selected_sets ss
        JOIN equipped_item ON equipped_item.custom_set_id = ss.uuid
        JOIN item ON item.uuid = equipped_item.item_id
        JOIN item_slot ON item_slot.uuid = equipped_item.item_slot_id
        LEFT JOIN equipped_item_exo
          ON equipped_item_exo.equipped_item_id = equipped_item.uuid
        ORDER BY ss.uuid, item_slot."order", equipped_item_exo.stat
        """
    )
    candidate_limit = min(sample_limit * 4, MAX_BUILD_SAMPLE_LIMIT * 4)
    engine = create_engine(database_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            with connection.begin():
                connection.execute(text("SET TRANSACTION READ ONLY"))
                connection.execute(
                    text("SET LOCAL statement_timeout = :timeout_ms"),
                    {"timeout_ms": statement_timeout_ms},
                )
                rows = [dict(row) for row in connection.execute(
                    query,
                    {
                        "candidate_limit": candidate_limit,
                        "sample_limit": sample_limit,
                        "min_slots": MIN_EQUIPPED_SLOT_COUNT,
                    },
                )]
    finally:
        engine.dispose()

    grouped: dict[str, dict[str, Any]] = {}
    for row in rows:
        slot_name = SLOT_BY_ORDER.get(row["slot_order"])
        dofus_id = row.get("dofus_id")
        if not slot_name or not dofus_id:
            continue
        build = grouped.setdefault(
            row["build_key"],
            {"source_class": row["source_class"], "slots": {}},
        )
        slot = build["slots"].setdefault(
            slot_name,
            {"dofus_id": str(dofus_id), "exos": []},
        )
        if row.get("exo_stat") in DB_STAT_NAMES and row.get("exo_value"):
            slot["exos"].append((row["exo_stat"], int(row["exo_value"])))

    return [
        ProductionBuild(
            source_class=build["source_class"],
            slots=tuple(
                (slot_name, slot["dofus_id"], tuple(slot["exos"]))
                for slot_name, slot in sorted(build["slots"].items())
            ),
        )
        for build in grouped.values()
        if len(build["slots"]) >= MIN_EQUIPPED_SLOT_COUNT
    ]


def local_items_by_id() -> dict[str, dict[str, Any]]:
    return {
        item["dofusID"]: item
        for item in load_all_item_records(score_items=False)
    }


def normalized_state(
    build: ProductionBuild,
    items_by_id: dict[str, dict[str, Any]],
    sets: dict[str, dict[str, Any]],
) -> BuildState | None:
    state = BuildState(stats=dict(active_base_stats()))
    for slot_name, dofus_id, exos in build.slots:
        item = items_by_id.get(dofus_id)
        if item is None or slot_name in state.slots:
            return None
        state.slots[slot_name] = item
        state.used_item_ids.add(dofus_id)
        apply_stat_delta(state.stats, item.get("_stats") or {})
        set_id = item.get("setID")
        if set_id:
            state.set_counts[set_id] = state.set_counts.get(set_id, 0) + 1
        for stat_key, value in exos:
            stat_name = DB_STAT_NAMES[stat_key]
            state.stats[stat_name] = state.stats.get(stat_name, 0) + value
            state.exos.setdefault(stat_name, dofus_id)

    for set_id, count in state.set_counts.items():
        apply_stat_delta(state.stats, set_bonus_stats(sets.get(set_id, {})).get(str(count), {}))
    return state


def dominant_element(state: BuildState) -> str:
    stats = effective_scoring_stats(state)
    return max(ELEMENTS, key=lambda element: stats.get(PRIMARY_STAT_BY_ELEMENT[element], 0))


def build_action_stats(state: BuildState) -> tuple[int, int]:
    stats = effective_scoring_stats(state)
    return int(stats.get("AP", 0)), int(stats.get("MP", 0))


def query_key(source_class: str, element: str, ap: int, mp: int) -> tuple[str, str, int, int]:
    return source_class, element, ap, mp


def common_queries(
    builds: list[tuple[ProductionBuild, BuildState]],
    *,
    limit: int,
) -> list[tuple[BuildDiscoveryQuery, int]]:
    frequencies: Counter[tuple[str, str, int, int]] = Counter()
    for build, state in builds:
        if build.source_class not in SUPPORTED_CLASS_NAMES:
            continue
        ap, mp = build_action_stats(state)
        if 7 <= ap <= 12 and 3 <= mp <= 6:
            frequencies[query_key(build.source_class, dominant_element(state), ap, mp)] += 1

    queries = []
    for (class_name, element, ap, mp), sample_count in frequencies.most_common(limit):
        query = BuildDiscoveryQuery(
            class_name=class_name,
            level=200,
            elements=(element,),
            mode="pvm",
            ap_target=ap,
            mp_target=mp,
            range_target=None,
            damage_survivability_preset=DEFAULT_PRESET,
            budget_tier=DEFAULT_BUDGET_TIER,
            exo_policy=DEFAULT_EXO_POLICY,
            limit=1,
        )
        try:
            query.validate()
        except ValueError:
            continue
        queries.append((query, sample_count))
    return queries


def score_production_build(
    state: BuildState,
    query: BuildDiscoveryQuery,
) -> BuildState | None:
    try:
        return optimize_base_allocation(
            state,
            generic_damage_weight=0.45,
            survivability_weight=1.0,
            target_level=query.level,
        )
    except RuntimeError:
        return None


def percentile(score: float, values: list[float]) -> float:
    if not values:
        return 0.0
    return round(100.0 * sum(value <= score for value in values) / len(values), 2)


def score_query(
    query: BuildDiscoveryQuery,
    source_count: int,
    normalized_builds: list[tuple[ProductionBuild, BuildState]],
    args: argparse.Namespace,
) -> dict[str, Any]:
    with target_level_context(query.level):
        configure_damage_profile(query.primary_element, query.class_name)
        qualifying_scores = []
        ignored_source_class_count = 0
        for build, original_state in normalized_builds:
            if dominant_element(original_state) != query.primary_element:
                continue
            ap, mp = build_action_stats(original_state)
            if not (query.ap_target <= ap <= 12 and query.mp_target <= mp <= 6):
                continue
            if build.source_class != query.class_name:
                ignored_source_class_count += 1
            scored = score_production_build(original_state.clone(), query)
            if scored is not None:
                qualifying_scores.append(scored.score)

        solver_args = build_cpsat_args(
            query,
            time_limit_seconds=args.solver_time_limit_seconds,
            workers=args.solver_workers,
            candidate_limit=3,
            summary_limit=3,
            output_build_limit=1,
            collection_mode="callback",
            objective_mode="final-linear",
            max_shared_items=None,
            generic_damage_weight=0.45,
        )
        started = time.perf_counter()
        try:
            generated = solve_cpsat_query(query, solver_args)
        except Exception as error:  # pragma: no cover - defensive report path
            generated = {"status": "error", "error": str(error)}
        elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
        generated_score = (generated.get("build") or {}).get("score")
        sorted_scores = sorted(qualifying_scores)
        best_prod_score = sorted_scores[-1] if sorted_scores else None
        p90_index = max(0, int(len(sorted_scores) * 0.9) - 1)
        p90_prod_score = sorted_scores[p90_index] if sorted_scores else None

    return {
        "query": {
            "className": query.class_name,
            "element": query.primary_element,
            "level": query.level,
            "apTarget": query.ap_target,
            "mpTarget": query.mp_target,
            "rangeTarget": query.range_target,
            "damageSurvivabilityPreset": query.damage_survivability_preset,
            "budgetTier": query.budget_tier,
            "exoPolicy": query.exo_policy,
        },
        "sourceProfileCount": source_count,
        "qualifyingProductionBuildCount": len(sorted_scores),
        "qualifyingProductionSourceClassMismatchCount": ignored_source_class_count,
        "bestProductionScore": best_prod_score,
        "p90ProductionScore": p90_prod_score,
        "generatedScore": generated_score,
        "generatedPercentileAmongProduction": percentile(generated_score, sorted_scores)
        if isinstance(generated_score, (int, float))
        else None,
        "generatedVsBestDelta": round(generated_score - best_prod_score, 2)
        if isinstance(generated_score, (int, float)) and isinstance(best_prod_score, (int, float))
        else None,
        "generatedVsP90Delta": round(generated_score - p90_prod_score, 2)
        if isinstance(generated_score, (int, float)) and isinstance(p90_prod_score, (int, float))
        else None,
        "generatedSolverStatus": generated.get("solverStatus"),
        "generatedElapsedMs": elapsed_ms,
        "generatedTotals": (generated.get("build") or {}).get("totals", {}),
    }


def build_report(args: argparse.Namespace) -> dict[str, Any]:
    raw_builds = fetch_recent_complete_builds(
        readonly_database_url(),
        sample_limit=args.build_sample_limit,
        statement_timeout_ms=args.statement_timeout_ms,
    )
    items_by_id = local_items_by_id()
    sets = load_sets()
    normalized: list[tuple[ProductionBuild, BuildState]] = []
    skipped_missing_local_items = 0
    with target_level_context(200):
        configure_damage_profile("strength", "Iop")
        for build in raw_builds:
            state = normalized_state(build, items_by_id, sets)
            if state is None:
                skipped_missing_local_items += 1
                continue
            normalized.append((build, state))

    queries = common_queries(normalized, limit=args.query_limit)
    rows = [score_query(query, source_count, normalized, args) for query, source_count in queries]
    comparable = [row for row in rows if row["bestProductionScore"] is not None and row["generatedScore"] is not None]
    return {
        "reportVersion": REPORT_VERSION,
        "source": "bounded_recent_complete_prod_build_sample",
        "assumptions": [
            "Production builds are normalized against local current item and set data before scoring.",
            "A production build can qualify for a query even when its source class differs from the query class.",
            "AP and MP are minimum targets, matching Build Discovery action constraints; Range is soft for this report.",
            "Queries are the most frequent source class/element/AP/MP profiles in the bounded recent production sample.",
            "Production build identifiers, names, owners, and item lists are omitted from this report.",
            "Generated and production builds use the same final scorer and balanced preset, but generation remains time-bounded.",
        ],
        "limits": {
            "recentWindow": RECENT_WINDOW,
            "buildSampleLimit": args.build_sample_limit,
            "queryLimit": args.query_limit,
            "statementTimeoutMs": args.statement_timeout_ms,
            "solverTimeLimitSeconds": args.solver_time_limit_seconds,
            "solverWorkers": args.solver_workers,
        },
        "normalization": {
            "recentCompleteProductionBuildCount": len(raw_builds),
            "normalizedProductionBuildCount": len(normalized),
            "skippedMissingLocalItems": skipped_missing_local_items,
        },
        "summary": {
            "queryCount": len(rows),
            "comparableQueryCount": len(comparable),
            "generatedBeatsBestProductionCount": sum(
                row["generatedVsBestDelta"] >= 0 for row in comparable
            ),
            "generatedBeatsP90ProductionCount": sum(
                row["generatedVsP90Delta"] >= 0 for row in comparable
            ),
            "medianGeneratedPercentile": sorted(
                row["generatedPercentileAmongProduction"] for row in comparable
            )[len(comparable) // 2]
            if comparable
            else None,
        },
        "queries": rows,
    }


def main() -> None:
    args = parse_args()
    try:
        validate_args(args)
        report = build_report(args)
    except ValueError as error:
        raise SystemExit(str(error))
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))


if __name__ == "__main__":
    main()
