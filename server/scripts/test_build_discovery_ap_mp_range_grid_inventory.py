import unittest

from build_discovery_ap_mp_range_grid_inventory import (
    attempted_keys_from_reports,
    build_inventory_report,
    covered_keys_from_reports,
    profile_bucket,
    select_next_unproven_targets,
    valid_query_rows,
)


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

        self.assertEqual(min(level_99_aps), 6)
        self.assertEqual(min(level_100_aps), 7)
        self.assertEqual(max(level_99_aps), 12)
        self.assertEqual(max(level_100_aps), 12)

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
        self.assertEqual(inventory["generatedEvidenceCount"], 1)
        self.assertEqual(inventory["attemptedEvidenceCount"], 1)
        self.assertEqual(inventory["unprovenCount"], 223)
        self.assertEqual(inventory["unattemptedCount"], 223)
        self.assertEqual(inventory["byLevel"][0]["level"], 1)
        self.assertEqual(len(inventory["unprovenExamples"]), 3)
        self.assertGreater(len(inventory["nextUnprovenTargets"]), 0)

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
