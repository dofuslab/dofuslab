#!/usr/bin/env python3

import json
import os
from app import session_scope
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_spell import ModelSpell
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_buff import ModelBuff
from oneoff.update_class_list import add_class_to_classes
from oneoff.sync_spell import create_spell_stats
import oneoff.sync_buff

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wipeSpellsAndBuffs(db_session):
    db_session.query(ModelSpell).delete()
    db_session.query(ModelSpellVariantPair).delete()
    db_session.query(ModelBuff).delete()
    db_session.flush()


def add_classes_and_spells(db_session, data):
    print("Adding new class spells to database")
    wipeSpellsAndBuffs(db_session)
    for record in data:
        en_name = record["names"]["en"]
        class_translation = (
            db_session.query(ModelClassTranslation)
            .filter_by(locale="en", name=en_name)
            .one()
        )

        for spell_pair in record["spells"]:
            pair = ModelSpellVariantPair(class_id=class_translation.class_id)
            db_session.add(pair)
            db_session.flush()

            for spell in spell_pair:
                spell_object = ModelSpell(
                    dofus_db_id=str(spell["dofusID"]),
                    spell_variant_pair_id=pair.uuid,
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


def add_buffs(db_session, data):
    print("Adding buffs to database")
    all_classes = data["spells"]
    all_items = data["items"]

    for class_name in all_classes:
        for spell in all_classes[class_name]:
            spell_uuid = (
                db_session.query(ModelSpell)
                .filter_by(dofus_db_id=str(spell["dofusID"]))
                .one()
                .uuid
            )

            for level in spell["levels"]:
                spell_stat_id = (
                    db_session.query(ModelSpellStats)
                    .filter_by(spell_id=spell_uuid, level=level["level"])
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


def sync_class():
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r") as file:
        spells = json.load(file)
    with open(os.path.join(app_root, "app/database/data/buffs.json"), "r") as file:
        buffs = json.load(file)
    add_class_to_classes()
    with session_scope() as db_session:
        add_classes_and_spells(db_session, spells)
        add_buffs(db_session, buffs)


if __name__ == "__main__":
    sync_class()
