import unittest

from build_discovery_ap_mp_range_grid_inventory import (
    build_inventory_report,
    covered_keys_from_reports,
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
        self.assertEqual(inventory["unprovenCount"], 223)
        self.assertEqual(inventory["byLevel"][0]["level"], 1)
        self.assertEqual(len(inventory["unprovenExamples"]), 3)


if __name__ == "__main__":
    unittest.main()
