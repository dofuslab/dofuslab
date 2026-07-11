import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

import oneoff.build_discovery_cpsat_experiment as cpsat


class BuildDiscoveryCpsatExperimentTest(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
