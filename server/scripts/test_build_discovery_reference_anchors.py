import unittest

from scripts.build_discovery_reference_anchors import anchor_level


class BuildDiscoveryReferenceAnchorsTest(unittest.TestCase):
    def test_level_buckets_include_major_trophies_and_level_199(self):
        expectations = {
            1: 20,
            20: 20,
            21: 21,
            39: 21,
            40: 40,
            59: 40,
            60: 60,
            79: 60,
            80: 80,
            99: 80,
            100: 100,
            119: 100,
            140: 140,
            141: 140,
            149: 140,
            150: 150,
            159: 150,
            160: 160,
            179: 160,
            180: 180,
            198: 180,
            199: 199,
            200: 200,
        }

        for level, expected_anchor in expectations.items():
            with self.subTest(level=level):
                self.assertEqual(anchor_level(level), expected_anchor)


if __name__ == "__main__":
    unittest.main()
