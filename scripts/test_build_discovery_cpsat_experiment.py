import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

import oneoff.build_discovery_cpsat_experiment as cpsat
from oneoff.build_discovery_prototype import (
    ACTION_STATS,
    BuildState,
    BuildTarget,
    active_base_stats,
    active_stat_weights,
    configure_damage_profile,
    profile_damage_reference_stats,
)


class BuildDiscoveryCpsatExperimentTest(unittest.TestCase):
    def metadata(self, stats=None):
        return cpsat.ModelMetadata(
            items=(),
            candidates_by_slot={},
            item_by_id={},
            group_rings=False,
            selected_set_ids=set(),
            max_set_counts={},
            set_bonus_by_id={},
            item_objective_stats_by_id={"item": stats or {}},
            item_stat_coefficients_by_stat={},
            set_bonus_coefficients_by_stat={},
        )

    def reference_linearized_weights(
        self, metadata, damage_weight, survivability_weight, penalty_weight
    ):
        reference_stats = profile_damage_reference_stats()
        objective_stats = cpsat.collect_objective_stats(metadata)
        for stat in objective_stats:
            reference_stats.setdefault(stat, active_base_stats().get(stat, 0))
        baseline = cpsat.cheap_final_score_for_stats(
            reference_stats, damage_weight, survivability_weight, penalty_weight
        )
        weights = {}
        for stat in objective_stats:
            step = 100 if stat in {
                "Strength",
                "Intelligence",
                "Chance",
                "Agility",
                "Power",
                "Vitality",
                "Initiative",
            } else 1
            next_stats = dict(reference_stats)
            next_stats[stat] = next_stats.get(stat, 0) + step
            weights[stat] = (
                cpsat.cheap_final_score_for_stats(
                    next_stats, damage_weight, survivability_weight, penalty_weight
                ) - baseline
            ) / step
        active_weights = active_stat_weights()
        for stat in ACTION_STATS:
            weights[stat] = active_weights.get(stat, 0.0)
        return weights

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
        metadata = self.metadata()

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
        metadata = self.metadata({"Chance": 1, "Power": 1})

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

    def test_final_linear_objective_values_dodge_like_power_for_generic_pvm(self):
        metadata = self.metadata({"Power": 80, "Dodge": 40})

        configure_damage_profile("chance", "Enutrof")
        try:
            weights = cpsat.objective_weights_for_mode(
                "final-linear",
                metadata,
                generic_damage_weight=0.25,
            )
        finally:
            configure_damage_profile("strength", "Iop")

        self.assertGreater(weights["Power"] * 80, weights["Dodge"] * 40)
        self.assertAlmostEqual(weights["Power"] * 40, weights["Dodge"] * 40, delta=1.0)

    def test_final_linear_objective_preserves_dodge_above_lock(self):
        metadata = self.metadata({"Dodge": 1, "Lock": 1})

        weights = cpsat.objective_weights_for_mode(
            "final-linear",
            metadata,
            generic_damage_weight=0.45,
        )

        self.assertGreater(weights["Dodge"], weights["Lock"])

    def test_optimized_final_linear_weights_exactly_match_full_recompute_reference(self):
        signed_stats = {
            "AP": 1, "MP": -1, "Range": 1,
            "Strength": -100, "Intelligence": 100, "Chance": -100, "Agility": 100,
            "Power": -100, "Vitality": -100, "Initiative": -100,
            "Damage": -5, "Critical": -3, "Critical Damage": -7,
            "% Final Damage": -4, "% Spell Damage": 6, "% Weapon Damage": -2,
            "% Melee Damage": 3, "% Ranged Damage": -3,
            "Earth Damage": -10, "Fire Damage": 10, "Water Damage": -10, "Air Damage": 10,
            "% Earth Resistance": -20, "% Fire Resistance": 20,
            "% Water Resistance": -10, "% Air Resistance": 10,
            "% Neutral Resistance": -5, "Earth Resistance": -12,
            "Critical Resistance": -8, "Pushback Resistance": 8,
            "% Ranged Resistance": -6, "% Melee Resistance": 6,
            "Dodge": -10, "Lock": 10, "Wisdom": -20, "Unscored Stat": -99,
        }
        metadata = self.metadata(signed_stats)
        profiles = (
            ("chance", "Enutrof", 1, 0.15, 2.5, 0.0),
            ("intelligence", "Cra", 2, 0.25, 1.8, 0.0),
            ("agility", "Sram", 3, 0.45, 1.0, 0.0),
            ("strength", "Iop", 4, 0.60, 0.7, 0.0),
            ("chance", "Enutrof", "signed-penalty", 0.45, 1.0, 1.3),
        )
        try:
            for (
                element, class_name, preset, damage_weight,
                survivability_weight, penalty_weight,
            ) in profiles:
                with self.subTest(element=element, class_name=class_name, preset=preset):
                    configure_damage_profile(element, class_name)
                    expected = self.reference_linearized_weights(
                        metadata, damage_weight, survivability_weight, penalty_weight
                    )
                    actual = cpsat.linearized_final_score_weights(
                        metadata, damage_weight, survivability_weight, penalty_weight
                    )
                    self.assertEqual(actual, expected)
        finally:
            configure_damage_profile("strength", "Iop")

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
