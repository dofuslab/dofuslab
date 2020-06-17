from app import session_scope
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_buff import ModelBuff
from app.database.model_item import ModelItem
import oneoff.database_setup
import os
import json

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def add_item_buffs(db_session, item_id, record):
    for buff in record["buffs"]:
        buff_object = ModelBuff(
            item_id=item_id,
            stat=oneoff.database_setup.to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def update_item_buffs(db_session, item_id, record):
    db_session.query(ModelBuff).filter(ModelBuff.item_id == item_id).delete()
    for buff in record["buffs"]:
        buff_object = ModelBuff(
            item_id=item_id,
            stat=oneoff.database_setup.to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def add_spell_buff_for_level(db_session, spell_stat_id, buff_data):
    for buff in buff_data["buffs"]:
        buff_object = ModelBuff(
            spell_stat_id=spell_stat_id,
            stat=oneoff.database_setup.to_stat_enum[buff["stat"]],
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
            stat=oneoff.database_setup.to_stat_enum[buff["stat"]],
            increment_by=buff["incrementBy"],
            crit_increment_by=buff["critIncrementBy"],
            max_stacks=buff["maxStacks"],
        )
        db_session.add(buff_object)


def update_or_create_item_buff(db_session, item_name, record):
    print(item_name)
    item_id = (
        db_session.query(ModelItemTranslation)
        .filter(
            ModelItemTranslation.locale == "en", ModelItemTranslation.name == item_name
        )
        .one()
        .item_id
    )
    buffs = db_session.query(ModelItem).filter(ModelItem.uuid == item_id).one().buff

    if len(buffs) >= 1:
        print("Buffs already exists on this item. Updating buffs...")
        update_item_buffs(db_session, item_id, record)
        print("Buffs for {} updated.".format(item_name))
    else:
        print("No buffs currently exist on this item. Adding buffs now.")
        add_item_buffs(db_session, item_id, record)
        print("Buffs for {} added.".format(item_name))


def update_or_create_spell_buff(db_session, spell_name, spell_data):
    translations = (
        db_session.query(ModelSpellTranslation)
        .filter(
            ModelSpellTranslation.locale == "en",
            ModelSpellTranslation.name == spell_name,
        )
        .all()
    )
    # I'm pretty sure spell names were recently made unique for all classes
    # but a little error handling couldn't hurt
    if len(translations) > 1:
        print("Multiple spells with that name exist, skipping it.")
        return

    spell_id = translations[0].spell_id

    spell_stat_ids = {}

    for spell_data_per_level in spell_data["levels"]:
        spell_stat_id = (
            db_session.query(ModelSpellStats)
            .filter(
                ModelSpellStats.spell_id == spell_id,
                ModelSpellStats.level == spell_data_per_level["level"],
            )
            .one()
            .uuid
        )
        spell_stat_ids[spell_data_per_level["level"]] = spell_stat_id

    level_to_spell_stat_record_map = {}

    for spell_data_per_level in spell_data["levels"]:
        level_to_spell_stat_record_map[
            spell_data_per_level["level"]
        ] = spell_data_per_level

    buffs = (
        db_session.query(ModelSpellStats)
        .filter(ModelSpellStats.uuid == spell_stat_ids[next(iter(spell_stat_ids))])
        .one()
        .buff
    )

    if len(buffs) >= 1:
        print("Buffs already exists for {}. Updating buffs...".format(spell_name))
        for level in spell_stat_ids:
            update_spell_buff_for_level(
                db_session,
                spell_stat_ids[level],
                level_to_spell_stat_record_map[level],
            )
        print("Buffs for {} updated.".format(spell_name))
    else:
        print("No buffs currently exist for {}. Adding buffs now.".format(spell_name))
        for level in spell_stat_ids:
            add_spell_buff_for_level(
                db_session,
                spell_stat_ids[level],
                level_to_spell_stat_record_map[level],
            )
        print("Buffs for {} added.".format(spell_name))


def sync_spell_buffs(db_session, class_name, spells):
    print(class_name)
    name_to_spell_record_map = {}

    for spell in spells:
        name_to_spell_record_map[spell["name"]] = spell

    while True:
        response = input(
            "Enter a spell name, type 'update all' to update all spell buffs for this class, or type 'q' to quit: "
        )
        if response == "q":
            break
        with session_scope() as db_session:
            if response == "update all":
                for spell in spells:
                    update_or_create_spell_buff(db_session, spell["name"], spell)
                break
            elif response in name_to_spell_record_map:
                spell_data = name_to_spell_record_map[response]
                update_or_create_spell_buff(db_session, response, spell_data)
            else:
                print(
                    "That spell either does not have a buff or a typo was made, please try again."
                )


def sync_buffs():
    with open(os.path.join(root_dir, "app/database/data/buffs.json"), "r") as file:
        data = json.load(file)

        while True:
            response = input(
                "Enter a class name (e.g. 'Eliotrope'), type 'update all' to update all classes, or type 'q' to move onto item buffs: "
            )
            if response == "q":
                break
            with session_scope() as db_session:
                if response == "update all":
                    for class_name in data["spells"]:
                        sync_spell_buffs(
                            db_session, class_name, data["spells"][class_name]
                        )
                    break
                elif response in data["spells"]:
                    all_spell_data = data["spells"][response]
                    sync_spell_buffs(db_session, response, all_spell_data)
                else:
                    print(
                        "'{}' class does not exist, please try again.".format(response)
                    )

        name_to_item_record_map = {}

        for r in data["items"]:
            name_to_item_record_map[r["name"]] = r

        while True:
            response = input(
                "Enter an item name (e.g. 'Crimson Dofus'), type 'update all' to update all items in file, or type 'q' to quit: "
            )
            if response == "q":
                break
            with session_scope() as db_session:
                if response == "update all":
                    for record in data["items"]:
                        update_or_create_item_buff(db_session, record["name"], record)
                    break
                elif response in name_to_item_record_map:
                    record = name_to_item_record_map[response]
                    update_or_create_item_buff(db_session, response, record)
                else:
                    print(
                        "That item does not have a buff or a typo was made, please try again."
                    )


if __name__ == "__main__":
    sync_buffs()
