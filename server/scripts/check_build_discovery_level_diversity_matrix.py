"""Validate a generated Build Discovery level-diversity matrix artifact."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.build_discovery_level_diversity_matrix import (  # noqa: E402
    REPORT_VERSION,
    load_targets_from_file,
    parse_int_filter,
    parse_optional_int_filter,
    query_for_matrix_target,
    query_payload_matches_artifact,
    selected_targets,
    target_summary,
    targets_for_set,
    validate_best_build,
)
from oneoff.build_discovery_prototype import (  # noqa: E402
    PRIMARY_STAT_NAMES,
    SLOTS,
    availability_tier_for_item,
    characteristic_point_cost,
    characteristic_points_for_level,
    effective_exo_policy,
)


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def csv_filter(raw_value: str | None) -> set[str] | None:
    if not raw_value or raw_value == "all":
        return None
    return {value.strip() for value in raw_value.split(",") if value.strip()}


def slot_types_by_name() -> dict[str, tuple[str, ...]]:
    return dict(SLOTS)


def validate_single_build_artifact(
    *,
    target_id: str,
    target: Any,
    query: Any,
    build: dict[str, Any],
    label: str,
) -> list[str]:
    failures: list[str] = []

    for error in validate_best_build(target, query, build):
        failures.append(f"{target_id}: {label} current-code validation failed: {error}")

    base_allocation = build.get("baseAllocation")
    if not isinstance(base_allocation, dict):
        failures.append(f"{target_id}: {label} missing baseAllocation")
    else:
        available_points = characteristic_points_for_level(target.level)
        for stat_name, value in base_allocation.items():
            if not isinstance(value, int):
                failures.append(
                    f"{target_id}: {label} baseAllocation {stat_name} is {value!r}, expected integer"
                )
        allocated_primary_stats = {
            stat: value
            for stat in PRIMARY_STAT_NAMES
            for value in [base_allocation.get(stat)]
            if isinstance(value, int) and value > 0
        }
        spent_points = sum(characteristic_point_cost(int(value)) for value in allocated_primary_stats.values())
        if spent_points > available_points:
            failures.append(
                f"{target_id}: {label} baseAllocation spends {spent_points} characteristic points, "
                f"above level {target.level} budget {available_points}"
            )
        vitality_allocation = base_allocation.get("Vitality")
        if isinstance(vitality_allocation, int) and spent_points <= available_points:
            expected_vitality = available_points - spent_points
            if vitality_allocation != expected_vitality:
                failures.append(
                    f"{target_id}: {label} baseAllocation Vitality is {vitality_allocation}, expected {expected_vitality}"
                )

    slot_types = slot_types_by_name()
    seen_item_ids: set[str] = set()
    items = build.get("items") or {}
    if not isinstance(items, dict):
        failures.append(f"{target_id}: {label} items must be an object")
        items = {}
    expected_slots = set(slot_types)
    actual_slots = set(items)
    missing_slots = sorted(expected_slots - actual_slots)
    extra_slots = sorted(actual_slots - expected_slots)
    if missing_slots:
        failures.append(f"{target_id}: {label} missing item slots: {', '.join(missing_slots)}")
    if extra_slots:
        failures.append(f"{target_id}: {label} unknown item slots: {', '.join(extra_slots)}")
    for slot_name, item in items.items():
        allowed_types = slot_types.get(slot_name)
        if allowed_types is None:
            failures.append(f"{target_id}: {label} unknown item slot {slot_name}")
            continue
        if not isinstance(item, dict):
            failures.append(f"{target_id}: {label} {slot_name} item must be an object")
            continue
        item_type = item.get("type") or item.get("itemType")
        if item_type not in allowed_types:
            failures.append(f"{target_id}: {label} {slot_name} item type {item_type} not in {allowed_types}")
        item_id = item.get("id") or item.get("dofusID")
        if item_id:
            if item_id in seen_item_ids:
                failures.append(f"{target_id}: {label} duplicate item id {item_id}")
            seen_item_ids.add(item_id)
        tier = availability_tier_for_item(item)
        if tier > query.budget_tier:
            failures.append(
                f"{target_id}: {label} {slot_name} item availability tier {tier} exceeds budget tier {query.budget_tier}"
            )

    exos = build.get("exos") or {}
    if effective_exo_policy(query) == "none" and exos:
        failures.append(f"{target_id}: {label} generated exos present under effective exoPolicy=none")

    return failures


def validate_full_build_artifact(result: dict[str, Any], target_by_id: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    target_id = result.get("target", {}).get("id", "unknown")
    target = target_by_id.get(target_id)
    if target is None:
        return failures

    artifact_query = result.get("query") or {}
    query_limit = artifact_query.get("limit")
    query = query_for_matrix_target(
        target,
        query_limit=query_limit if isinstance(query_limit, int) else None,
    )
    if result.get("target") != target_summary(target):
        failures.append(f"{target_id}: target does not match current target definition")
    if not query_payload_matches_artifact(target, query, result.get("query")):
        failures.append(f"{target_id}: query does not match current query definition")
    if (result.get("diagnostics") or {}).get("fallbackBudget"):
        failures.append(f"{target_id}: budget fallback used; not covering requested budget tier")

    best_build = result.get("bestBuild")
    if not isinstance(best_build, dict):
        failures.append(f"{target_id}: missing full bestBuild artifact")
        return failures

    failures.extend(
        validate_single_build_artifact(
            target_id=target_id,
            target=target,
            query=query,
            build=best_build,
            label="bestBuild",
        )
    )

    candidate_builds = result.get("candidateBuilds")
    result_count = result.get("resultCount", 0)
    if result_count > 1 or query.limit > 1:
        if not isinstance(candidate_builds, list):
            failures.append(f"{target_id}: missing candidateBuilds for multi-candidate result")
            return failures
    if candidate_builds is None:
        return failures
    if not isinstance(candidate_builds, list):
        failures.append(f"{target_id}: candidateBuilds must be a list")
    elif len(candidate_builds) != result_count:
        failures.append(
            f"{target_id}: candidateBuilds length {len(candidate_builds)} does not match resultCount {result_count}"
        )
    else:
        for index, candidate in enumerate(candidate_builds):
            if not isinstance(candidate, dict):
                failures.append(f"{target_id}: candidateBuilds[{index}] must be an object")
                continue
            failures.extend(
                validate_single_build_artifact(
                    target_id=target_id,
                    target=target,
                    query=query,
                    build=candidate,
                    label=f"candidateBuilds[{index}]",
                )
            )

    return failures


def validate_report(
    report: dict[str, Any],
    target_set: str = "level-diversity",
    *,
    allow_no_build: bool = False,
    expected_solver: str | None = None,
    target_names: set[str] | None = None,
    levels: set[int] | None = None,
    elements: set[str] | None = None,
    budget_tiers: set[int] | None = None,
    ap_targets: set[int] | None = None,
    mp_targets: set[int] | None = None,
    range_targets: set[int | None] | None = None,
    target_file: str | Path | None = None,
    target_file_limit: int | None = None,
    target_file_prefix: str = "file",
) -> list[str]:
    failures: list[str] = []
    if report.get("reportVersion") != REPORT_VERSION:
        failures.append(
            f"reportVersion is {report.get('reportVersion')}, expected {REPORT_VERSION}"
        )
    if expected_solver is not None:
        provenance_solver = (report.get("provenance") or {}).get("solver")
        if provenance_solver != expected_solver:
            failures.append(f"provenance.solver is {provenance_solver}, expected {expected_solver}")

    if target_file:
        targets = load_targets_from_file(
            target_file,
            limit=target_file_limit,
            prefix=target_file_prefix,
        ).targets
    else:
        targets = targets_for_set(target_set)
    targets = tuple(
        selected_targets(
            all_targets=targets,
            target_names=target_names,
            levels=levels,
            elements=elements,
            budget_tiers=budget_tiers,
            ap_targets=ap_targets,
            mp_targets=mp_targets,
            range_targets=range_targets,
        )
    )
    target_by_id = {target.name: target for target in targets}
    expected_ids = set(target_by_id)
    results = report.get("results", [])
    if len(results) != len(expected_ids):
        failures.append(f"results length is {len(results)}, expected {len(expected_ids)}")
    result_ids = [
        result.get("target", {}).get("id")
        for result in results
        if isinstance(result.get("target", {}).get("id"), str)
    ]
    duplicate_ids = sorted(
        target_id
        for target_id in set(result_ids)
        if result_ids.count(target_id) > 1
    )
    if duplicate_ids:
        failures.append(f"duplicate target reports: {', '.join(duplicate_ids)}")
    actual_ids = {
        target_id
        for target_id in result_ids
    }
    missing_ids = sorted(expected_ids - actual_ids)
    extra_ids = sorted(actual_ids - expected_ids)
    if missing_ids:
        failures.append(f"missing target reports: {', '.join(missing_ids)}")
    if extra_ids:
        failures.append(f"unexpected target reports: {', '.join(extra_ids)}")

    if report.get("targetCount") != len(expected_ids):
        failures.append(f"targetCount is {report.get('targetCount')}, expected {len(expected_ids)}")
    expected_generated_count = len(expected_ids) - report.get("noBuildCount", 0) if allow_no_build else len(expected_ids)
    if report.get("generatedCount") != expected_generated_count:
        failures.append(
            f"generatedCount is {report.get('generatedCount')}, expected {expected_generated_count}"
        )
    if not allow_no_build and report.get("noBuildCount") != 0:
        failures.append(f"noBuildCount is {report.get('noBuildCount')}, expected 0")
    if report.get("invalidCount", 0) != 0:
        failures.append(f"invalidCount is {report.get('invalidCount')}, expected 0")

    for result in results:
        target_id = result.get("target", {}).get("id", "unknown")
        diagnostics = result.get("diagnostics") or {}
        if expected_solver is not None and diagnostics.get("solver") != expected_solver:
            failures.append(f"{target_id}: diagnostics.solver is {diagnostics.get('solver')}, expected {expected_solver}")
        if result.get("status") == "no_build" and allow_no_build:
            if result.get("resultCount", 0) != 0:
                failures.append(f"{target_id}: no_build resultCount is {result.get('resultCount')}, expected 0")
            if result.get("bestBuildSummary") is not None:
                failures.append(f"{target_id}: no_build bestBuildSummary should be empty")
            solver_status = diagnostics.get("solverStatus")
            if expected_solver == "cpsat" and solver_status != "INFEASIBLE":
                failures.append(
                    f"{target_id}: no_build solverStatus is {solver_status}, expected INFEASIBLE"
                )
            continue
        if result.get("status") != "generated":
            failures.append(f"{target_id}: status is {result.get('status')}, expected generated")
        validation_errors = result.get("validationErrors") or []
        if validation_errors:
            failures.append(f"{target_id}: validationErrors is not empty: {validation_errors}")
        if result.get("resultCount", 0) < 1:
            failures.append(f"{target_id}: resultCount is {result.get('resultCount')}, expected >= 1")
        summary = result.get("bestBuildSummary")
        if not isinstance(summary, dict):
            failures.append(f"{target_id}: missing bestBuildSummary")
            continue
        if not isinstance(summary.get("score"), (int, float)):
            failures.append(f"{target_id}: missing numeric bestBuildSummary.score")
        totals = summary.get("totals") or {}
        for stat in ("AP", "MP", "Range", "Vitality"):
            if not isinstance(totals.get(stat), (int, float)):
                failures.append(f"{target_id}: missing numeric totals.{stat}")
        if not summary.get("items"):
            failures.append(f"{target_id}: bestBuildSummary.items is empty")
        failures.extend(validate_full_build_artifact(result, target_by_id))

    return failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", help="Path to a level-diversity matrix JSON artifact.")
    parser.add_argument(
        "--target-set",
        choices=("level-diversity", "milestone2-level200", "boundary", "coverage", "prod-level-sample", "grid-next-minimum", "grid-next-minimum-2", "grid-next-minimum-3", "grid-next-cap", "grid-next-cap-2", "grid-next-cap-3", "grid-next-cap-4", "all"),
        default="level-diversity",
    )
    parser.add_argument("--allow-no-build", action="store_true")
    parser.add_argument("--expected-solver", choices=("prototype", "cpsat"), help="Require report and row solver provenance.")
    parser.add_argument("--targets", help="Comma-separated target ids to validate as a subset.")
    parser.add_argument("--levels", help="Comma-separated levels to validate as a subset.")
    parser.add_argument("--elements", help="Comma-separated elements to validate as a subset.")
    parser.add_argument("--budget-tiers", help="Comma-separated budget tiers to validate as a subset.")
    parser.add_argument("--ap-targets", help="Comma-separated AP targets to validate as a subset.")
    parser.add_argument("--mp-targets", help="Comma-separated MP targets to validate as a subset.")
    parser.add_argument("--range-targets", help="Comma-separated range targets to validate as a subset; accepts none/any/null.")
    parser.add_argument("--target-file", help="JSON target rows, inventory report, or matrix report to validate against.")
    parser.add_argument("--target-file-limit", type=int, help="Limit target rows loaded from --target-file.")
    parser.add_argument("--target-file-prefix", default="file", help="Prefix for generated target ids from --target-file.")
    args = parser.parse_args()
    if args.target_file_limit is not None and args.target_file_limit < 0:
        parser.error("--target-file-limit must be non-negative.")

    failures = validate_report(
        load_json(args.report),
        target_set=args.target_set,
        allow_no_build=args.allow_no_build,
        expected_solver=args.expected_solver,
        target_names=csv_filter(args.targets),
        levels=parse_int_filter(args.levels),
        elements=csv_filter(args.elements),
        budget_tiers=parse_int_filter(args.budget_tiers),
        ap_targets=parse_int_filter(args.ap_targets),
        mp_targets=parse_int_filter(args.mp_targets),
        range_targets=parse_optional_int_filter(args.range_targets),
        target_file=args.target_file,
        target_file_limit=args.target_file_limit,
        target_file_prefix=args.target_file_prefix,
    )
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        raise SystemExit(1)
    print("Build Discovery level-diversity matrix check passed.")


if __name__ == "__main__":
    main()
