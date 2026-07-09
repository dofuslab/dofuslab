import unittest

from oneoff.build_discovery_prototype import (
    BuildTarget,
    candidate_pool_for_slot,
    load_items,
    load_sets,
)


class BuildDiscoveryUncommonActionSourceTest(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
