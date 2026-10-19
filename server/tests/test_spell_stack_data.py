import json
import os
import unittest


class SpellStackDataTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "app",
            "database",
            "data",
            "spells.json",
        )
        with open(data_path, "r", encoding="utf-8") as source:
            classes = json.load(source)
        cls.spells = {
            str(spell["dofusID"]): spell
            for class_record in classes
            for pair in class_record["spells"]
            for spell in pair
        }

    def assert_max_stacks(self, spell_id, expected):
        spell = self.spells[str(spell_id)]
        self.assertTrue(spell["effects"])
        self.assertEqual(
            {level.get("damageIncreaseMaxStacks") for level in spell["effects"]},
            {expected},
        )

    def test_frozen_arrow_allows_two_damage_increase_stacks(self):
        self.assert_max_stacks(32435, 2)

    def test_distillation_allows_four_damage_increase_stacks(self):
        self.assert_max_stacks(12815, 4)


if __name__ == "__main__":
    unittest.main()
