"""Generate review artifacts for the Iop level-diversity smoke matrix."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass, replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    SLOTS,
    BuildDiscoveryQuery,
    build_discovery_response,
    query_summary as prototype_query_summary,
)
from scripts.build_discovery_level_diversity_targets import (  # noqa: E402
    AP_MP_RANGE_COVERAGE_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS,
    AP_MP_RANGE_GRID_NEXT_CAP_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS,
    AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS,
    BOUNDARY_LEVEL_TARGETS,
    LEVEL_DIVERSITY_TARGETS,
    LevelDiversityTarget,
    MILESTONE2_LEVEL200_TARGETS,
    PROD_LEVEL_SAMPLE_TARGETS,
    query_for_target,
)


REPORT_VERSION = "build-discovery-level-diversity-matrix-v1"
SEARCH_QUERY_FIELDS = {"limit", "topK", "beamWidth", "perSignatureCap", "relevantSetLimit"}


def query_summary(query: BuildDiscoveryQuery) -> dict[str, Any]:
    return {
        **prototype_query_summary(query),
        "limit": query.limit,
        "topK": query.top_k,
        "beamWidth": query.beam_width,
        "perSignatureCap": query.per_signature_cap,
        "relevantSetLimit": query.relevant_set_limit,
    }


def legacy_query_summary(query: BuildDiscoveryQuery) -> dict[str, Any]:
    return {
        key: value
        for key, value in query_summary(query).items()
        if key not in SEARCH_QUERY_FIELDS
    }


def query_payload_matches_artifact(
    target: LevelDiversityTarget,
    query: BuildDiscoveryQuery,
    artifact_query: Any,
) -> bool:
    if artifact_query == query_summary(query):
        return True
    if query == query_for_target(target) and artifact_query == legacy_query_summary(query):
        return True
    return False


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


@dataclass(frozen=True)
class TargetFileRows:
    rows: list[dict[str, Any]]
    source_kind: str


@dataclass(frozen=True)
class TargetFileLoadResult:
    targets: tuple[LevelDiversityTarget, ...]
    source: str
    source_kind: str


def csv_filter(raw_value: str | None) -> set[str] | None:
    if not raw_value or raw_value == "all":
        return None
    return {value.strip() for value in raw_value.split(",") if value.strip()}


def selected_targets(
    *,
    all_targets: Iterable[LevelDiversityTarget] = LEVEL_DIVERSITY_TARGETS,
    target_names: set[str] | None = None,
    levels: set[int] | None = None,
    elements: set[str] | None = None,
    budget_tiers: set[int] | None = None,
    ap_targets: set[int] | None = None,
    mp_targets: set[int] | None = None,
    range_targets: set[int | None] | None = None,
    damage_survivability_presets: set[int] | None = None,
) -> list[LevelDiversityTarget]:
    targets = []
    for target in all_targets:
        if target_names is not None and target.name not in target_names:
            continue
        if levels is not None and target.level not in levels:
            continue
        if elements is not None and target.element not in elements:
            continue
        if budget_tiers is not None and target.budget_tier not in budget_tiers:
            continue
        if ap_targets is not None and target.ap not in ap_targets:
            continue
        if mp_targets is not None and target.mp not in mp_targets:
            continue
        if range_targets is not None and target.range_target not in range_targets:
            continue
        if (
            damage_survivability_presets is not None
            and target.damage_survivability_preset not in damage_survivability_presets
        ):
            continue
        targets.append(target)
    return targets


def target_name_from_row(row: dict[str, Any], prefix: str = "file") -> str:
    range_value = row.get("rangeTarget")
    range_label = "none" if range_value is None else str(range_value)
    preset_label = (
        f"preset{row['damageSurvivabilityPreset']}_"
        if "damageSurvivabilityPreset" in row
        else ""
    )
    return (
        f"{prefix}_level_{row['level']}_{row['element']}_"
        f"{preset_label}"
        f"{row['apTarget']}_{row['mpTarget']}_{range_label}_budget{row['budgetTier']}"
    )


def normalize_range_target(value: Any, *, index: int) -> int | None:
    if value is None:
        return None
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"", "none", "any", "null"}:
            return None
        try:
            return int(normalized)
        except ValueError as exc:
            raise ValueError(f"target row {index} has invalid rangeTarget: {value}") from exc
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"target row {index} has invalid rangeTarget: {value}") from exc


def required_row_value(row: dict[str, Any], key: str, *, index: int) -> Any:
    if key not in row:
        raise ValueError(f"target row {index} missing {key}")
    return row[key]


def target_from_row(row: dict[str, Any], prefix: str = "file", *, index: int = 0) -> LevelDiversityTarget:
    if not isinstance(row, dict):
        raise ValueError(f"target row {index} must be an object")
    has_explicit_preset = "damageSurvivabilityPreset" in row
    normalized_row = {
        "level": int(required_row_value(row, "level", index=index)),
        "element": str(required_row_value(row, "element", index=index)),
        "budgetTier": int(required_row_value(row, "budgetTier", index=index)),
        "apTarget": int(required_row_value(row, "apTarget", index=index)),
        "mpTarget": int(required_row_value(row, "mpTarget", index=index)),
        "rangeTarget": normalize_range_target(
            required_row_value(row, "rangeTarget", index=index),
            index=index,
        ),
        "damageSurvivabilityPreset": int(row.get("damageSurvivabilityPreset", 3)),
    }
    name_row = normalized_row if has_explicit_preset else {
        key: value
        for key, value in normalized_row.items()
        if key != "damageSurvivabilityPreset"
    }
    return LevelDiversityTarget(
        row.get("id") or target_name_from_row(name_row, prefix),
        normalized_row["level"],
        normalized_row["element"],
        normalized_row["budgetTier"],
        normalized_row["apTarget"],
        normalized_row["mpTarget"],
        normalized_row["rangeTarget"],
        normalized_row["damageSurvivabilityPreset"],
    )


def rows_from_target_file_payload(payload: Any) -> TargetFileRows:
    if isinstance(payload, list):
        return TargetFileRows(payload, "array")
    if not isinstance(payload, dict):
        raise ValueError("Target file must contain a JSON object or array.")
    if isinstance(payload.get("nextUnprovenTargets"), list):
        return TargetFileRows(payload["nextUnprovenTargets"], "nextUnprovenTargets")
    if isinstance(payload.get("targets"), list):
        return TargetFileRows(payload["targets"], "targets")
    if isinstance(payload.get("results"), list):
        rows = []
        for index, result in enumerate(payload["results"]):
            if not isinstance(result, dict) or not isinstance(result.get("target"), dict):
                raise ValueError(f"target file results row {index} missing target object")
            rows.append(result["target"])
        return TargetFileRows(rows, "results")
    raise ValueError("Target file must contain nextUnprovenTargets, targets, results, or a target row array.")


def target_source_for_file(path: str | Path, source_kind: str) -> str:
    return f"{path}#{source_kind}"


def load_targets_from_file(path: str | Path, *, limit: int | None = None, prefix: str = "file") -> TargetFileLoadResult:
    if limit is not None and limit < 0:
        raise ValueError("--target-file-limit must be non-negative")
    with open(path, encoding="utf-8") as file:
        payload = json.load(file)
    target_rows = rows_from_target_file_payload(payload)
    rows = target_rows.rows
    if limit is not None:
        rows = rows[:limit]
    targets = []
    seen_names: set[str] = set()
    seen_row_keys: set[tuple[int, str, int, int, int, int | None, int]] = set()
    for index, row in enumerate(rows):
        target = target_from_row(row, prefix, index=index)
        row_key = (
            target.level,
            target.element,
            target.budget_tier,
            target.ap,
            target.mp,
            target.range_target,
            target.damage_survivability_preset,
        )
        if target.name in seen_names:
            duplicate_type = "explicit target id" if isinstance(row, dict) and row.get("id") else "synthesized target row key"
            raise ValueError(f"Duplicate {duplicate_type} in target file: {target.name}")
        if row_key in seen_row_keys:
            raise ValueError(f"Duplicate target row key in target file: {row_key}")
        seen_names.add(target.name)
        seen_row_keys.add(row_key)
        targets.append(target)
    return TargetFileLoadResult(
        tuple(targets),
        target_source_for_file(path, target_rows.source_kind),
        target_rows.source_kind,
    )


def targets_from_file(path: str | Path, *, limit: int | None = None, prefix: str = "file") -> tuple[LevelDiversityTarget, ...]:
    return load_targets_from_file(path, limit=limit, prefix=prefix).targets


def targets_for_set(target_set: str) -> tuple[LevelDiversityTarget, ...]:
    if target_set == "level-diversity":
        return LEVEL_DIVERSITY_TARGETS
    if target_set == "milestone2-level200":
        return MILESTONE2_LEVEL200_TARGETS
    if target_set == "boundary":
        return BOUNDARY_LEVEL_TARGETS
    if target_set == "coverage":
        return AP_MP_RANGE_COVERAGE_TARGETS
    if target_set == "prod-level-sample":
        return PROD_LEVEL_SAMPLE_TARGETS
    if target_set == "grid-next-minimum":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS
    if target_set == "grid-next-minimum-2":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS
    if target_set == "grid-next-minimum-3":
        return AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS
    if target_set == "grid-next-cap":
        return AP_MP_RANGE_GRID_NEXT_CAP_TARGETS
    if target_set == "grid-next-cap-2":
        return AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS
    if target_set == "grid-next-cap-3":
        return AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS
    if target_set == "grid-next-cap-4":
        return AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS
    if target_set == "all":
        return (
            LEVEL_DIVERSITY_TARGETS
            + MILESTONE2_LEVEL200_TARGETS
            + BOUNDARY_LEVEL_TARGETS
            + AP_MP_RANGE_COVERAGE_TARGETS
            + PROD_LEVEL_SAMPLE_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS
            + AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS
            + AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS
        )
    raise ValueError(f"Unsupported target set: {target_set}")


def query_for_matrix_target(
    target: LevelDiversityTarget,
    *,
    query_limit: int | None = None,
) -> BuildDiscoveryQuery:
    query = query_for_target(target)
    if query_limit is not None:
        query = replace(query, limit=query_limit)
    return query


def target_source_for_set(target_set: str) -> str:
    if target_set == "target-file":
        return "target file"
    if target_set == "milestone2-level200":
        return "scripts.build_discovery_level_diversity_targets.MILESTONE2_LEVEL200_TARGETS"
    if target_set == "boundary":
        return "scripts.build_discovery_level_diversity_targets.BOUNDARY_LEVEL_TARGETS"
    if target_set == "coverage":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_COVERAGE_TARGETS"
    if target_set == "prod-level-sample":
        return "scripts.build_discovery_level_diversity_targets.PROD_LEVEL_SAMPLE_TARGETS"
    if target_set == "grid-next-minimum":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS"
    if target_set == "grid-next-minimum-2":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS"
    if target_set == "grid-next-minimum-3":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS"
    if target_set == "grid-next-cap":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_TARGETS"
    if target_set == "grid-next-cap-2":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS"
    if target_set == "grid-next-cap-3":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS"
    if target_set == "grid-next-cap-4":
        return "scripts.build_discovery_level_diversity_targets.AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS"
    if target_set == "all":
        return "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS+MILESTONE2_LEVEL200_TARGETS+BOUNDARY_LEVEL_TARGETS+AP_MP_RANGE_COVERAGE_TARGETS+PROD_LEVEL_SAMPLE_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS+AP_MP_RANGE_GRID_NEXT_MINIMUM_3_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_2_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_3_TARGETS+AP_MP_RANGE_GRID_NEXT_CAP_4_TARGETS"
    return "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS"


def target_summary(target: LevelDiversityTarget) -> dict[str, Any]:
    return {
        "id": target.name,
        "className": "Iop",
        "level": target.level,
        "element": target.element,
        "budgetTier": target.budget_tier,
        "apTarget": target.ap,
        "mpTarget": target.mp,
        "rangeTarget": target.range_target,
        "damageSurvivabilityPreset": target.damage_survivability_preset,
    }


def item_names(build: dict[str, Any] | None) -> list[str]:
    if not build:
        return []
    items = build.get("items", {})
    names = []
    for slot_name, _ in SLOTS:
        item = items.get(slot_name)
        if item:
            names.append(item.get("name") or item.get("id") or slot_name)
    return names


def compact_build_summary(build: dict[str, Any] | None) -> dict[str, Any] | None:
    if not build:
        return None
    totals = build.get("totals", {})
    return {
        "score": build.get("score"),
        "apStrategy": build.get("apStrategy"),
        "totals": totals,
        "sets": build.get("sets", {}),
        "exos": build.get("exos", {}),
        "items": item_names(build),
    }


def build_item_signature(build: dict[str, Any]) -> tuple[str, ...]:
    signature = []
    for item in (build.get("items") or {}).values():
        item_id = item.get("id") or item.get("dofusID") or item.get("name")
        if item_id:
            signature.append(str(item_id))
    return tuple(sorted(signature))


def candidate_diversity_summary(builds: list[dict[str, Any]]) -> dict[str, Any]:
    signatures = [build_item_signature(build) for build in builds]
    unique_signatures = {signature for signature in signatures}
    best_signature = set(signatures[0]) if signatures else set()
    max_shared_with_best = 0
    if len(signatures) > 1:
        max_shared_with_best = max(
            len(best_signature & set(signature))
            for signature in signatures[1:]
        )
    return {
        "candidateCount": len(builds),
        "uniqueItemSignatureCount": len(unique_signatures),
        "maxSharedItemsWithBest": max_shared_with_best,
    }


def current_git_sha() -> str | None:
    repo_root = Path(__file__).resolve().parents[2]
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=repo_root,
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return result.stdout.strip() or None


def validate_best_build(target: LevelDiversityTarget, query: BuildDiscoveryQuery, build: dict[str, Any] | None) -> list[str]:
    if not build:
        return ["no build returned"]

    errors = []
    condition_failures = build.get("conditionFailures") or []
    if condition_failures:
        errors.append(f"condition failures present: {condition_failures}")

    totals = build.get("totals") or {}
    ap = totals.get("AP")
    mp = totals.get("MP")
    range_value = totals.get("Range")
    if not isinstance(ap, (int, float)):
        errors.append("missing numeric AP total")
    elif ap < query.ap_target or ap > MAX_AP:
        errors.append(f"AP total {ap} outside target/cap {query.ap_target}-{MAX_AP}")
    if not isinstance(mp, (int, float)):
        errors.append("missing numeric MP total")
    elif mp < query.mp_target or mp > MAX_MP:
        errors.append(f"MP total {mp} outside target/cap {query.mp_target}-{MAX_MP}")
    if not isinstance(range_value, (int, float)):
        errors.append("missing numeric Range total")
    elif range_value > MAX_RANGE:
        errors.append(f"Range total {range_value} exceeds cap {MAX_RANGE}")
    elif query.range_target is not None and range_value < query.range_target:
        errors.append(f"Range total {range_value} below target {query.range_target}")

    for slot_name, item in (build.get("items") or {}).items():
        item_level = item.get("level")
        if isinstance(item_level, (int, float)) and item_level > target.level:
            errors.append(f"{slot_name} item level {item_level} exceeds target level {target.level}")

    return errors


def matrix_entry(
    target: LevelDiversityTarget,
    response: dict[str, Any],
    query: BuildDiscoveryQuery,
) -> dict[str, Any]:
    builds = response.get("builds", [])
    best_build = builds[0] if builds else None
    diagnostics = response.get("diagnostics", {})
    coverage_errors = []
    if diagnostics.get("fallbackBudget"):
        coverage_errors.append("budget fallback used; not covering requested budget tier")
    candidate_validation_errors = [
        {
            "index": index,
            "errors": validate_best_build(target, query, build),
        }
        for index, build in enumerate(builds)
    ]
    invalid_candidates = [
        validation for validation in candidate_validation_errors if validation["errors"]
    ]
    validation_errors = validate_best_build(target, query, best_build) + coverage_errors
    status = "no_build" if not best_build else "invalid" if invalid_candidates or coverage_errors else "generated"
    return {
        "target": target_summary(target),
        "query": query_summary(query),
        "status": status,
        "resultCount": len(builds),
        "validationErrors": validation_errors,
        "candidateValidationErrors": candidate_validation_errors,
        "bestBuild": best_build,
        "bestBuildSummary": compact_build_summary(best_build),
        "candidateBuilds": builds,
        "candidateBuildSummaries": [compact_build_summary(build) for build in builds],
        "candidateDiversity": candidate_diversity_summary(builds),
        "warnings": response.get("warnings", []),
        "diagnostics": diagnostics,
        "cache": response.get("cache", {}),
        "datasetVersion": response.get("datasetVersion"),
        "solverVersion": response.get("solverVersion"),
    }


def matrix_report_from_entries(
    entries: list[dict[str, Any]],
    *,
    generated_at: str,
    target_set: str,
    git_sha: str | None,
    target_source: str | None = None,
    solver: str = "prototype",
) -> dict[str, Any]:
    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": generated_at,
        "scope": f"Iop {target_set} generated target matrix",
        "evidenceType": (
            "action_stat_feasibility"
            if target_set == "coverage"
            else "generated_solver_snapshot"
        ),
        "provenance": {
            "gitSha": git_sha or current_git_sha(),
            "targetSource": target_source or target_source_for_set(target_set),
            "generator": "scripts/build_discovery_level_diversity_matrix.py",
            "solver": solver,
        },
        "targetCount": len(entries),
        "generatedCount": sum(1 for entry in entries if entry["status"] == "generated"),
        "noBuildCount": sum(1 for entry in entries if entry["status"] == "no_build"),
        "invalidCount": sum(1 for entry in entries if entry["status"] == "invalid"),
        "results": entries,
    }


def build_matrix_report(
    targets: Iterable[LevelDiversityTarget],
    *,
    generator: Callable[[BuildDiscoveryQuery], dict[str, Any]] = build_discovery_response,
    generated_at: str | None = None,
    target_set: str = "level-diversity",
    git_sha: str | None = None,
    target_source: str | None = None,
    query_limit: int | None = None,
    solver: str = "prototype",
) -> dict[str, Any]:
    entries = []
    for target in targets:
        query = query_for_matrix_target(target, query_limit=query_limit)
        query.validate()
        response = generator(query)
        entries.append(matrix_entry(target, response, query))

    return matrix_report_from_entries(
        entries,
        generated_at=generated_at or datetime.now(timezone.utc).isoformat(),
        target_set=target_set,
        git_sha=git_sha,
        target_source=target_source,
        solver=solver,
    )


def artifact_stem_for_target(target: LevelDiversityTarget) -> str:
    stem = re.sub(r"[^A-Za-z0-9_.-]+", "-", target.name).strip("-")
    return stem or "unknown-target"


def unique_artifact_stem_for_target(target: LevelDiversityTarget, used_stems: set[str]) -> str:
    stem = artifact_stem_for_target(target)
    base_stem = stem
    suffix = 2
    while stem in used_stems:
        stem = f"{base_stem}-{suffix}"
        suffix += 1
    used_stems.add(stem)
    return stem


def split_report_target_id(report: dict[str, Any]) -> str | None:
    results = report.get("results")
    if not isinstance(results, list) or len(results) != 1:
        return None
    target = results[0].get("target") if isinstance(results[0], dict) else None
    if not isinstance(target, dict):
        return None
    return target.get("id")


def validate_existing_split_report_for_target(
    report: dict[str, Any],
    target: LevelDiversityTarget,
    query: BuildDiscoveryQuery,
    path: Path,
    solver: str = "prototype",
) -> None:
    if report.get("reportVersion") != REPORT_VERSION:
        raise ValueError(f"Existing split report {path} has unsupported reportVersion {report.get('reportVersion')}.")
    if split_report_target_id(report) != target.name:
        raise ValueError(f"Existing split report {path} does not match target {target.name}.")

    result = report["results"][0]
    provenance = report.get("provenance") or {}
    artifact_solver = provenance.get("solver")
    if artifact_solver is None and solver != "prototype":
        raise ValueError(f"Existing split report {path} does not record solver {solver}.")
    if artifact_solver is not None and artifact_solver != solver:
        raise ValueError(f"Existing split report {path} solver is {artifact_solver}, expected {solver}.")
    diagnostics = result.get("diagnostics") if isinstance(result, dict) else None
    diagnostic_solver = diagnostics.get("solver") if isinstance(diagnostics, dict) else None
    if solver != "prototype" and diagnostic_solver != solver:
        raise ValueError(
            f"Existing split report {path} result solver is {diagnostic_solver}, expected {solver}."
        )
    if result.get("target") != target_summary(target):
        raise ValueError(f"Existing split report {path} target payload is stale for {target.name}.")
    if not query_payload_matches_artifact(target, query, result.get("query")):
        raise ValueError(f"Existing split report {path} query payload is stale for {target.name}.")
    if result.get("status") == "generated":
        validation_errors = validate_best_build(target, query, result.get("bestBuild"))
        if validation_errors:
            raise ValueError(
                f"Existing split report {path} generated build no longer validates for {target.name}: {validation_errors}"
            )
        candidate_builds = result.get("candidateBuilds")
        result_count = result.get("resultCount", 0)
        if result_count > 1 or query.limit > 1:
            if not isinstance(candidate_builds, list):
                raise ValueError(f"Existing split report {path} is missing candidateBuilds for {target.name}.")
            if len(candidate_builds) != result_count:
                raise ValueError(
                    f"Existing split report {path} candidateBuilds length {len(candidate_builds)} "
                    f"does not match resultCount {result_count} for {target.name}."
                )
        if isinstance(candidate_builds, list):
            for index, candidate in enumerate(candidate_builds):
                candidate_errors = validate_best_build(target, query, candidate)
                if candidate_errors:
                    raise ValueError(
                        f"Existing split report {path} candidateBuilds[{index}] no longer validates "
                        f"for {target.name}: {candidate_errors}"
                    )


def existing_split_report_for_target(
    path: Path,
    target: LevelDiversityTarget,
    query: BuildDiscoveryQuery,
    solver: str = "prototype",
) -> dict[str, Any] | None:
    if not path.exists():
        return None
    report = load_json(path)
    validate_existing_split_report_for_target(report, target, query, path, solver=solver)
    return report


def completed_target_ids_from_split_reports(
    targets: Iterable[LevelDiversityTarget],
    split_output_dir: str | Path,
    query_limit: int | None = None,
    solver: str = "prototype",
) -> set[str]:
    output_dir = Path(split_output_dir)
    if not output_dir.exists():
        return set()

    completed: set[str] = set()
    used_stems: set[str] = set()
    for target in targets:
        query = query_for_matrix_target(target, query_limit=query_limit)
        stem = unique_artifact_stem_for_target(target, used_stems)
        path = output_dir / f"{stem}.json"
        report = existing_split_report_for_target(path, target, query, solver=solver)
        if report is None:
            continue
        result = report["results"][0]
        if result.get("status") == "generated":
            completed.add(target.name)
    return completed


def targets_missing_from_split_reports(
    targets: Iterable[LevelDiversityTarget],
    split_output_dir: str | Path,
    query_limit: int | None = None,
    solver: str = "prototype",
) -> tuple[LevelDiversityTarget, ...]:
    selected_targets = tuple(targets)
    completed = completed_target_ids_from_split_reports(
        selected_targets,
        split_output_dir,
        query_limit=query_limit,
        solver=solver,
    )
    return tuple(target for target in selected_targets if target.name not in completed)


def write_split_matrix_reports(
    targets: Iterable[LevelDiversityTarget],
    *,
    output_dir: Path,
    generator: Callable[[BuildDiscoveryQuery], dict[str, Any]] = build_discovery_response,
    generated_at: str | None = None,
    target_set: str = "level-diversity",
    git_sha: str | None = None,
    target_source: str | None = None,
    resume_existing: bool = False,
    query_limit: int | None = None,
    solver: str = "prototype",
) -> dict[str, Any]:
    generated_at = generated_at or datetime.now(timezone.utc).isoformat()
    output_dir.mkdir(parents=True, exist_ok=True)
    entries = []
    manifest_rows = []
    used_stems: set[str] = set()
    for target in targets:
        query = query_for_matrix_target(target, query_limit=query_limit)
        query.validate()

        stem = unique_artifact_stem_for_target(target, used_stems)

        json_path = output_dir / f"{stem}.json"
        md_path = output_dir / f"{stem}.md"
        existing_report = existing_split_report_for_target(json_path, target, query, solver=solver) if resume_existing else None
        if existing_report:
            one_row_report = existing_report
            entry = existing_report["results"][0]
            if not md_path.exists():
                md_path.write_text(render_markdown(one_row_report), encoding="utf-8")
        else:
            response = generator(query)
            entry = matrix_entry(target, response, query)
            one_row_report = matrix_report_from_entries(
                [entry],
                generated_at=generated_at,
                target_set=target_set,
                git_sha=git_sha,
                target_source=target_source,
                solver=solver,
            )
            json_path.write_text(json.dumps(one_row_report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            md_path.write_text(render_markdown(one_row_report), encoding="utf-8")
        entries.append(entry)
        manifest_rows.append(
            {
                "targetId": target.name,
                "status": entry["status"],
                "resumed": bool(existing_report),
                "json": json_path.name,
                "markdown": md_path.name,
            }
        )
        manifest = {"splitReportCount": len(manifest_rows), "reports": manifest_rows}
        (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    aggregate_report = matrix_report_from_entries(
        entries,
        generated_at=generated_at,
        target_set=target_set,
        git_sha=git_sha,
        target_source=target_source,
        solver=solver,
    )
    return {
        "manifest": {"splitReportCount": len(manifest_rows), "reports": manifest_rows},
        "aggregateReport": aggregate_report,
    }


def target_label(target: dict[str, Any]) -> str:
    range_value = target["rangeTarget"]
    range_label = "any" if range_value is None else str(range_value)
    return (
        f"L{target['level']} {target['element']} "
        f"{target['apTarget']}/{target['mpTarget']}/{range_label} "
        f"tier {target['budgetTier']}"
    )


def target_manifest_report(
    targets: Iterable[LevelDiversityTarget],
    *,
    generated_at: str,
    target_set: str,
    git_sha: str | None,
    target_source: str | None = None,
    query_limit: int | None = None,
) -> dict[str, Any]:
    rows = []
    for target in targets:
        query = query_for_matrix_target(target, query_limit=query_limit)
        rows.append(
            {
                "target": target_summary(target),
                "query": query_summary(query),
                "search": {
                    "topK": query.top_k,
                    "beamWidth": query.beam_width,
                    "perSignatureCap": query.per_signature_cap,
                    "relevantSetLimit": query.relevant_set_limit,
                },
            }
        )
    return {
        "reportVersion": "build-discovery-level-target-manifest-v1",
        "generatedAt": generated_at,
        "scope": f"Iop {target_set} target manifest",
        "evidenceType": "target_selection_manifest",
        "provenance": {
            "gitSha": git_sha,
            "targetSource": target_source or target_source_for_set(target_set),
        },
        "targetCount": len(rows),
        "targets": rows,
    }


def render_target_manifest_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery Iop Target Manifest",
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        "This is a target-selection manifest only. It does not contain generated builds or quality proof.",
        "",
        f"Targets: `{report['targetCount']}`",
        "",
        "| Target | Preset | Query budget | Exo policy | Search |",
        "|---|---:|---:|---|---|",
    ]
    for row in report["targets"]:
        target = row["target"]
        query = row["query"]
        search_config = row.get("search", {})
        search = (
            f"topK {search_config.get('topK', '')}, beam {search_config.get('beamWidth', '')}, "
            f"signature {search_config.get('perSignatureCap', '')}, sets {search_config.get('relevantSetLimit', '')}"
        )
        lines.append(
            "| {} | {} | {} | {} | {} |".format(
                target_label(target),
                query["damageSurvivabilityPreset"],
                query["budgetTier"],
                query["exoPolicy"],
                search,
            )
        )
    lines.append("")
    return "\n".join(lines)


def report_title(report: dict[str, Any]) -> str:
    scope = report.get("scope", "")
    if scope.startswith("Iop ") and scope.endswith(" generated target matrix"):
        target_set = scope[len("Iop ") : -len(" generated target matrix")]
        target_set_label = target_set.replace("-", " ").title()
        return f"# Build Discovery Iop {target_set_label} Matrix"
    return "# Build Discovery Iop Target Matrix"


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        report_title(report),
        "",
        f"Generated at: `{report['generatedAt']}`",
        "",
        (
            "This is a generated-output snapshot for the sampled target set. "
            "It records the current best solver result "
            "for review; it is not yet a human-accepted benchmark list."
        ),
        (
            "Coverage target-set artifacts are action-stat feasibility evidence "
            "only. They do not prove realistic build quality at every level."
            if report.get("evidenceType") == "action_stat_feasibility"
            else ""
        ),
        "",
        f"Targets: `{report['targetCount']}`",
        f"Generated: `{report['generatedCount']}`",
        f"No build: `{report['noBuildCount']}`",
        f"Invalid: `{report.get('invalidCount', 0)}`",
        "",
        "| Target | Preset | Status | Candidates | Score | Miss ms | AP/MP/Range | Main stat | Vitality | Validation | Sets | Items |",
        "|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|---|",
    ]
    for entry in report["results"]:
        target = entry["target"]
        summary = entry.get("bestBuildSummary") or {}
        totals = summary.get("totals", {})
        main_stat = totals.get(target["element"].capitalize(), "")
        if target["element"] == "strength":
            main_stat = totals.get("Strength", main_stat)
        elif target["element"] == "intelligence":
            main_stat = totals.get("Intelligence", main_stat)
        elif target["element"] == "chance":
            main_stat = totals.get("Chance", main_stat)
        elif target["element"] == "agility":
            main_stat = totals.get("Agility", main_stat)
        diagnostics = entry.get("diagnostics", {})
        elapsed = diagnostics.get("elapsedMs", "")
        action_stats = (
            f"{totals.get('AP', '')}/{totals.get('MP', '')}/{totals.get('Range', '')}"
            if totals
            else ""
        )
        sets = ", ".join(f"{name} x{count}" for name, count in summary.get("sets", {}).items())
        items = ", ".join(summary.get("items", []))
        validation = "; ".join(entry.get("validationErrors", []))
        diversity = entry.get("candidateDiversity") or {}
        candidates = diversity.get("candidateCount", entry.get("resultCount", ""))
        unique_signatures = diversity.get("uniqueItemSignatureCount")
        candidate_label = (
            f"{candidates} ({unique_signatures} unique)"
            if unique_signatures is not None
            else str(candidates)
        )
        lines.append(
            "| {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} |".format(
                target_label(target),
                target.get("damageSurvivabilityPreset", 3),
                entry["status"],
                candidate_label,
                summary.get("score", ""),
                elapsed,
                action_stats,
                main_stat,
                totals.get("Vitality", ""),
                validation,
                sets,
                items,
            )
        )
    lines.append("")
    return "\n".join(lines)


def parse_int_filter(raw_value: str | None) -> set[int] | None:
    values = csv_filter(raw_value)
    if values is None:
        return None
    return {int(value) for value in values}


def parse_optional_int_filter(raw_value: str | None) -> set[int | None] | None:
    values = csv_filter(raw_value)
    if values is None:
        return None
    parsed: set[int | None] = set()
    for value in values:
        normalized = value.strip().lower()
        if normalized in {"", "none", "any", "null"}:
            parsed.add(None)
        else:
            parsed.add(int(normalized))
    return parsed


def cpsat_args_for_query(query: BuildDiscoveryQuery, args: argparse.Namespace) -> argparse.Namespace:
    requested_limit = query.limit or 1
    candidate_limit = max(getattr(args, "cpsat_candidate_limit", 20), requested_limit)
    return argparse.Namespace(
        time_limit_seconds=getattr(args, "cpsat_time_limit_seconds", 20.0),
        workers=getattr(args, "cpsat_workers", 8),
        max_attempts=getattr(args, "cpsat_max_attempts", 40),
        candidate_limit=candidate_limit,
        summary_limit=getattr(args, "cpsat_summary_limit", 10),
        output_build_limit=requested_limit,
        collection_mode=getattr(args, "cpsat_collection_mode", "callback"),
        stop_after_candidates=getattr(args, "cpsat_stop_after_candidates", False),
        objective_mode=getattr(args, "cpsat_objective_mode", "final-linear"),
        generic_damage_weight=query.generic_damage_weight,
        max_shared_items=query.max_shared_items,
    )


def cpsat_build_discovery_response(query: BuildDiscoveryQuery, args: argparse.Namespace) -> dict[str, Any]:
    from oneoff.build_discovery_cpsat_experiment import solve_query

    response = solve_query(query, cpsat_args_for_query(query, args))
    diagnostics = response.setdefault("diagnostics", {})
    diagnostics.setdefault("solver", "cpsat")
    timings = response.get("timings") if isinstance(response.get("timings"), dict) else {}
    load_ms = timings.get("loadMs", 0) if isinstance(timings.get("loadMs", 0), (int, float)) else 0
    total_search_ms = (
        timings.get("totalSearchMs", 0)
        if isinstance(timings.get("totalSearchMs", 0), (int, float))
        else 0
    )
    diagnostics.setdefault("elapsedMs", round(load_ms + total_search_ms, 1))
    for key in (
        "solverStatus",
        "timings",
        "attempts",
        "itemCount",
        "candidateCount",
        "requestedCandidateLimit",
        "collectionMode",
        "stopAfterCandidates",
        "maxSharedItems",
        "maxSharedItemsEnforced",
        "objectiveWeights",
    ):
        if key in response:
            diagnostics.setdefault(key, response[key])
    response.setdefault("solverVersion", "oneoff.build_discovery_cpsat_experiment")
    return response


def generator_for_args(args: argparse.Namespace) -> Callable[[BuildDiscoveryQuery], dict[str, Any]]:
    if args.solver == "prototype":
        return (
            build_discovery_response
            if args.use_cache
            else lambda query: build_discovery_response(query, use_cache=False)
        )
    if args.use_cache:
        raise ValueError("--use-cache is only supported with --solver prototype.")
    return lambda query: cpsat_build_discovery_response(query, args)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--targets", help="Comma-separated target ids to include.")
    parser.add_argument("--target-file", help="JSON target rows, inventory report, or matrix report to run.")
    parser.add_argument("--target-file-limit", type=int, help="Limit target rows loaded from --target-file.")
    parser.add_argument("--target-file-prefix", default="file", help="Prefix for generated target ids from --target-file.")
    parser.add_argument(
        "--target-set",
        choices=("level-diversity", "milestone2-level200", "boundary", "coverage", "prod-level-sample", "grid-next-minimum", "grid-next-minimum-2", "grid-next-minimum-3", "grid-next-cap", "grid-next-cap-2", "grid-next-cap-3", "grid-next-cap-4", "all"),
        default="level-diversity",
    )
    parser.add_argument("--levels", help="Comma-separated levels to include.")
    parser.add_argument("--elements", help="Comma-separated elements to include.")
    parser.add_argument("--budget-tiers", help="Comma-separated budget tiers to include.")
    parser.add_argument("--ap-targets", help="Comma-separated AP targets to include.")
    parser.add_argument("--mp-targets", help="Comma-separated MP targets to include.")
    parser.add_argument("--range-targets", help="Comma-separated range targets to include; accepts none/any/null.")
    parser.add_argument("--damage-survivability-presets", help="Comma-separated damage/survivability presets to include.")
    parser.add_argument("--target-manifest-json", help="Write selected target/query manifest JSON without running the solver.")
    parser.add_argument("--target-manifest-md", help="Write selected target/query manifest Markdown without running the solver.")
    parser.add_argument("--output-json", help="Write JSON report to this path.")
    parser.add_argument("--output-md", help="Write Markdown summary to this path.")
    parser.add_argument("--query-limit", type=int, help="Override BuildDiscoveryQuery.limit for generated matrix rows.")
    parser.add_argument("--split-output-dir", help="Write one JSON/Markdown report per selected target.")
    parser.add_argument(
        "--missing-from-split-dir",
        help="Only run selected targets that do not already have one-row JSON reports in this split dir.",
    )
    parser.add_argument("--resume-existing", action="store_true", help="In split-output mode, reuse existing one-row target reports.")
    parser.add_argument("--git-sha", help="Git SHA to record when the runtime cannot see .git.")
    parser.add_argument("--solver", choices=("prototype", "cpsat"), default="prototype")
    parser.add_argument("--use-cache", action="store_true", help="Use process cache during generation.")
    parser.add_argument("--cpsat-time-limit-seconds", type=float, default=20.0)
    parser.add_argument("--cpsat-workers", type=int, default=8)
    parser.add_argument("--cpsat-max-attempts", type=int, default=40)
    parser.add_argument("--cpsat-candidate-limit", type=int, default=20)
    parser.add_argument("--cpsat-summary-limit", type=int, default=10)
    parser.add_argument("--cpsat-collection-mode", choices=("callback", "repeated"), default="callback")
    parser.add_argument("--cpsat-stop-after-candidates", action="store_true")
    parser.add_argument("--cpsat-objective-mode", choices=("stat-linear", "final-linear"), default="final-linear")
    args = parser.parse_args()
    if args.resume_existing and not args.split_output_dir:
        parser.error("--resume-existing requires --split-output-dir.")
    if args.query_limit is not None and args.query_limit < 1:
        parser.error("--query-limit must be positive.")
    if args.solver == "cpsat" and args.use_cache:
        parser.error("--use-cache is only supported with --solver prototype.")
    if args.cpsat_time_limit_seconds <= 0:
        parser.error("--cpsat-time-limit-seconds must be positive.")
    if args.cpsat_workers < 1:
        parser.error("--cpsat-workers must be positive.")
    if args.cpsat_max_attempts < 1:
        parser.error("--cpsat-max-attempts must be positive.")
    if args.cpsat_candidate_limit < 1:
        parser.error("--cpsat-candidate-limit must be positive.")
    if args.cpsat_summary_limit < 1:
        parser.error("--cpsat-summary-limit must be positive.")

    target_source = None
    if args.target_file:
        target_file_result = load_targets_from_file(
            args.target_file,
            limit=args.target_file_limit,
            prefix=args.target_file_prefix,
        )
        all_targets = target_file_result.targets
        target_source = target_file_result.source
    else:
        all_targets = targets_for_set(args.target_set)
    target_set = "target-file" if args.target_file else args.target_set
    targets = selected_targets(
        all_targets=all_targets,
        target_names=csv_filter(args.targets),
        levels=parse_int_filter(args.levels),
        elements=csv_filter(args.elements),
        budget_tiers=parse_int_filter(args.budget_tiers),
        ap_targets=parse_int_filter(args.ap_targets),
        mp_targets=parse_int_filter(args.mp_targets),
        range_targets=parse_optional_int_filter(args.range_targets),
        damage_survivability_presets=parse_int_filter(args.damage_survivability_presets),
    )
    if args.missing_from_split_dir:
        targets = targets_missing_from_split_reports(
            targets,
            args.missing_from_split_dir,
            query_limit=args.query_limit,
            solver=args.solver,
        )
    if not targets:
        parser.error(f"No targets selected from {target_source or args.target_set}.")

    if args.target_manifest_json or args.target_manifest_md:
        manifest = target_manifest_report(
            targets,
            generated_at=datetime.now(timezone.utc).isoformat(),
            target_set=target_set,
            git_sha=args.git_sha or current_git_sha(),
            target_source=target_source,
            query_limit=args.query_limit,
        )
        if args.target_manifest_json:
            target_manifest_json = Path(args.target_manifest_json)
            target_manifest_json.parent.mkdir(parents=True, exist_ok=True)
            target_manifest_json.write_text(
                json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
        if args.target_manifest_md:
            target_manifest_md = Path(args.target_manifest_md)
            target_manifest_md.parent.mkdir(parents=True, exist_ok=True)
            target_manifest_md.write_text(render_target_manifest_markdown(manifest), encoding="utf-8")
        if not args.output_json and not args.output_md and not args.split_output_dir:
            return

    generator = generator_for_args(args)
    if args.split_output_dir:
        split_result = write_split_matrix_reports(
            targets,
            output_dir=Path(args.split_output_dir),
            generator=generator,
            target_set=target_set,
            git_sha=args.git_sha,
            target_source=target_source,
            resume_existing=args.resume_existing,
            query_limit=args.query_limit,
            solver=args.solver,
        )
        report = split_result["aggregateReport"]
    else:
        report = build_matrix_report(
            targets,
            generator=generator,
            target_set=target_set,
            git_sha=args.git_sha,
            target_source=target_source,
            query_limit=args.query_limit,
            solver=args.solver,
        )

    if args.output_json:
        output_json = Path(args.output_json)
        output_json.parent.mkdir(parents=True, exist_ok=True)
        output_json.write_text(
            json.dumps(report, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    else:
        print(json.dumps(report, indent=2, ensure_ascii=False))

    if args.output_md:
        output_md = Path(args.output_md)
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(render_markdown(report), encoding="utf-8")


if __name__ == "__main__":
    main()
