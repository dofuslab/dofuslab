#!/usr/bin/env python3

import json
import os
from app import session_scope
from app.database.model_spell import ModelSpell
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_buff import ModelBuff
from app.database.model_item import ModelItem
from oneoff.enums import to_stat_enum

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def add_item_buffs(db_session, item_id, record):
    for buff in record["buffs"]:
        buff_object = ModelBuff(
            item_id=item_id,
            stat=to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def update_item_buffs(db_session, item_id, record):
    db_session.query(ModelBuff).filter(ModelBuff.item_id == item_id).delete()
    for buff in record["buffs"]:
        buff_object = ModelBuff(
            item_id=item_id,
            stat=to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def add_spell_buff_for_level(db_session, spell_stat_id, buff_data):
    for buff in buff_data["buffs"]:
        buff_object = ModelBuff(
            spell_stat_id=spell_stat_id,
            stat=to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            crit_increment_by=buff["critIncrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def update_spell_buff_for_level(db_session, spell_stat_id, buff_data):
    db_session.query(ModelBuff).filter(
        ModelBuff.spell_stat_id == spell_stat_id
    ).delete()
    for buff in buff_data["buffs"]:
        buff_object = ModelBuff(
            spell_stat_id=spell_stat_id,
            stat=to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            crit_increment_by=buff["critIncrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def update_or_create_item_buff(db_session, item_name, record, should_only_add_missing):
    item_id = (
        db_session.query(ModelItemTranslation)
        .filter(
            ModelItemTranslation.locale == "en", ModelItemTranslation.name == item_name
        )
        .one()
        .item_id
    )
    buffs = db_session.query(ModelItem).filter(ModelItem.uuid == item_id).one().buffs

    if len(buffs) >= 1 and not should_only_add_missing:
        print("Buffs already exist on for {}. Updating buffs...".format(item_name))
        update_item_buffs(db_session, item_id, record)
        print("Buffs for {} updated.".format(item_name))
    elif len(buffs) == 0:
        print("No buffs currently exist for {}. Adding buffs now.".format(item_name))
        add_item_buffs(db_session, item_id, record)
        print("Buffs for {} added.".format(item_name))


def update_or_create_spell_buff(db_session, spell_data, should_only_add_missing):
    dofus_id = str(spell_data["dofusID"])
    spell = db_session.query(ModelSpell).filter_by(dofus_db_id=dofus_id).one_or_none()
    if spell is None:
        raise ValueError("Spell dofusID {} is missing; sync spells first".format(dofus_id))

    seen_levels = set()
    for level in spell_data["levels"]:
        level_number = level["level"]
        if level_number in seen_levels:
            raise ValueError("Duplicate buff level {} for spell {}".format(level_number, dofus_id))
        seen_levels.add(level_number)
        spell_stat = (
            db_session.query(ModelSpellStats)
            .filter_by(spell_id=spell.uuid, level=level_number)
            .one_or_none()
        )
        if spell_stat is None:
            raise ValueError("Spell {} has no level {}".format(dofus_id, level_number))
        has_buffs = (
            db_session.query(ModelBuff)
            .filter_by(spell_stat_id=spell_stat.uuid)
            .first()
        )
        if should_only_add_missing and has_buffs:
            continue
        update_spell_buff_for_level(db_session, spell_stat.uuid, level)
    print("Synced buffs for {} ({})".format(spell_data["name"], dofus_id))


def sync_spell_buffs(class_name, spells):
    print(class_name)
    id_to_spell_record_map = {str(spell["dofusID"]): spell for spell in spells}

    while True:
        response = input(
            "Enter a Dofus spell ID, type 'update all' to update all spell buffs for this class, 'add missing buffs' to only add buffs to levels that are missing them, or type 'q' to quit: "
        )
        if response == "q":
            break
        with session_scope() as db_session:
            if response == "update all":
                for spell in spells:
                    update_or_create_spell_buff(db_session, spell, False)
                break
            elif response == "add missing buffs":
                for spell in spells:
                    update_or_create_spell_buff(db_session, spell, True)
                break
            elif response in id_to_spell_record_map:
                spell_data = id_to_spell_record_map[response]
                update_or_create_spell_buff(db_session, spell_data, False)
            else:
                print("That spell ID is not in this class's buff data, please try again.")


def sync_buffs():
    with open(os.path.join(root_dir, "app/database/data/buffs.json"), "r") as file:
        data = json.load(file)

        while True:
            response = input(
                "Enter a class name (e.g. 'Eliotrope'), type 'update all' to update all classes, or type 'q' to move onto item buffs: "
            )
            if response == "q":
                break
            if response == "update all":
                for class_name in data["spells"]:
                    sync_spell_buffs(class_name, data["spells"][class_name])
                break
            elif response in data["spells"]:
                all_spell_data = data["spells"][response]
                sync_spell_buffs(response, all_spell_data)
            else:
                print("'{}' class does not exist, please try again.".format(response))

        name_to_item_record_map = {}

        for r in data["items"]:
            name_to_item_record_map[r["name"]] = r

        while True:
            response = input(
                "Enter an item name (e.g. 'Crimson Dofus') to update its buffs, type 'update all' to update all buffs for items in the file, 'add missing buffs' to only add buffs to items that are missing them, or type 'q' to quit: "
            )
            if response == "q":
                break
            with session_scope() as db_session:
                if response == "update all":
                    for record in data["items"]:
                        update_or_create_item_buff(
                            db_session, record["name"], record, False
                        )
                    break
                elif response == "add missing buffs":
                    for record in data["items"]:
                        update_or_create_item_buff(
                            db_session, record["name"], record, True
                        )
                    break
                elif response in name_to_item_record_map:
                    record = name_to_item_record_map[response]
                    update_or_create_item_buff(db_session, response, record, False)
                else:
                    print(
                        "That item does not have a buff or a typo was made, please try again."
                    )


if __name__ == "__main__":
    sync_buffs()
