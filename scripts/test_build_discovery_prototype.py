import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import BuildState, add_item_to_state


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


if __name__ == "__main__":
    unittest.main()
