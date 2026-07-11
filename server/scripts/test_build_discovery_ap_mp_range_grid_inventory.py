import unittest
import json
import tempfile
from pathlib import Path

from build_discovery_ap_mp_range_grid_inventory import (
    ALL_LEVELS,
    DEFAULT_ARTIFACTS,
    MATRIX_REPORT_VERSION,
    attempted_keys_from_reports,
    build_inventory_report,
    covered_keys_from_reports,
    iter_valid_iop_target_space,
    load_reports_from_artifacts,
    load_reports_from_artifact_dirs,
    parse_csv_ints,
    parse_csv_string_set,
    profile_bucket,
    row_key,
    select_next_zero_resolved_level_targets,
    select_next_unproven_targets,
    valid_query_rows,
)
from build_discovery_level_diversity_matrix import targets_for_set


def generated_result(level=1, element="strength", budget=1, ap=6, mp=3, range_target=None):
    return {
        "status": "generated",
        "validationErrors": [],
        "target": {
            "level": level,
            "element": element,
            "budgetTier": budget,
            "apTarget": ap,
            "mpTarget": mp,
            "rangeTarget": range_target,
        },
    }


def infeasible_result(level=1, element="strength", budget=1, ap=12, mp=6, range_target=6):
    result = generated_result(level, element, budget, ap, mp, range_target)
    result["status"] = "no_build"
    result["diagnostics"] = {"solverStatus": "INFEASIBLE"}
    return result


class BuildDiscoveryApMpRangeGridInventoryTest(unittest.TestCase):
    def test_valid_query_rows_use_level_dependent_ap_minimum(self):
        rows = valid_query_rows([99, 100], ["strength"], [1])

        level_99_aps = {row["apTarget"] for row in rows if row["level"] == 99}
        level_100_aps = {row["apTarget"] for row in rows if row["level"] == 100}
        mps = {row["mpTarget"] for row in rows}
        ranges = {row["rangeTarget"] for row in rows}

        self.assertEqual(min(level_99_aps), 6)
        self.assertEqual(min(level_100_aps), 7)
        self.assertEqual(max(level_99_aps), 12)
        self.assertEqual(max(level_100_aps), 12)
        self.assertEqual(mps, {3, 4, 5, 6})
        self.assertEqual(ranges, {None, 0, 1, 2, 3, 4, 5, 6})

    def test_default_artifacts_include_prod_level_samples(self):
        self.assertIn(
            ".codex/state/build-discovery-m3-next-level-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-between-boundary-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-unresolved-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-prod-shaped-1-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-thin-bucket-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-profile-stress-1-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-profile-stress-2-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-profile-stress-3-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-level-coverage-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-level-coverage-2-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-level-coverage-3-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-level-coverage-4-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-m3-level-coverage-5-sample-20260711.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-prod-level-sample-matrix.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-prod-level-sample-multicandidate-smoke.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-ap-mp-range-frontier-001-matrix.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-ap-mp-range-frontier-002-matrix.json",
            DEFAULT_ARTIFACTS,
        )
        self.assertIn(
            ".codex/state/build-discovery-ap-mp-range-frontier-003-matrix.json",
            DEFAULT_ARTIFACTS,
        )

    def test_valid_query_rows_count_full_milestone_three_query_space(self):
        rows = list(
            iter_valid_iop_target_space(
                ALL_LEVELS,
                ["strength", "intelligence", "chance", "agility"],
                [1, 2, 3, 4],
            )
        )

        self.assertEqual(len(rows), 665088)

    def test_static_all_target_set_is_only_a_subset_of_full_query_space(self):
        universe = {
            row_key(row)
            for row in iter_valid_iop_target_space(
                ALL_LEVELS,
                ["strength", "intelligence", "chance", "agility"],
                [1, 2, 3, 4],
            )
        }
        static_all = {
            (
                target.level,
                target.element,
                target.budget_tier,
                target.ap,
                target.mp,
                target.range_target,
            )
            for target in targets_for_set("all")
        }

        self.assertLess(len(static_all), len(universe))
        self.assertTrue(static_all <= universe)

    def test_parse_csv_ints_accepts_ranges(self):
        self.assertEqual(parse_csv_ints("1,3-5,5", ()), (1, 3, 4, 5))

    def test_parse_csv_string_set_rejects_unknown_values(self):
        self.assertEqual(parse_csv_string_set("retry,unattempted", {"retry", "unattempted"}, "status"), {"retry", "unattempted"})
        with self.assertRaises(ValueError):
            parse_csv_string_set("retry,stale", {"retry", "unattempted"}, "status")

    def test_covered_keys_ignore_invalid_or_no_build_results(self):
        report = {
            "results": [
                generated_result(),
                {**generated_result(element="chance"), "status": "invalid"},
                {**generated_result(element="agility"), "validationErrors": ["bad"]},
            ]
        }

        covered = covered_keys_from_reports([report])

        self.assertEqual(len(covered), 1)
        self.assertIn((1, "strength", 1, 6, 3, None), covered)

    def test_attempted_keys_include_generated_invalid_and_no_build_results(self):
        report = {
            "results": [
                generated_result(),
                {**generated_result(element="chance"), "status": "invalid"},
                {**generated_result(element="agility"), "status": "no_build"},
            ]
        }

        attempted = attempted_keys_from_reports([report])

        self.assertEqual(
            attempted,
            {
                (1, "strength", 1, 6, 3, None),
                (1, "chance", 1, 6, 3, None),
                (1, "agility", 1, 6, 3, None),
            },
        )

    def test_build_inventory_report_counts_generated_evidence(self):
        report = {"results": [generated_result()]}

        inventory = build_inventory_report(
            [report],
            levels=[1],
            elements=["strength"],
            budget_tiers=[1],
            unproven_example_limit=3,
        )

        self.assertEqual(inventory["validQueryCount"], 224)
        self.assertEqual(inventory["levelScope"], "selected_levels")
        self.assertEqual(inventory["levelCount"], 1)
        self.assertEqual(inventory["generatedEvidenceCount"], 1)
        self.assertEqual(inventory["attemptedEvidenceCount"], 1)
        self.assertEqual(inventory["noBuildEvidenceCount"], 0)
        self.assertEqual(inventory["resolvedEvidenceCount"], 1)
        self.assertEqual(inventory["unprovenCount"], 223)
        self.assertEqual(inventory["unresolvedCount"], 223)
        self.assertEqual(inventory["unattemptedCount"], 223)
        self.assertEqual(inventory["byLevel"][0]["level"], 1)
        self.assertEqual(inventory["byLevel"][0]["resolvedEvidenceCount"], 1)
        self.assertEqual(inventory["byLevel"][0]["unresolvedCount"], 223)
        self.assertEqual(inventory["byElement"][0]["element"], "strength")
        self.assertEqual(inventory["byElement"][0]["resolvedEvidenceCount"], 1)
        self.assertEqual(inventory["byBudgetTier"][0]["budgetTier"], 1)
        self.assertEqual(inventory["byBudgetTier"][0]["resolvedEvidenceCount"], 1)
        self.assertTrue(
            any(row["profileBucket"] == "minimum" for row in inventory["byProfileBucket"])
        )
        self.assertEqual(len(inventory["unprovenExamples"]), 3)
        self.assertEqual(len(inventory["unresolvedExamples"]), 3)
        self.assertGreater(len(inventory["nextUnprovenTargets"]), 0)
        self.assertGreater(len(inventory["nextUnresolvedTargets"]), 0)
        self.assertEqual(inventory["nextZeroResolvedLevelTargets"], [])

    def test_artifact_dir_loader_includes_split_matrix_reports_only(self):
        no_build_result = infeasible_result(element="chance")
        matrix_report = {
            "reportVersion": MATRIX_REPORT_VERSION,
            "results": [generated_result(), no_build_result],
        }
        diagnostic_report = {
            "reportVersion": "build-discovery-action-stat-diagnostics-v1",
            "results": [generated_result(element="chance")],
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "target.json").write_text(json.dumps(matrix_report), encoding="utf-8")
            (root / "manifest.json").write_text(json.dumps({"reports": []}), encoding="utf-8")
            (root / "diagnostic.json").write_text(json.dumps(diagnostic_report), encoding="utf-8")

            reports = load_reports_from_artifact_dirs([root])

        self.assertEqual(reports, [matrix_report])
        inventory = build_inventory_report(
            reports,
            levels=[1],
            elements=["strength", "chance"],
            budget_tiers=[1],
        )
        self.assertEqual(inventory["generatedEvidenceCount"], 1)
        self.assertEqual(inventory["attemptedEvidenceCount"], 2)
        self.assertEqual(inventory["noBuildEvidenceCount"], 1)
        self.assertEqual(inventory["resolvedEvidenceCount"], 2)
        self.assertEqual(inventory["unresolvedCount"], 446)

    def test_no_build_evidence_requires_infeasible_solver_status(self):
        unknown_no_build = generated_result(element="chance")
        unknown_no_build["status"] = "no_build"
        unknown_no_build["diagnostics"] = {"solverStatus": "UNKNOWN"}
        report = {"results": [generated_result(), unknown_no_build]}

        inventory = build_inventory_report(
            [report],
            levels=[1],
            elements=["strength", "chance"],
            budget_tiers=[1],
        )

        self.assertEqual(inventory["attemptedEvidenceCount"], 2)
        self.assertEqual(inventory["noBuildEvidenceCount"], 0)
        self.assertEqual(inventory["resolvedEvidenceCount"], 1)
        self.assertEqual(inventory["unresolvedCount"], 447)

    def test_next_unresolved_targets_skips_proven_infeasible_rows(self):
        impossible = infeasible_result()
        report = {"results": [impossible]}

        inventory = build_inventory_report(
            [report],
            levels=[1],
            elements=["strength"],
            budget_tiers=[1],
            next_target_limit=3,
        )

        impossible_key = row_key(impossible["target"])
        next_unproven_keys = {row_key(row) for row in inventory["nextUnprovenTargets"]}
        next_unresolved_keys = {row_key(row) for row in inventory["nextUnresolvedTargets"]}

        self.assertIn(impossible_key, next_unproven_keys)
        self.assertNotIn(impossible_key, next_unresolved_keys)

    def test_artifact_loader_combines_paths_and_dirs(self):
        aggregate_report = {
            "reportVersion": MATRIX_REPORT_VERSION,
            "results": [generated_result()],
        }
        split_report = {
            "reportVersion": MATRIX_REPORT_VERSION,
            "results": [generated_result(element="chance")],
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            aggregate_path = root / "aggregate.json"
            split_dir = root / "split"
            split_dir.mkdir()
            aggregate_path.write_text(json.dumps(aggregate_report), encoding="utf-8")
            (split_dir / "target.json").write_text(json.dumps(split_report), encoding="utf-8")

            reports = load_reports_from_artifacts([aggregate_path], [split_dir])

        self.assertEqual(reports, [aggregate_report, split_report])

    def test_artifact_dir_loader_rejects_missing_directory(self):
        with self.assertRaises(FileNotFoundError):
            load_reports_from_artifact_dirs(["does-not-exist"])

    def test_build_inventory_report_labels_all_level_scope(self):
        inventory = build_inventory_report(
            [],
            levels=ALL_LEVELS,
            elements=["strength"],
            budget_tiers=[1],
            unproven_example_limit=1,
            next_target_limit=1,
        )

        self.assertEqual(inventory["levelScope"], "all_levels")
        self.assertEqual(inventory["levelCount"], 200)
        self.assertEqual(inventory["validQueryCount"], 41568)

    def test_profile_bucket_labels_edge_shapes(self):
        self.assertEqual(
            profile_bucket({"level": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None}),
            "minimum",
        )
        self.assertEqual(
            profile_bucket({"level": 200, "apTarget": 12, "mpTarget": 6, "rangeTarget": 6}),
            "cap",
        )
        self.assertEqual(
            profile_bucket({"level": 100, "apTarget": 7, "mpTarget": 6, "rangeTarget": 0}),
            "mp_heavy",
        )

    def test_select_next_unproven_targets_diversifies_signatures(self):
        rows = [
            {"level": 1, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 1, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": 0},
            {"level": 1, "element": "chance", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 20, "element": "intelligence", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 20, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 6, "rangeTarget": 0},
        ]

        selected = select_next_unproven_targets(rows, set(), set(), limit=3)

        self.assertEqual(
            [(row["level"], row["element"], row["profileBucket"]) for row in selected[:2]],
            [(1, "strength", "minimum"), (20, "strength", "mp_heavy")],
        )
        self.assertEqual(len(selected), 3)

    def test_select_next_unproven_targets_keeps_attempted_failures_retryable(self):
        rows = [
            {"level": 1, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 1, "element": "chance", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
        ]
        attempted = {row_key(rows[0])}

        selected = select_next_unproven_targets(rows, set(), attempted, limit=2)

        self.assertEqual([row["evidenceStatus"] for row in selected], ["retry", "unattempted"])

    def test_select_next_unproven_targets_can_filter_status_and_profile(self):
        rows = [
            {"level": 1, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 1, "element": "chance", "budgetTier": 4, "apTarget": 12, "mpTarget": 6, "rangeTarget": 6},
            {"level": 20, "element": "agility", "budgetTier": 4, "apTarget": 6, "mpTarget": 6, "rangeTarget": 0},
        ]
        attempted = {row_key(rows[1])}

        selected = select_next_unproven_targets(
            rows,
            set(),
            attempted,
            limit=3,
            evidence_statuses={"unattempted"},
            profile_buckets={"mp_heavy"},
        )

        self.assertEqual(len(selected), 1)
        self.assertEqual(selected[0]["element"], "agility")
        self.assertEqual(selected[0]["evidenceStatus"], "unattempted")
        self.assertEqual(selected[0]["profileBucket"], "mp_heavy")

    def test_select_next_unproven_targets_rotates_profile_buckets_across_levels(self):
        rows = []
        for level in range(1, 7):
            rows.extend(
                [
                    {"level": level, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
                    {"level": level, "element": "strength", "budgetTier": 4, "apTarget": 12, "mpTarget": 6, "rangeTarget": 6},
                    {"level": level, "element": "strength", "budgetTier": 4, "apTarget": 6, "mpTarget": 6, "rangeTarget": 0},
                    {"level": level, "element": "strength", "budgetTier": 4, "apTarget": 6, "mpTarget": 3, "rangeTarget": 6},
                    {"level": level, "element": "strength", "budgetTier": 4, "apTarget": 11, "mpTarget": 3, "rangeTarget": 0},
                    {"level": level, "element": "strength", "budgetTier": 4, "apTarget": 8, "mpTarget": 4, "rangeTarget": 0},
                ]
            )

        selected = select_next_unproven_targets(rows, set(), set(), limit=6)

        self.assertEqual(
            [row["profileBucket"] for row in selected],
            ["minimum", "cap", "mp_heavy", "range_heavy", "ap_heavy", "middle"],
        )

    def test_select_next_zero_resolved_level_targets_skips_levels_with_resolved_evidence(self):
        rows = [
            {"level": 1, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 1, "element": "chance", "budgetTier": 4, "apTarget": 12, "mpTarget": 6, "rangeTarget": 6},
            {"level": 2, "element": "strength", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
            {"level": 2, "element": "intelligence", "budgetTier": 2, "apTarget": 7, "mpTarget": 4, "rangeTarget": 1},
            {"level": 3, "element": "agility", "budgetTier": 1, "apTarget": 6, "mpTarget": 3, "rangeTarget": None},
        ]
        resolved = {row_key(rows[0])}

        selected = select_next_zero_resolved_level_targets(rows, resolved, set(), limit=2)

        self.assertEqual([row["level"] for row in selected], [2, 3])
        self.assertEqual([row["profileBucket"] for row in selected], ["minimum", "minimum"])
        self.assertEqual([row["evidenceStatus"] for row in selected], ["unattempted", "unattempted"])


if __name__ == "__main__":
    unittest.main()
