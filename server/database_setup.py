from database.model_item import ModelItem
from database.model_item_stat import ModelItemStat
from database.model_item_slot import ModelItemSlot
from database.model_item_type import ModelItemType
from database.model_item_condition import ModelItemCondition
from database.model_set import ModelSet
from database.model_custom_set_stat import ModelCustomSetStat
from database.model_custom_set_exo import ModelCustomSetExo
from database.model_custom_set import ModelCustomSet
from database.model_user import ModelUser
from database import base, enums
from sqlalchemy.schema import MetaData
import sqlalchemy
import json
import sys

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
}

if __name__ == "__main__":
    print("Resetting database")
    base.Base.metadata.drop_all(base.engine)
    base.Base.metadata.create_all(base.engine)

    item_types = {}

    print("Adding item types to database")
    with open("database/data/item_types.json", "r") as file:
        data = json.load(file)
        for record in data:
            item_type = ModelItemType(name=record["en-US"])
            base.db_session.add(item_type)
            item_types[record["en-US"]] = item_type

    print("Adding item slots to database")
    with open("database/data/item_slots.json", "r") as file:
        data = json.load(file)
        for record in data:
            for _ in range(record.get("quantity", 1)):
                item_slot = ModelItemSlot(
                    name=record["name"]["en-US"],
                    item_types=[
                        item_types[item_type_name] for item_type_name in record["types"]
                    ],
                )
                base.db_session.add(item_slot)

    base.db_session.commit()

    print("Adding sets to database")
    with open("database/data/sets.json", "r") as file:
        data = json.load(file)
        for record in data:
            set = ModelSet(name=record["name"], bonuses=record["bonuses"])
            base.db_session.add(set)
        base.db_session.commit()

    print("Adding items to database")
    with open("database/data/items.json", "r") as file:
        data = json.load(file)
        for record in data:
            item = ModelItem(
                name=record["name"],
                item_type=item_types[record["itemType"]],
                level=record["level"],
                image_url=record["imageUrl"],
            )

            # Currently, stats that aren't in the Stat enum will cause a KeyError
            try:
                for stat in record["stats"]:
                    item_stat = ModelItemStat(
                        stat=to_stat_enum[stat["stat"]],
                        min_value=stat["minStat"],
                        max_value=stat["maxStat"],
                    )
                    base.db_session.add(item_stat)
                    item.stats.append(item_stat)

                for condition in record["conditions"]:
                    item_condition = ModelItemCondition(
                        stat_type=condition["statType"],
                        condition_type=condition["condition"],
                        limit=condition["limit"],
                    )
                    base.db_session.add(item_condition)
                    item.conditions.append(item_condition)

                base.db_session.add(item)

                # If this item belongs in a set, query the set and add the relationship to the record
                if record["set"]:
                    set = record["set"]
                    set_record = (
                        base.db_session.query(ModelSet)
                        .filter(ModelSet.name == set)
                        .first()
                    )
                    set_record.items.append(item)
                    base.db_session.merge(set_record)
            except KeyError as err:
                print("KeyError occurred:", err)

        base.db_session.commit()

    # print('Inserting user data in database')
    # with open('database/data/users.json', 'r') as file:
    #     data = literal_eval(file.read())
    #     for record in data:
    #         user = ModelUser(**record)
    #         base.db_session.add(user)
    #     base.db_session.commit()
