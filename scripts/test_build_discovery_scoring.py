import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_scoring import (
    STAT_WEIGHTS,
    score_stats_with_weights,
    utility_stat_weights,
    wisdom_weight_for_level,
)


class BuildDiscoveryScoringTest(unittest.TestCase):
    def test_score_stats_with_weights_caps_hard_capped_stats(self):
        self.assertEqual(
            score_stats_with_weights({"AP": 13, "MP": 7, "Range": 8}, STAT_WEIGHTS),
            score_stats_with_weights({"AP": 12, "MP": 6, "Range": 6}, STAT_WEIGHTS),
        )

    def test_utility_stat_weights_exclude_damage_and_survivability(self):
        weights = utility_stat_weights(STAT_WEIGHTS)

        self.assertIn("Dodge", weights)
        self.assertIn("AP", weights)
        self.assertNotIn("Power", weights)
        self.assertNotIn("Vitality", weights)

    def test_wisdom_weight_drops_at_level_200(self):
        self.assertGreater(wisdom_weight_for_level(199), 0)
        self.assertEqual(wisdom_weight_for_level(200), 0)


if __name__ == "__main__":
    unittest.main()
