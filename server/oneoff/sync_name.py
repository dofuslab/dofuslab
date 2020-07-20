import json
import os
from app import session_scope
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_spell_translation import ModelSpellTranslation
from oneoff.sync_item import allowed_file_names as item_file_names

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

allowed_file_names = item_file_names + ["spells"]


def update_name(db_session, file_name):
    with open(
        os.path.join(app_root, "app/database/data/{}.json".format(file_name)), "r"
    ) as file:
        data = json.load(file)
        name_to_record_map = {}

        if file_name in item_file_names:
            for r in data:
                name_to_record_map[r["name"]["en"]] = r
        else:
            for r in data:
                for pair in r["spells"]:
                    for spell in pair:
                        name_to_record_map[spell["name"]["en"]] = spell

        while True:
            old_name = input(
                "Enter the old name of the record (as it exists in the db) that you would like to update or 'q' to quit: "
            )
            if old_name == "q":
                return
            new_name = input(
                "Enter the new name of the record (as it should appear) that you would like to update: "
            )

            translations = None
            if file_name in item_file_names:
                translations = (
                    db_session.query(ModelItemTranslation)
                    .filter(
                        ModelItemTranslation.locale == "en",
                        ModelItemTranslation.name == old_name,
                    )
                    .all()
                )
            else:
                translations = (
                    db_session.query(ModelSpellTranslation)
                    .filter(
                        ModelSpellTranslation.locale == "en",
                        ModelSpellTranslation.name == old_name,
                    )
                    .all()
                )

            if new_name not in name_to_record_map:
                print("Error: The new name does not exist within the data files.")
            elif len(translations) > 1:
                print("Error: Multiple records with the old name exist in the db.")
            elif len(translations) == 0:
                print(
                    "Error: Record with the provided old name does not exist in the db"
                )
            else:
                print("Updating names for {}".format(new_name))
                if file_name in item_file_names:
                    item = translations[0].item
                    record = name_to_record_map[new_name]
                    db_session.query(ModelItemTranslation).filter_by(
                        item_id=item.uuid
                    ).delete()
                    for locale in name_to_record_map[new_name]["name"]:
                        if record["name"].get(locale):
                            item_translation = ModelItemTranslation(
                                item_id=item.uuid,
                                locale=locale,
                                name=record["name"][locale],
                            )
                            db_session.add(item_translation)
                else:
                    spell = translations[0].spell
                    record = name_to_record_map[new_name]
                    db_session.query(ModelSpellTranslation).filter_by(
                        spell_id=spell.uuid
                    ).delete()
                    for locale in name_to_record_map[new_name]["name"]:
                        if record["name"][locale]:
                            spell_translation = ModelSpellTranslation(
                                spell_id=spell.uuid,
                                locale=locale,
                                name=record["name"][locale],
                                description=record["description"][locale],
                            )
                            db_session.add(spell_translation)


def sync_name():
    while True:
        file_name = input(
            "Enter JSON file name without extension ({}) or q to quit: ".format(
                ", ".join(allowed_file_names)
            )
        )
        if file_name == "q":
            break

        if file_name in allowed_file_names:
            with session_scope() as db_session:
                update_name(db_session, file_name)
        else:
            print("File name not allowed or is incorrect. Please try again.")


if __name__ == "__main__":
    sync_name()
