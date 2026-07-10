import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (
    ApStrategy,
    BuildState,
    BuildTarget,
    SHAKER_TROPHY_ID,
    SLOTS,
    action_stat_witness_seed_states,
    candidate_pool_for_slot,
    base_ap_for_level,
    direct_complete_package_seeds,
    load_all_item_records,
    load_items,
    load_sets,
    required_item_seed_states,
)


def test_item(item_id, item_type, stats, score=0):
    return {
        "dofusID": item_id,
        "name": item_id,
        "_name": item_id,
        "level": 1,
        "itemType": item_type,
        "setID": None,
        "_stats": stats,
        "_score": score if score else sum(stats.values()),
        "conditions": {},
    }


class BuildDiscoveryUncommonActionSourceTest(unittest.TestCase):
    def test_direct_completion_accepts_already_valid_open_dofus_seed(self):
        target = BuildTarget(ap=12, mp=6, range=6, level=99, min_ap=base_ap_for_level(99))
        seed = BuildState(stats={"AP": 12, "MP": 6, "Range": 6, "Vitality": 1000})
        for slot_name, item_type in (
            ("amulet", "Amulet"),
            ("belt", "Belt"),
            ("weapon", "Sword"),
            ("shield", "Shield"),
            ("ring_1", "Ring"),
            ("ring_2", "Ring"),
            ("boots", "Boots"),
            ("hat", "Hat"),
            ("cloak", "Cloak"),
            ("pet", "Pet"),
            ("dofus_1", "Trophy"),
        ):
            item = test_item(f"{slot_name}_item", item_type, {})
            seed.slots[slot_name] = item
            seed.used_item_ids.add(item["dofusID"])

        completed = direct_complete_package_seeds(
            [seed],
            pools={slot_name: [] for slot_name, _ in SLOTS},
            sets={},
            target=target,
            search_target=target,
            natural_cap_target=target,
            ap_strategies=(
                ApStrategy(
                    name="test_no_fill_required",
                    require_amulet_ap=False,
                    require_ap_exo=False,
                    min_secondary_ap_sources=0,
                ),
            ),
            exo_policy="none",
        )

        self.assertTrue(completed)
        self.assertTrue(any("dofus_2" not in state.slots for state in completed))

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

    def test_cap_action_stat_witness_seeds_preserve_low_score_skeletons(self):
        target = BuildTarget(ap=12, mp=6, range=6, level=50, min_ap=base_ap_for_level(50))
        pools = {
            "amulet": [test_item("ap_amulet", "Amulet", {"AP": 1})],
            "belt": [test_item("range_belt", "Belt", {"Range": 1})],
            "weapon": [test_item("ap_range_sword", "Sword", {"AP": 1, "Range": 1})],
            "shield": [test_item("range_shield", "Shield", {"Range": 1})],
            "ring_1": [test_item("ap_ring_1", "Ring", {"AP": 1}, score=-100)],
            "ring_2": [test_item("ap_ring_2", "Ring", {"AP": 1}, score=-90)],
            "boots": [test_item("mp_boots", "Boots", {"MP": 1})],
            "hat": [test_item("range_hat", "Hat", {"Range": 1})],
            "cloak": [test_item("ap_cloak", "Cloak", {"AP": 1})],
            "pet": [test_item("mp_range_pet", "Pet", {"MP": 1, "Range": 1})],
            "dofus_1": [test_item("range_trophy", "Trophy", {"Range": 1})],
            "dofus_2": [],
            "dofus_3": [],
            "dofus_4": [],
            "dofus_5": [],
            "dofus_6": [],
        }

        seeds = action_stat_witness_seed_states(
            pools,
            {},
            target,
            target,
            target,
            exo_policy="allow",
            max_states_per_slot=200,
        )

        self.assertTrue(seeds)
        self.assertTrue(any(seed.stats["AP"] >= 12 and seed.stats["MP"] >= 6 and seed.stats["Range"] >= 6 for seed in seeds))
        self.assertTrue(any(seed.exos for seed in seeds))

        no_exo_seeds = action_stat_witness_seed_states(
            pools,
            {},
            target,
            target,
            target,
            exo_policy="none",
            max_states_per_slot=200,
        )

        self.assertEqual(no_exo_seeds, [])

    def test_action_stat_witness_seeds_only_run_for_cap_pressure_targets(self):
        target = BuildTarget(ap=11, mp=6, range=6, level=50, min_ap=base_ap_for_level(50))

        seeds = action_stat_witness_seed_states(
            {"amulet": [test_item("ap_amulet", "Amulet", {"AP": 1})]},
            {},
            target,
            target,
            target,
        )

        self.assertEqual(seeds, [])


if __name__ == "__main__":
    unittest.main()
