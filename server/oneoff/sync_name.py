#!/usr/bin/env python3

import json
import os
from app import session_scope
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_spell_translation import ModelSpellTranslation
from oneoff.sync_item import allowed_file_names as item_file_names

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

allowed_file_names = item_file_names + ["spells"]


def update_name(db_session, name_to_record_map, file_name, old_name, new_name):
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
    elif file_name == "spells":
        translations = (
            db_session.query(ModelSpellTranslation)
            .filter(
                ModelSpellTranslation.locale == "en",
                ModelSpellTranslation.name == old_name,
            )
            .all()
        )
    else:
        raise ValueError("Invalid file name")

    if new_name not in name_to_record_map:
        print("Error: The new name does not exist within the data files.")
    elif len(translations) > 1:
        print("Error: Multiple records with the old name exist in the db.")
    elif len(translations) == 0:
        print("Error: Record with the provided old name does not exist in the db")
    else:
        print("Updating names for {}".format(new_name))
        if file_name in item_file_names:
            item = translations[0].item
            record = name_to_record_map[new_name]
            db_session.query(ModelItemTranslation).filter_by(item_id=item.uuid).delete()
            for locale in name_to_record_map[new_name]["name"]:
                if record["name"].get(locale):
                    item_translation = ModelItemTranslation(
                        item_id=item.uuid, locale=locale, name=record["name"][locale],
                    )
                    db_session.add(item_translation)
        elif file_name == "spells":
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
        else:
            raise ValueError("Invalid file name")


def get_name_to_record_map(file_name):
    with open(
        os.path.join(app_root, "app/database/data/{}.json".format(file_name)), "r"
    ) as file:
        data = json.load(file)
        name_to_record_map = {}

        if file_name in item_file_names:
            for r in data:
                name_to_record_map[r["name"]["en"]] = r
        elif file_name == "spells":
            for r in data:
                for pair in r["spells"]:
                    for spell in pair:
                        name_to_record_map[spell["name"]["en"]] = spell
        else:
            raise ValueError("Invalid file name")

        return name_to_record_map


def prompt_for_names():
    old_name = input(
        "Enter the old name of the record (as it exists in the db) that you would like to update or 'q' to quit: "
    )
    if old_name == "q":
        return None
    new_name = input(
        "Enter the new name of the record (as it should appear) that you would like to update: "
    )
    return old_name, new_name


def sync_name():
    with session_scope() as db_session:
        while True:
            file_name = input(
                'Enter JSON file name without extension ({}), "JSON" to specify a translation change file in app/database/data/translation_files, or "q" to quit: '.format(
                    ", ".join(allowed_file_names)
                )
            )
            if file_name == "q":
                break
            elif file_name == "JSON":
                translation_file_name = input(
                    'Enter JSON file name without extension (e.g. "20230224"): '
                )
                with open(
                    os.path.join(
                        app_root,
                        "app/database/data/translation_files/{}.json".format(
                            translation_file_name
                        ),
                    ),
                    "r",
                ) as file:
                    translations_dict = json.load(file)
                    for (
                        item_or_spell_file_name,
                        translations,
                    ) in translations_dict.items():
                        name_to_record_map = get_name_to_record_map(
                            item_or_spell_file_name
                        )
                        for (old_name, new_name) in translations.items():
                            update_name(
                                db_session,
                                name_to_record_map,
                                item_or_spell_file_name,
                                old_name,
                                new_name,
                            )
            elif file_name in allowed_file_names:
                name_to_record_map = get_name_to_record_map(file_name)
                while True:
                    names = prompt_for_names()
                    if not names:
                        break
                    old_name, new_name = names
                    update_name(
                        db_session, name_to_record_map, file_name, old_name, new_name
                    )
            else:
                print("File name not allowed or is incorrect. Please try again.")


if __name__ == "__main__":
    sync_name()
