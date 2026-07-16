import unittest

from scripts.build_discovery_reference_anchors import (
    anchor_level,
    crit_families,
    extrapolated_low_level_anchor,
    lane_anchor_report,
)


class BuildDiscoveryReferenceAnchorsTest(unittest.TestCase):
    def test_low_level_fallback_is_still_generated(self):
        anchor = extrapolated_low_level_anchor(
            20,
            {
                "AP": 9,
                "PrimaryStat": 790,
                "Power": 79,
                "ElementalDamage": 40,
                "Critical": 8,
                "CriticalDamage": 0,
            },
        )

        self.assertEqual(anchor["AP"], 7)
        self.assertEqual(anchor["PrimaryStat"], 200)

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

    def test_crit_families_are_data_driven(self):
        builds = [
            {"Critical": 5, "CriticalDamage": 0, "damageScore": 100},
            {"Critical": 15, "CriticalDamage": 5, "damageScore": 110},
            {"Critical": 70, "CriticalDamage": 80, "damageScore": 120},
            {"Critical": 85, "CriticalDamage": 100, "damageScore": 130},
        ]

        families = crit_families(builds)

        self.assertEqual([build["Critical"] for build in families["nonCrit"]], [5, 15])
        self.assertEqual([build["Critical"] for build in families["crit"]], [70, 85])

    def test_lane_anchor_uses_an_observed_stat_line(self):
        def build(primary, power, damage, critical, critical_damage, score):
            return {
                "element": "strength",
                "damageScore": score,
                "AP": 12,
                "PrimaryStat": primary,
                "Power": power,
                "ElementalDamage": damage,
                "Critical": critical,
                "CriticalDamage": critical_damage,
            }

        builds = [
            build(1600, 50, 180, 10, 0, 200),
            build(1400, 100, 150, 20, 5, 190),
            build(1200, 250, 100, 70, 80, 220),
            build(1100, 300, 90, 80, 100, 210),
        ]

        report = lane_anchor_report(builds)
        observed = [
            {key: candidate[key] for key in report["nonCrit"]["stats"]}
            for candidate in builds
        ]
        observed += [
            {key: candidate[key] for key in report["crit"]["stats"]}
            for candidate in builds
        ]

        self.assertIn(report["nonCrit"]["stats"], observed)
        self.assertIn(report["crit"]["stats"], observed)


if __name__ == "__main__":
    unittest.main()
