"""Inventory generated evidence against the Iop AP/MP/Range query grid."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    MIN_MP,
    BuildDiscoveryQuery,
    base_ap_for_level,
)


REPORT_VERSION = "build-discovery-ap-mp-range-grid-inventory-v1"
MATRIX_REPORT_VERSION = "build-discovery-level-diversity-matrix-v1"
ALL_LEVELS = tuple(range(1, 201))
DEFAULT_LEVELS = (1, 20, 50, 80, 99, 100, 120, 150, 179, 180, 199, 200)
DEFAULT_ELEMENTS = ("strength", "intelligence", "chance", "agility")
DEFAULT_BUDGET_TIERS = (1, 2, 3, 4)
DEFAULT_ARTIFACTS = (
    ".codex/state/build-discovery-level-diversity-matrix.json",
    ".codex/state/build-discovery-level-boundary-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-coverage-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-minimum-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-minimum-2-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-minimum-3-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-cap-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-cap-2-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-cap-3-matrix.json",
    ".codex/state/build-discovery-ap-mp-range-grid-next-cap-4-matrix.json",
)


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def is_matrix_report(report: dict[str, Any]) -> bool:
    return report.get("reportVersion") == MATRIX_REPORT_VERSION and isinstance(report.get("results"), list)


def load_reports_from_artifact_paths(paths: Iterable[str | Path]) -> list[dict[str, Any]]:
    return [load_json(path) for path in paths]


def iter_matrix_reports_from_artifact_dir(directory: str | Path) -> Iterable[dict[str, Any]]:
    directory_path = Path(directory)
    if not directory_path.is_dir():
        raise FileNotFoundError(f"Artifact directory does not exist: {directory_path}")
    for path in sorted(directory_path.glob("*.json")):
        if path.name == "manifest.json":
            continue
        report = load_json(path)
        if is_matrix_report(report):
            yield report


def load_reports_from_artifacts(
    paths: Iterable[str | Path],
    dirs: Iterable[str | Path] = (),
) -> list[dict[str, Any]]:
    reports = load_reports_from_artifact_paths(paths)
    for directory in dirs:
        reports.extend(iter_matrix_reports_from_artifact_dir(directory))
    return reports


def load_reports_from_artifact_dirs(dirs: Iterable[str | Path]) -> list[dict[str, Any]]:
    return load_reports_from_artifacts((), dirs)


def target_key(
    *,
    level: int,
    element: str,
    budget_tier: int,
    ap: int,
    mp: int,
    range_target: int | None,
) -> tuple[int, str, int, int, int, int | None]:
    return (level, element, budget_tier, ap, mp, range_target)


def iter_valid_iop_target_space(
    levels: Iterable[int] = ALL_LEVELS,
    elements: Iterable[str] = DEFAULT_ELEMENTS,
    budget_tiers: Iterable[int] = DEFAULT_BUDGET_TIERS,
) -> Iterable[dict[str, Any]]:
    for level in levels:
        min_ap = base_ap_for_level(level)
        for element in elements:
            for budget_tier in budget_tiers:
                for ap in range(min_ap, MAX_AP + 1):
                    for mp in range(MIN_MP, MAX_MP + 1):
                        for range_target in (None, *range(0, MAX_RANGE + 1)):
                            query = BuildDiscoveryQuery(
                                level=level,
                                elements=(element,),
                                budget_tier=budget_tier,
                                ap_target=ap,
                                mp_target=mp,
                                range_target=range_target,
                            )
                            query.validate()
                            yield {
                                "level": level,
                                "element": element,
                                "budgetTier": budget_tier,
                                "apTarget": ap,
                                "mpTarget": mp,
                                "rangeTarget": range_target,
                            }


def covered_keys_from_reports(reports: Iterable[dict[str, Any]]) -> set[tuple[int, str, int, int, int, int | None]]:
    covered = set()
    for report in reports:
        for result in report.get("results", []):
            if result.get("status") != "generated" or result.get("validationErrors"):
                continue
            target = result.get("target") or {}
            covered.add(
                target_key(
                    level=target["level"],
                    element=target["element"],
                    budget_tier=target["budgetTier"],
                    ap=target["apTarget"],
                    mp=target["mpTarget"],
                    range_target=target["rangeTarget"],
                )
            )
    return covered


def attempted_keys_from_reports(reports: Iterable[dict[str, Any]]) -> set[tuple[int, str, int, int, int, int | None]]:
    attempted = set()
    for report in reports:
        for result in report.get("results", []):
            if result.get("status") not in {"generated", "invalid", "no_build"}:
                continue
            target = result.get("target") or {}
            attempted.add(
                target_key(
                    level=target["level"],
                    element=target["element"],
                    budget_tier=target["budgetTier"],
                    ap=target["apTarget"],
                    mp=target["mpTarget"],
                    range_target=target["rangeTarget"],
                )
            )
    return attempted


def no_build_keys_from_reports(reports: Iterable[dict[str, Any]]) -> set[tuple[int, str, int, int, int, int | None]]:
    no_build = set()
    for report in reports:
        for result in report.get("results", []):
            if result.get("status") != "no_build":
                continue
            target = result.get("target") or {}
            no_build.add(
                target_key(
                    level=target["level"],
                    element=target["element"],
                    budget_tier=target["budgetTier"],
                    ap=target["apTarget"],
                    mp=target["mpTarget"],
                    range_target=target["rangeTarget"],
                )
            )
    return no_build


def valid_query_rows(
    levels: Iterable[int],
    elements: Iterable[str],
    budget_tiers: Iterable[int],
) -> list[dict[str, Any]]:
    return list(iter_valid_iop_target_space(levels, elements, budget_tiers))


def row_key(row: dict[str, Any]) -> tuple[int, str, int, int, int, int | None]:
    return target_key(
        level=row["level"],
        element=row["element"],
        budget_tier=row["budgetTier"],
        ap=row["apTarget"],
        mp=row["mpTarget"],
        range_target=row["rangeTarget"],
    )


def summarize_by_level(rows: list[dict[str, Any]], covered: set[tuple[int, str, int, int, int, int | None]]) -> list[dict[str, Any]]:
    summaries = []
    for level in sorted({row["level"] for row in rows}):
        level_rows = [row for row in rows if row["level"] == level]
        covered_count = sum(1 for row in level_rows if row_key(row) in covered)
        summaries.append(
            {
                "level": level,
                "validQueryCount": len(level_rows),
                "generatedEvidenceCount": covered_count,
                "unprovenCount": len(level_rows) - covered_count,
            }
        )
    return summaries


def compact_unproven_examples(
    rows: list[dict[str, Any]],
    covered: set[tuple[int, str, int, int, int, int | None]],
    limit: int,
) -> list[dict[str, Any]]:
    examples = []
    for row in rows:
        if row_key(row) in covered:
            continue
        examples.append(row)
        if len(examples) >= limit:
            break
    return examples


def profile_bucket(row: dict[str, Any]) -> str:
    range_target = row["rangeTarget"]
    if row["apTarget"] == MAX_AP and row["mpTarget"] == MAX_MP and range_target == MAX_RANGE:
        return "cap"
    if row["apTarget"] == base_ap_for_level(row["level"]) and row["mpTarget"] == MIN_MP and range_target is None:
        return "minimum"
    if row["mpTarget"] == MAX_MP:
        return "mp_heavy"
    if range_target == MAX_RANGE:
        return "range_heavy"
    if row["apTarget"] >= MAX_AP - 1:
        return "ap_heavy"
    return "middle"


def select_next_unproven_targets(
    rows: list[dict[str, Any]],
    covered: set[tuple[int, str, int, int, int, int | None]],
    attempted: set[tuple[int, str, int, int, int, int | None]] | None,
    limit: int,
) -> list[dict[str, Any]]:
    selected = []
    attempted = attempted or set()
    unproven = [row for row in rows if row_key(row) not in covered]
    levels = sorted({row["level"] for row in unproven})

    def with_bucket(row: dict[str, Any]) -> dict[str, Any]:
        return {
            **row,
            "profileBucket": profile_bucket(row),
            "evidenceStatus": "retry" if row_key(row) in attempted else "unattempted",
        }

    def is_selected(row: dict[str, Any]) -> bool:
        return any(row_key(row) == row_key(selected_row) for selected_row in selected)

    profile_rank = {
        "minimum": 0,
        "cap": 1,
        "mp_heavy": 2,
        "range_heavy": 3,
        "ap_heavy": 4,
        "middle": 5,
    }
    element_rank = {element: index for index, element in enumerate(DEFAULT_ELEMENTS)}

    def element_sort_rank(element: str, preferred_element: str | None) -> int:
        rank = element_rank.get(element, len(element_rank))
        if preferred_element is None:
            return rank
        preferred_rank = element_rank.get(preferred_element, 0)
        return (rank - preferred_rank) % max(len(element_rank), 1)

    def profile_sort_rank(bucket: str, preferred_bucket: str | None = None) -> int:
        rank = profile_rank[bucket]
        if preferred_bucket is None:
            return rank
        preferred_rank = profile_rank[preferred_bucket]
        return (rank - preferred_rank) % len(profile_rank)

    def candidate_sort_key(
        row: dict[str, Any],
        preferred_element: str | None = None,
        preferred_bucket: str | None = None,
    ) -> tuple[Any, ...]:
        bucket = profile_bucket(row)
        budget_sort = row["budgetTier"] if bucket == "minimum" else -row["budgetTier"]
        return (
            profile_sort_rank(bucket, preferred_bucket),
            element_sort_rank(row["element"], preferred_element),
            budget_sort,
            row["apTarget"],
            row["mpTarget"],
            -1 if row["rangeTarget"] is None else row["rangeTarget"],
        )

    profile_order = ("minimum", "cap", "mp_heavy", "range_heavy", "ap_heavy", "middle")
    retry_quota = min(len([row for row in unproven if row_key(row) in attempted]), max(1, limit // 4)) if limit else 0
    retry_candidates = sorted(
        (row for row in unproven if row_key(row) in attempted),
        key=lambda row: candidate_sort_key(row),
    )
    for row in retry_candidates[:retry_quota]:
        selected.append(with_bucket(row))
        if len(selected) >= limit:
            return selected

    for level_index, level in enumerate(levels):
        level_rows = [row for row in unproven if row["level"] == level and not is_selected(row)]
        if not level_rows:
            continue
        preferred_element = DEFAULT_ELEMENTS[level_index % len(DEFAULT_ELEMENTS)]
        preferred_bucket = profile_order[level_index % len(profile_order)]
        selected.append(
            with_bucket(
                sorted(
                    level_rows,
                    key=lambda row: candidate_sort_key(row, preferred_element, preferred_bucket),
                )[0]
            )
        )
        if len(selected) >= limit:
            return selected

    seen_profile_signatures = {
        (row["level"], row["element"], row["budgetTier"], row["profileBucket"])
        for row in selected
    }
    refill_profile_order = ("cap", "mp_heavy", "range_heavy", "ap_heavy", "middle", "minimum")
    for bucket_index, bucket in enumerate(refill_profile_order):
        for level_index, level in enumerate(levels):
            level_bucket_rows = [
                row
                for row in unproven
                if row["level"] == level and profile_bucket(row) == bucket and not is_selected(row)
            ]
            if not level_bucket_rows:
                continue
            preferred_element = DEFAULT_ELEMENTS[(level_index + bucket_index + 1) % len(DEFAULT_ELEMENTS)]
            row = sorted(level_bucket_rows, key=lambda row: candidate_sort_key(row, preferred_element))[0]
            signature = (row["level"], row["element"], row["budgetTier"], profile_bucket(row))
            if signature in seen_profile_signatures:
                continue
            seen_profile_signatures.add(signature)
            selected.append(with_bucket(row))
            if len(selected) >= limit:
                return selected
    for row in unproven:
        if is_selected(row):
            continue
        selected.append(with_bucket(row))
        if len(selected) >= limit:
            break
    return selected


def build_inventory_report(
    reports: Iterable[dict[str, Any]],
    *,
    levels: Iterable[int] = DEFAULT_LEVELS,
    elements: Iterable[str] = DEFAULT_ELEMENTS,
    budget_tiers: Iterable[int] = DEFAULT_BUDGET_TIERS,
    unproven_example_limit: int = 40,
    next_target_limit: int = 24,
) -> dict[str, Any]:
    levels = tuple(levels)
    elements = tuple(elements)
    budget_tiers = tuple(budget_tiers)
    rows = valid_query_rows(levels, elements, budget_tiers)
    covered = covered_keys_from_reports(reports)
    attempted = attempted_keys_from_reports(reports)
    no_build = no_build_keys_from_reports(reports)
    covered_rows = [row for row in rows if row_key(row) in covered]
    attempted_rows = [row for row in rows if row_key(row) in attempted]
    no_build_rows = [row for row in rows if row_key(row) in no_build]
    return {
        "reportVersion": REPORT_VERSION,
        "scope": "query-grid inventory, not generated-build proof",
        "levelScope": "all_levels" if levels == ALL_LEVELS else "selected_levels",
        "levels": list(levels),
        "levelCount": len(levels),
        "elements": list(elements),
        "elementCount": len(elements),
        "budgetTiers": list(budget_tiers),
        "budgetTierCount": len(budget_tiers),
        "validQueryCount": len(rows),
        "generatedEvidenceCount": len(covered_rows),
        "attemptedEvidenceCount": len(attempted_rows),
        "noBuildEvidenceCount": len(no_build_rows),
        "unprovenCount": len(rows) - len(covered_rows),
        "unattemptedCount": len(rows) - len(attempted_rows),
        "byLevel": summarize_by_level(rows, covered),
        "unprovenExamples": compact_unproven_examples(rows, covered, unproven_example_limit),
        "nextUnprovenTargets": select_next_unproven_targets(rows, covered, attempted, next_target_limit),
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery AP/MP/Range Grid Inventory",
        "",
        (
            "This inventory enumerates valid Iop query-grid targets for every level, element, and budget tier."
            if report.get("levelScope") == "all_levels"
            else "This inventory enumerates valid Iop query-grid targets for representative levels, elements, and budgets."
        ),
        "It is not generated-build proof; it shows how much of the grid currently has generated artifact evidence.",
        "",
        f"Level scope: `{report.get('levelScope', 'selected_levels')}` (`{report.get('levelCount', len(report.get('levels', [])))}` levels)",
        f"Element count: `{report.get('elementCount', len(report.get('elements', [])))}`",
        f"Budget tier count: `{report.get('budgetTierCount', len(report.get('budgetTiers', [])))}`",
        f"Valid query rows: `{report['validQueryCount']}`",
        f"Generated evidence rows: `{report['generatedEvidenceCount']}`",
        f"Attempted evidence rows: `{report['attemptedEvidenceCount']}`",
        f"No-build evidence rows: `{report.get('noBuildEvidenceCount', 0)}`",
        f"Unproven rows: `{report['unprovenCount']}`",
        f"Unattempted rows: `{report['unattemptedCount']}`",
        "",
        "| Level | Valid rows | Generated evidence | Unproven |",
        "|---:|---:|---:|---:|",
    ]
    for row in report["byLevel"]:
        lines.append(
            f"| {row['level']} | {row['validQueryCount']} | {row['generatedEvidenceCount']} | {row['unprovenCount']} |"
        )
    lines.extend(["", "## Unproven Examples", ""])
    for row in report["unprovenExamples"]:
        range_label = "any" if row["rangeTarget"] is None else row["rangeTarget"]
        lines.append(
            "- L{level} {element} tier {budgetTier} {apTarget}/{mpTarget}/{range}".format(
                **row,
                range=range_label,
            )
        )
    lines.append("")
    lines.extend(["## Suggested Next Generated Rows", ""])
    for row in report["nextUnprovenTargets"]:
        range_label = "any" if row["rangeTarget"] is None else row["rangeTarget"]
        lines.append(
            "- L{level} {element} tier {budgetTier} {apTarget}/{mpTarget}/{range} `{profileBucket}` `{evidenceStatus}`".format(
                **row,
                range=range_label,
            )
        )
    lines.append("")
    return "\n".join(lines)


def parse_csv_ints(raw_value: str | None, defaults: tuple[int, ...]) -> tuple[int, ...]:
    if not raw_value:
        return defaults
    values = []
    for raw_part in raw_value.split(","):
        part = raw_part.strip()
        if not part:
            continue
        if "-" in part:
            start, end = (int(value.strip()) for value in part.split("-", 1))
            if start > end:
                raise ValueError(f"Invalid descending range: {part}")
            values.extend(range(start, end + 1))
        else:
            values.append(int(part))
    return tuple(dict.fromkeys(values))


def parse_csv_strings(raw_value: str | None, defaults: tuple[str, ...]) -> tuple[str, ...]:
    if not raw_value:
        return defaults
    return tuple(value.strip() for value in raw_value.split(",") if value.strip())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", action="append")
    parser.add_argument("--artifact-dir", action="append", help="Directory of split matrix JSON reports to include.")
    parser.add_argument("--levels")
    parser.add_argument("--all-levels", action="store_true", help="Inventory levels 1 through 200.")
    parser.add_argument("--elements")
    parser.add_argument("--budget-tiers")
    parser.add_argument("--unproven-example-limit", type=int, default=40)
    parser.add_argument("--next-target-limit", type=int, default=24)
    parser.add_argument("--output-json")
    parser.add_argument("--output-md")
    args = parser.parse_args()

    artifact_paths = args.artifact or list(DEFAULT_ARTIFACTS)
    reports = load_reports_from_artifacts(artifact_paths, args.artifact_dir or ())
    levels = ALL_LEVELS if args.all_levels else parse_csv_ints(args.levels, DEFAULT_LEVELS)
    report = build_inventory_report(
        reports,
        levels=levels,
        elements=parse_csv_strings(args.elements, DEFAULT_ELEMENTS),
        budget_tiers=parse_csv_ints(args.budget_tiers, DEFAULT_BUDGET_TIERS),
        unproven_example_limit=args.unproven_example_limit,
        next_target_limit=args.next_target_limit,
    )

    if args.output_json:
        output_json = Path(args.output_json)
        output_json.parent.mkdir(parents=True, exist_ok=True)
        output_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    else:
        print(json.dumps(report, indent=2, ensure_ascii=False))

    if args.output_md:
        output_md = Path(args.output_md)
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(render_markdown(report), encoding="utf-8")


if __name__ == "__main__":
    main()
