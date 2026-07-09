import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    MIN_AP,
    MIN_MP,
    MIN_RANGE,
    BuildDiscoveryQuery,
)


class BuildDiscoveryQueryContractTest(unittest.TestCase):
    def test_level_200_milestone_one_action_stat_bounds_are_supported(self):
        lower = BuildDiscoveryQuery(
            ap_target=MIN_AP,
            mp_target=MIN_MP,
            range_target=MIN_RANGE,
        )
        lower.validate()
        self.assertEqual(lower.target.ap, 7)
        self.assertEqual(lower.target.mp, 3)
        self.assertEqual(lower.target.range, 0)

        upper = BuildDiscoveryQuery(
            ap_target=MAX_AP,
            mp_target=MAX_MP,
            range_target=MAX_RANGE,
        )
        upper.validate()
        self.assertEqual(upper.target.ap, 12)
        self.assertEqual(upper.target.mp, 6)
        self.assertEqual(upper.target.range, 6)

    def test_rejects_action_stat_targets_outside_level_200_bounds(self):
        invalid_queries = (
            BuildDiscoveryQuery(ap_target=MIN_AP - 1),
            BuildDiscoveryQuery(mp_target=MIN_MP - 1),
            BuildDiscoveryQuery(range_target=MIN_RANGE - 1),
            BuildDiscoveryQuery(ap_target=MAX_AP + 1),
            BuildDiscoveryQuery(mp_target=MAX_MP + 1),
            BuildDiscoveryQuery(range_target=MAX_RANGE + 1),
        )

        for query in invalid_queries:
            with self.subTest(query=query):
                with self.assertRaises(ValueError):
                    query.validate()

    def test_milestone_one_scope_rejects_non_iop_non_200_and_multi_element(self):
        invalid_queries = (
            BuildDiscoveryQuery(class_name="Cra"),
            BuildDiscoveryQuery(level=199),
            BuildDiscoveryQuery(elements=("strength", "chance")),
        )

        for query in invalid_queries:
            with self.subTest(query=query):
                with self.assertRaises(ValueError):
                    query.validate()


if __name__ == "__main__":
    unittest.main()
