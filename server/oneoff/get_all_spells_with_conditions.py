import json
import os

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# This script is to generate a list of spells to pass to sync_spells when translations
# are added for conditional spells


def get_all_spells_with_conditions():
    print("Loading and processing file...")
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r",) as file:
        data = json.load(file)
        results = []

        for class_record in data:
            for class_spells in class_record["spells"]:
                for spell_record in class_spells:
                    for spell_level_record in spell_record["effects"]:
                        if spell_level_record["normalEffects"].get(
                            "conditionalEffect"
                        ) or spell_level_record["criticalEffects"].get(
                            "conditionalEffect"
                        ):
                            results.append(spell_record["name"]["en"])
                            break
    print(", ".join(results))


if __name__ == "__main__":
    get_all_spells_with_conditions()
