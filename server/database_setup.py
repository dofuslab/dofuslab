from app import db
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_type import ModelItemType
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
from app.database import base, enums
from sqlalchemy.schema import MetaData
from worker import redis_connection
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

to_effect_enum = {
    "Neutral damage": enums.WeaponEffectType.NEUTRAL_DAMAGE,
    "Earth damage": enums.WeaponEffectType.EARTH_DAMAGE,
    "Fire damage": enums.WeaponEffectType.FIRE_DAMAGE,
    "Water damage": enums.WeaponEffectType.WATER_DAMAGE,
    "Air damage": enums.WeaponEffectType.AIR_DAMAGE,
    "Neutral steal": enums.WeaponEffectType.NEUTRAL_STEAL,
    "Earth steal": enums.WeaponEffectType.EARTH_STEAL,
    "Fire steal": enums.WeaponEffectType.FIRE_STEAL,
    "Water steal": enums.WeaponEffectType.WATER_STEAL,
    "Air steal": enums.WeaponEffectType.AIR_STEAL,
    "AP": enums.WeaponEffectType.AP,
    "MP": enums.WeaponEffectType.MP,
    "HP restored": enums.WeaponEffectType.HP_RESTORED,
}

to_spell_enum = {
    "Neutral damage": enums.SpellEffectType.NEUTRAL_DAMAGE,
    "Earth damage": enums.SpellEffectType.EARTH_DAMAGE,
    "Fire damage": enums.SpellEffectType.FIRE_DAMAGE,
    "Water damage": enums.SpellEffectType.WATER_DAMAGE,
    "Air damage": enums.SpellEffectType.AIR_DAMAGE,
    "Neutral steal": enums.SpellEffectType.NEUTRAL_STEAL,
    "Earth steal": enums.SpellEffectType.EARTH_STEAL,
    "Fire steal": enums.SpellEffectType.FIRE_STEAL,
    "Water steal": enums.SpellEffectType.WATER_STEAL,
    "Air steal": enums.SpellEffectType.AIR_STEAL,
    "HP restored": enums.SpellEffectType.HP_RESTORED,
    "Shield": enums.SpellEffectType.SHIELD,
    "Pushback damage": enums.SpellEffectType.PUSHBACK_DAMAGE,
}

if __name__ == "__main__":
    # print("Resetting database")
    # base.Base.metadata.reflect(base.engine)
    # base.Base.metadata.drop_all(base.engine)
    # base.Base.metadata.create_all(base.engine)
    # redis_connection.flushall()

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
        i = 0
        for record in data:
            for _ in range(record.get("quantity", 1)):
                item_slot = ModelItemSlot(
                    name=record["name"]["en-US"],
                    item_types=[
                        item_types[item_type_name] for item_type_name in record["types"]
                    ],
                    order=i,
                )
                db.session.add(item_slot)
                i = i + 1

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
                        for locale in bonus["altStat"]:
                            for custom_bonus in bonus["altStat"][locale]:
                                bonus_translation = ModelSetBonusTranslation(
                                    set_bonus_id=bonus_obj.uuid,
                                    locale=locale,
                                    custom_stat=custom_bonus,
                                )
                                db.session.add(bonus_translation)
                                bonus_obj.set_bonus_translation.append(
                                    bonus_translation
                                )

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
            db.session.add(item)

            conditions = {
                "conditions": record["conditions"].get("conditions", None),
                "customConditions": record["conditions"].get("customConditions", None),
            }
            item.conditions = conditions

            for locale in record["name"]:
                if record["name"][locale] == None:
                    continue
                item_translations = ModelItemTranslation(
                    locale=locale, name=record["name"][locale],
                )
                db.session.add(item_translations)
                item.item_translations.append(item_translations)

            try:
                i = 0
                for stat in record.get("stats", []):
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
                if record.get("setID", None):
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

    print("Adding weapons to database")
    with open(os.path.join(dirname, "app/database/data/weapons.json"), "r") as file:
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

            weapon_stat = ModelWeaponStat(
                ap_cost=record["weaponStats"]["apCost"],
                uses_per_turn=record["weaponStats"]["usesPerTurn"],
                min_range=record["weaponStats"]["minRange"],
                max_range=record["weaponStats"]["maxRange"],
            )

            if record["weaponStats"]["baseCritChance"] > 0:
                weapon_stat.base_crit_chance = (
                    record["weaponStats"]["baseCritChance"],
                )
                weapon_stat.crit_bonus_damage = (
                    record["weaponStats"]["critBonusDamage"],
                )

            for effect in record["weaponStats"]["weapon_effects"]:
                weapon_effects = ModelWeaponEffect(
                    effect_type=to_effect_enum[effect["stat"]],
                    min_damage=effect["minStat"],
                    max_damage=effect["maxStat"],
                )
                weapon_stat.weapon_effects.append(weapon_effects)

            item.weapon_stats = weapon_stat

        db.session.commit()

    print("Adding pets to database")
    with open(os.path.join(dirname, "app/database/data/pets.json"), "r") as file:
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
    #
    print("Adding mounts to database")
    with open(os.path.join(dirname, "app/database/data/mounts.json"), "r") as file:
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

    with open(os.path.join(dirname, "app/database/data/rhineetles.json"), "r") as file:
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

    print("Adding classes to database")
    with open(os.path.join(dirname, "app/database/data/spells.json"), "r") as file:
        data = json.load(file)
        for record in data:
            class_object = ModelClass()

            for locale in record["names"]:
                class_translation = ModelClassTranslation(
                    class_id=class_object.uuid,
                    locale=locale,
                    name=record["names"][locale],
                )
                db.session.add(class_translation)
                class_object.name.append(class_translation)

            for spell_pair in record["spells"]:
                spell_pair_object = ModelSpellVariantPair(class_id=class_object.uuid)
                for spell in spell_pair:
                    spell_object = ModelSpell(
                        spell_variant_pair_id=spell_pair_object.uuid,
                        image_url=spell["imageUrl"],
                    )
                    for locale in spell["name"]:
                        spell_translation = ModelSpellTranslation(
                            spell_id=spell_object.uuid,
                            locale=locale,
                            name=spell["name"][locale],
                            description=spell["description"][locale],
                        )
                        db.session.add(spell_translation)
                        spell_object.spell_translation.append(spell_translation)

                    for level in spell["effects"]:
                        spell_stat = ModelSpellStats(
                            level=level["level"],
                            ap_cost=level["apCost"],
                            cooldown=level["cooldown"],
                            base_crit_chance=level["baseCritRate"],
                            casts_per_turn=level["castsPerTurn"],
                            casts_per_target=level["castsPerPlayer"],
                            needs_los=level["needLos"],
                            has_modifiable_range=level["modifiableRange"],
                            is_linear=level["isLinear"],
                            needs_free_cell=level["needsFreeCell"],
                            min_range=level["spellRange"]["minRange"],
                            max_range=level["spellRange"]["maxRange"],
                        )

                        if level["aoeType"]:
                            for locale in level["aoeType"]:
                                spell_stat_translation = ModelSpellStatTranslation(
                                    spell_stat_id=spell_stat.uuid,
                                    locale=locale,
                                    aoe_type=level["aoeType"][locale],
                                )
                                db.session.add(spell_stat_translation)
                                spell_stat.spell_stat_translation.append(
                                    spell_stat_translation
                                )

                        for i in range(len(level["normalEffects"]["modifiableEffect"])):
                            spell_effect = ModelSpellEffect(
                                spell_stat_id=spell_stat.uuid,
                                effect_type=to_spell_enum[
                                    level["normalEffects"]["modifiableEffect"][i][
                                        "stat"
                                    ]
                                ],
                                min_damage=level["normalEffects"]["modifiableEffect"][
                                    i
                                ]["minStat"],
                                max_damage=level["normalEffects"]["modifiableEffect"][
                                    i
                                ]["maxStat"],
                            )

                            if level["criticalEffects"].get("modifiableEffect", None):
                                spell_effect.crit_min_damage = level["criticalEffects"][
                                    "modifiableEffect"
                                ][i]["minStat"]
                                spell_effect.crit_max_damage = level["criticalEffects"][
                                    "modifiableEffect"
                                ][i]["maxStat"]

                            db.session.add(spell_effect)
                            spell_stat.spell_effects.append(spell_effect)

                        db.session.add(spell_stat)
                        spell_object.spell_stats.append(spell_stat)

                    db.session.add(spell_object)
                    spell_pair_object.spells.append(spell_object)

                db.session.add(spell_pair_object)
                class_object.spell_variant_pairs.append(spell_pair_object)

        db.session.commit()
