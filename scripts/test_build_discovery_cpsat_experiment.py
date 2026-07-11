import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

import oneoff.build_discovery_cpsat_experiment as cpsat
from oneoff.build_discovery_prototype import BuildState, BuildTarget, configure_damage_profile


class BuildDiscoveryCpsatExperimentTest(unittest.TestCase):
    def test_exo_stats_include_range_for_hard_or_meaningful_soft_range(self):
        soft_target = BuildTarget(level=200, ap=12, mp=6, range=0)
        hard_range_target = BuildTarget(level=200, ap=12, mp=6, range=6)

        self.assertEqual(cpsat.exo_stats_for_target(soft_target, "none"), ())

        with patch.object(cpsat, "active_range_soft_weight", return_value=0.5):
            self.assertEqual(cpsat.exo_stats_for_target(soft_target, "opti"), ("AP", "MP"))

        with patch.object(cpsat, "active_range_soft_weight", return_value=12.0):
            self.assertEqual(cpsat.exo_stats_for_target(soft_target, "opti"), ("AP", "MP", "Range"))

        with patch.object(cpsat, "active_range_soft_weight", return_value=0.5):
            self.assertEqual(cpsat.exo_stats_for_target(hard_range_target, "opti"), ("AP", "MP", "Range"))

    def test_final_linear_objective_uses_active_range_soft_weight(self):
        metadata = cpsat.ModelMetadata(
            candidates_by_slot={},
            item_by_id={},
            group_rings=False,
            selected_set_ids=set(),
            max_set_counts={},
            set_bonus_by_id={},
            item_objective_stats_by_id={},
        )

        with patch(
            "oneoff.build_discovery_prototype.active_range_soft_weight",
            return_value=0.5,
        ):
            with patch.object(cpsat, "cheap_final_score_for_stats", return_value=0.0):
                weights = cpsat.objective_weights_for_mode(
                    "final-linear",
                    metadata,
                    generic_damage_weight=0.45,
                )

        self.assertEqual(weights["Range"], 0.5)
        self.assertEqual(weights["AP"], 12.0)
        self.assertEqual(weights["MP"], 10.0)

    def test_final_linear_objective_does_not_double_count_non_strength_primary_stats(self):
        metadata = cpsat.ModelMetadata(
            candidates_by_slot={},
            item_by_id={},
            group_rings=False,
            selected_set_ids=set(),
            max_set_counts={},
            set_bonus_by_id={},
            item_objective_stats_by_id={"item": {"Chance": 1, "Power": 1}},
        )

        configure_damage_profile("chance", "Enutrof")
        try:
            weights = cpsat.objective_weights_for_mode(
                "final-linear",
                metadata,
                generic_damage_weight=0.45,
            )
        finally:
            configure_damage_profile("strength", "Iop")

        self.assertAlmostEqual(weights["Chance"], weights["Power"])

    def test_final_linear_objective_values_major_power_above_ebony_dodge(self):
        metadata = cpsat.ModelMetadata(
            candidates_by_slot={},
            item_by_id={},
            group_rings=False,
            selected_set_ids=set(),
            max_set_counts={},
            set_bonus_by_id={},
            item_objective_stats_by_id={"item": {"Power": 80, "Dodge": 40}},
        )

        configure_damage_profile("chance", "Enutrof")
        try:
            weights = cpsat.objective_weights_for_mode(
                "final-linear",
                metadata,
                generic_damage_weight=0.45,
            )
        finally:
            configure_damage_profile("strength", "Iop")

        self.assertGreater(weights["Power"] * 80, weights["Dodge"] * 40)

    def test_final_linear_objective_preserves_dodge_above_lock(self):
        metadata = cpsat.ModelMetadata(
            candidates_by_slot={},
            item_by_id={},
            group_rings=False,
            selected_set_ids=set(),
            max_set_counts={},
            set_bonus_by_id={},
            item_objective_stats_by_id={"item": {"Dodge": 1, "Lock": 1}},
        )

        weights = cpsat.objective_weights_for_mode(
            "final-linear",
            metadata,
            generic_damage_weight=0.45,
        )

        self.assertGreater(weights["Dodge"], weights["Lock"])

    def test_active_profile_totals_include_non_strength_damage_stats(self):
        configure_damage_profile("chance", "Enutrof")
        state = BuildState(
            stats={
                "AP": 11,
                "MP": 6,
                "Range": 6,
                "Chance": 900,
                "Water Damage": 80,
                "Strength": 100,
                "Earth Damage": 10,
                "Vitality": 2500,
            }
        )

        try:
            totals = cpsat.active_profile_totals(state)
        finally:
            configure_damage_profile("strength", "Iop")

        self.assertEqual(totals["Chance"], 900)
        self.assertEqual(totals["Water Damage"], 80)
        self.assertEqual(totals["Strength"], 100)
        self.assertEqual(totals["Earth Damage"], 10)


if __name__ == "__main__":
    unittest.main()
