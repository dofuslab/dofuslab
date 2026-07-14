import json
from pathlib import Path
import unittest

from oneoff.condition_evaluator import traverse_conditions
from oneoff.damage_calculator import calc_damage


FIXTURE_DIRECTORY = Path(__file__).parent / "fixtures" / "parity"


def load_fixture(name):
    with (FIXTURE_DIRECTORY / name).open(encoding="utf-8") as fixture_file:
        return json.load(fixture_file)


class FrontendDamageParityTests(unittest.TestCase):
    def test_checked_in_damage_expectations(self):
        fixture = load_fixture("damage_cases.json")
        self.assertIn(
            "outside the backend solver contract", fixture["resistanceDecision"]
        )

        for case in fixture["cases"]:
            flags = case["flags"]
            with self.subTest(case=case["name"]):
                result = calc_damage(
                    case["baseDamage"],
                    case["element"],
                    case["stats"],
                    is_crit=flags.get("isCrit", False),
                    is_trap=flags.get("isTrap", False),
                    is_weapon=flags.get("isWeapon", False),
                    weapon_skill_power=flags.get("weaponSkillPower", 0),
                    crit_bonus_damage=flags.get("critBonusDamage", 0),
                )
                self.assertEqual(
                    {key: result[key] for key in ("melee", "ranged")},
                    case["expected"],
                )


class FrontendConditionParityTests(unittest.TestCase):
    def test_checked_in_condition_expectations(self):
        fixture = load_fixture("condition_cases.json")

        for case in fixture["cases"]:
            with self.subTest(case=case["name"]):
                self.assertEqual(
                    traverse_conditions(
                        case["condition"], case["stats"], case["setCounts"]
                    ),
                    case["expected"],
                )


if __name__ == "__main__":
    unittest.main()
