import json
import os
from app import session_scope
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_item_type import ModelItemType
from app.database.model_item_type_translation import ModelItemTypeTranslation
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_weapon_stat import ModelWeaponStat
from oneoff.database_setup import to_stat_enum
from oneoff.database_setup import to_effect_enum

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

allowed_file_names = ["items", "mounts", "pets", "prysmaradites", "weapons"]
languages = ["en", "fr", "pt", "it", "es", "de"]


def update_or_create_item(db_session, item_name, record):
    print(item_name)
    translations = (
        db_session.query(ModelItemTranslation)
        .filter(
            ModelItemTranslation.locale == "en", ModelItemTranslation.name == item_name,
        )
        .all()
    )
    if len(translations) > 1:
        print("Error: Multiple items with that name exist in the database")
    elif len(translations) == 1:
        print("Item already exists in database. Updating item...")
        item = translations[0].item
        create_item_translations(db_session, record, item)
        print("Item translations successfully updated")
        db_session.query(ModelItemStat).filter_by(item_id=item.uuid).delete()
        create_item_stats(db_session, record, item)
        print("Item stats successfully updated")
        conditions = {
            "conditions": record["conditions"].get("conditions", None),
            "customConditions": record["conditions"].get("customConditions", None),
        }
        print("Item conditions successfully updated")
        if "weaponStats" in record:
            create_weapon_stat(db_session, record, item)
        print("Item weapon stats successfully updated")
    else:
        should_create_response = input(
            "Item does not exist in database. Would you like to create it? (Y/n): "
        )
        if should_create_response == "Y":
            create_item(db_session, record)
            print("Item successfully created")


def create_item(db_session, record):
    print("Loading item types...")
    item_types = {}
    with open(os.path.join(app_root, "app/database/data/item_types.json"), "r") as file:
        data = json.load(file)
        for item_type_record in data:
            item_type = (
                db_session.query(ModelItemTypeTranslation)
                .filter_by(locale="en", name=item_type_record["en"])
                .one()
                .item_type
            )
            item_types[item_type_record["en"]] = item_type
    item = ModelItem(
        dofus_db_id=record["dofusID"],
        item_type_id=item_types[record["itemType"]].uuid,
        level=record["level"],
        image_url=record["imageUrl"],
    )
    conditions = {
        "conditions": record["conditions"].get("conditions", None),
        "customConditions": record["conditions"].get("customConditions", None),
    }
    item.conditions = conditions
    db_session.add(item)
    db_session.flush()

    for locale in record["name"]:
        item_translations = ModelItemTranslation(
            item_id=item.uuid, locale=locale, name=record["name"][locale],
        )
        db_session.add(item_translations)
    create_item_stats(db_session, record, item)
    create_weapon_stat(db_session, record, item)


def create_item_stats(db_session, record, item):
    i = 0

    for stat in record.get("stats", []):
        item_stat = ModelItemStat(
            item_id=item.uuid,
            stat=to_stat_enum[stat["stat"]],
            min_value=stat["minStat"],
            max_value=stat["maxStat"],
            order=i,
        )
        db_session.add(item_stat)
        i = i + 1
    if record["customStats"]:
        num_of_stats = len(record["customStats"]["en"])

        for j in range(num_of_stats):
            item_stat = ModelItemStat(order=i + j, item_id=item.uuid)
            db_session.add(item_stat)
            db_session.flush()
            for locale in record["customStats"]:
                custom_stat = record["customStats"][locale][j]
                stat_translation = ModelItemStatTranslation(
                    item_stat_id=item_stat.uuid, locale=locale, custom_stat=custom_stat,
                )
                db_session.add(stat_translation)


def create_item_translations(db_session, record, item):
    db_session.query(ModelItemTranslation).filter_by(item_id=item.uuid).delete()
    for locale in languages:
        if record["name"][locale]:
            item_translation = ModelItemTranslation(
                item_id=item.uuid, locale=locale, name=record["name"][locale]
            )
            db_session.add(item_translation)


def create_weapon_stat(db_session, record, item):
    if not "weaponStats" in record:
        return
    db_session.query(ModelWeaponStat).filter_by(item_id=item.uuid).delete()

    weapon_stat = ModelWeaponStat(
        item_id=item.uuid,
        ap_cost=record["weaponStats"]["apCost"],
        uses_per_turn=record["weaponStats"]["usesPerTurn"],
        min_range=record["weaponStats"]["minRange"],
        max_range=record["weaponStats"]["maxRange"],
    )

    if record["weaponStats"]["baseCritChance"] > 0:
        weapon_stat.base_crit_chance = (record["weaponStats"]["baseCritChance"],)
        weapon_stat.crit_bonus_damage = (record["weaponStats"]["critBonusDamage"],)

    db_session.add(weapon_stat)
    db_session.flush()

    for effect in record["weaponStats"]["weapon_effects"]:
        weapon_effects = ModelWeaponEffect(
            weapon_stat_id=weapon_stat.uuid,
            effect_type=to_effect_enum[effect["stat"]],
            min_damage=effect["minStat"],
            max_damage=effect["maxStat"],
        )
        db_session.add(weapon_effects)


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
            item_name = input(
                "Enter item name, e.g. 'Yellow Piwin', type 'update all' to update all items in file, or 'q' to quit: "
            )
            if item_name == "q":
                return
            with session_scope() as db_session:
                if item_name == "update all":
                    should_prompt_item = False
                    for record in data:
                        update_or_create_item(db_session, record["name"]["en"], record)
                elif item_name in name_to_record_map:
                    record = name_to_record_map[item_name]
                    update_or_create_item(db_session, item_name, record)


if __name__ == "__main__":
    sync_item()
