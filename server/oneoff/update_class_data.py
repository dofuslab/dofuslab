import sys

sys.path.append("../")

from app import session_scope
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_class import ModelClass
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_spell import ModelSpell
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_stat_translation import ModelSpellStatTranslation
from app.database.model_spell_effect import ModelSpellEffect
from database_setup import to_spell_enum
import os
import json

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def update_sacrier_patch_2_55():
    with session_scope() as db_session:
        sacrier_id = (
            db_session.query(ModelClassTranslation)
            .filter_by(name="Sacrier", locale="en")
            .one()
            .class_id
        )

        # db_session.query(ModelSpellVariantPair).filter_by(class_id=sacrier_id).delete()

        with open(os.path.join(root_dir, "app/database/data/spells.json"), "r") as file:
            data = json.load(file)

            for dofus_class in data:
                if dofus_class["names"]["en"] != "Sacrier":
                    continue

                sacrier_record = (
                    db_session.query(ModelClass).filter_by(uuid=sacrier_id).one()
                )

                for spell_pair in dofus_class["spells"]:
                    spell_pair_object = ModelSpellVariantPair(class_id=sacrier_id)
                    for spell in spell_pair:
                        spell_object = ModelSpell(
                            spell_variant_pair_id=spell_pair_object.uuid,
                            image_url=spell["imageUrl"],
                            is_trap=spell.get("isTrap", False),
                        )
                        for locale in spell["name"]:
                            spell_translation = ModelSpellTranslation(
                                spell_id=spell_object.uuid,
                                locale=locale,
                                name=spell["name"][locale],
                                description=spell["description"][locale],
                            )
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

                                spell_stat.spell_effects.append(spell_effect)

                            spell_object.spell_stats.append(spell_stat)

                        spell_pair_object.spells.append(spell_object)

                    sacrier_record.spell_variant_pairs.append(spell_pair_object)


if __name__ == "__main__":
    update_sacrier_patch_2_55()
