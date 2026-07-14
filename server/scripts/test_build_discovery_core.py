import unittest
from unittest.mock import patch

from oneoff.build_discovery_core import BuildTarget, load_items


class BuildDiscoveryCoreTest(unittest.TestCase):
    def test_item_conditions_are_left_for_the_complete_build_model(self):
        item = {
            "dofusID": "surplus-ap-item",
            "level": 200,
            "itemType": "Hat",
            "conditions": {"conditions": {"stat": "AP", "operator": ">", "value": 11}},
        }
        target = BuildTarget(ap=10, mp=5, range=0, level=200)

        with patch(
            "oneoff.build_discovery_core.load_all_item_records",
            return_value=(item,),
        ), patch(
            "oneoff.build_discovery_core.indexed_candidate_item_ids",
            return_value={"surplus-ap-item"},
        ):
            candidates = load_items(target, budget_tier=4, score_items=False)

        self.assertEqual(candidates, [item])

    def test_item_condition_prefilter_rejects_unreachable_surplus(self):
        item = {
            "dofusID": "impossible-ap-item",
            "level": 200,
            "itemType": "Hat",
            "conditions": {
                "conditions": {"stat": "AP", "operator": ">", "value": 12}
            },
        }
        target = BuildTarget(ap=10, mp=5, range=0, level=200)

        with patch(
            "oneoff.build_discovery_core.load_all_item_records", return_value=(item,)
        ), patch(
            "oneoff.build_discovery_core.indexed_candidate_item_ids",
            return_value={"impossible-ap-item"},
        ):
            candidates = load_items(target, budget_tier=4, score_items=False)

        self.assertEqual(candidates, [])


if __name__ == "__main__":
    unittest.main()
