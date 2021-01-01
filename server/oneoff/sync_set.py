import json
import os
from app import session_scope
from app.database.model_set import ModelSet
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from oneoff.enums import to_stat_enum
from oneoff.utils import prompt_game_version, get_relative_path_for_game_version

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_set_bonuses(db_session, set_object, data):
    for num_items in data["bonuses"]:
        bonuses = data["bonuses"][num_items]
        for bonus in bonuses:
            bonus_obj = ModelSetBonus(set_id=set_object.uuid, num_items=int(num_items),)
            if bonus["stat"]:
                bonus_obj.stat = to_stat_enum[bonus["stat"]]
                bonus_obj.value = bonus["value"]
            else:
                for locale in bonus["altStat"]:
                    for custom_bonus in bonus["altStat"][locale]:
                        bonus_translation = ModelSetBonusTranslation(
                            set_bonus_id=bonus_obj.uuid,
                            locale=locale,
                            custom_stat=custom_bonus,
                        )
                        db_session.add(bonus_translation)
                        bonus_obj.set_bonus_translation.append(bonus_translation)

            db_session.add(bonus_obj)


def create_set_translations(db_session, set_object, data):
    for locale in data["name"]:
        if data["name"][locale]:
            translation = ModelSetTranslation(
                set_id=set_object.uuid, locale=locale, name=data["name"][locale]
            )
            db_session.add(translation)


def update_set(
    db_session, set_object, data,
):
    db_session.query(ModelSetTranslation).filter(
        ModelSetTranslation.set_id == set_object.uuid,
    ).delete()
    create_set_translations(db_session, set_object, data)

    db_session.query(ModelSetBonus).filter(
        ModelSetBonus.set_id == set_object.uuid,
    ).delete()
    create_set_bonuses(db_session, set_object, data)


def create_set(db_session, data, game_version):
    set_object = ModelSet(dofus_db_id=data["id"], game_version=game_version)
    db_session.add(set_object)
    db_session.flush()

    create_set_translations(db_session, set_object, data)
    create_set_bonuses(db_session, set_object, data)


def create_or_update_set(
    db_session, set_name, data, should_only_add_missing, game_version
):
    translations = (
        db_session.query(ModelSetTranslation)
        .join(ModelSet)
        .filter(
            ModelSetTranslation.locale == "en",
            ModelSetTranslation.name == set_name,
            ModelSet.game_version == game_version,
        )
        .all()
    )
    if len(translations) > 1:
        print("Multiple sets with that name exist, skipping it.")
        return
    elif len(translations) == 1 and not should_only_add_missing:
        print("The set {} currently exists. Updating the set.".format(set_name))
        set_object = (
            db_session.query(ModelSet)
            .filter(
                ModelSet.uuid == translations[0].set_id,
                ModelSet.game_version == game_version,
            )
            .one()
        )
        update_set(db_session, set_object, data)
    elif len(translations) == 0:
        print("No set was found for {}. Creating the set".format(set_name))
        create_set(db_session, data, game_version)


def sync_set():
    game_version = prompt_game_version()
    with open(
        os.path.join(
            app_root, get_relative_path_for_game_version(game_version), "sets.json"
        ),
        "r",
    ) as file:
        data = json.load(file)

        name_to_record_map = {}

        for set_data in data:
            name_to_record_map[set_data["name"]["en"]] = set_data

        while True:
            response = input(
                "Enter a set name, type 'update all' to update all sets, type 'add missing sets' to only add sets that are missing, or type 'q' to quit: "
            )
            if response == "q":
                break
            with session_scope() as db_session:
                if response == "update all":
                    for set_data in data:
                        create_or_update_set(
                            db_session,
                            set_data["name"]["en"],
                            set_data,
                            False,
                            game_version,
                        )
                    break
                elif response == "add missing sets":
                    for set_data in data:
                        create_or_update_set(
                            db_session,
                            set_data["name"]["en"],
                            set_data,
                            True,
                            game_version,
                        )
                    break
                elif response in name_to_record_map:
                    record = name_to_record_map[response]
                    create_or_update_set(
                        db_session, response, record, False, game_version
                    )
                else:
                    print(
                        "The set {} does not exist. Please try again.".format(response)
                    )


if __name__ == "__main__":
    sync_set()
