from app import db, cache_region
from collections import defaultdict
from promise import Promise
from promise.dataloader import DataLoader
from sqlalchemy.orm import joinedload
from app.database.model_item import ModelItem
from app.database.model_buff import ModelBuff
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_type import ModelItemType
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_slot_translation import ModelItemSlotTranslation
from app.database.model_item_type_translation import ModelItemTypeTranslation
from app.database.model_set import ModelSet
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_weapon_stat import ModelWeaponStat
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_custom_set_tag_association import ModelCustomSetTagAssociation
from app.database.model_custom_set_tag_translation import ModelCustomSetTagTranslation
from app.database.model_equipped_item import ModelEquippedItem
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_effect import ModelSpellEffect
from app.database.model_spell import ModelSpell
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_damage_increase import ModelSpellDamageIncrease
from app.database.model_spell_effect_condition_translation import (
    ModelSpellEffectConditionTranslation,
)
from flask_babel import get_locale
from sqlalchemy.dialects.postgresql import JSONB, TEXT
from sqlalchemy.sql import cast


class EligibleItemSlotLoader(DataLoader):
    def batch_load_fn(self, item_type_ids):
        item_slots_by_item_type_id = defaultdict(list)
        for item_type in (
            db.session.query(ModelItemType)
            .join(ModelItemType.eligible_item_slots)
            .filter(ModelItemType.uuid.in_(item_type_ids))
            .options(joinedload(ModelItemType.eligible_item_slots))
        ):
            for item_slot in item_type.eligible_item_slots:
                item_slots_by_item_type_id[item_type.uuid].append(item_slot)
        return Promise.resolve(
            [
                item_slots_by_item_type_id.get(item_type_id, [])
                for item_type_id in item_type_ids
            ]
        )


class SpellEffectConditionTranslationLoader(DataLoader):
    def batch_load_fn(self, spell_effect_ids):
        locale = str(get_locale())
        translation_by_spell_effect_id = {}
        for translation in (
            db.session.query(ModelSpellEffectConditionTranslation)
            .filter(
                ModelSpellEffectConditionTranslation.spell_effect_id.in_(
                    spell_effect_ids
                )
            )
            .filter_by(locale=locale)
        ):
            translation_by_spell_effect_id[
                translation.spell_effect_id
            ] = translation.condition
        return Promise.resolve(
            [
                translation_by_spell_effect_id.get(spell_effect_condition_id, None)
                for spell_effect_condition_id in spell_effect_ids
            ]
        )


class SpellDamageIncreaseLoader(DataLoader):
    def batch_load_fn(self, spell_stat_ids):
        damage_increase_by_spell_stat_id = {}
        for damage_increase in db.session.query(ModelSpellDamageIncrease).filter(
            ModelSpellDamageIncrease.spell_stat_id.in_(spell_stat_ids)
        ):
            damage_increase_by_spell_stat_id[
                damage_increase.spell_stat_id
            ] = damage_increase
        return Promise.resolve(
            [
                damage_increase_by_spell_stat_id.get(spell_stat_id, None)
                for spell_stat_id in spell_stat_ids
            ]
        )


class SpellLoader(DataLoader):
    def batch_load_fn(self, spell_variant_pair_ids):
        spells_by_spell_variant_pair_id = defaultdict(list)

        for spell in (
            db.session.query(ModelSpell)
            .join(ModelSpell.spell_variant_pair)
            .filter(ModelSpellVariantPair.uuid.in_(spell_variant_pair_ids))
            .options(joinedload(ModelSpell.spell_variant_pair))
        ):
            spells_by_spell_variant_pair_id[spell.spell_variant_pair_id].append(spell)

        return Promise.resolve(
            [
                spells_by_spell_variant_pair_id.get(spell_variant_pair_id, [])
                for spell_variant_pair_id in spell_variant_pair_ids
            ]
        )


def load_spell_translations(spell_ids, get_description):
    locale = str(get_locale())
    translations_by_spell_id = {}
    for translation in db.session.query(ModelSpellTranslation).filter(
        ModelSpellTranslation.spell_id.in_(spell_ids),
        ModelSpellTranslation.locale == locale,
    ):
        translations_by_spell_id[translation.spell_id] = (
            translation.description if get_description else translation.name
        )

    return Promise.resolve(
        [translations_by_spell_id.get(spell_id, None) for spell_id in spell_ids]
    )


class SpellNameLoader(DataLoader):
    def batch_load_fn(self, spell_ids):
        return load_spell_translations(spell_ids, False)


class SpellDescriptionLoader(DataLoader):
    def batch_load_fn(self, spell_ids):
        return load_spell_translations(spell_ids, True)


class SpellVariantPairLoader(DataLoader):
    def batch_load_fn(self, class_ids):
        spell_variant_pairs_by_class_id = defaultdict(list)
        for spell_variant_pair in (
            db.session.query(ModelSpellVariantPair)
            .join(ModelSpellVariantPair.spells)
            .join(ModelSpell.spell_stats)
            .join(ModelSpell.spell_translation)
            .filter(ModelSpellVariantPair.class_id.in_(class_ids))
            .options(
                joinedload(ModelSpellVariantPair.spells).options(
                    joinedload(ModelSpell.spell_stats),
                    joinedload(ModelSpell.spell_translation),
                )
            )
        ):
            spell_variant_pairs_by_class_id[spell_variant_pair.class_id].append(
                spell_variant_pair
            )
        return Promise.resolve(
            [
                spell_variant_pairs_by_class_id.get(class_id, [])
                for class_id in class_ids
            ]
        )


class SpellEffectLoader(DataLoader):
    def batch_load_fn(self, spell_stats_ids):
        spell_effects_by_spell_stats_id = defaultdict(list)
        for spell_effect in (
            db.session.query(ModelSpellEffect)
            .join(ModelSpellEffect.spell_stats)
            .filter(ModelSpellStats.uuid.in_(spell_stats_ids))
            .options(joinedload(ModelSpellEffect.spell_stats))
        ):
            spell_effects_by_spell_stats_id[spell_effect.spell_stat_id].append(
                spell_effect
            )
        return Promise.resolve(
            [
                spell_effects_by_spell_stats_id.get(spell_stat_id, [])
                for spell_stat_id in spell_stats_ids
            ]
        )


def load_item_slots_from_equipped_items(equipped_item_ids):
    item_slot_by_equipped_item_id = {}

    for equipped_item in (
        db.session.query(ModelEquippedItem)
        .join(ModelEquippedItem.slot)
        .filter(ModelEquippedItem.uuid.in_(equipped_item_ids))
        .options(joinedload(ModelEquippedItem.slot))
    ):
        item_slot_by_equipped_item_id[equipped_item.uuid] = equipped_item.slot

    return Promise.resolve(
        [
            item_slot_by_equipped_item_id.get(equipped_item_id, None)
            for equipped_item_id in equipped_item_ids
        ]
    )


class EquippedItemToItemSlotLoader(DataLoader):
    def batch_load_fn(self, equipped_item_ids):
        return load_item_slots_from_equipped_items(equipped_item_ids)


def load_items_from_equipped_items(equipped_item_ids):
    item_by_equipped_item_id = {}

    for equipped_item in (
        db.session.query(ModelEquippedItem)
        .join(ModelEquippedItem.item)
        .filter(ModelEquippedItem.uuid.in_(equipped_item_ids))
        .options(joinedload(ModelEquippedItem.item))
    ):
        item_by_equipped_item_id[equipped_item.uuid] = equipped_item.item

    import logging

    logging.info(
        f"item_by_equipped_item_id: {item_by_equipped_item_id}; equipped_item_ids: {equipped_item_ids}"
    )

    return Promise.resolve(
        [
            item_by_equipped_item_id.get(equipped_item_id, None)
            for equipped_item_id in equipped_item_ids
        ]
    )


class EquippedItemToItemLoader(DataLoader):
    def batch_load_fn(self, equipped_item_ids):
        return load_items_from_equipped_items(equipped_item_ids)


def load_equipped_items_from_custom_sets(custom_set_ids):
    equipped_items_by_custom_set_id = defaultdict(list)
    for equipped_item in db.session.query(ModelEquippedItem).filter(
        ModelEquippedItem.custom_set_id.in_(custom_set_ids)
    ):
        equipped_items_by_custom_set_id[equipped_item.custom_set_id].append(
            equipped_item
        )
    return Promise.resolve(
        [
            equipped_items_by_custom_set_id.get(custom_set_id, [])
            for custom_set_id in custom_set_ids
        ]
    )


class EquippedItemLoader(DataLoader):
    def batch_load_fn(self, custom_set_ids):
        return load_equipped_items_from_custom_sets(custom_set_ids)


def load_exos_from_equipped_items(equipped_item_ids):
    exos_by_equipped_item_id = defaultdict(list)
    for exo in db.session.query(ModelEquippedItemExo).filter(
        ModelEquippedItemExo.equipped_item_id.in_(equipped_item_ids)
    ):
        exos_by_equipped_item_id[exo.equipped_item_id].append(exo)
    return Promise.resolve(
        [
            exos_by_equipped_item_id.get(equipped_item_id, [])
            for equipped_item_id in equipped_item_ids
        ]
    )


class ExoLoader(DataLoader):
    def batch_load_fn(self, equipped_item_ids):
        return load_exos_from_equipped_items(equipped_item_ids)


def load_items_from_sets(set_ids):
    id_order = {str(v): k for k, v in enumerate(set_ids)}
    result = [
        list(item_set.items)
        for item_set in db.session.query(ModelSet)
        .join(ModelSet.items)
        .filter(ModelSet.uuid.in_(set_ids))
        .options(joinedload(ModelSet.items))
        .order_by(cast(id_order, JSONB)[cast(ModelSet.uuid, TEXT)])
        .all()
    ]

    return Promise.resolve(result)


class SetToItemLoader(DataLoader):
    def batch_load_fn(self, set_ids):
        return load_items_from_sets(set_ids)


def load_item_types_from_items(item_ids):
    id_order = {str(v): k for k, v in enumerate(item_ids)}
    return Promise.resolve(
        [
            item.item_type
            for item in db.session.query(ModelItem)
            .join(ModelItem.item_type)
            .join(ModelItemType.eligible_item_slots)
            .filter(ModelItem.uuid.in_(item_ids))
            .options(
                joinedload(ModelItem.item_type).options(
                    joinedload(ModelItemType.eligible_item_slots)
                )
            )
            .order_by(cast(id_order, JSONB)[cast(ModelItem.uuid, TEXT)])
            .all()
        ]
    )


class ItemToItemTypeLoader(DataLoader):
    def batch_load_fn(self, item_ids):
        return load_item_types_from_items(item_ids)


def load_item_types_from_item_slots(item_slot_ids):
    item_types_by_slot_id = defaultdict(list)
    for item_type in (
        db.session.query(ModelItemType)
        .join(ModelItemType.eligible_item_slots)
        .filter(ModelItemSlot.uuid.in_(item_slot_ids))
        .options(joinedload(ModelItemType.eligible_item_slots))
    ):
        for slot in item_type.eligible_item_slots:
            if slot.uuid in item_slot_ids:
                item_types_by_slot_id[slot.uuid].append(item_type)
    return Promise.resolve(
        [item_types_by_slot_id.get(item_slot_id, []) for item_slot_id in item_slot_ids]
    )


class ItemSlotToItemTypeLoader(DataLoader):
    def batch_load_fn(self, item_slot_ids):
        return load_item_types_from_item_slots(item_slot_ids)


def load_all_class_translations(class_ids):
    translation_by_class_id = defaultdict(list)
    for translation in db.session.query(ModelClassTranslation).filter(
        ModelClassTranslation.class_id.in_(class_ids)
    ):
        translation_by_class_id[translation.class_id].append(translation.name)
    return Promise.resolve(
        [translation_by_class_id.get(class_id, None) for class_id in class_ids]
    )


class AllClassTranslationLoader(DataLoader):
    def batch_load_fn(self, class_ids):
        return load_all_class_translations(class_ids)


def load_class_translations(class_ids, locale=None):
    translation_by_class_id = {}
    for translation in (
        db.session.query(ModelClassTranslation)
        .filter(ModelClassTranslation.class_id.in_(class_ids))
        .filter_by(locale=locale or str(get_locale()))
    ):
        translation_by_class_id[translation.class_id] = translation.name
    return Promise.resolve(
        [translation_by_class_id.get(class_id, None) for class_id in class_ids]
    )


class EnClassTranslationLoader(DataLoader):
    def batch_load_fn(self, item_slot_ids):
        return load_class_translations(item_slot_ids, "en")


class ClassTranslationLoader(DataLoader):
    def batch_load_fn(self, item_slot_ids):
        return load_class_translations(item_slot_ids)


def load_item_slot_translations(item_slot_ids, locale=None):
    translation_by_slot_id = defaultdict(list)
    for translation in (
        db.session.query(ModelItemSlotTranslation)
        .filter(ModelItemSlotTranslation.item_slot_id.in_(item_slot_ids))
        .filter_by(locale=locale or str(get_locale()))
    ):
        translation_by_slot_id[translation.item_slot_id] = translation.name
    return Promise.resolve(
        [
            translation_by_slot_id.get(item_slot_id, None)
            for item_slot_id in item_slot_ids
        ]
    )


class EnItemSlotTranslationLoader(DataLoader):
    def batch_load_fn(self, item_slot_ids):
        return load_item_slot_translations(item_slot_ids, "en")


class ItemSlotTranslationLoader(DataLoader):
    def batch_load_fn(self, item_slot_ids):
        return load_item_slot_translations(item_slot_ids)


def load_item_type_translations(item_type_ids, locale=None):
    translation_by_stat_id = defaultdict(list)
    for translation in (
        db.session.query(ModelItemTypeTranslation)
        .filter(ModelItemTypeTranslation.item_type_id.in_(item_type_ids))
        .filter_by(locale=locale or str(get_locale()))
    ):
        translation_by_stat_id[translation.item_type_id] = translation.name
    return Promise.resolve(
        [
            translation_by_stat_id.get(item_type_id, None)
            for item_type_id in item_type_ids
        ]
    )


class EnItemTypeTranslationLoader(DataLoader):
    def batch_load_fn(self, item_type_ids):
        return load_item_type_translations(item_type_ids, "en")


class ItemTypeTranslationLoader(DataLoader):
    def batch_load_fn(self, item_type_ids):
        return load_item_type_translations(item_type_ids)


# @cache_region.cache_on_arguments()
def load_item_stats(item_ids):
    stats_by_item_id = defaultdict(list)
    for stats_list in db.session.query(ModelItemStat).filter(
        ModelItemStat.item_id.in_(item_ids)
    ):
        stats_by_item_id[stats_list.item_id].append(stats_list)
    return Promise.resolve([stats_by_item_id.get(item_id, []) for item_id in item_ids])


class ItemStatsLoader(DataLoader):
    def batch_load_fn(self, item_ids):
        return load_item_stats(item_ids)


# @cache_region.cache_on_arguments()
def load_item_stat_translations(item_stat_ids):
    locale = str(get_locale())
    translation_by_stat_id = defaultdict(list)
    for translation in (
        db.session.query(ModelItemStatTranslation)
        .filter(ModelItemStatTranslation.item_stat_id.in_(item_stat_ids))
        .filter_by(locale=locale)
    ):
        translation_by_stat_id[translation.item_stat_id] = translation.custom_stat
    return Promise.resolve(
        [
            translation_by_stat_id.get(item_stat_id, None)
            for item_stat_id in item_stat_ids
        ]
    )


class ItemStatTranslationLoader(DataLoader):
    def batch_load_fn(self, item_stat_ids):
        return load_item_stat_translations(item_stat_ids)


# @cache_region.cache_on_arguments()
def load_item_names(item_ids):
    locale = str(get_locale())
    name_by_item_id = {}
    for translation in (
        db.session.query(ModelItemTranslation)
        .filter(ModelItemTranslation.item_id.in_(item_ids))
        .filter_by(locale=locale)
    ):
        name_by_item_id[translation.item_id] = translation.name
    return Promise.resolve([name_by_item_id.get(item_id, []) for item_id in item_ids])


class ItemNameLoader(DataLoader):
    def batch_load_fn(self, item_ids):
        return load_item_names(item_ids)


# @cache_region.cache_on_arguments()
def load_sets(set_ids):
    sets = {
        item_set.uuid: item_set
        for item_set in db.session.query(ModelSet).filter(ModelSet.uuid.in_(set_ids))
    }
    return Promise.resolve([sets.get(set_id) for set_id in set_ids])


class SetLoader(DataLoader):
    def batch_load_fn(self, set_ids):
        return load_sets(set_ids)


# @cache_region.cache_on_arguments()
def load_set_bonuses(set_ids):
    bonuses_by_set_id = defaultdict(list)
    for bonus in db.session.query(ModelSetBonus).filter(
        ModelSetBonus.set_id.in_(set_ids)
    ):
        bonuses_by_set_id[bonus.set_id].append(bonus)
    return Promise.resolve([bonuses_by_set_id.get(set_id, []) for set_id in set_ids])


class SetBonusLoader(DataLoader):
    def batch_load_fn(self, set_ids):
        return load_set_bonuses(set_ids)


# @cache_region.cache_on_arguments()
def load_set_bonus_translations(set_bonus_ids):
    locale = str(get_locale())
    translation_by_bonus_id = {}
    for translation in (
        db.session.query(ModelSetBonusTranslation)
        .filter(ModelSetBonusTranslation.set_bonus_id.in_(set_bonus_ids))
        .filter_by(locale=locale)
    ):
        translation_by_bonus_id[translation.set_bonus_id] = translation.custom_stat
    return Promise.resolve(
        [
            translation_by_bonus_id.get(set_bonus_id, None)
            for set_bonus_id in set_bonus_ids
        ]
    )


class SetBonusTranslationLoader(DataLoader):
    def batch_load_fn(self, set_bonus_ids):
        return load_set_bonus_translations(set_bonus_ids)


# @cache_region.cache_on_arguments()
def load_set_translations(set_ids):
    locale = str(get_locale())
    translation_by_set_id = {}
    for translation in (
        db.session.query(ModelSetTranslation)
        .filter(ModelSetTranslation.set_id.in_(set_ids))
        .filter_by(locale=locale)
    ):
        translation_by_set_id[translation.set_id] = translation.name
    return Promise.resolve(
        [translation_by_set_id.get(set_id, None) for set_id in set_ids]
    )


class SetTranslationLoader(DataLoader):
    def batch_load_fn(self, set_ids):
        return load_set_translations(set_ids)


# @cache_region.cache_on_arguments()
def load_weapon_stats(item_ids):
    weapon_stat_by_item_id = {}
    for stat in db.session.query(ModelWeaponStat).filter(
        ModelWeaponStat.item_id.in_(item_ids)
    ):
        weapon_stat_by_item_id[stat.item_id] = stat
    return Promise.resolve(
        [weapon_stat_by_item_id.get(item_id, None) for item_id in item_ids]
    )


class WeaponStatLoader(DataLoader):
    def batch_load_fn(self, item_ids):
        return load_weapon_stats(item_ids)


# @cache_region.cache_on_arguments()
def load_weapon_effects(weapon_stat_ids):
    effect_by_stat_id = defaultdict(list)
    for effect in db.session.query(ModelWeaponEffect).filter(
        ModelWeaponEffect.weapon_stat_id.in_(weapon_stat_ids)
    ):
        effect_by_stat_id[effect.weapon_stat_id].append(effect)
    return Promise.resolve(
        [
            effect_by_stat_id.get(weapon_stat_id, [])
            for weapon_stat_id in weapon_stat_ids
        ]
    )


class WeaponEffectLoader(DataLoader):
    def batch_load_fn(self, weapon_stat_ids):
        return load_weapon_effects(weapon_stat_ids)


def load_spell_buffs(spell_buff_ids):
    buff_by_spell_id = defaultdict(list)
    for buff in db.session.query(ModelBuff).filter(
        ModelBuff.spell_stat_id.in_(spell_buff_ids)
    ):
        buff_by_spell_id[buff.spell_stat_id].append(buff)

    return Promise.resolve(
        [buff_by_spell_id.get(spell_buff_id, []) for spell_buff_id in spell_buff_ids]
    )


class SpellBuffLoader(DataLoader):
    def batch_load_fn(self, spell_buff_ids):
        return load_spell_buffs(spell_buff_ids)


def load_item_buffs(item_buff_ids):
    buff_by_item_id = defaultdict(list)
    for buff in db.session.query(ModelBuff).filter(
        ModelBuff.item_id.in_(item_buff_ids)
    ):
        buff_by_item_id[buff.item_id].append(buff)

    return Promise.resolve(
        [buff_by_item_id.get(item_buff_id, []) for item_buff_id in item_buff_ids]
    )


class ItemBuffLoader(DataLoader):
    def batch_load_fn(self, item_buff_ids):
        return load_item_buffs(item_buff_ids)


def load_custom_set_tag_associations(custom_set_ids):
    tags_by_custom_set_id = defaultdict(list)
    for tag_association in db.session.query(ModelCustomSetTagAssociation).filter(
        ModelCustomSetTagAssociation.custom_set_id.in_(custom_set_ids)
    ):
        tags_by_custom_set_id[tag_association.custom_set_id].append(tag_association)
    return Promise.resolve(
        [
            tags_by_custom_set_id.get(custom_set_id, [])
            for custom_set_id in custom_set_ids
        ]
    )


class CustomSetTagAssociationLoader(DataLoader):
    def batch_load_fn(self, custom_set_ids):
        return load_custom_set_tag_associations(custom_set_ids)


def load_custom_set_tag_translations(tag_ids):
    locale = str(get_locale())
    translation_by_tag_id = {}
    for translation in (
        db.session.query(ModelCustomSetTagTranslation)
        .filter(ModelCustomSetTagTranslation.custom_set_tag_id.in_(tag_ids))
        .filter_by(locale=locale)
    ):
        translation_by_tag_id[translation.custom_set_tag_id] = translation.name
    return Promise.resolve(
        [
            translation_by_tag_id.get(custom_set_tag_id, None)
            for custom_set_tag_id in tag_ids
        ]
    )


class CustomSetTagTranslationLoader(DataLoader):
    def batch_load_fn(self, tag_ids):
        return load_custom_set_tag_translations(tag_ids)
