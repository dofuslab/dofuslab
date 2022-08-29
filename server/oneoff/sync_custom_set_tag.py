#!/usr/bin/env python3

import json
import os
from app import session_scope
from app.database.model_custom_set_tag import ModelCustomSetTag
from app.database.model_custom_set_tag_translation import ModelCustomSetTagTranslation

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_or_update_custom_set_tag(db_session, en_name, record):
    translation = (
        db_session.query(ModelCustomSetTagTranslation)
        .filter(
            ModelCustomSetTagTranslation.locale == "en",
            ModelCustomSetTagTranslation.name == en_name,
        )
        .one_or_none()
    )
    if translation:
        custom_set_tag = translation.custom_set_tag
        db_session.query(ModelCustomSetTagTranslation).filter_by(
            custom_set_tag_id=custom_set_tag.uuid
        ).delete()

        custom_set_tag.image_url = record["imageUrl"]
    else:
        custom_set_tag = ModelCustomSetTag(image_url=record["imageUrl"])
        db_session.add(custom_set_tag)
        db_session.flush()

    all_names = record["name"]
    for locale in all_names:
        new_translation = ModelCustomSetTagTranslation(
            custom_set_tag_id=custom_set_tag.uuid,
            locale=locale,
            name=all_names[locale],
        )
        db_session.add(new_translation)


def create_or_update_all_custom_set_tags(db_session, data):
    for record in data:
        create_or_update_custom_set_tag(db_session, record["name"]["en"], record)


def load_and_create_all_custom_set_tags(db_session):
    with open(
        os.path.join(app_root, "app/database/data/custom_set_tags.json"), "r",
    ) as file:
        data = json.load(file)
        create_or_update_all_custom_set_tags(db_session, data)


def sync_custom_set_tag():
    print("Loading and processing file...")
    with open(
        os.path.join(app_root, "app/database/data/custom_set_tags.json"), "r",
    ) as file:
        data = json.load(file)
        name_to_record_map = {}

        for r in data:
            name_to_record_map[r["name"]["en"]] = r

        should_prompt = True
        while should_prompt:
            tag_name = input(
                "Enter tag name, e.g. 'Str', type 'update all' to update all tags, or 'q' to quit: "
            )
            if tag_name == "q":
                return
            with session_scope() as db_session:
                if tag_name == "update all":
                    should_prompt = False
                    create_or_update_all_custom_set_tags(db_session, data)
                elif tag_name in name_to_record_map:
                    record = name_to_record_map[tag_name]
                    create_or_update_custom_set_tag(db_session, tag_name, record)


if __name__ == "__main__":
    sync_custom_set_tag()
