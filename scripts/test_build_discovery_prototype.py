import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import (
    BuildState,
    add_item_to_state,
    diversify_builds,
    has_negative_action_stat,
)


class BuildDiscoveryPrototypeTest(unittest.TestCase):
    def test_ap_set_bonus_applies_when_threshold_is_reached(self):
        sets = {
            "toy": {
                "bonuses": {
                    "2": [{"stat": "AP", "value": 1}],
                }
            }
        }
        first = {
            "dofusID": "1",
            "setID": "toy",
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }
        second = {
            "dofusID": "2",
            "setID": "toy",
            "stats": [{"stat": "Vitality", "maxStat": 100}],
        }

        state = add_item_to_state(BuildState(), "ring_1", first, sets)
        self.assertIsNotNone(state)
        self.assertEqual(state.stats["AP"], 7)

        state = add_item_to_state(state, "ring_2", second, sets)
        self.assertIsNotNone(state)
        self.assertEqual(state.stats["AP"], 8)

    def test_set_bonus_uses_exact_item_count_not_cumulative_thresholds(self):
        sets = {
            "toy": {
                "bonuses": {
                    "2": [{"stat": "AP", "value": 1}],
                    "3": [{"stat": "AP", "value": 2}],
                }
            }
        }
        items = [
            {"dofusID": "1", "setID": "toy", "stats": []},
            {"dofusID": "2", "setID": "toy", "stats": []},
            {"dofusID": "3", "setID": "toy", "stats": []},
        ]

        state = BuildState()
        for idx, item in enumerate(items):
            state = add_item_to_state(state, f"slot_{idx}", item, sets)

        self.assertEqual(state.stats["AP"], 9)

    def test_duplicate_items_are_rejected(self):
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "ring_1", item, {})
        self.assertIsNotNone(state)
        duplicate = add_item_to_state(state, "ring_2", item, {})
        self.assertIsNone(duplicate)

    def test_over_target_mp_is_rejected(self):
        state = BuildState()
        state.stats["MP"] = 6
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "MP", "maxStat": 1}],
        }

        self.assertIsNone(add_item_to_state(state, "boots", item, {}))

    def test_over_target_ap_is_rejected(self):
        state = BuildState()
        state.stats["AP"] = 11
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "AP", "maxStat": 1}],
        }

        self.assertIsNone(add_item_to_state(state, "amulet", item, {}))

    def test_negative_ap_mp_items_are_identified(self):
        self.assertTrue(
            has_negative_action_stat(
                {
                    "stats": [
                        {"stat": "Summons", "maxStat": 2},
                        {"stat": "MP", "maxStat": -1},
                    ]
                }
            )
        )

        self.assertFalse(has_negative_action_stat({"stats": [{"stat": "Strength", "maxStat": 80}]}))

    def test_diversify_builds_rejects_near_duplicates(self):
        first = BuildState(used_item_ids={str(i) for i in range(16)}, score=100)
        near_duplicate = BuildState(used_item_ids={str(i) for i in range(10)} | {"a", "b", "c", "d", "e", "f"}, score=90)
        different = BuildState(used_item_ids={str(i) for i in range(6)} | {"g", "h", "i", "j", "k", "l", "m", "n", "o", "p"}, score=80)

        self.assertEqual(
            diversify_builds([first, near_duplicate, different], max_shared_items=9),
            [first, different],
        )


if __name__ == "__main__":
    unittest.main()
