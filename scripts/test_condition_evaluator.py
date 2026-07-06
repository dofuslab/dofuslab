import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.condition_evaluator import (
    condition_can_pass_at_target,
    traverse_conditions,
    unmet_item_conditions,
)
from oneoff.build_discovery_prototype import BuildState


class ConditionEvaluatorTest(unittest.TestCase):
    def test_evaluates_leaf_stat_condition(self):
        condition = {"stat": "AP", "operator": "<", "value": 12}

        self.assertTrue(traverse_conditions(condition, {"AP": 11}, {}))
        self.assertFalse(traverse_conditions(condition, {"AP": 12}, {}))

    def test_evaluates_nested_conditions(self):
        condition = {
            "and": [
                {"stat": "STRENGTH", "operator": ">", "value": 300},
                {
                    "or": [
                        {"stat": "MP", "operator": ">", "value": 5},
                        {"stat": "RANGE", "operator": ">", "value": 2},
                    ]
                },
            ]
        }

        self.assertTrue(
            traverse_conditions(
                condition,
                {"Strength": 400, "MP": 6, "Range": 0},
                {},
            )
        )
        self.assertFalse(
            traverse_conditions(
                condition,
                {"Strength": 400, "MP": 5, "Range": 2},
                {},
            )
        )

    def test_evaluates_set_bonus_count(self):
        condition = {"stat": "SET_BONUS", "operator": "<", "value": 3}

        self.assertTrue(traverse_conditions(condition, {}, {"a": 2, "b": 1}))
        self.assertFalse(traverse_conditions(condition, {}, {"a": 3, "b": 2}))

    def test_returns_unmet_item_conditions(self):
        state = BuildState()
        state.slots["cloak"] = {
            "dofusID": "967",
            "_name": "Dazzling Cloak",
            "conditions": {
                "conditions": {"stat": "AP", "operator": "<", "value": 10}
            },
        }
        state.stats["AP"] = 11

        failures = unmet_item_conditions(state)

        self.assertEqual(len(failures), 1)
        self.assertEqual(failures[0]["itemName"], "Dazzling Cloak")

    def test_target_compatibility_rejects_impossible_ap_mp_condition(self):
        condition = {
            "or": [
                {"stat": "AP", "operator": "<", "value": 12},
                {"stat": "MP", "operator": "<", "value": 6},
            ]
        }

        self.assertFalse(
            condition_can_pass_at_target(condition, {"AP": 12, "MP": 6})
        )
        self.assertTrue(
            condition_can_pass_at_target(condition, {"AP": 11, "MP": 6})
        )


if __name__ == "__main__":
    unittest.main()
