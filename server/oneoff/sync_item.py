import json
import os
from app import session_scope
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_translation import ModelItemTranslation
from oneoff.database_setup import to_stat_enum

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

allowed_file_names = ["items", "mounts", "pets"]


def create_item(db_session, record):
    item = ModelItem(
        dofus_db_id=record["dofusID"],
        item_type=item_types[record["itemType"]],
        level=record["level"],
        image_url=record["imageUrl"],
    )
    db_session.add(item)
    db_session.flush()

    for locale in record["name"]:
        item_translations = ModelItemTranslation(
            item_id=item.uuid, locale=locale, name=record["name"][locale],
        )
        db_session.add(item_translations)
    create_item_stats(db_session, record, item)


def create_item_stats(db_session, record, item):
    i = 0
    for stat in record["stats"]:
        item_stat = ModelItemStat(
            stat=to_stat_enum[stat["stat"]],
            min_value=stat["minStat"],
            max_value=stat["maxStat"],
            order=i,
        )
        db_session.add(item_stat)
        item.stats.append(item_stat)
        i = i + 1


def sync_item():
    should_prompt_file = True
    while should_prompt_file:
        file_name = input(
            "Enter JSON file name without extension ({}): ".format(
                ", ".join(allowed_file_names)
            )
        )
        if file_name in allowed_file_names:
            should_prompt_file = False
        else:
            print("File name not allowed")

    print("Loading and processing file...")
    with open(
        os.path.join(app_root, "app/database/data/{}.json".format(file_name)), "r"
    ) as file:
        data = json.load(file)
        name_to_record_map = {}

        for r in data:
            name_to_record_map[r["name"]["en"]] = r

        should_prompt_item = True
        while should_prompt_item:
            item_name = input("Enter item name, e.g. 'Yellow Piwin': ")
            if item_name in name_to_record_map:
                record = name_to_record_map[item_name]
                should_prompt_item = False
                with session_scope() as db_session:
                    translations = (
                        db_session.query(ModelItemTranslation)
                        .filter(
                            ModelItemTranslation.locale == "en",
                            ModelItemTranslation.name == item_name,
                        )
                        .all()
                    )
                    if len(translations) > 1:
                        print(
                            "Error: Multiple items with that name exist in the database"
                        )
                    elif len(translations) == 1:
                        print("Item already exists in database. Updating stats...")
                        item = translations[0].item
                        db_session.query(ModelItemStat).filter_by(
                            item_id=item.uuid
                        ).delete()
                        create_item_stats(db_session, record, item)
                        print("Item stats successfully updated")
                    else:
                        should_create_response = input(
                            "Item does not exist in database. Would you like to create it? (Y/n)"
                        )
                        if should_create_response == "Y":
                            create_item(db_session, record)
                            print("Item successfully created")


if __name__ == "__main__":
    sync_item()

# with open(os.path.join(app_root, "app/database/data/pets.json"), "r") as file:
