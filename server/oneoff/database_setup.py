from app import db
from app import session_scope
from app.database.model_custom_set_tag import ModelCustomSetTag
from app.database.model_custom_set_tag_translation import ModelCustomSetTagTranslation
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_slot_translation import ModelItemSlotTranslation
from app.database.model_item_type import ModelItemType
from app.database.model_item_type_translation import ModelItemTypeTranslation
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_weapon_stat import ModelWeaponStat
from app.database.model_set import ModelSet
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_custom_set import ModelCustomSet
from app.database.model_user import ModelUserAccount
from app.database.model_class import ModelClass
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_spell import ModelSpell
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_stat_translation import ModelSpellStatTranslation
from app.database.model_spell_effect import ModelSpellEffect
from app.database import base
from oneoff.enums import to_stat_enum, to_effect_enum, to_spell_enum
from oneoff.sync_custom_set_tag import load_and_create_all_custom_set_tags
from oneoff.sync_spell import create_spell_stats
from oneoff.sync_set import create_set
import oneoff.sync_item
import oneoff.sync_buff
from sqlalchemy.schema import MetaData
from worker import redis_connection
import sqlalchemy
import json
import sys
import os

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


face_url_base = "class/face/{}_M.png"
male_sprite_url_base = "class/sprite/{}_M.png"
female_sprite_url_base = "class/sprite/{}_F.png"
slot_url_base = "icon/{}.svg"

item_types = {}


def add_item_types_and_slots():
    print("Adding item types to database")
    with open(os.path.join(app_root, "app/database/data/item_types.json"), "r") as file:
        data = json.load(file)
        for record in data:
            item_type = ModelItemType()
            db.session.add(item_type)
            db.session.flush()
            for locale in record:
                translation = ModelItemTypeTranslation(
                    item_type_id=item_type.uuid, locale=locale, name=record[locale]
                )
                db.session.add(translation)

            item_types[record["en"]] = item_type

    db.session.commit()

    print("Adding item slots to database")
    with open(os.path.join(app_root, "app/database/data/item_slots.json"), "r") as file:
        data = json.load(file)
        i = 0
        for record in data:
            for _ in range(record.get("quantity", 1)):
                en_name = record["name"]["en"]
                item_slot = ModelItemSlot(
                    item_types=[
                        item_types[item_type_name] for item_type_name in record["types"]
                    ],
                    order=i,
                    image_url=slot_url_base.format(en_name),
                )
                db.session.add(item_slot)
                db.session.flush()
                for locale in record["name"]:
                    translation = ModelItemSlotTranslation(
                        item_slot_id=item_slot.uuid,
                        locale=locale,
                        name=record["name"][locale],
                    )
                    db.session.add(translation)

                i = i + 1

    db.session.commit()


def add_sets_and_items():
    print("Adding sets to database")
    with open(os.path.join(app_root, "app/database/data/sets.json"), "r") as file:
        with session_scope() as db_session:
            data = json.load(file)
            for record in data:
                create_set(db_session, record)

    print("Adding items to database")
    with open(os.path.join(app_root, "app/database/data/items.json"), "r") as file:
        with session_scope() as db_session:
            data = json.load(file)
            for record in data:
                if record["itemType"] == "Living object":
                    continue

                oneoff.sync_item.create_item(db_session, record)


def add_weapons():
    print("Adding weapons to database")
    with open(os.path.join(app_root, "app/database/data/weapons.json"), "r") as file:
        with session_scope() as db_session:
            data = json.load(file)
            for record in data:

                oneoff.sync_item.create_item(db_session, record)


def add_pets():
    print("Adding pets to database")
    with open(os.path.join(app_root, "app/database/data/pets.json"), "r") as file:
        data = json.load(file)
        for record in data:
            item = ModelItem(
                dofus_db_id=record["dofusID"],
                item_type=item_types[record["itemType"]],
                level=record["level"],
                image_url=record["imageUrl"],
            )
            db.session.add(item)

            conditions = {
                "conditions": record["conditions"]["conditions"],
                "customConditions": record["conditions"]["customConditions"],
            }
            item.conditions = conditions

            for locale in record["name"]:
                item_translations = ModelItemTranslation(
                    item_id=item.uuid, locale=locale, name=record["name"][locale],
                )
                db.session.add(item_translations)
                item.item_translations.append(item_translations)

            try:
                i = 0
                for stat in record["stats"]:
                    item_stat = ModelItemStat(
                        stat=to_stat_enum[stat["stat"]],
                        min_value=stat["minStat"],
                        max_value=stat["maxStat"],
                        order=i,
                    )
                    db.session.add(item_stat)
                    item.stats.append(item_stat)
                    i = i + 1
                if record["customStats"] != {} and record["customStats"] != []:
                    num_of_stats = len(record["customStats"]["en"])

                    for j in range(num_of_stats):
                        item_stat = ModelItemStat(order=i)
                        for locale in record["customStats"]:
                            custom_stat = record["customStats"][locale][j]
                            stat_translation = ModelItemStatTranslation(
                                item_stat_id=item_stat.uuid,
                                locale=locale,
                                custom_stat=custom_stat,
                            )
                            db.session.add(stat_translation)
                            item_stat.item_stat_translation.append(stat_translation)

                        db.session.add(item_stat)
                        item.stats.append(item_stat)
                        i = i + 1

                # If this item belongs in a set, query the set and add the relationship to the record
                if record["setID"]:
                    set = record["setID"]
                    set_record = (
                        db.session.query(ModelSet)
                        .filter(ModelSet.dofus_db_id == set)
                        .first()
                    )
                    set_record.items.append(item)
                    db.session.merge(set_record)
            except KeyError as err:
                print("KeyError occurred:", err)

        db.session.commit()


def add_mounts():
    print("Adding mounts to database")
    with open(os.path.join(app_root, "app/database/data/mounts.json"), "r") as file:
        data = json.load(file)
        for record in data:
            item = ModelItem(
                dofus_db_id=record["dofusID"],
                item_type=item_types[record["itemType"]],
                level=record["level"],
                image_url=record["imageUrl"],
            )

            for locale in record["name"]:
                item_translations = ModelItemTranslation(
                    item_id=item.uuid, locale=locale, name=record["name"][locale],
                )
                db.session.add(item_translations)
                item.item_translations.append(item_translations)

            try:
                i = 0
                for stat in record["stats"]:
                    item_stat = ModelItemStat(
                        stat=to_stat_enum[stat["stat"]],
                        min_value=stat["minStat"],
                        max_value=stat["maxStat"],
                        order=i,
                    )
                    db.session.add(item_stat)
                    item.stats.append(item_stat)
                    i = i + 1

                db.session.add(item)

            except KeyError as err:
                print("KeyError occurred:", err)

        db.session.commit()

    with open(os.path.join(app_root, "app/database/data/rhineetles.json"), "r") as file:
        data = json.load(file)
        for record in data:
            item = ModelItem(
                dofus_db_id=record["dofusID"],
                item_type=item_types[record["itemType"]],
                level=record["level"],
                image_url=record["imageUrl"],
            )

            for locale in record["name"]:
                item_translations = ModelItemTranslation(
                    item_id=item.uuid, locale=locale, name=record["name"][locale],
                )
                db.session.add(item_translations)
                item.item_translations.append(item_translations)

            try:
                i = 0
                for stat in record["stats"]:
                    item_stat = ModelItemStat(
                        stat=to_stat_enum[stat["stat"]],
                        min_value=stat["minStat"],
                        max_value=stat["maxStat"],
                        order=i,
                    )
                    db.session.add(item_stat)
                    item.stats.append(item_stat)
                    i = i + 1

                db.session.add(item)

            except KeyError as err:
                print("KeyError occurred:", err)

        db.session.commit()


def add_classes_and_spells():
    print("Adding classes to database")
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r") as file:
        with session_scope() as db_session:
            data = json.load(file)
            for record in data:
                en_name = record["names"]["en"]
                class_object = ModelClass(
                    face_image_url=face_url_base.format(en_name),
                    male_sprite_image_url=male_sprite_url_base.format(en_name),
                    female_sprite_image_url=female_sprite_url_base.format(en_name),
                )
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

                for spell_pair in record["spells"]:
                    spell_pair_object = ModelSpellVariantPair(
                        class_id=class_object.uuid
                    )
                    db_session.add(spell_pair_object)
                    db_session.flush()

                    for spell in spell_pair:
                        spell_object = ModelSpell(
                            spell_variant_pair_id=spell_pair_object.uuid,
                            image_url=spell["imageUrl"],
                            is_trap=spell.get("isTrap", False),
                        )
                        db_session.add(spell_object)
                        db_session.flush()

                        for locale in spell["name"]:
                            spell_translation = ModelSpellTranslation(
                                spell_id=spell_object.uuid,
                                locale=locale,
                                name=spell["name"][locale],
                                description=spell["description"][locale],
                            )
                            db_session.add(spell_translation)
                            spell_object.spell_translation.append(spell_translation)

                        create_spell_stats(db_session, spell, spell_object)


def add_buffs():
    print("Adding buffs to database")
    with open(os.path.join(app_root, "app/database/data/buffs.json"), "r") as file:
        data = json.load(file)

        all_classes = data["spells"]
        all_items = data["items"]

        with session_scope() as db_session:
            for class_name in all_classes:
                for spell in all_classes[class_name]:
                    spell_id = (
                        db_session.query(ModelSpellTranslation)
                        .filter_by(name=spell["name"], locale="en")
                        .one()
                        .spell_id
                    )

                    for level in spell["levels"]:
                        spell_stat_id = (
                            db_session.query(ModelSpellStats)
                            .filter_by(spell_id=spell_id, level=level["level"])
                            .one()
                            .uuid
                        )

                        oneoff.sync_buff.add_spell_buff_for_level(
                            db_session, spell_stat_id, level
                        )

            for item in all_items:
                item_id = (
                    db_session.query(ModelItemTranslation)
                    .filter_by(name=item["name"], locale="en")
                    .one()
                    .item_id
                )

                oneoff.sync_buff.add_item_buffs(db_session, item_id, item)


def add_tags():
    print("Adding custom set tags to database")
    load_and_create_all_custom_set_tags(db.session)
    db.session.commit()


def populate_table_for(table, fn):
    while True:
        str = "Would you like to add {}? (y/n)? ".format(table)
        response = input(str)
        if response == "y":
            fn()
            break
        elif response == "n":
            break
        else:
            print("Invalid response, please type 'y' or 'n'")


def setup_db():
    while True:
        response = input("Would you like to populate all tables (y/n)? ")
        if response == "y":
            add_item_types_and_slots()
            add_sets_and_items()
            add_weapons()
            add_pets()
            add_mounts()
            add_classes_and_spells()
            add_buffs()
            add_tags()
            break
        elif response == "n":
            populate_table_for("item types and item slots", add_item_types_and_slots)
            populate_table_for("sets and items", add_sets_and_items)
            populate_table_for("weapons", add_weapons)
            populate_table_for("pets", add_pets)
            populate_table_for("mounts", add_mounts)
            populate_table_for("classes and spells", add_classes_and_spells)
            populate_table_for("spell and item buffs", add_buffs)
            break
        else:
            print("Invalid response, please type 'y' or 'n'")


if __name__ == "__main__":
    # print("Resetting database")
    # base.Base.metadata.reflect(base.engine)
    # base.Base.metadata.drop_all(base.engine)
    # base.Base.metadata.create_all(base.engine)
    redis_connection.flushall()

    setup_db()
