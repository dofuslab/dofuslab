import unittest
from unittest.mock import patch

from oneoff.build_discovery_core import (
    BuildTarget,
    configure_damage_profile,
    load_items,
    objective_linearization_reference_stats,
    profile_damage_reference_stats,
    reference_anchor_for_level,
    target_level_context,
)


class BuildDiscoveryCoreTest(unittest.TestCase):
    def test_reference_anchors_respect_unlock_boundaries(self):
        self.assertEqual(
            reference_anchor_for_level(149), reference_anchor_for_level(140)
        )
        self.assertEqual(
            reference_anchor_for_level(159), reference_anchor_for_level(150)
        )
        self.assertEqual(
            reference_anchor_for_level(179), reference_anchor_for_level(160)
        )
        self.assertEqual(reference_anchor_for_level(99)["AP"], 10)
        self.assertEqual(reference_anchor_for_level(100)["AP"], 12)
        self.assertEqual(reference_anchor_for_level(199)["PrimaryStat"], 1387)
        self.assertEqual(reference_anchor_for_level(200)["PrimaryStat"], 1000)

    def test_level_anchor_only_changes_cpsat_linearization_reference(self):
        configure_damage_profile("strength", "Iop")
        with target_level_context(150):
            objective_reference = objective_linearization_reference_stats()
            final_score_reference = profile_damage_reference_stats()

        self.assertEqual(objective_reference["Strength"], 1105)
        self.assertEqual(objective_reference["Critical"], 20)
        self.assertEqual(final_score_reference["Strength"], 1000)
        self.assertEqual(final_score_reference["Critical"], 50)

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
