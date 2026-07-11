import unittest

from build_discovery_ap_mp_range_grid_inventory import (
    ALL_LEVELS,
    attempted_keys_from_reports,
    build_inventory_report,
    covered_keys_from_reports,
    iter_valid_iop_target_space,
    parse_csv_ints,
    profile_bucket,
    row_key,
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
        self.assertEqual(inventory["unprovenCount"], 223)
        self.assertEqual(inventory["unattemptedCount"], 223)
        self.assertEqual(inventory["byLevel"][0]["level"], 1)
        self.assertEqual(len(inventory["unprovenExamples"]), 3)
        self.assertGreater(len(inventory["nextUnprovenTargets"]), 0)

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

        selected = select_next_unproven_targets(rows, set(), limit=3)

        self.assertEqual(
            [(row["level"], row["element"], row["profileBucket"]) for row in selected[:2]],
            [(1, "strength", "minimum"), (20, "intelligence", "minimum")],
        )
        self.assertEqual(len(selected), 3)


if __name__ == "__main__":
    unittest.main()
