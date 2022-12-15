import json
import os
from app import session_scope
from app.database.model_class import ModelClass
from app.database.model_class_translation import ModelClassTranslation

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

male_face_url_base = "class/face/{}_M.png"
female_face_url_base = "class/face/{}_F.png"
male_sprite_url_base = "class/sprite/{}_M.png"
female_sprite_url_base = "class/sprite/{}_F.png"


def add_class_to_classes():
    print("Loading and processing file...")
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r",) as file:
        data = json.load(file)

        with session_scope() as db_session:
            for record in data:
                en_name = record["names"]["en"]
                print(en_name)
                class_in_db = (
                    db_session.query(ModelClass)
                    .join(ModelClassTranslation)
                    .filter(
                        ModelClassTranslation.locale == "en",
                        ModelClassTranslation.name == en_name,
                    )
                    .first()
                )

                class_object = ModelClass(
                    male_face_image_url=male_face_url_base.format(en_name),
                    female_face_image_url=female_face_url_base.format(en_name),
                    male_sprite_image_url=male_sprite_url_base.format(en_name),
                    female_sprite_image_url=female_sprite_url_base.format(en_name),
                )
                if not class_in_db:
                    message = "Adding {} to database".format(en_name)
                    print(message)
                    db_session.add(class_object)
                    db_session.flush()

                    for locale in record["names"]:
                        class_translation = ModelClassTranslation(
                            class_id=class_object.uuid,
                            locale=locale,
                            name=record["names"][locale],
                        )
                        db_session.add(class_translation)
                        class_object.name.append(class_translation)
                else:
                    print("Class existed already")


def update_class_translations(db_session, en_name, all_names):
    translations = (
        db_session.query(ModelClassTranslation)
        .filter(
            ModelClassTranslation.locale == "en", ModelClassTranslation.name == en_name
        )
        .one_or_none()
    )
    if translations:
        print("Updating translation")
        db_session.query(ModelClassTranslation).filter_by(
            class_id=translations.class_id
        ).delete()
    else:
        return
    for locale in all_names:
        translation = ModelClassTranslation(
            class_id=translations.class_id, locale=locale, name=all_names[locale]
        )
        db_session.add(translation)


def update_class_list():
    print("Loading and processing file...")
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r",) as file:
        data = json.load(file)
        name_to_record_map = {}

        for r in data:
            name_to_record_map[r["names"]["en"]] = r

        should_prompt_class = True
        while should_prompt_class:
            class_name = input(
                "Enter class name, e.g. 'Osamodas' to update translations, type 'add new' to add new classes, or 'q' to quit: "
            )
            if class_name == "q":
                return
            with session_scope() as db_session:
                if class_name == "add new":
                    should_prompt_class = False
                    add_class_to_classes()
                elif class_name in name_to_record_map:
                    record = name_to_record_map[class_name]
                    update_class_translations(db_session, class_name, record["names"])


if __name__ == "__main__":
    update_class_list()
