import unittest

from build_discovery_action_feasibility import (
    REPORT_VERSION,
    action_deficit,
    action_stat_total,
    complete_with_action_dofus,
    render_markdown,
    target_to_build_target,
)
from build_discovery_level_diversity_targets import LevelDiversityTarget
from oneoff import build_discovery_prototype as solver


class BuildDiscoveryActionFeasibilityTest(unittest.TestCase):
    def test_target_to_build_target_uses_level_specific_base_ap(self):
        low_level = LevelDiversityTarget("low", 50, "agility", 2, 12, 6, 6)
        high_level = LevelDiversityTarget("high", 100, "agility", 2, 12, 6, 6)

        self.assertEqual(target_to_build_target(low_level).min_ap, 6)
        self.assertEqual(target_to_build_target(high_level).min_ap, 7)

    def test_target_to_build_target_preserves_none_range_semantics(self):
        target = target_to_build_target(
            LevelDiversityTarget("none-range", 200, "strength", 1, 10, 5, None)
        )

        self.assertFalse(target.range_required)

    def test_action_progress_helpers_cap_at_target(self):
        target = target_to_build_target(
            LevelDiversityTarget("target", 200, "strength", 1, 12, 6, 6)
        )

        self.assertEqual(action_stat_total({"AP": 13, "MP": 6, "Range": 8}, target), 24)
        self.assertEqual(action_deficit({"AP": 10, "MP": 5, "Range": 2}, target), 7)

    def test_action_progress_helpers_ignore_range_when_target_is_none(self):
        target = target_to_build_target(
            LevelDiversityTarget("target", 200, "strength", 1, 10, 5, None)
        )

        self.assertEqual(action_stat_total({"AP": 10, "MP": 5, "Range": -4}, target), 15)
        self.assertEqual(action_deficit({"AP": 9, "MP": 4, "Range": -4}, target), 2)

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

    def test_complete_with_action_dofus_returns_completed_state(self):
        target = target_to_build_target(
            LevelDiversityTarget("target", 200, "strength", 1, 12, 6, 6)
        )
        state = solver.BuildState(stats={"AP": 11, "MP": 6, "Range": 6})
        shaker = {
            "dofusID": "test-shaker",
            "_name": "Test Shaker",
            "itemType": "Trophy",
            "_stats": {"AP": 1},
            "conditions": {"conditions": {}, "customConditions": {}},
        }

        examples = complete_with_action_dofus(state, [shaker], target, "none", 1)

        self.assertEqual(len(examples), 1)
        self.assertEqual(examples[0].stats["AP"], 12)
        self.assertIn("dofus_1", examples[0].slots)
        self.assertEqual(examples[0].slots["dofus_1"]["dofusID"], "test-shaker")

    def test_complete_with_action_dofus_can_apply_exo_policy(self):
        target = target_to_build_target(
            LevelDiversityTarget("target", 200, "strength", 3, 12, 6, 6)
        )
        ring = {
            "dofusID": "test-ring",
            "_name": "Test Ring",
            "itemType": "Ring",
            "_stats": {},
            "conditions": {"conditions": {}, "customConditions": {}},
        }
        state = solver.BuildState(
            slots={"ring_1": ring},
            stats={"AP": 11, "MP": 6, "Range": 6},
            used_item_ids={"test-ring"},
        )

        examples = complete_with_action_dofus(state, [], target, "allow", 1)

        self.assertEqual(len(examples), 1)
        self.assertEqual(examples[0].stats["AP"], 12)
        self.assertEqual(examples[0].exos["AP"], "test-ring")


if __name__ == "__main__":
    unittest.main()
