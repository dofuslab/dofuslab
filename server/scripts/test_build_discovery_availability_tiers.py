import unittest

from oneoff.build_discovery_prototype import (
    BASE_AP,
    DEFAULT_AP_STRATEGIES,
    DEFAULT_NO_EXO_AP_STRATEGIES,
    SHAKER_TROPHY_ID,
    BuildState,
    ap_strategy_matches,
    availability_tier_for_item,
)


class BuildDiscoveryAvailabilityTierTest(unittest.TestCase):
    def test_trophies_are_budget_tier_one(self):
        self.assertEqual(
            availability_tier_for_item({"itemType": "Trophy", "dofusID": "16333"}),
            1,
        )

    def test_other_budget_categories_keep_expected_tiers(self):
        self.assertEqual(
            availability_tier_for_item({"itemType": "Mount", "dofusID": "1"}),
            1,
        )
        self.assertEqual(
            availability_tier_for_item({"itemType": "Pet", "dofusID": "13673"}),
            2,
        )
        self.assertEqual(
            availability_tier_for_item({"itemType": "Dofus", "dofusID": "694"}),
            2,
        )
        self.assertEqual(
            availability_tier_for_item({"itemType": "Dofus", "dofusID": "737"}),
            2,
        )
        self.assertEqual(
            availability_tier_for_item({"itemType": "Dofus", "dofusID": "7754"}),
            4,
        )

    def test_budget_no_exo_ap_strategy_accepts_trophy_and_set_bonus_sources(self):
        state = BuildState()
        state.slots["amulet"] = {"dofusID": "amulet-ap", "_stats": {"AP": 1}}
        state.slots["dofus_1"] = {"dofusID": SHAKER_TROPHY_ID, "_stats": {"AP": 1}}
        state.used_item_ids.add(SHAKER_TROPHY_ID)
        state.stats["AP"] = BASE_AP + 3

        self.assertFalse(ap_strategy_matches(state, DEFAULT_AP_STRATEGIES[0]))
        self.assertTrue(ap_strategy_matches(state, DEFAULT_NO_EXO_AP_STRATEGIES[0]))


if __name__ == "__main__":
    unittest.main()
