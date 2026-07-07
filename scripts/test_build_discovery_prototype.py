import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import (
    BuildState,
    BuildTarget,
    add_item_to_state,
    apply_missing_exos,
    diversify_builds,
    dominates_item,
    exo_search_target,
    has_negative_action_stat,
    prune_dominated_items,
)


class BuildDiscoveryPrototypeTest(unittest.TestCase):
    def test_exo_search_target_uses_one_lower_action_stat_targets(self):
        target = exo_search_target(BuildTarget(ap=11, mp=6, range=4))

        self.assertEqual(target.ap, 10)
        self.assertEqual(target.mp, 5)
        self.assertEqual(target.range, 3)

    def test_prune_dominated_items_removes_strictly_inferior_boots(self):
        weak_boots = {
            "dofusID": "weak",
            "itemType": "Boots",
            "level": 44,
            "_stats": {"MP": 1},
            "_score": 0,
        }
        strong_boots = {
            "dofusID": "strong",
            "itemType": "Boots",
            "level": 200,
            "_stats": {"MP": 1, "Strength": 80, "Vitality": 300},
            "_score": 170,
        }

        self.assertTrue(dominates_item(strong_boots, weak_boots))
        self.assertEqual(prune_dominated_items([weak_boots, strong_boots]), [strong_boots])

    def test_dominance_does_not_cross_item_types(self):
        boots = {
            "dofusID": "boots",
            "itemType": "Boots",
            "level": 200,
            "_stats": {"MP": 1, "Strength": 80},
            "_score": 80,
        }
        amulet = {
            "dofusID": "amulet",
            "itemType": "Amulet",
            "level": 200,
            "_stats": {"AP": 1, "Strength": 80},
            "_score": 80,
        }

        self.assertFalse(dominates_item(boots, amulet))

    def test_score_based_dominance_removes_bad_negative_range_boots(self):
        weak_boots = {
            "dofusID": "weak",
            "itemType": "Boots",
            "level": 41,
            "_stats": {"Strength": 40, "Range": -3},
            "_score": 52,
        }
        strong_boots = {
            "dofusID": "strong",
            "itemType": "Boots",
            "level": 200,
            "_stats": {"Strength": 90, "Vitality": 350, "MP": 1, "Range": 1},
            "_score": 347,
        }

        self.assertTrue(dominates_item(strong_boots, weak_boots))
        self.assertEqual(prune_dominated_items([weak_boots, strong_boots]), [strong_boots])

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

    def test_search_target_can_score_lower_than_final_cap(self):
        search_target = BuildTarget(ap=10, mp=5)
        final_target = BuildTarget(ap=11, mp=6)
        state = BuildState()
        state.stats["AP"] = 10
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "AP", "maxStat": 1}],
        }

        next_state = add_item_to_state(
            state,
            "amulet",
            item,
            {},
            search_target,
            cap_target=final_target,
        )

        self.assertIsNotNone(next_state)
        self.assertEqual(next_state.stats["AP"], 11)

    def test_ap_exo_can_fill_missing_ap_on_completed_build(self):
        target = BuildTarget(ap=8, mp=3)
        item = {
            "dofusID": "1",
            "itemType": "Hat",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "hat", item, {}, target)
        state = apply_missing_exos(state, target)

        self.assertIsNotNone(state)
        self.assertEqual(state.stats["AP"], 8)
        self.assertEqual(state.exos, {"AP": "1"})

    def test_two_missing_ap_cannot_be_filled_by_exos(self):
        target = BuildTarget(ap=9, mp=3)
        first = {
            "dofusID": "1",
            "itemType": "Hat",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }
        second = {
            "dofusID": "2",
            "itemType": "Cloak",
            "setID": None,
            "stats": [{"stat": "Vitality", "maxStat": 100}],
        }

        state = add_item_to_state(BuildState(), "hat", first, {}, target)
        self.assertIsNotNone(state)

        state = add_item_to_state(state, "cloak", second, {}, target)
        self.assertIsNotNone(state)
        self.assertIsNone(apply_missing_exos(state, target))

    def test_exo_is_not_added_to_ineligible_item_type(self):
        target = BuildTarget(ap=8, mp=3)
        item = {
            "dofusID": "1",
            "itemType": "Dofus",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "dofus_1", item, {}, target)
        state = apply_missing_exos(state, target)

        self.assertIsNone(state)

    def test_exo_is_not_added_when_item_already_gives_stat(self):
        target = BuildTarget(ap=9, mp=3)
        item = {
            "dofusID": "1",
            "itemType": "Amulet",
            "setID": None,
            "stats": [{"stat": "AP", "maxStat": 1}],
        }

        state = add_item_to_state(BuildState(), "amulet", item, {}, target)
        state = apply_missing_exos(state, target)

        self.assertIsNone(state)

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
        self.assertTrue(
            has_negative_action_stat(
                {
                    "stats": [
                        {"stat": "Strength", "maxStat": 40},
                        {"stat": "Range", "maxStat": -3},
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
