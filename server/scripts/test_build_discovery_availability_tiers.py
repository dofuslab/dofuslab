import unittest

from oneoff.build_discovery_core import (
    OCHRE_DOFUS_ID,
    VULBIS_DOFUS_ID,
    BuildDiscoveryQuery,
    availability_tier_for_item,
    effective_exo_policy,
)


class BuildDiscoveryAvailabilityTierTest(unittest.TestCase):
    def test_budget_policy_fixture_keeps_expected_tiers(self):
        cases = [
            ("normal gear", {"itemType": "Ring", "dofusID": "ring"}, 1),
            ("mount", {"itemType": "Mount", "dofusID": "1"}, 1),
            ("trophy", {"itemType": "Trophy", "dofusID": "trophy"}, 1),
            ("serialized trophy", {"type": "Trophy", "id": "trophy"}, 1),
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
            (
                "buff item",
                {"itemType": "Hat", "dofusID": "buffed", "buffs": [{"stat": "POWER"}]},
                4,
            ),
        ]

        for label, item, expected_tier in cases:
            with self.subTest(label=label):
                self.assertEqual(availability_tier_for_item(item), expected_tier)

    def test_exomages_require_the_exo_availability_tier(self):
        for budget_tier in (1, 2):
            with self.subTest(budget_tier=budget_tier):
                query = BuildDiscoveryQuery(budget_tier=budget_tier, exo_policy="allow")
                self.assertEqual(effective_exo_policy(query), "none")

        query = BuildDiscoveryQuery(budget_tier=3, exo_policy="allow")
        self.assertEqual(effective_exo_policy(query), "allow")


if __name__ == "__main__":
    unittest.main()
