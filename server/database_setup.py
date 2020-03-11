from app import db
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_type import ModelItemType
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_set import ModelSet
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_custom_set import ModelCustomSet
from app.database.model_user import ModelUser
from app.database import base, enums
from sqlalchemy.schema import MetaData
import sqlalchemy
import json
import sys
import os

dirname = os.path.dirname(os.path.abspath(__file__))

to_stat_enum = {
    "Vitality": enums.Stat.VITALITY,
    "AP": enums.Stat.AP,
    "MP": enums.Stat.MP,
    "Initiative": enums.Stat.INITIATIVE,
    "Prospecting": enums.Stat.PROSPECTING,
    "Range": enums.Stat.RANGE,
    "Summons": enums.Stat.SUMMON,
    "Wisdom": enums.Stat.WISDOM,
    "Strength": enums.Stat.STRENGTH,
    "Intelligence": enums.Stat.INTELLIGENCE,
    "Chance": enums.Stat.CHANCE,
    "Agility": enums.Stat.AGILITY,
    "AP Parry": enums.Stat.AP_PARRY,
    "AP Reduction": enums.Stat.AP_REDUCTION,
    "MP Parry": enums.Stat.MP_PARRY,
    "MP Reduction": enums.Stat.MP_REDUCTION,
    "Critical": enums.Stat.CRITICAL,
    "Heals": enums.Stat.HEALS,
    "Lock": enums.Stat.LOCK,
    "Dodge": enums.Stat.DODGE,
    "Power": enums.Stat.POWER,
    "Damage": enums.Stat.DAMAGE,
    "Critical Damage": enums.Stat.CRITICAL_DAMAGE,
    "Neutral Damage": enums.Stat.NEUTRAL_DAMAGE,
    "Earth Damage": enums.Stat.EARTH_DAMAGE,
    "Fire Damage": enums.Stat.FIRE_DAMAGE,
    "Water Damage": enums.Stat.WATER_DAMAGE,
    "Air Damage": enums.Stat.AIR_DAMAGE,
    "Reflect": enums.Stat.REFLECT,
    "Trap Damage": enums.Stat.TRAP_DAMAGE,
    "Power (traps)": enums.Stat.TRAP_POWER,
    "Pushback Damage": enums.Stat.PUSHBACK_DAMAGE,
    "% Spell Damage": enums.Stat.PCT_SPELL_DAMAGE,
    "% Weapon Damage": enums.Stat.PCT_WEAPON_DAMAGE,
    "% Ranged Damage": enums.Stat.PCT_RANGED_DAMAGE,
    "% Melee Damage": enums.Stat.PCT_MELEE_DAMAGE,
    "Neutral Resistance": enums.Stat.NEUTRAL_RES,
    "% Neutral Resistance": enums.Stat.PCT_NEUTRAL_RES,
    "Earth Resistance": enums.Stat.EARTH_RES,
    "% Earth Resistance": enums.Stat.PCT_EARTH_RES,
    "Fire Resistance": enums.Stat.FIRE_RES,
    "% Fire Resistance": enums.Stat.PCT_FIRE_RES,
    "Water Resistance": enums.Stat.WATER_RES,
    "% Water Resistance": enums.Stat.PCT_WATER_RES,
    "Air Resistance": enums.Stat.AIR_RES,
    "% Air Resistance": enums.Stat.PCT_AIR_RES,
    "Critical Resistance": enums.Stat.CRITICAL_RES,
    "Pushback Resistance": enums.Stat.PUSHBACK_RES,
    "% Ranged Resistance": enums.Stat.PCT_RANGED_RES,
    "% Melee Resistance": enums.Stat.PCT_MELEE_RES,
    "pods": enums.Stat.PODS,
}

if __name__ == "__main__":
    print("Resetting database")
    base.Base.metadata.reflect(base.engine)
    base.Base.metadata.drop_all(base.engine)
    base.Base.metadata.create_all(base.engine)

    item_types = {}

    print("Adding item types to database")
    with open(os.path.join(dirname, "app/database/data/item_types.json"), "r") as file:
        data = json.load(file)
        for record in data:
            item_type = ModelItemType(name=record["en-US"])
            db.session.add(item_type)
            item_types[record["en-US"]] = item_type

    print("Adding item slots to database")
    with open(os.path.join(dirname, "app/database/data/item_slots.json"), "r") as file:
        data = json.load(file)
        for record in data:
            for _ in range(record.get("quantity", 1)):
                item_slot = ModelItemSlot(
                    name=record["name"]["en-US"],
                    item_types=[
                        item_types[item_type_name] for item_type_name in record["types"]
                    ],
                )
                db.session.add(item_slot)

    db.session.commit()

    print("Adding sets to database")
    with open(os.path.join(dirname, "app/database/data/sets.json"), "r") as file:
        data = json.load(file)
        for record in data:
            set_obj = ModelSet(dofus_db_id=record["id"])
            db.session.add(set_obj)

            for locale in record["name"]:
                set_translation = ModelSetTranslation(
                    set_id=set_obj.uuid, locale=locale, name=record["name"][locale]
                )
                db.session.add(set_translation)
                set_obj.set_translation.append(set_translation)

            for num_items in record["bonuses"]:
                bonuses = record["bonuses"][num_items]
                for bonus in bonuses:
                    bonus_obj = ModelSetBonus(
                        set_id=set_obj.uuid, num_items=int(num_items),
                    )
                    if bonus["stat"]:
                        bonus_obj.stat = to_stat_enum[bonus["stat"]]
                        bonus_obj.value = bonus["value"]
                    else:
                        bonus_obj.alt_stat = bonus["altStat"]
                    db.session.add(bonus_obj)
                    set_obj.bonuses.append(bonus_obj)

        db.session.commit()

    print("Adding items to database")
    with open(os.path.join(dirname, "app/database/data/items.json"), "r") as file:
        data = json.load(file)
        for record in data:
            if record["itemType"] == "Living object":
                continue

            item = ModelItem(
                dofus_db_id=record["dofusID"],
                item_type=item_types[record["itemType"]],
                level=record["level"],
                image_url=record["imageUrl"],
            )

            conditions = {
                "conditions": record["conditions"]["conditions"],
                "customConditions": record["conditions"]["custom_conditions"],
            }
            item.conditions = conditions

            for locale in record["name"]:
                item_translations = ModelItemTranslation(
                    item_id=item.uuid, locale=locale, name=record["name"][locale],
                )
                db.session.add(item_translations)
                item.item_translations.append(item_translations)

            # Currently, stats that aren't in the Stat enum will cause a KeyError
            try:
                for stat in record["stats"]:
                    item_stat = ModelItemStat(
                        stat=to_stat_enum[stat["stat"]],
                        min_value=stat["minStat"],
                        max_value=stat["maxStat"],
                    )
                    db.session.add(item_stat)
                    item.stats.append(item_stat)

                db.session.add(item)

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
