import unittest

from build_discovery_level_diversity_matrix import (
    REPORT_VERSION,
    build_matrix_report,
    render_markdown,
    selected_targets,
    targets_for_set,
    validate_best_build,
)
from build_discovery_level_diversity_targets import query_for_target


class BuildDiscoveryLevelDiversityMatrixTest(unittest.TestCase):
    def test_selected_targets_filters_by_level_element_and_budget(self):
        targets = selected_targets(
            levels={60},
            elements={"agility"},
            budget_tiers={1},
        )

        self.assertEqual([target.name for target in targets], ["level_60_agility_9_3_none_budget1"])

    def test_selected_targets_can_use_boundary_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("boundary"),
            levels={1, 99},
            budget_tiers={1},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "boundary_level_1_strength_6_3_none_budget1",
                "boundary_level_99_agility_6_3_none_budget1",
            ],
        )

    def test_selected_targets_can_use_coverage_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("coverage"),
            levels={20, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "coverage_level_20_chance_range_budget1",
                "coverage_level_200_agility_cap_budget4",
            ],
        )

    def test_build_matrix_report_records_generated_and_empty_results(self):
        selected = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})
        seen_queries = []

        def fake_generator(query):
            seen_queries.append(query)
            return {
                "datasetVersion": "dataset",
                "solverVersion": "solver",
                "cache": {"status": "miss"},
                "diagnostics": {"elapsedMs": 12.3},
                "warnings": [],
                "builds": [
                    {
                        "score": 42.0,
                        "apStrategy": "level_diversity_flexible_ap",
                        "totals": {
                            "AP": 7,
                            "MP": 3,
                            "Range": 1,
                            "Strength": 250,
                            "Vitality": 800,
                        },
                        "sets": {"Example Set": 2},
                        "exos": {},
                        "items": {
                            "amulet": {"name": "Example Amulet"},
                            "weapon": {"name": "Example Sword"},
                        },
                    }
                ],
            }

        report = build_matrix_report(
            selected,
            generator=fake_generator,
            generated_at="now",
            target_set="level-diversity",
        )

        self.assertEqual(report["reportVersion"], REPORT_VERSION)
        self.assertEqual(report["targetCount"], 1)
        self.assertEqual(report["generatedCount"], 1)
        self.assertEqual(report["noBuildCount"], 0)
        self.assertEqual(report["invalidCount"], 0)
        self.assertEqual(
            report["provenance"]["targetSource"],
            "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS",
        )
        self.assertEqual(seen_queries[0].level, 50)
        self.assertEqual(report["results"][0]["validationErrors"], [])
        self.assertEqual(report["results"][0]["bestBuildSummary"]["items"], ["Example Amulet", "Example Sword"])

    def test_validate_best_build_rejects_condition_and_target_violations(self):
        target = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})[0]

        errors = validate_best_build(
            target,
            query_for_target(target),
            {
                "conditionFailures": ["bad condition"],
                "totals": {"AP": 13, "MP": 2, "Range": 0, "Vitality": 100},
                "items": {"amulet": {"level": 60}},
            },
        )

        self.assertTrue(any("condition failures" in error for error in errors))
        self.assertTrue(any("AP total" in error for error in errors))
        self.assertTrue(any("MP total" in error for error in errors))
        self.assertTrue(any("Range total" in error for error in errors))
        self.assertTrue(any("item level" in error for error in errors))

    def test_render_markdown_includes_review_table(self):
        report = {
            "generatedAt": "now",
            "targetCount": 1,
            "generatedCount": 1,
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": [
                {
                    "target": {
                        "level": 50,
                        "element": "strength",
                        "budgetTier": 1,
                        "apTarget": 7,
                        "mpTarget": 3,
                        "rangeTarget": None,
                    },
                    "status": "generated",
                    "validationErrors": [],
                    "diagnostics": {"elapsedMs": 12.3},
                    "bestBuildSummary": {
                        "score": 42.0,
                        "totals": {"AP": 7, "MP": 4, "Range": 0, "Strength": 250, "Vitality": 800},
                        "sets": {"Example Set": 2},
                        "items": ["Example Amulet", "Example Sword"],
                    },
                }
            ],
        }

        markdown = render_markdown(report)

        self.assertIn("# Build Discovery Iop Level Diversity Matrix", markdown)
        self.assertIn("L50 strength 7/3/any tier 1", markdown)
        self.assertIn("Example Amulet, Example Sword", markdown)


if __name__ == "__main__":
    unittest.main()
