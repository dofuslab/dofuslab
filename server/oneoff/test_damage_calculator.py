import unittest

from oneoff.damage_calculator import DamageLine, profile_damage


class DamageCalculatorDistanceTests(unittest.TestCase):
    def test_ranged_and_melee_damage_are_not_unconditional(self):
        line = DamageLine(element="earth", base_min=100, base_max=100, crit_chance=0)
        stats = {
            "Strength": 0,
            "% Ranged Damage": 50,
            "% Melee Damage": 50,
        }

        self.assertEqual(profile_damage([line], stats), 100)

    def test_ranged_damage_applies_only_to_ranged_lines(self):
        line = DamageLine(
            element="earth",
            base_min=100,
            base_max=100,
            crit_chance=0,
            distance="ranged",
        )
        stats = {
            "Strength": 0,
            "% Ranged Damage": 50,
            "% Melee Damage": 0,
        }

        self.assertEqual(profile_damage([line], stats), 150)

    def test_melee_damage_applies_only_to_melee_lines(self):
        line = DamageLine(
            element="earth",
            base_min=100,
            base_max=100,
            crit_chance=0,
            distance="melee",
        )
        stats = {
            "Strength": 0,
            "% Ranged Damage": 0,
            "% Melee Damage": 50,
        }

        self.assertEqual(profile_damage([line], stats), 150)


if __name__ == "__main__":
    unittest.main()
