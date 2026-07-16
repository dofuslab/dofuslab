"""Run a bounded CP-SAT smoke slice for all-class Build Discovery work."""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_cpsat_runner import (  # noqa: E402
    DEFAULT_FAST_TIME_LIMIT_SECONDS,
    build_cpsat_args,
    solve_cpsat_query,
)
from oneoff.build_discovery_core import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    BuildDiscoveryQuery,
)


REPORT_VERSION = "build-discovery-all-class-cpsat-smoke-v1"


@dataclass(frozen=True)
class SmokeTarget:
    name: str
    class_name: str
    element: str
    level: int
    budget_tier: int
    ap: int
    mp: int
    range_target: int | None
    preset: int
    exo_policy: str
    purpose: str
    min_score: float | None = None


ALL_CLASS_LEVEL_200_TARGETS = (
    SmokeTarget("trusted_iop_strength_opti_damage", "Iop", "strength", 200, 4, 12, 6, None, 4, "opti", "reviewed baseline", min_score=950.0),
    SmokeTarget("cra_strength_soft_range", "Cra", "strength", 200, 4, 12, 6, None, 3, "opti", "soft Range, no hard target", min_score=1150.0),
    SmokeTarget("ecaflip_intelligence_range6", "Ecaflip", "intelligence", 200, 4, 12, 6, 6, 3, "opti", "hard Range 6 stress", min_score=1100.0),
    SmokeTarget("eliotrope_chance_range5", "Eliotrope", "chance", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("eniripsa_agility_range6", "Eniripsa", "agility", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("enutrof_chance_hard_range", "Enutrof", "chance", 200, 3, 11, 6, 6, 2, "allow", "hard Range 6 corner", min_score=950.0),
    SmokeTarget("feca_chance_budget1_floor", "Feca", "chance", 200, 1, 10, 5, None, 2, "none", "cheap accessibility floor", min_score=650.0),
    SmokeTarget("foggernaut_strength_no_range", "Foggernaut", "strength", 200, 3, 12, 6, 0, 2, "allow", "nearly-useless Range guard"),
    SmokeTarget("forgelance_chance_range6", "Forgelance", "chance", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("huppermage_strength_range3", "Huppermage", "strength", 200, 3, 11, 6, 3, 2, "allow", "hard Range 3 stress"),
    SmokeTarget("masqueraider_intelligence_range5", "Masqueraider", "intelligence", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("osamodas_agility_range5", "Osamodas", "agility", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("ouginak_chance_no_range", "Ouginak", "chance", 200, 2, 11, 5, 0, 2, "allow", "short-range/no-Range class guard"),
    SmokeTarget("pandawa_agility_range5", "Pandawa", "agility", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("rogue_intelligence_range6", "Rogue", "intelligence", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress", min_score=1150.0),
    SmokeTarget("sacrier_intelligence_no_range", "Sacrier", "intelligence", 200, 4, 12, 6, 0, 2, "opti", "short-range hard zero"),
    SmokeTarget("sadida_intelligence_range6", "Sadida", "intelligence", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("sram_strength_range6", "Sram", "strength", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("xelor_agility_low_action_validity", "Xelor", "agility", 200, 2, 7, 3, None, 2, "allow", "low-action validity edge"),
)


LEVEL_DIVERSITY_TARGETS = (
    SmokeTarget("level1_iop_strength_min", "Iop", "strength", 1, 1, 6, 3, None, 2, "none", "level 1 base AP 6 minimum"),
    SmokeTarget("level20_cra_intelligence_range1", "Cra", "intelligence", 20, 1, 6, 3, 1, 2, "none", "early pre-100 hard Range 1"),
    SmokeTarget("level50_ecaflip_chance_budget1", "Ecaflip", "chance", 50, 1, 7, 4, 0, 2, "none", "budget tier 1 low-level action row", min_score=275.0),
    SmokeTarget("level80_feca_agility_budget2", "Feca", "agility", 80, 2, 10, 5, 0, 2, "allow", "mid-level AP/MP row before base AP change"),
    SmokeTarget("level99_enutrof_chance_cap", "Enutrof", "chance", 99, 4, 12, 6, 6, 2, "allow", "pre-100 hard cap stress", min_score=650.0),
    SmokeTarget("level100_xelor_agility_min", "Xelor", "agility", 100, 2, 7, 3, None, 2, "allow", "level 100 base AP 7 minimum"),
    SmokeTarget("level120_eniripsa_intelligence_mid", "Eniripsa", "intelligence", 120, 2, 11, 5, 1, 2, "allow", "post-100 mid-level budget row"),
    SmokeTarget("level150_sacrier_strength_floor", "Sacrier", "strength", 150, 2, 10, 5, 0, 2, "allow", "level 150 realistic floor row"),
    SmokeTarget("level179_pandawa_agility_mid", "Pandawa", "agility", 179, 3, 12, 5, 2, 2, "allow", "pre-180 high-level transition row"),
    SmokeTarget("level180_rogue_intelligence_range6", "Rogue", "intelligence", 180, 3, 12, 6, 6, 2, "allow", "level 180 hard Range 6 stress", min_score=750.0),
    SmokeTarget("level199_osamodas_agility_budget2", "Osamodas", "agility", 199, 2, 10, 6, 3, 2, "allow", "near-200 lower-budget row"),
    SmokeTarget("level200_feca_chance_budget1_floor", "Feca", "chance", 200, 1, 10, 5, None, 2, "none", "level 200 tier 1 realistic floor", min_score=650.0),
)


TARGET_SETS = {
    "all-class-level-200": ALL_CLASS_LEVEL_200_TARGETS,
    "level-diversity": LEVEL_DIVERSITY_TARGETS,
    "all": ALL_CLASS_LEVEL_200_TARGETS + LEVEL_DIVERSITY_TARGETS,
}


def timing_summary(values: list[float]) -> dict[str, float | None]:
    if not values:
        return {"minMs": None, "avgMs": None, "p95Ms": None, "maxMs": None}
    ordered = sorted(values)
    p95_index = max(math.ceil(len(ordered) * 0.95) - 1, 0)
    return {
        "minMs": round(ordered[0], 1),
        "avgMs": round(sum(ordered) / len(ordered), 1),
        "p95Ms": round(ordered[p95_index], 1),
        "maxMs": round(ordered[-1], 1),
    }


def target_query(target: SmokeTarget) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        class_name=target.class_name,
        level=target.level,
        elements=(target.element,),
        ap_target=target.ap,
        mp_target=target.mp,
        range_target=target.range_target,
        damage_survivability_preset=target.preset,
        budget_tier=target.budget_tier,
        exo_policy=target.exo_policy,
        limit=1,
        max_shared_items=None,
    )


def solver_args(query: BuildDiscoveryQuery, args: argparse.Namespace) -> argparse.Namespace:
    return build_cpsat_args(
        query,
        time_limit_seconds=args.time_limit_seconds,
        workers=args.workers,
        max_attempts=1,
        candidate_limit=args.candidate_limit,
        summary_limit=args.candidate_limit,
        output_build_limit=1,
        collection_mode="callback",
        objective_mode=getattr(args, "objective_mode", "final-linear"),
        objective_modes=(getattr(args, "objective_mode", "final-linear"),),
        max_shared_items=None,
        generic_damage_weight=0.45,
    )


def reference_solver_args(query: BuildDiscoveryQuery, args: argparse.Namespace) -> argparse.Namespace:
    return build_cpsat_args(
        query,
        time_limit_seconds=args.reference_time_limit_seconds,
        workers=args.workers,
        max_attempts=1,
        candidate_limit=args.reference_candidate_limit,
        summary_limit=args.reference_candidate_limit,
        output_build_limit=1,
        collection_mode="callback",
        objective_mode="final-linear",
        max_shared_items=None,
        generic_damage_weight=0.45,
    )


def score_ratio_validation_error(
    fast_score: float | None,
    reference_score: float | None,
    min_ratio: float,
) -> str | None:
    if not isinstance(fast_score, (int, float)):
        return "fast score missing for reference comparison"
    if not isinstance(reference_score, (int, float)):
        return "reference score missing for reference comparison"
    if reference_score <= 0:
        return None
    ratio = fast_score / reference_score
    if ratio < min_ratio:
        return f"fast score ratio {ratio:.4f} below floor {min_ratio:.4f}"
    return None


def validate_response(
    query: BuildDiscoveryQuery,
    response: dict[str, Any],
    *,
    min_score: float | None = None,
) -> list[str]:
    errors: list[str] = []
    build = response.get("build")
    if not build:
        return ["no build returned"]
    if build.get("conditionFailures"):
        errors.append(f"condition failures present: {build['conditionFailures']}")
    score = build.get("score")
    if min_score is not None and (not isinstance(score, (int, float)) or score < min_score):
        errors.append(f"score {score} below floor {min_score}")

    totals = build.get("totals") or {}
    ap = totals.get("AP")
    mp = totals.get("MP")
    range_value = totals.get("Range")
    if not isinstance(ap, (int, float)) or not query.ap_target <= ap <= MAX_AP:
        errors.append(f"AP total {ap} outside target/cap {query.ap_target}-{MAX_AP}")
    if not isinstance(mp, (int, float)) or not query.mp_target <= mp <= MAX_MP:
        errors.append(f"MP total {mp} outside target/cap {query.mp_target}-{MAX_MP}")
    if not isinstance(range_value, (int, float)) or range_value > MAX_RANGE:
        errors.append(f"Range total {range_value} exceeds cap {MAX_RANGE}")
    elif query.range_target is not None and range_value < query.range_target:
        errors.append(f"Range total {range_value} below target {query.range_target}")

    scoring_range_weight = (response.get("scoring") or {}).get("rangeSoftWeight")
    objective_range_weight = (response.get("objectiveWeights") or {}).get("Range")
    if scoring_range_weight is None:
        errors.append("missing scoring.rangeSoftWeight")
    elif objective_range_weight is None:
        errors.append("missing objectiveWeights.Range")
    elif abs(scoring_range_weight - objective_range_weight) > 0.0001:
        errors.append(
            f"Range objective weight {objective_range_weight} did not match scoring range soft weight {scoring_range_weight}"
        )

    if query.class_name != "Iop" and (response.get("scoring") or {}).get("spellCandidateCount", 0) <= 0:
        errors.append("non-Iop query had no active spell candidates")
    return errors


def compact_items(build: dict[str, Any] | None) -> list[str]:
    if not build:
        return []
    return [
        item.get("name") or item.get("id") or slot
        for slot, item in sorted((build.get("items") or {}).items())
    ]


def run_target(target: SmokeTarget, args: argparse.Namespace) -> dict[str, Any]:
    query = target_query(target)
    started = time.perf_counter()
    try:
        response = solve_cpsat_query(query, solver_args(query, args))
    except Exception as exc:  # pragma: no cover - report path for smoke scripts
        elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
        return {
            "target": target.__dict__,
            "query": {
                "className": query.class_name,
                "level": query.level,
                "elements": list(query.elements),
                "apTarget": query.ap_target,
                "mpTarget": query.mp_target,
                "rangeTarget": query.range_target,
                "budgetTier": query.budget_tier,
                "exoPolicy": query.exo_policy,
            },
            "status": "error",
            "error": str(exc),
            "elapsedMs": elapsed_ms,
            "validationErrors": [str(exc)],
        }

    elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
    validation_errors = (
        validate_response(query, response, min_score=target.min_score)
        if response.get("status") == "complete"
        else ["no complete response"]
    )
    build = response.get("build")
    reference = None
    if args.compare_reference and response.get("status") == "complete":
        reference_started = time.perf_counter()
        try:
            reference_response = solve_cpsat_query(query, reference_solver_args(query, args))
        except Exception as exc:  # pragma: no cover - report path for smoke scripts
            reference = {
                "status": "error",
                "error": str(exc),
                "elapsedMs": round((time.perf_counter() - reference_started) * 1000, 1),
            }
            validation_errors.append(f"reference comparison errored: {exc}")
        else:
            reference_build = reference_response.get("build")
            reference_elapsed_ms = round((time.perf_counter() - reference_started) * 1000, 1)
            reference_score = (reference_build or {}).get("score")
            ratio_error = score_ratio_validation_error(
                (build or {}).get("score"),
                reference_score,
                args.min_reference_score_ratio,
            )
            if ratio_error:
                validation_errors.append(ratio_error)
            reference = {
                "status": reference_response.get("status"),
                "solverStatus": reference_response.get("solverStatus"),
                "elapsedMs": reference_elapsed_ms,
                "timings": reference_response.get("timings"),
                "candidateCount": reference_response.get("candidateCount"),
                "requestedCandidateLimit": reference_response.get("requestedCandidateLimit"),
                "score": reference_score,
                "scoreRatio": (
                    round((build or {}).get("score") / reference_score, 4)
                    if isinstance((build or {}).get("score"), (int, float))
                    and isinstance(reference_score, (int, float))
                    and reference_score > 0
                    else None
                ),
            }
    totals = (build or {}).get("totals") or {}
    row = {
        "target": target.__dict__,
        "query": response.get("query"),
        "status": "passed" if not validation_errors else "failed",
        "solverStatus": response.get("solverStatus"),
        "responseStatus": response.get("status"),
        "elapsedMs": elapsed_ms,
        "timings": response.get("timings"),
        "scoring": response.get("scoring"),
        "validationErrors": validation_errors,
        "objectiveWeights": {
            key: response.get("objectiveWeights", {}).get(key)
            for key in ("Strength", "Intelligence", "Chance", "Agility", "Power", "Range", "AP", "MP")
            if key in response.get("objectiveWeights", {})
        },
        "totals": totals,
        "sets": (build or {}).get("sets", {}),
        "exos": (build or {}).get("exos", {}),
        "items": compact_items(build),
        "score": (build or {}).get("score"),
    }
    if reference is not None:
        row["reference"] = reference
    return row


def write_markdown(report: dict[str, Any], path: Path) -> None:
    lines = [
        "# All-Class CP-SAT Smoke Report",
        "",
        f"- Generated: `{report['generatedAt']}`",
        f"- Report version: `{report['reportVersion']}`",
        f"- Target set: `{report['targetSet']}`",
        f"- Warmup target: `{(report.get('warmup') or {}).get('target', {}).get('name')}`",
        f"- Targets: `{report['summary']['targetCount']}`",
        f"- Passed: `{report['summary']['passed']}`",
        f"- Failed: `{report['summary']['failed']}`",
        f"- Classes: `{report['summary']['classCount']}`",
        f"- Elements: `{report['summary']['elements']}`",
        f"- Budget tiers: `{report['summary']['budgetTiers']}`",
        f"- Range targets: `{report['summary']['rangeTargets']}`",
        f"- Total search timings: `{report['summary']['totalSearchMs']}`",
        f"- Elapsed timings: `{report['summary']['elapsedMs']}`",
        "",
        "## Rows",
        "",
    ]
    for row in report["rows"]:
        target = row["target"]
        range_label = "Any" if target["range_target"] is None else target["range_target"]
        lines.extend(
            [
                f"### {target['name']}",
                "",
                f"- Query: `{target['class_name']} {target['element']} level {target['level']} tier {target['budget_tier']} {target['ap']}/{target['mp']}/{range_label} preset {target['preset']} exo {target['exo_policy']}`",
                f"- Purpose: {target['purpose']}",
                f"- Status: `{row['status']}` / solver `{row.get('solverStatus')}` / response `{row.get('responseStatus')}`",
                f"- Timings: `{row.get('timings')}`",
                f"- Scoring: `{row.get('scoring')}`",
                f"- Objective weights: `{row.get('objectiveWeights')}`",
                f"- Totals: `{row.get('totals')}`",
                f"- Sets: `{row.get('sets')}`",
                f"- Exos: `{row.get('exos')}`",
                f"- Items: {', '.join(row.get('items') or [])}",
            ]
        )
        if row.get("validationErrors"):
            lines.append(f"- Validation errors: `{row['validationErrors']}`")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def run_smoke_report(args: argparse.Namespace) -> dict[str, Any]:
    target_names = set(args.target or [])
    selected_set = TARGET_SETS[args.target_set]
    targets = [target for target in selected_set if not target_names or target.name in target_names]
    warmup = None
    if targets and not args.skip_warmup:
        warmup = run_target(targets[0], args)
    rows = [run_target(target, args) for target in targets]
    range_targets = [
        "None" if row["target"]["range_target"] is None else row["target"]["range_target"]
        for row in rows
    ]
    total_search_values = [
        (row.get("timings") or {}).get("totalSearchMs", 0)
        for row in rows
        if row.get("timings")
    ]
    elapsed_values = [
        row.get("elapsedMs", 0)
        for row in rows
        if row.get("elapsedMs") is not None
    ]
    total_search_summary = timing_summary(total_search_values)
    elapsed_summary = timing_summary(elapsed_values)
    failures = []
    if args.max_total_search_p95_ms is not None:
        p95_ms = total_search_summary["p95Ms"]
        if p95_ms is None or p95_ms > args.max_total_search_p95_ms:
            failures.append(
                f"totalSearchMs p95 {p95_ms} exceeded threshold {args.max_total_search_p95_ms}"
            )
    if args.max_elapsed_p95_ms is not None:
        p95_ms = elapsed_summary["p95Ms"]
        if p95_ms is None or p95_ms > args.max_elapsed_p95_ms:
            failures.append(
                f"elapsedMs p95 {p95_ms} exceeded threshold {args.max_elapsed_p95_ms}"
            )
    reference_rows = [
        row["reference"]
        for row in rows
        if isinstance(row.get("reference"), dict)
    ]
    reference_score_ratios = [
        reference["scoreRatio"]
        for reference in reference_rows
        if isinstance(reference.get("scoreRatio"), (int, float))
    ]
    summary = {
        "targetCount": len(rows),
        "passed": sum(1 for row in rows if row["status"] == "passed"),
        "failed": sum(1 for row in rows if row["status"] != "passed"),
        "classCount": len({row["target"]["class_name"] for row in rows}),
        "classes": sorted({row["target"]["class_name"] for row in rows}),
        "elements": sorted({row["target"]["element"] for row in rows}),
        "budgetTiers": sorted({row["target"]["budget_tier"] for row in rows}),
        "rangeTargets": sorted(set(range_targets), key=str),
        "totalSearchMs": total_search_summary,
        "elapsedMs": elapsed_summary,
        "maxTotalSearchMs": total_search_summary["maxMs"] or 0,
        "maxTotalSearchP95Ms": args.max_total_search_p95_ms,
        "maxElapsedP95Ms": args.max_elapsed_p95_ms,
        "referenceComparison": {
            "enabled": args.compare_reference,
            "minScoreRatio": args.min_reference_score_ratio,
            "comparedCount": len(reference_rows),
            "minScoreRatioObserved": min(reference_score_ratios) if reference_score_ratios else None,
        },
        "failures": failures,
    }
    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "targetSet": args.target_set,
        "warmup": warmup,
        "summary": summary,
        "rows": rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--time-limit-seconds", type=float, default=DEFAULT_FAST_TIME_LIMIT_SECONDS)
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--candidate-limit", type=int, default=20)
    parser.add_argument(
        "--objective-mode",
        choices=(
            "final-linear",
            "final-linear-crit-neutral",
            "final-linear-crit",
            "final-linear-noncrit",
        ),
        default="final-linear",
    )
    parser.add_argument("--compare-reference", action="store_true")
    parser.add_argument("--reference-time-limit-seconds", type=float, default=12.0)
    parser.add_argument("--reference-candidate-limit", type=int, default=12)
    parser.add_argument("--min-reference-score-ratio", type=float, default=0.97)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-md", required=True)
    parser.add_argument("--target-set", choices=sorted(TARGET_SETS), default="all-class-level-200")
    parser.add_argument(
        "--skip-warmup",
        action="store_true",
        help="Skip the unmeasured first-target warmup run used to populate in-process item/set caches.",
    )
    parser.add_argument(
        "--max-total-search-p95-ms",
        type=float,
        default=None,
        help="Fail when totalSearchMs p95 exceeds this threshold.",
    )
    parser.add_argument(
        "--max-elapsed-p95-ms",
        type=float,
        default=None,
        help="Fail when end-to-end elapsedMs p95 exceeds this threshold.",
    )
    parser.add_argument(
        "--target",
        action="append",
        choices=sorted({target.name for targets in TARGET_SETS.values() for target in targets}),
    )
    args = parser.parse_args()

    report = run_smoke_report(args)
    summary = report["summary"]
    failures = summary["failures"]
    output_json = Path(args.output_json)
    output_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(report, Path(args.output_md))
    print(json.dumps(summary, indent=2))
    if summary["failed"] or failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
