import unittest

from oneoff.build_discovery_prototype import (
    BASE_AP,
    DEFAULT_AP_STRATEGIES,
    DEFAULT_NO_EXO_AP_STRATEGIES,
    OCHRE_DOFUS_ID,
    SHAKER_TROPHY_ID,
    VULBIS_DOFUS_ID,
    BuildState,
    ap_strategy_matches,
    availability_tier_for_item,
)


class BuildDiscoveryAvailabilityTierTest(unittest.TestCase):
    def test_budget_policy_fixture_keeps_expected_tiers(self):
        cases = [
            ("normal gear", {"itemType": "Ring", "dofusID": "ring"}, 1),
            ("mount", {"itemType": "Mount", "dofusID": "1"}, 1),
            ("trophy", {"itemType": "Trophy", "dofusID": SHAKER_TROPHY_ID}, 1),
            ("serialized trophy", {"type": "Trophy", "id": SHAKER_TROPHY_ID}, 1),
            ("pet", {"itemType": "Pet", "dofusID": "13673"}, 2),
            ("petsmount", {"itemType": "Petsmount", "dofusID": "petsmount"}, 2),
            ("crimson dofus", {"itemType": "Dofus", "dofusID": "694"}, 2),
            ("emerald dofus", {"itemType": "Dofus", "dofusID": "737"}, 2),
            ("turquoise dofus", {"itemType": "Dofus", "dofusID": "739"}, 2),
            ("ice dofus", {"itemType": "Dofus", "dofusID": "7043"}, 2),
            ("dolmanax", {"itemType": "Dofus", "dofusID": "13344"}, 2),
            ("unclassified dofus", {"itemType": "Dofus", "dofusID": "other"}, 3),
            ("prysmaradite", {"itemType": "Prysmaradite", "dofusID": "prysma"}, 3),
            ("ochre dofus", {"itemType": "Dofus", "dofusID": OCHRE_DOFUS_ID}, 4),
            ("vulbis dofus", {"itemType": "Dofus", "dofusID": VULBIS_DOFUS_ID}, 4),
            ("serialized ochre", {"type": "Dofus", "id": OCHRE_DOFUS_ID}, 4),
            ("buff item", {"itemType": "Hat", "dofusID": "buffed", "buffs": [{"stat": "POWER"}]}, 4),
        ]

        for label, item, expected_tier in cases:
            with self.subTest(label=label):
                self.assertEqual(availability_tier_for_item(item), expected_tier)

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
