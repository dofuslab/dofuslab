import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (
    BuildState,
    BuildTarget,
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    action_stats_meet_target,
    final_utility_score,
)


class BuildDiscoveryActionStatScoringTest(unittest.TestCase):
    def test_action_stats_are_minimum_targets_with_hard_caps(self):
        target = BuildTarget(ap=11, mp=6, range=0)

        exact_state = BuildState(stats={"AP": 11, "MP": 6, "Range": 0})
        surplus_state = BuildState(stats={"AP": MAX_AP, "MP": MAX_MP, "Range": MAX_RANGE})
        over_ap_cap_state = BuildState(stats={"AP": MAX_AP + 1, "MP": MAX_MP, "Range": MAX_RANGE})
        over_mp_cap_state = BuildState(stats={"AP": MAX_AP, "MP": MAX_MP + 1, "Range": MAX_RANGE})
        over_range_cap_state = BuildState(stats={"AP": MAX_AP, "MP": MAX_MP, "Range": MAX_RANGE + 1})

        self.assertTrue(action_stats_meet_target(exact_state, target))
        self.assertTrue(action_stats_meet_target(surplus_state, target))
        self.assertFalse(action_stats_meet_target(over_ap_cap_state, target))
        self.assertFalse(action_stats_meet_target(over_mp_cap_state, target))
        self.assertFalse(action_stats_meet_target(over_range_cap_state, target))

    def test_action_stat_surplus_utility_is_capped_and_light(self):
        target_stats = {"AP": 11, "MP": 6, "Range": 0}
        capped_surplus_stats = {"AP": MAX_AP, "MP": MAX_MP, "Range": MAX_RANGE}
        over_cap_surplus_stats = {"AP": MAX_AP + 50, "MP": MAX_MP + 50, "Range": MAX_RANGE + 50}

        target_score = final_utility_score(target_stats)
        capped_surplus_score = final_utility_score(capped_surplus_stats)
        over_cap_surplus_score = final_utility_score(over_cap_surplus_stats)

        self.assertEqual(capped_surplus_score - target_score, 60)
        self.assertEqual(over_cap_surplus_score, capped_surplus_score)
        self.assertLessEqual(capped_surplus_score - target_score, 60)


if __name__ == "__main__":
    unittest.main()
