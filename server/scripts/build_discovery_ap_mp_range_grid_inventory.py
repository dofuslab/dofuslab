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
)


def load_json(path: str | Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


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


def valid_query_rows(
    levels: Iterable[int],
    elements: Iterable[str],
    budget_tiers: Iterable[int],
) -> list[dict[str, Any]]:
    rows = []
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
                            rows.append(
                                {
                                    "level": level,
                                    "element": element,
                                    "budgetTier": budget_tier,
                                    "apTarget": ap,
                                    "mpTarget": mp,
                                    "rangeTarget": range_target,
                                }
                            )
    return rows


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
    limit: int,
) -> list[dict[str, Any]]:
    selected = []
    unproven = [row for row in rows if row_key(row) not in covered]
    levels = sorted({row["level"] for row in unproven})

    def with_bucket(row: dict[str, Any]) -> dict[str, Any]:
        return {**row, "profileBucket": profile_bucket(row)}

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

    def candidate_sort_key(row: dict[str, Any], preferred_element: str | None = None) -> tuple[Any, ...]:
        bucket = profile_bucket(row)
        budget_sort = row["budgetTier"] if bucket == "minimum" else -row["budgetTier"]
        return (
            profile_rank[bucket],
            element_sort_rank(row["element"], preferred_element),
            budget_sort,
            row["apTarget"],
            row["mpTarget"],
            -1 if row["rangeTarget"] is None else row["rangeTarget"],
        )

    for level_index, level in enumerate(levels):
        level_rows = [row for row in unproven if row["level"] == level]
        if not level_rows:
            continue
        preferred_element = DEFAULT_ELEMENTS[level_index % len(DEFAULT_ELEMENTS)]
        selected.append(
            with_bucket(
                sorted(level_rows, key=lambda row: candidate_sort_key(row, preferred_element))[0]
            )
        )
        if len(selected) >= limit:
            return selected

    seen_profile_signatures = {
        (row["level"], row["element"], row["budgetTier"], row["profileBucket"])
        for row in selected
    }
    profile_order = ("cap", "mp_heavy", "range_heavy", "ap_heavy", "middle", "minimum")
    for bucket_index, bucket in enumerate(profile_order):
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
    rows = valid_query_rows(levels, elements, budget_tiers)
    covered = covered_keys_from_reports(reports)
    attempted = attempted_keys_from_reports(reports)
    covered_rows = [row for row in rows if row_key(row) in covered]
    attempted_rows = [row for row in rows if row_key(row) in attempted]
    return {
        "reportVersion": REPORT_VERSION,
        "scope": "query-grid inventory, not generated-build proof",
        "levels": list(levels),
        "elements": list(elements),
        "budgetTiers": list(budget_tiers),
        "validQueryCount": len(rows),
        "generatedEvidenceCount": len(covered_rows),
        "attemptedEvidenceCount": len(attempted_rows),
        "unprovenCount": len(rows) - len(covered_rows),
        "unattemptedCount": len(rows) - len(attempted_rows),
        "byLevel": summarize_by_level(rows, covered),
        "unprovenExamples": compact_unproven_examples(rows, covered, unproven_example_limit),
        "nextUnprovenTargets": select_next_unproven_targets(rows, attempted, next_target_limit),
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Build Discovery AP/MP/Range Grid Inventory",
        "",
        "This inventory enumerates valid Iop query-grid targets for representative levels, elements, and budgets.",
        "It is not generated-build proof; it shows how much of the grid currently has generated artifact evidence.",
        "",
        f"Valid query rows: `{report['validQueryCount']}`",
        f"Generated evidence rows: `{report['generatedEvidenceCount']}`",
        f"Attempted evidence rows: `{report['attemptedEvidenceCount']}`",
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
            "- L{level} {element} tier {budgetTier} {apTarget}/{mpTarget}/{range} `{profileBucket}`".format(
                **row,
                range=range_label,
            )
        )
    lines.append("")
    return "\n".join(lines)


def parse_csv_ints(raw_value: str | None, defaults: tuple[int, ...]) -> tuple[int, ...]:
    if not raw_value:
        return defaults
    return tuple(int(value.strip()) for value in raw_value.split(",") if value.strip())


def parse_csv_strings(raw_value: str | None, defaults: tuple[str, ...]) -> tuple[str, ...]:
    if not raw_value:
        return defaults
    return tuple(value.strip() for value in raw_value.split(",") if value.strip())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", action="append")
    parser.add_argument("--levels")
    parser.add_argument("--elements")
    parser.add_argument("--budget-tiers")
    parser.add_argument("--unproven-example-limit", type=int, default=40)
    parser.add_argument("--next-target-limit", type=int, default=24)
    parser.add_argument("--output-json")
    parser.add_argument("--output-md")
    args = parser.parse_args()

    artifact_paths = args.artifact or list(DEFAULT_ARTIFACTS)
    reports = [load_json(path) for path in artifact_paths]
    report = build_inventory_report(
        reports,
        levels=parse_csv_ints(args.levels, DEFAULT_LEVELS),
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
