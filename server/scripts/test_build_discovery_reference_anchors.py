import unittest

from scripts.build_discovery_reference_anchors import anchor_level


class BuildDiscoveryReferenceAnchorsTest(unittest.TestCase):
    def test_level_buckets_include_major_trophies_and_level_199(self):
        expectations = {
            1: 20,
            20: 20,
            21: 40,
            140: 140,
            141: 150,
            150: 150,
            151: 160,
            180: 180,
            181: 199,
            199: 199,
            200: 200,
        }

        for level, expected_anchor in expectations.items():
            with self.subTest(level=level):
                self.assertEqual(anchor_level(level), expected_anchor)


if __name__ == "__main__":
    unittest.main()
