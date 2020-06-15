import json
import os
from app import session_scope
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_stat_translation import ModelSpellStatTranslation
from app.database.model_spell_effect import ModelSpellEffect
from app.database.model_spell_effect_condition_translation import (
    ModelSpellEffectConditionTranslation,
)
from app.database.model_spell_damage_increase import ModelSpellDamageIncrease
from app.database import enums

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

languages = ["en", "fr", "pt", "it", "es", "de"]

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
    "Best element damage": enums.SpellEffectType.BEST_ELEMENT_DAMAGE,
    "Best element steal": enums.SpellEffectType.BEST_ELEMENT_STEAL,
}


def create_spell_translations(db_session, record, spell):
    db_session.query(ModelSpellTranslation).filter_by(spell_id=spell.uuid).delete()
    for locale in languages:
        if record["name"][locale]:
            spell_translation = ModelSpellTranslation(
                spell_id=spell.uuid,
                locale=locale,
                name=record["name"][locale],
                description=record["description"][locale],
            )
            db_session.add(spell_translation)


def create_spell_effect(db_session, spell_stat, level, i, has_condition):
    effect_type = "conditionalEffect" if has_condition else "modifiableEffect"
    spell_effect = ModelSpellEffect(
        spell_stat_id=spell_stat.uuid,
        effect_type=to_spell_enum[level["normalEffects"][effect_type][i]["stat"]],
        min_damage=level["normalEffects"][effect_type][i].get("minStat", None),
        max_damage=level["normalEffects"][effect_type][i]["maxStat"],
        order=i if has_condition else None,
    )

    if level["criticalEffects"].get(effect_type, None):
        if i < len(level["criticalEffects"][effect_type]):
            spell_effect.crit_min_damage = level["criticalEffects"][effect_type][i][
                "minStat"
            ]
            spell_effect.crit_max_damage = level["criticalEffects"][effect_type][i][
                "maxStat"
            ]

    db_session.add(spell_effect)
    return spell_effect


def create_spell_stats(db_session, record, spell):
    db_session.query(ModelSpellStats).filter_by(spell_id=spell.uuid).delete()
    for level in record["effects"]:
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
            spell_id=spell.uuid,
        )
        db_session.add(spell_stat)
        db_session.flush()

        if level["aoeType"]:
            for locale in level["aoeType"]:
                spell_stat_translation = ModelSpellStatTranslation(
                    spell_stat_id=spell_stat.uuid,
                    locale=locale,
                    aoe_type=level["aoeType"][locale],
                )
                db_session.add(spell_stat_translation)

        for i in range(len(level["normalEffects"].get("modifiableEffect", []))):
            create_spell_effect(db_session, spell_stat, level, i, False)

        for i, effect in enumerate(level["normalEffects"].get("conditionalEffect", [])):
            spell_effect = create_spell_effect(db_session, spell_stat, level, i, True)
            db_session.flush()
            for locale, condition in effect["condition"].items():
                condition_translation = ModelSpellEffectConditionTranslation(
                    spell_effect_id=spell_effect.uuid,
                    locale=locale,
                    condition=condition,
                )
                db_session.add(condition_translation)

        damage_increase_max_stacks = level.get("damageIncreaseMaxStacks", None)
        if damage_increase_max_stacks:
            base_increase = level["normalEffects"]["damageIncrease"]
            critical_effects = level.get("criticalEffects", None)
            crit_base_increase = None
            if critical_effects:
                crit_base_increase = level["criticalEffects"]["damageIncrease"]
            spell_damage_increase = ModelSpellDamageIncrease(
                spell_stat_id=spell_stat.uuid,
                base_increase=base_increase,
                crit_base_increase=crit_base_increase,
                max_stacks=damage_increase_max_stacks,
            )
            db_session.add(spell_damage_increase)


def update_spell(db_session, spell_name, record):
    print(spell_name)
    translations = (
        db_session.query(ModelSpellTranslation)
        .filter(
            ModelSpellTranslation.locale == "en",
            ModelSpellTranslation.name == spell_name,
        )
        .all()
    )
    if len(translations) > 1:
        print("Error: Multiple spells with that name exist in the database")
    elif len(translations) == 1:
        print("Spell already exists in database. Updating spell...")
        spell = translations[0].spell
        spell.is_trap = record.get("isTrap", False)
        create_spell_translations(db_session, record, spell)
        print("Spell translations successfully updated")
        create_spell_stats(db_session, record, spell)
        print("Spell stats successfully updated")
    else:
        print("Error: Spell does not exist in database")


def sync_spell():
    print("Loading and processing file...")
    with open(os.path.join(app_root, "app/database/data/spells.json"), "r") as file:
        data = json.load(file)
        name_to_record_map = {}

        for r in data:
            class_name = r["names"]["en"]
            for pair in r["spells"]:
                for spell in pair:
                    name_to_record_map[spell["name"]["en"]] = spell

        should_prompt_spell = True
        while should_prompt_spell:
            response = input(
                "Enter spell name, e.g. 'Blindness' or multiple spell names separated "
                "by commas, type 'update all' to update all spells in file, or 'q' to quit: "
            )
            if response == "q":
                return
            with session_scope() as db_session:
                if response == "update all":
                    should_prompt_spell = False
                    for record in data:
                        update_spell(db_session, record["name"]["en"], record)
                else:
                    spell_names = response.split(",")
                    print(spell_names)
                    for name in spell_names:
                        spell_name = name.strip()
                        if spell_name in name_to_record_map:
                            record = name_to_record_map[spell_name]
                            update_spell(db_session, spell_name, record)


if __name__ == "__main__":
    sync_spell()
