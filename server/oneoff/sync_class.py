#!/usr/bin/env python3

import json
import os
from app import db
from app import session_scope
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_class import ModelClass
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_spell import ModelSpell
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_buff import ModelBuff
from oneoff.sync_spell import create_spell_stats
import oneoff.sync_item
import oneoff.sync_buff

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wipeSpellsAndBuffs():
    db.session.query(ModelSpell).delete()
    db.session.query(ModelSpellVariantPair).delete()
    db.session.query(ModelBuff).delete()
    db.session.commit()


def add_classes_and_spells():
    print("Adding new class spells to database")
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r") as file:
        with session_scope() as db_session:
            data = json.load(file)
            for record in data:
                en_name = record["names"]["en"]
                class_object = (
                    db_session.query(ModelClassTranslation)
                    .filter(
                        ModelClassTranslation.locale == "en",
                        ModelClassTranslation.name == en_name,
                    )
                    .first()
                )
                db_session.flush()

                for spell_pair in record["spells"]:
                    spell_pair_object = ModelSpellVariantPair(
                        class_id=class_object.class_id
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


wipeSpellsAndBuffs()
add_classes_and_spells()
add_buffs()
