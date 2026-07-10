import unittest

from build_discovery_action_feasibility import (
    REPORT_VERSION,
    action_deficit,
    action_stat_total,
    render_markdown,
    target_to_build_target,
)
from build_discovery_level_diversity_targets import LevelDiversityTarget


class BuildDiscoveryActionFeasibilityTest(unittest.TestCase):
    def test_target_to_build_target_uses_level_specific_base_ap(self):
        low_level = LevelDiversityTarget("low", 50, "agility", 2, 12, 6, 6)
        high_level = LevelDiversityTarget("high", 100, "agility", 2, 12, 6, 6)

        self.assertEqual(target_to_build_target(low_level).min_ap, 6)
        self.assertEqual(target_to_build_target(high_level).min_ap, 7)

    def test_action_progress_helpers_cap_at_target(self):
        target = target_to_build_target(
            LevelDiversityTarget("target", 200, "strength", 1, 12, 6, 6)
        )

        self.assertEqual(action_stat_total({"AP": 13, "MP": 6, "Range": 8}, target), 24)
        self.assertEqual(action_deficit({"AP": 10, "MP": 5, "Range": 2}, target), 7)

    def test_render_markdown_reports_status_and_example(self):
        report = {
            "reportVersion": REPORT_VERSION,
            "generatedAt": "now",
            "targetCount": 1,
            "statusCounts": {"feasible": 1},
            "results": [
                {
                    "target": {
                        "id": "target",
                        "level": 50,
                        "element": "agility",
                        "budgetTier": 2,
                        "apTarget": 12,
                        "mpTarget": 6,
                        "rangeTarget": 6,
                    },
                    "status": "feasible",
                    "baseStats": {"AP": 6, "MP": 3, "Range": 0},
                    "slotSummaries": [{"stateCapHit": True}],
                    "actionDofus": [{"id": "16336", "name": "Observer", "stats": {"Range": 2}}],
                    "examples": [{"stats": {"AP": 12, "MP": 6, "Range": 6}}],
                }
            ],
        }

        markdown = render_markdown(report)

        self.assertIn("L50 agility 12/6/6 tier 2", markdown)
        self.assertIn("feasible", markdown)
        self.assertIn("12/6/6", markdown)
        self.assertIn("state cap hit", markdown)


if __name__ == "__main__":
    unittest.main()
