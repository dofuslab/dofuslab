import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.damage_calculator import DamageLine, calc_damage, profile_damage


class DamageCalculatorTest(unittest.TestCase):
    def test_calc_damage_matches_frontend_formula_shape(self):
        stats = {
            "Strength": 400,
            "Power": 100,
            "Earth Damage": 20,
            "Damage": 10,
        }

        damage = calc_damage(30, "earth", stats)

        self.assertEqual(damage["melee"], 210)
        self.assertEqual(damage["ranged"], 210)

    def test_critical_damage_only_applies_on_crit(self):
        stats = {
            "Strength": 400,
            "Earth Damage": 20,
            "Critical Damage": 50,
        }

        noncrit = calc_damage(30, "earth", stats)
        crit = calc_damage(30, "earth", stats, is_crit=True)

        self.assertEqual(noncrit["ranged"], 170)
        self.assertEqual(crit["ranged"], 220)

    def test_neutral_damage_only_affects_neutral_lines(self):
        stats = {
            "Strength": 400,
            "Earth Damage": 20,
            "Neutral Damage": 80,
        }

        earth = calc_damage(30, "earth", stats)
        neutral = calc_damage(30, "neutral", stats)

        self.assertEqual(earth["ranged"], 170)
        self.assertEqual(neutral["ranged"], 230)

    def test_profile_damage_uses_critical_rate(self):
        low_crit = {"Strength": 400, "Earth Damage": 20, "Critical Damage": 100}
        high_crit = {
            "Strength": 400,
            "Earth Damage": 20,
            "Critical Damage": 100,
            "Critical": 50,
        }
        profile = [DamageLine("earth", 30, 30, crit_chance=0)]

        self.assertGreater(profile_damage(profile, high_crit), profile_damage(profile, low_crit))


if __name__ == "__main__":
    unittest.main()
