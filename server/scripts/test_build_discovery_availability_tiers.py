import unittest

from oneoff.build_discovery_prototype import availability_tier_for_item


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
            availability_tier_for_item({"itemType": "Dofus", "dofusID": "7754"}),
            4,
        )


if __name__ == "__main__":
    unittest.main()
