from app import db, cache_region
from collections import defaultdict
from promise import Promise
from promise.dataloader import DataLoader
from app.database.model_buff import ModelBuff
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_set import ModelSet
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_weapon_stat import ModelWeaponStat
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_custom_set_tag import ModelCustomSetTag
from app.database.model_custom_set_tag_association import ModelCustomSetTagAssociation
from app.database.model_custom_set_tag_translation import ModelCustomSetTagTranslation
from flask_babel import get_locale


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


class AllItemNameLoader(DataLoader):
    def batch_load_fn(self, item_ids):
        return load_all_item_names(item_ids)


def load_all_item_names(item_ids):
    all_names_by_item_id = defaultdict(lambda: {})
    for translation in db.session.query(ModelItemTranslation).filter(
        ModelItemTranslation.item_id.in_(item_ids)
    ):
        all_names_by_item_id[translation.item_id][translation.locale] = translation.name
    return Promise.resolve(
        [all_names_by_item_id.get(item_id, {}) for item_id in item_ids]
    )


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
