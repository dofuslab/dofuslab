#!/usr/bin/env python3

import json
import os
from app import session_scope
from app.database.model_item_type import ModelItemType
from app.database.model_item_type_translation import ModelItemTypeTranslation

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def recreate_item_type_translations(db_session, en_name, all_names):
    translations = (
        db_session.query(ModelItemTypeTranslation)
        .filter(
            ModelItemTypeTranslation.locale == "en",
            ModelItemTypeTranslation.name == en_name,
        )
        .one_or_none()
    )
    if translations:
        item_type = translations.item_type
        db_session.query(ModelItemTypeTranslation).filter_by(
            item_type_id=item_type.uuid
        ).delete()
    else:
        item_type = ModelItemType()
        db_session.add(item_type)
        db_session.flush()
    for locale in all_names:
        translation = ModelItemTypeTranslation(
            item_type_id=item_type.uuid, locale=locale, name=all_names[locale]
        )
        db_session.add(translation)


def sync_item_type():
    print("Loading and processing file...")
    with open(
        os.path.join(app_root, "app/database/data/item_types.json"), "r",
    ) as file:
        data = json.load(file)
        name_to_record_map = {}

        for r in data:
            name_to_record_map[r["en"]] = r

        should_prompt_item = True
        while should_prompt_item:
            item_name = input(
                "Enter item type name, e.g. 'Prysmaradite', type 'update all' to update all item types, or 'q' to quit: "
            )
            if item_name == "q":
                return
            with session_scope() as db_session:
                if item_name == "update all":
                    should_prompt_item = False
                    for record in data:
                        recreate_item_type_translations(
                            db_session, record["en"], record
                        )
                elif item_name in name_to_record_map:
                    record = name_to_record_map[item_name]
                    recreate_item_type_translations(db_session, item_name, record)


if __name__ == "__main__":
    sync_item_type()
