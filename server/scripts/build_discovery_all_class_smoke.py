"""Run a bounded CP-SAT smoke slice for all-class Build Discovery work."""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_cpsat_experiment import solve_query  # noqa: E402
from oneoff.build_discovery_prototype import (  # noqa: E402
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


DEFAULT_TARGETS = (
    SmokeTarget("trusted_iop_strength_opti_damage", "Iop", "strength", 200, 4, 12, 6, None, 4, "opti", "reviewed baseline"),
    SmokeTarget("cra_strength_soft_range", "Cra", "strength", 200, 4, 12, 6, None, 3, "opti", "soft Range, no hard target"),
    SmokeTarget("ecaflip_intelligence_range6", "Ecaflip", "intelligence", 200, 4, 12, 6, 6, 3, "opti", "hard Range 6 stress"),
    SmokeTarget("eliotrope_chance_range5", "Eliotrope", "chance", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("eniripsa_agility_range6", "Eniripsa", "agility", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("enutrof_chance_hard_range", "Enutrof", "chance", 200, 3, 11, 6, 6, 2, "allow", "hard Range 6 corner"),
    SmokeTarget("feca_chance_budget1_floor", "Feca", "chance", 200, 1, 10, 5, None, 2, "none", "cheap accessibility floor"),
    SmokeTarget("foggernaut_strength_no_range", "Foggernaut", "strength", 200, 3, 12, 6, 0, 2, "allow", "nearly-useless Range guard"),
    SmokeTarget("forgelance_chance_range6", "Forgelance", "chance", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("huppermage_strength_range3", "Huppermage", "strength", 200, 3, 11, 6, 3, 2, "allow", "hard Range 3 stress"),
    SmokeTarget("masqueraider_intelligence_range5", "Masqueraider", "intelligence", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("osamodas_agility_range5", "Osamodas", "agility", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("ouginak_chance_no_range", "Ouginak", "chance", 200, 2, 11, 5, 0, 2, "allow", "short-range/no-Range class guard"),
    SmokeTarget("pandawa_agility_range5", "Pandawa", "agility", 200, 3, 11, 6, 5, 2, "allow", "hard Range 5 stress"),
    SmokeTarget("rogue_intelligence_range6", "Rogue", "intelligence", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("sacrier_intelligence_no_range", "Sacrier", "intelligence", 200, 4, 12, 6, 0, 2, "opti", "short-range hard zero"),
    SmokeTarget("sadida_intelligence_range6", "Sadida", "intelligence", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("sram_strength_range6", "Sram", "strength", 200, 4, 12, 6, 6, 2, "opti", "hard Range 6 stress"),
    SmokeTarget("xelor_agility_low_action_validity", "Xelor", "agility", 200, 2, 7, 3, None, 2, "allow", "low-action validity edge"),
)


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


def solver_args(args: argparse.Namespace) -> SimpleNamespace:
    return SimpleNamespace(
        time_limit_seconds=args.time_limit_seconds,
        workers=args.workers,
        max_attempts=1,
        candidate_limit=1,
        summary_limit=1,
        output_build_limit=1,
        collection_mode="callback",
        stop_after_candidates=True,
        objective_mode="final-linear",
        max_shared_items=None,
        generic_damage_weight=0.45,
    )


def validate_response(query: BuildDiscoveryQuery, response: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    build = response.get("build")
    if not build:
        return ["no build returned"]
    if build.get("conditionFailures"):
        errors.append(f"condition failures present: {build['conditionFailures']}")

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
        response = solve_query(query, solver_args(args))
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
    validation_errors = validate_response(query, response) if response.get("status") == "complete" else ["no complete response"]
    build = response.get("build")
    totals = (build or {}).get("totals") or {}
    return {
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


def write_markdown(report: dict[str, Any], path: Path) -> None:
    lines = [
        "# All-Class CP-SAT Smoke Report",
        "",
        f"- Generated: `{report['generatedAt']}`",
        f"- Report version: `{report['reportVersion']}`",
        f"- Targets: `{report['summary']['targetCount']}`",
        f"- Passed: `{report['summary']['passed']}`",
        f"- Failed: `{report['summary']['failed']}`",
        f"- Classes: `{report['summary']['classCount']}`",
        f"- Elements: `{report['summary']['elements']}`",
        f"- Budget tiers: `{report['summary']['budgetTiers']}`",
        f"- Range targets: `{report['summary']['rangeTargets']}`",
        f"- Max total search ms: `{report['summary']['maxTotalSearchMs']}`",
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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--time-limit-seconds", type=float, default=5.0)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-md", required=True)
    parser.add_argument("--target", action="append", choices=[target.name for target in DEFAULT_TARGETS])
    args = parser.parse_args()

    target_names = set(args.target or [])
    targets = [target for target in DEFAULT_TARGETS if not target_names or target.name in target_names]
    rows = [run_target(target, args) for target in targets]
    range_targets = [
        "None" if row["target"]["range_target"] is None else row["target"]["range_target"]
        for row in rows
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
        "maxTotalSearchMs": max(
            (row.get("timings") or {}).get("totalSearchMs", 0)
            for row in rows
        ) if rows else 0,
    }
    report = {
        "reportVersion": REPORT_VERSION,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "rows": rows,
    }
    output_json = Path(args.output_json)
    output_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(report, Path(args.output_md))
    print(json.dumps(summary, indent=2))
    if summary["failed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
