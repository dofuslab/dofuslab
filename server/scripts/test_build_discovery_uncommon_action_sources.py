import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (
    BuildTarget,
    SHAKER_TROPHY_ID,
    candidate_pool_for_slot,
    load_all_item_records,
    load_items,
    load_sets,
    required_item_seed_states,
)


class BuildDiscoveryUncommonActionSourceTest(unittest.TestCase):
    def test_low_level_positive_action_sources_survive_small_candidate_pools(self):
        bad_score_ap_ring = {
            "dofusID": "bad-score-ap-ring",
            "name": "Bad Score AP Ring",
            "level": 8,
            "itemType": "Ring",
            "setID": None,
            "_stats": {"AP": 1, "Strength": -200},
            "_score": -200,
        }
        good_score_ring = {
            "dofusID": "good-score-ring",
            "name": "Good Score Ring",
            "level": 50,
            "itemType": "Ring",
            "setID": None,
            "_stats": {"Strength": 80},
            "_score": 80,
        }

        pool = candidate_pool_for_slot(
            ("Ring",),
            [bad_score_ap_ring, good_score_ring],
            relevant_sets=set(),
            top_k=1,
            target_level=50,
        )

        self.assertIn("bad-score-ap-ring", {item["dofusID"] for item in pool})

    def test_uncommon_ap_mp_sources_survive_small_candidate_pools(self):
        target = BuildTarget(ap=11, mp=6, range=0)
        items = load_items(target, excluded_item_ids=set(), budget_tier=1)
        sets = load_sets()

        pools = {
            "hat": candidate_pool_for_slot(("Hat",), items, relevant_sets=set(), top_k=1),
            "cloak": candidate_pool_for_slot(("Cloak",), items, relevant_sets=set(), top_k=1),
            "shield": candidate_pool_for_slot(("Shield",), items, relevant_sets=set(), top_k=1),
        }

        self.assertIn("Koutoulou Mask", {item["name"] for item in pools["hat"]})
        self.assertIn("Cloak of a Thousand Excuses", {item["name"] for item in pools["cloak"]})
        self.assertIn("Mama Ayuto's Parasail", {item["name"] for item in pools["shield"]})

    def test_required_trophy_seed_places_locked_item_in_dofus_slot(self):
        target = BuildTarget(ap=11, mp=6, range=0)
        items = [
            item
            for item in load_all_item_records()
            if item["dofusID"] == SHAKER_TROPHY_ID
        ]

        seeds = required_item_seed_states(
            {SHAKER_TROPHY_ID},
            items,
            load_sets(),
            target,
            target,
            target,
        )

        self.assertTrue(seeds)
        self.assertTrue(all(SHAKER_TROPHY_ID in seed.used_item_ids for seed in seeds))


if __name__ == "__main__":
    unittest.main()
