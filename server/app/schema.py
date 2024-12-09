from json.encoder import INFINITY
from math import inf
import random
from app import (
    db,
    supported_languages,
    q,
    session_scope,
    template_env,
    limiter,
    base_url,
    reset_password_salt,
)
from app.database.model_favorite_item import ModelFavoriteItem
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_type_translation import ModelItemTypeTranslation
from app.database.model_item_type import ModelItemType
from app.database.model_item_slot_translation import ModelItemSlotTranslation
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_weapon_stat import ModelWeaponStat
from app.database.model_buff import ModelBuff
from app.database.model_item import ModelItem
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.model_custom_set_tag import ModelCustomSetTag
from app.database.model_custom_set_tag_translation import ModelCustomSetTagTranslation
from app.database.model_custom_set_tag_association import ModelCustomSetTagAssociation
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_equipped_item import ModelEquippedItem
from app.database.model_custom_set import ModelCustomSet, MAX_NAME_LENGTH
from app.database.model_user import ModelUserAccount
from app.database.model_spell_effect import ModelSpellEffect
from app.database.model_spell_effect_condition_translation import (
    ModelSpellEffectConditionTranslation,
)
from app.database.model_spell_stat_translation import ModelSpellStatTranslation
from app.database.model_spell_damage_increase import ModelSpellDamageIncrease
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell import ModelSpell
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_user_setting import ModelUserSetting
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_class import ModelClass
from app.suggester.suggester import get_ordered_suggestions
from app.tasks import send_email
from app.utils import (
    get_or_create_custom_set,
    save_custom_sets,
    anonymous_or_verified,
    verified,
    check_owner,
    base_stat_list,
    scrolled_stat_list,
    edit_custom_set_stats,
    edit_custom_set_metadata,
    ALLOWED_PROFILE_PICTURE_URLS,
    DEFAULT_PROFILE_PICTURE_URLS,
)
from app.verify_email import verify_email_salt
from functools import reduce
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
from app.database.base import Base
from app.database.enums import (
    Stat,
    WeaponEffectType,
    SpellEffectType,
    WeaponElementMage,
    BuildGender,
)
from app.token_utils import decode_token, encode_token, generate_url
import app.mutation_validation_utils as validation
import graphene
import pytz
import uuid
from graphql import GraphQLError
from flask import session, render_template, g
from flask_babel import _, get_locale, refresh
from flask_login import login_required, login_user, current_user, logout_user
from functools import lru_cache
from sqlalchemy import func, distinct, or_, and_
from sqlalchemy.orm import aliased
from sqlalchemy.sql.expression import true
from datetime import datetime

# workaround from https://github.com/graphql-python/graphene-sqlalchemy/issues/211
# without this workaround, graphene complains that there are multiple
# types with the same name when using the same enum in different places
# i.e. AssertionError:
# Found different types with the same name in the schema: Stat, Stat.
graphene.Enum.from_enum = lru_cache(maxsize=None)(graphene.Enum.from_enum)


class GlobalNode(graphene.Interface):
    id = graphene.UUID(required=True)

    def resolve_id(self, info):
        return self.uuid


# https://github.com/graphql-python/graphene/issues/968#issuecomment-537328256
class NonNullConnection(relay.Connection, abstract=True):
    @classmethod
    def __init_subclass_with_meta__(cls, node, **kwargs):
        if not hasattr(cls, "Edge"):
            _node = node

            class EdgeBase(graphene.ObjectType, name=f"{node._meta.name}Edge"):
                cursor = graphene.String(required=True)
                node = graphene.Field(_node, required=True)

            setattr(cls, "Edge", EdgeBase)

        if not hasattr(cls, "edges"):
            setattr(
                cls, "edges", graphene.List(graphene.NonNull(cls.Edge), required=True)
            )

        super(NonNullConnection, cls).__init_subclass_with_meta__(node=_node, **kwargs)

    total_count = graphene.Int(required=True)

    def resolve_total_count(self, info, **kwargs):
        return len(self.iterable)


StatEnum = graphene.Enum.from_enum(Stat)
WeaponEffectEnum = graphene.Enum.from_enum(WeaponEffectType)
SpellEffectEnum = graphene.Enum.from_enum(SpellEffectType)
WeaponElementMageEnum = graphene.Enum.from_enum(WeaponElementMage)
BuildGenderEnum = graphene.Enum.from_enum(BuildGender)


class ItemStat(SQLAlchemyObjectType):
    custom_stat = graphene.String()

    def resolve_custom_stat(self, info):
        return g.dataloaders.get("item_stat_translation_loader").load(self.uuid)

    class Meta:
        model = ModelItemStat
        interfaces = (GlobalNode,)


class ItemSlot(SQLAlchemyObjectType):
    # https://github.com/graphql-python/graphene/issues/110
    item_types = graphene.NonNull(graphene.List(graphene.NonNull(lambda: ItemType)))
    name = graphene.String(required=True)

    def resolve_name(self, info):
        locale = str(get_locale())
        query = db.session.query(ModelItemSlotTranslation)
        return (
            query.filter(ModelItemSlotTranslation.locale == locale)
            .filter(ModelItemSlotTranslation.item_slot_id == self.uuid)
            .one()
            .name
        )

    en_name = graphene.String(required=True)

    def resolve_en_name(self, info):
        query = db.session.query(ModelItemSlotTranslation)
        return (
            query.filter(ModelItemSlotTranslation.locale == "en")
            .filter(ModelItemSlotTranslation.item_slot_id == self.uuid)
            .one()
            .name
        )

    class Meta:
        model = ModelItemSlot
        interfaces = (GlobalNode,)


class ItemType(SQLAlchemyObjectType):
    eligible_item_slots = graphene.NonNull(graphene.List(graphene.NonNull(ItemSlot)))
    name = graphene.String(required=True)
    en_name = graphene.String(required=True)

    def resolve_name(self, info):
        locale = str(get_locale())
        query = db.session.query(ModelItemTypeTranslation)
        return (
            query.filter(ModelItemTypeTranslation.locale == locale)
            .filter(ModelItemTypeTranslation.item_type_id == self.uuid)
            .one()
            .name
        )

    def resolve_en_name(self, info):
        query = db.session.query(ModelItemTypeTranslation)
        return (
            query.filter(ModelItemTypeTranslation.locale == "en")
            .filter(ModelItemTypeTranslation.item_type_id == self.uuid)
            .one()
            .name
        )

    class Meta:
        model = ModelItemType
        interfaces = (GlobalNode,)


class WeaponEffect(SQLAlchemyObjectType):
    class Meta:
        model = ModelWeaponEffect
        interfaces = (GlobalNode,)


class WeaponStat(SQLAlchemyObjectType):
    weapon_effects = graphene.NonNull(graphene.List(graphene.NonNull(WeaponEffect)))

    def resolve_weapon_effects(self, info):
        return g.dataloaders.get("weapon_effect_loader").load(self.uuid)

    class Meta:
        model = ModelWeaponStat
        interfaces = (GlobalNode,)


class Buff(SQLAlchemyObjectType):
    class Meta:
        model = ModelBuff
        interfaces = (GlobalNode,)


class Item(SQLAlchemyObjectType):
    stats = graphene.NonNull(graphene.List(graphene.NonNull(ItemStat)))

    def resolve_stats(self, info):
        return g.dataloaders.get("item_stats_loader").load(self.uuid)

    item_type = graphene.NonNull(ItemType)
    name = graphene.String(required=True)

    def resolve_name(self, info):
        return g.dataloaders.get("item_name_loader").load(self.uuid)

    # https://github.com/graphql-python/graphene/issues/110#issuecomment-366515268
    set = graphene.Field(lambda: Set)

    def resolve_set(self, info):
        if not self.set_id:
            return None
        return g.dataloaders.get("set_loader").load(self.set_id)

    weapon_stat = graphene.Field(lambda: WeaponStat)

    def resolve_weapon_stat(self, info):
        return g.dataloaders.get("weapon_stat_loader").load(self.uuid)

    buffs = graphene.List(graphene.NonNull(Buff))

    def resolve_buffs(self, info):
        # query = db.session.query(ModelBuff).filter(ModelBuff.item_id == self.uuid)
        # return query

        return g.dataloaders.get("item_buff_loader").load(self.uuid)

    class Meta:
        model = ModelItem
        interfaces = (GlobalNode,)


class ItemConnection(NonNullConnection):
    class Meta:
        node = Item


class SetBonus(SQLAlchemyObjectType):
    custom_stat = graphene.String()

    def resolve_custom_stat(self, info):
        return g.dataloaders.get("set_bonus_translation_loader").load(self.uuid)

    class Meta:
        model = ModelSetBonus
        interfaces = (GlobalNode,)


class Set(SQLAlchemyObjectType):
    items = graphene.NonNull(graphene.List(graphene.NonNull(Item)))
    bonuses = graphene.NonNull(graphene.List(graphene.NonNull(SetBonus)))

    def resolve_bonuses(self, info):
        return g.dataloaders.get("set_bonus_loader").load(self.uuid)

    name = graphene.String(required=True)

    def resolve_name(self, info):
        return g.dataloaders.get("set_translation_loader").load(self.uuid)

    class Meta:
        model = ModelSet
        interfaces = (GlobalNode,)


class SetConnection(NonNullConnection):
    class Meta:
        node = Set


class EquippedItemExo(SQLAlchemyObjectType):
    class Meta:
        model = ModelEquippedItemExo
        interfaces = (GlobalNode,)


class EquippedItem(SQLAlchemyObjectType):
    item = graphene.NonNull(Item)
    slot = graphene.NonNull(ItemSlot)
    exos = graphene.NonNull(graphene.List(graphene.NonNull(EquippedItemExo)))

    class Meta:
        model = ModelEquippedItem
        interfaces = (GlobalNode,)
        only_fields = ("id", "item", "slot", "exos", "weapon_element_mage")


class CustomSetStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSetStat
        interfaces = (GlobalNode,)


class CustomSetTag(SQLAlchemyObjectType):
    name = graphene.String(required=True)
    image_url = graphene.String(required=True)

    def resolve_name(self, info):
        return g.dataloaders.get("custom_set_tag_translation_loader").load(self.uuid)

    class Meta:
        model = ModelCustomSetTag
        interfaces = (GlobalNode,)


class CustomSetTagAssociation(SQLAlchemyObjectType):
    id = graphene.String(required=True)
    custom_set_tag = graphene.NonNull(CustomSetTag)

    def resolve_id(self, info):
        return "{}:{}".format(self.custom_set_id, self.custom_set_tag_id)

    class Meta:
        model = ModelCustomSetTagAssociation


class CustomSet(SQLAlchemyObjectType):
    equipped_items = graphene.NonNull(graphene.List(graphene.NonNull(EquippedItem)))
    stats = graphene.NonNull(CustomSetStats)
    tag_associations = graphene.NonNull(
        graphene.List(graphene.NonNull(CustomSetTagAssociation))
    )
    has_edit_permission = graphene.Boolean(required=True)

    def resolve_creation_date(self, info):
        return pytz.utc.localize(self.creation_date)

    def resolve_last_modified(self, info):
        return pytz.utc.localize(self.last_modified)

    def resolve_tag_associations(self, info):
        return g.dataloaders.get("custom_set_tag_association_loader").load(self.uuid)

    def resolve_has_edit_permission(self, info):
        try:
            check_owner(self)
        except GraphQLError:
            return False
        return True

    class Meta:
        model = ModelCustomSet
        interfaces = (GlobalNode,)


class CustomSetConnection(NonNullConnection):
    class Meta:
        node = CustomSet


class CustomSetFilters(graphene.InputObjectType):
    search = graphene.String(required=True)
    tag_ids = graphene.NonNull(graphene.List(graphene.NonNull(graphene.UUID)))
    private = graphene.Boolean()
    default_class_id = graphene.UUID()


class UserSetting(SQLAlchemyObjectType):
    class Meta:
        model = ModelUserSetting
        interfaces = (GlobalNode,)


class User(SQLAlchemyObjectType):
    custom_sets = relay.ConnectionField(
        graphene.NonNull(CustomSetConnection),
        filters=graphene.Argument(CustomSetFilters),
    )

    def resolve_custom_sets(self, info, **kwargs):
        filters = kwargs.get("filters")
        search = filters.search.strip()

        query = (
            db.session.query(ModelCustomSet)
            .filter_by(owner_id=self.uuid)
            .order_by(ModelCustomSet.last_modified.desc())
        )

        if search:
            query = query.filter(
                func.upper(ModelCustomSet.name).contains(func.upper(search))
            )

        if filters.default_class_id:
            query = query.filter_by(default_class_id=filters.default_class_id)

        if filters.private is not None:
            query = query.filter_by(private=filters.private)

        if filters.tag_ids:
            tag_sq = (
                db.session.query(
                    ModelCustomSetTagAssociation.custom_set_id,
                    func.count(ModelCustomSetTagAssociation.custom_set_tag_id).label(
                        "num_tags_matched"
                    ),
                )
                .filter(
                    ModelCustomSetTagAssociation.custom_set_tag_id.in_(filters.tag_ids)
                )
                .group_by(ModelCustomSetTagAssociation.custom_set_id)
                .subquery()
            )
            query = query.join(
                tag_sq, ModelCustomSet.uuid == tag_sq.c.custom_set_id
            ).filter(tag_sq.c.num_tags_matched == len(filters.tag_ids))

        return query.all()

    def resolve_email(self, info):
        if self.uuid != current_user.get_id():
            raise GraphQLError(_("You are not authorized to make this request."))
        return self.email

    favorite_items = graphene.NonNull(graphene.List(graphene.NonNull(Item)))

    def resolve_favorite_items(self, info):
        if self.uuid != current_user.get_id():
            raise GraphQLError(_("You are not authorized to make this request."))
        return map(lambda favorite: favorite.item, self.favorite_items)

    settings = graphene.NonNull(UserSetting)

    def resolve_settings(self, info):
        if self.uuid != current_user.get_id():
            raise GraphQLError(_("You are not authorized to make this request."))
        return self.settings

    class Meta:
        model = ModelUserAccount
        interfaces = (GlobalNode,)
        only_fields = (
            "id",
            "username",
            "email",
            "custom_sets",
            "verified",
            "favorite_items",
            "profile_picture",
            "creation_date",
            "settings",
        )


class SpellEffects(SQLAlchemyObjectType):

    condition = graphene.String()

    def resolve_condition(self, info):
        locale = str(get_locale())
        condition_obj = (
            db.session.query(ModelSpellEffectConditionTranslation)
            .filter_by(locale=locale, spell_effect_id=self.uuid)
            .one_or_none()
        )
        return condition_obj.condition if condition_obj else None

    class Meta:
        model = ModelSpellEffect
        interfaces = (GlobalNode,)


class SpellDamageIncrease(SQLAlchemyObjectType):
    class Meta:
        model = ModelSpellDamageIncrease
        interfaces = (GlobalNode,)


class SpellStats(SQLAlchemyObjectType):
    aoe = graphene.String()
    spell_effects = graphene.NonNull(graphene.List(graphene.NonNull(SpellEffects)))

    def resolve_aoe(self, info):
        locale = str(get_locale())
        query = (
            db.session.query(ModelSpellStatTranslation)
            .filter(ModelSpellStatTranslation.locale == locale)
            .filter(ModelSpellStatTranslation.spell_stat_id == self.uuid)
            .one_or_none()
        )

        if query:
            return query.aoe_type

    buffs = graphene.List(graphene.NonNull(Buff))

    def resolve_buffs(self, info):
        # query = db.session.query(ModelBuff).filter(ModelBuff.spell_stat_id == self.uuid)
        # return query

        return g.dataloaders.get("spell_buff_loader").load(self.uuid)

    class Meta:
        model = ModelSpellStats
        interfaces = (GlobalNode,)


class Spell(SQLAlchemyObjectType):
    name = graphene.String(required=True)
    description = graphene.String(required=True)
    spell_stats = graphene.NonNull(graphene.List(graphene.NonNull(SpellStats)))

    def resolve_name(self, info):
        locale = str(get_locale())
        query = db.session.query(ModelSpellTranslation)
        return (
            query.filter(ModelSpellTranslation.locale == locale)
            .filter(ModelSpellTranslation.spell_id == self.uuid)
            .one()
            .name
        )

    def resolve_description(self, info):
        locale = str(get_locale())
        query = db.session.query(ModelSpellTranslation)
        return (
            query.filter(ModelSpellTranslation.locale == locale)
            .filter(ModelSpellTranslation.spell_id == self.uuid)
            .one()
            .description
        )

    class Meta:
        model = ModelSpell
        interfaces = (GlobalNode,)


class SpellVariantPair(SQLAlchemyObjectType):
    spells = graphene.NonNull(graphene.List(graphene.NonNull(Spell)))

    class Meta:
        model = ModelSpellVariantPair
        interfaces = (GlobalNode,)


class Class(SQLAlchemyObjectType):
    name = graphene.String(required=True)
    en_name = graphene.String(required=True)
    spell_variant_pairs = graphene.NonNull(
        graphene.List(graphene.NonNull(SpellVariantPair))
    )
    all_names = graphene.NonNull(graphene.List(graphene.NonNull(graphene.String)))
    face_image_url = graphene.String(required=True)

    def resolve_name(self, info):
        locale = str(get_locale())
        query = db.session.query(ModelClassTranslation)
        return (
            query.filter(ModelClassTranslation.locale == locale)
            .filter(ModelClassTranslation.class_id == self.uuid)
            .one()
            .name
        )

    def resolve_en_name(self, info):
        return (
            db.session.query(ModelClassTranslation)
            .filter_by(class_id=self.uuid, locale="en")
            .one()
            .name
        )

    def resolve_all_names(self, info):
        query = db.session.query(ModelClassTranslation)
        return set(
            map(
                lambda x: x.name,
                query.filter(ModelClassTranslation.class_id == self.uuid).all(),
            )
        )

    def resolve_face_image_url(self, info):
        return self.male_face_image_url

    class Meta:
        model = ModelClass
        interfaces = (GlobalNode,)


class CustomSetStatsInput(graphene.InputObjectType):
    scrolled_vitality = graphene.Int(required=True)
    scrolled_wisdom = graphene.Int(required=True)
    scrolled_strength = graphene.Int(required=True)
    scrolled_intelligence = graphene.Int(required=True)
    scrolled_chance = graphene.Int(required=True)
    scrolled_agility = graphene.Int(required=True)

    base_vitality = graphene.Int(required=True)
    base_wisdom = graphene.Int(required=True)
    base_strength = graphene.Int(required=True)
    base_intelligence = graphene.Int(required=True)
    base_chance = graphene.Int(required=True)
    base_agility = graphene.Int(required=True)


class CustomSetExosInput(graphene.InputObjectType):
    stat = graphene.NonNull(StatEnum)
    value = graphene.Int(required=True)


class CustomSetImportedItemInput(graphene.InputObjectType):
    id = graphene.UUID(required=True)
    ap_exo = graphene.Boolean()
    mp_exo = graphene.Boolean()
    range_exo = graphene.Boolean()


class CreateCustomSet(graphene.Mutation):
    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set = get_or_create_custom_set(None, db_session)

        return CreateCustomSet(custom_set=custom_set)


class EditCustomSetStats(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        stats = graphene.NonNull(CustomSetStatsInput)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            stats = kwargs.get("stats")
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            edit_custom_set_stats(custom_set, stats)

        return EditCustomSetStats(custom_set=custom_set)


class EditCustomSetMetadata(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        name = graphene.String()
        level = graphene.Int(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            name = kwargs.get("name")
            level = kwargs.get("level")
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            edit_custom_set_metadata(custom_set, name, level)

        return EditCustomSetMetadata(custom_set=custom_set)


class EditCustomSetDefaultClass(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        default_class_id = graphene.UUID()
        build_gender = graphene.NonNull(BuildGenderEnum)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            default_class_id = kwargs.get("default_class_id")
            build_gender = kwargs.get("build_gender")
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            custom_set.default_class_id = default_class_id
            custom_set.build_gender = BuildGender(build_gender)

        return EditCustomSetDefaultClass(custom_set=custom_set)


class UpdateCustomSetItem(graphene.Mutation):
    class Arguments:
        # if null, create new set
        custom_set_id = graphene.UUID()
        item_slot_id = graphene.UUID(required=True)
        item_id = graphene.UUID()

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            item_slot_id = kwargs.get("item_slot_id")
            item_id = kwargs.get("item_id")
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            custom_set.equip_item(item_id, item_slot_id, db_session)

        return UpdateCustomSetItem(custom_set=custom_set)


class EquipSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        set_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            set_id = kwargs.get("set_id")
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            set_obj = db_session.query(ModelSet).get(set_id)
            custom_set.equip_set(set_obj, db_session)

        return EquipSet(custom_set=custom_set)


class AddTagToCustomSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        custom_set_tag_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            custom_set_tag_id = kwargs.get("custom_set_tag_id")
            tag = db_session.query(ModelCustomSetTag).get(custom_set_tag_id)
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            check_owner(custom_set)
            db_session.add(
                ModelCustomSetTagAssociation(
                    custom_set_id=custom_set.uuid, custom_set_tag_id=tag.uuid
                )
            )

        return AddTagToCustomSet(custom_set=custom_set)


class RemoveTagFromCustomSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        custom_set_tag_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            custom_set_tag_id = kwargs.get("custom_set_tag_id")
            tag = db_session.query(ModelCustomSetTag).get(custom_set_tag_id)
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            check_owner(custom_set)
            custom_set.tags.remove(tag)

        return RemoveTagFromCustomSet(custom_set=custom_set)


class EquipMultipleItems(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        item_ids = graphene.NonNull(graphene.List(graphene.NonNull(graphene.UUID)))

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            item_ids = kwargs.get("item_ids")
            custom_set = get_or_create_custom_set(custom_set_id, db_session)
            items = [
                {
                    "item": db.session.query(ModelItem)
                    .filter(ModelItem.uuid == item_id)
                    .one()
                }
                for item_id in item_ids
            ]
            custom_set.equip_items(items, db_session)

        return EquipMultipleItems(custom_set=custom_set)


class MageEquippedItem(graphene.Mutation):
    class Arguments:
        equipped_item_id = graphene.UUID(required=True)
        stats = graphene.NonNull(graphene.List(graphene.NonNull(CustomSetExosInput)))
        weapon_element_mage = graphene.Argument(WeaponElementMageEnum)

    equipped_item = graphene.Field(EquippedItem, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            equipped_item_id = kwargs.get("equipped_item_id")
            weapon_element_mage = kwargs.get("weapon_element_mage")
            stats = kwargs.get("stats")
            equipped_item = db_session.query(ModelEquippedItem).get(equipped_item_id)
            check_owner(equipped_item.custom_set)
            db_session.query(ModelEquippedItemExo).filter_by(
                equipped_item_id=equipped_item_id
            ).delete(synchronize_session=False)
            exo_models = map(
                lambda stat_line: ModelEquippedItemExo(
                    stat=Stat(stat_line.stat),
                    value=stat_line.value,
                    equipped_item_id=equipped_item_id,
                ),
                stats,
            )
            if stats:
                db_session.add_all(exo_models)
            slot_name = (
                db_session.query(ModelItemSlotTranslation)
                .filter(ModelItemSlotTranslation.locale == "en")
                .filter(
                    ModelItemSlotTranslation.item_slot_id == equipped_item.slot.uuid
                )
                .one()
                .name
            )
            if weapon_element_mage and slot_name != "Weapon":
                raise GraphQLError(_("Invalid element mage on non-weapon item."))
            equipped_item.weapon_element_mage = (
                WeaponElementMage(weapon_element_mage) if weapon_element_mage else None
            )
            equipped_item.custom_set.last_modified = datetime.utcnow()

        return MageEquippedItem(equipped_item=equipped_item)


# used for exo shortcuts for AP, MP, range
class SetEquippedItemExo(graphene.Mutation):
    class Arguments:
        equipped_item_id = graphene.UUID(required=True)
        stat = graphene.NonNull(StatEnum)
        has_stat = graphene.Boolean(required=True)  # True if adding, False if removing

    equipped_item = graphene.Field(EquippedItem, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            equipped_item_id = kwargs.get("equipped_item_id")
            stat = Stat(kwargs.get("stat"))
            has_stat = kwargs.get("has_stat")
            equipped_item = db_session.query(ModelEquippedItem).get(equipped_item_id)
            check_owner(equipped_item.custom_set)
            if stat != Stat.AP and stat != Stat.MP and stat != Stat.RANGE:
                raise GraphQLError(_("Invalid stat to set exo."))
            exo_obj = (
                db_session.query(ModelEquippedItemExo)
                .filter_by(equipped_item_id=equipped_item_id, stat=stat)
                .one_or_none()
            )
            if not exo_obj and has_stat:
                exo_obj = ModelEquippedItemExo(
                    stat=stat, value=1, equipped_item_id=equipped_item_id
                )
                db_session.add(exo_obj)
            if exo_obj and not has_stat:
                db_session.delete(exo_obj)
            equipped_item.custom_set.last_modified = datetime.utcnow()

        return SetEquippedItemExo(equipped_item=equipped_item)


class TogglePrivateCustomSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)
    ok = graphene.Boolean(required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
            check_owner(custom_set)
            custom_set.private = not custom_set.private

        return TogglePrivateCustomSet(custom_set=custom_set, ok=True)

class DeleteCustomSetItem(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID(required=True)
        item_slot_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            custom_set_id = kwargs.get("custom_set_id")
            item_slot_id = kwargs.get("item_slot_id")
            custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
            check_owner(custom_set)
            custom_set.unequip_item(item_slot_id)

        return DeleteCustomSetItem(custom_set=custom_set)


class CopyCustomSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        with session_scope() as db_session:
            old_custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
            custom_set = get_or_create_custom_set(None, db_session)
            custom_set.name = (
                _("%(old_name)s copy", old_name=old_custom_set.name)[:MAX_NAME_LENGTH]
                if old_custom_set.name
                else _("Copy")
            )
            custom_set.level = old_custom_set.level
            custom_set.parent_custom_set_id = old_custom_set.uuid
            custom_set.default_class_id = old_custom_set.default_class_id
            for tag in old_custom_set.tags:
                db_session.add(
                    ModelCustomSetTagAssociation(
                        custom_set_id=custom_set.uuid, custom_set_tag_id=tag.uuid
                    )
                )
            for stat in base_stat_list + scrolled_stat_list:
                setattr(custom_set.stats, stat, getattr(old_custom_set.stats, stat))
            for old_equipped_item in old_custom_set.equipped_items:
                equipped_item = ModelEquippedItem(
                    custom_set_id=custom_set.uuid,
                    item_slot_id=old_equipped_item.item_slot_id,
                    item_id=old_equipped_item.item_id,
                    weapon_element_mage=old_equipped_item.weapon_element_mage,
                )
                db_session.add(equipped_item)
                db_session.flush()
                for old_exo in old_equipped_item.exos:
                    exo = ModelEquippedItemExo(
                        stat=old_exo.stat,
                        value=old_exo.value,
                        equipped_item_id=equipped_item.uuid,
                    )
                    db_session.add(exo)

        return CopyCustomSet(custom_set=custom_set)


class RestartCustomSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID(required=True)
        should_reset_stats = graphene.Boolean(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        should_reset_stats = kwargs.get("should_reset_stats")
        with session_scope() as db_session:
            custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
            check_owner(custom_set)
            db_session.query(ModelEquippedItem).filter_by(
                custom_set_id=custom_set_id
            ).delete()
            if should_reset_stats:
                db_session.delete(custom_set.stats)
                custom_set_stat = ModelCustomSetStat(custom_set_id=custom_set.uuid)
                db_session.add(custom_set_stat)
            custom_set.last_modified = datetime.utcnow()

        return RestartCustomSet(custom_set=custom_set)


class DeleteCustomSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID(required=True)

    ok = graphene.Boolean(required=True)

    @anonymous_or_verified
    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        with session_scope() as db_session:
            custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
            check_owner(custom_set)
            db_session.delete(custom_set)

        return DeleteCustomSet(ok=True)


class ImportCustomSet(graphene.Mutation):
    class Arguments:
        items = graphene.NonNull(
            graphene.List(graphene.NonNull(CustomSetImportedItemInput))
        )
        stats = graphene.NonNull(CustomSetStatsInput)
        name = graphene.NonNull(graphene.String)
        level = graphene.NonNull(graphene.Int)

    custom_set = graphene.Field(CustomSet, required=True)

    @verified
    def mutate(self, info, **kwargs):
        item_objs = kwargs.get("items")
        stats = kwargs.get("stats")
        name = kwargs.get("name")
        level = kwargs.get("level")
        with session_scope() as db_session:
            custom_set = get_or_create_custom_set(None, db_session)
            edit_custom_set_stats(custom_set, stats)
            edit_custom_set_metadata(custom_set, name, level)
            items = [
                {
                    "item": db.session.query(ModelItem)
                    .filter(ModelItem.uuid == item_obj.id)
                    .one(),
                    "ap_exo": item_obj.ap_exo,
                    "mp_exo": item_obj.mp_exo,
                    "range_exo": item_obj.range_exo,
                }
                for item_obj in item_objs
            ]
            custom_set.equip_items(items, db_session)
        return ImportCustomSet(custom_set=custom_set)


class RegisterUser(graphene.Mutation):
    class Arguments:
        username = graphene.NonNull(graphene.String)
        email = graphene.NonNull(graphene.String)
        password = graphene.NonNull(graphene.String)
        gender = graphene.NonNull(BuildGenderEnum)
        build_default_class_id = graphene.UUID()

    user = graphene.Field(User)
    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        with session_scope() as db_session:
            username = kwargs.get("username")
            email = kwargs.get("email")
            password = kwargs.get("password")
            gender = kwargs.get("gender")
            build_default_class_id = kwargs.get("build_default_class_id")
            validation.validate_registration(username, email, password)

            try:
                if current_user.is_authenticated:
                    raise GraphQLError(_("You are already logged in."))
                user = ModelUserAccount(
                    username=username,
                    email=email,
                    password=ModelUserAccount.generate_hash(password),
                    profile_picture=(random.choice(DEFAULT_PROFILE_PICTURE_URLS)),
                )
                token = encode_token(user.email, verify_email_salt)
                verify_url = generate_url("verify_email.verify_email", token)
                template = template_env.get_template("verify_email.html")
                content = template.render(display_name=username, verify_url=verify_url)
                db_session.add(user)
                db_session.flush()
                user_setting = ModelUserSetting(
                    locale=str(get_locale()),
                    classic=session.get("classic", True),
                    user_id=user.uuid,
                    build_gender=BuildGender(gender),
                    build_class_id=build_default_class_id,
                )
                db_session.add(user_setting)
                q.enqueue(
                    send_email, user.email, _("Verify your DofusLab account"), content
                )
                login_user(user)
                save_custom_sets(db_session)
            except Exception as e:
                raise GraphQLError(_("An error occurred while registering."))

        return RegisterUser(user=user, ok=True)


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        remember = graphene.Boolean(required=True)

    user = graphene.Field(User)
    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        if current_user.is_authenticated:
            raise GraphQLError(_("You are already logged in."))
        email = kwargs.get("email")
        password = kwargs.get("password")
        remember = kwargs.get("remember")
        user = ModelUserAccount.find_by_email(email)
        auth_error = GraphQLError(_("Invalid username or password."))
        if not user:
            raise auth_error
        if not user.check_password(password):
            raise auth_error
        login_user(user, remember=remember)
        refresh()
        with session_scope() as db_session:
            save_custom_sets(db_session)
        return LoginUser(user=user, ok=True)


class LogoutUser(graphene.Mutation):
    ok = graphene.Boolean(required=True)

    def mutate(self, info):
        if current_user.is_authenticated:
            logout_user()
        return LogoutUser(ok=True)


class ResendVerificationEmail(graphene.Mutation):
    ok = graphene.Boolean(required=True)

    @limiter.limit(
        "2/minute", error_message=_("Please wait a minute before trying again.")
    )
    @limiter.limit(
        "10/hour",
        error_message=_(
            "You have sent too many verification emails. Please wait awhile before trying again."
        ),
    )
    def mutate(self, info):
        with session_scope() as db_session:
            user = current_user._get_current_object()
            if not current_user.is_authenticated:
                raise GraphQLError(_("You must be signed in to do that."))
            if user.verified:
                raise GraphQLError(_("Your account is already verified."))
            token = encode_token(user.email, verify_email_salt)
            verify_url = generate_url("verify_email.verify_email", token)
            template = template_env.get_template("verify_email.html")
            content = template.render(display_name=user.username, verify_url=verify_url)
            q.enqueue(
                send_email, user.email, _("Verify your DofusLab account"), content
            )
            return ResendVerificationEmail(ok=True)


class ChangeLocale(graphene.Mutation):
    class Arguments:
        locale = graphene.String(required=True)

    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        locale = kwargs.get("locale")
        if not locale in supported_languages:
            raise GraphQLError(_("Received unsupported locale."))
        with session_scope():
            user = current_user._get_current_object()
            if current_user.is_authenticated:
                user.settings.locale = locale
            refresh()
            return ChangeLocale(ok=True)


class ChangeClassic(graphene.Mutation):
    class Arguments:
        classic = graphene.Boolean(required=True)

    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        with session_scope():
            user = current_user._get_current_object()
            classic = kwargs.get("classic")
            if current_user.is_authenticated:
                user.settings.classic = classic
            session["classic"] = classic
            refresh()
            return ChangeClassic(ok=True)


class ChangePassword(graphene.Mutation):
    class Arguments:
        old_password = graphene.String(required=True)
        new_password = graphene.String(required=True)

    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        if not current_user.is_authenticated:
            raise GraphQLError(_("You are not logged in."))
        old_password = kwargs.get("old_password")
        new_password = kwargs.get("new_password")
        user = current_user._get_current_object()
        auth_error = GraphQLError(_("Incorrect password."))
        if not user:
            raise auth_error
        if not user.check_password(old_password):
            raise auth_error
        validation.validate_password(new_password)
        if old_password == new_password:
            raise GraphQLError(
                _("You must enter a password different from your current one.")
            )
        with session_scope():
            user.password = ModelUserAccount.generate_hash(new_password)
            return ChangePassword(ok=True)


class RequestPasswordReset(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)

    ok = graphene.Boolean(required=True)

    @limiter.limit(
        "2/minute", error_message=_("Please wait a minute before trying again.")
    )
    @limiter.limit(
        "10/hour",
        error_message=_(
            "You have sent too many password request emails. Please wait awhile before trying again."
        ),
    )
    def mutate(self, info, **kwargs):
        if current_user.is_authenticated:
            raise GraphQLError(_("You are already logged in."))
        email = kwargs.get("email")
        user = ModelUserAccount.find_by_email(email)
        auth_error = GraphQLError(_("We could not find an account with that email."))
        if not user:
            raise auth_error
        if not user.verified:
            raise GraphQLError(_("Please verify your email first."))
        token = encode_token(user.email, reset_password_salt)
        reset_password_url = "{}reset-password?token={}".format(base_url, token)
        template = template_env.get_template("reset_password.html")
        content = template.render(
            display_name=user.username, reset_password_url=reset_password_url
        )
        q.enqueue(send_email, user.email, _("Reset your DofusLab password"), content)
        return RequestPasswordReset(ok=True)


class ResetPassword(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)
        password = graphene.String(required=True)

    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        if current_user.is_authenticated:
            raise GraphQLError(_("You are already logged in."))
        token = kwargs.get("token")
        password = kwargs.get("password")
        email = decode_token(token, reset_password_salt)
        invalid_token_error = GraphQLError(
            _("The link is invalid or expired. Please request a new one.")
        )
        if not email:
            raise invalid_token_error
        user = ModelUserAccount.find_by_email(email)

        if not user:
            raise GraphQLError(
                _("The link is invalid or expired. Please request a new one.")
            )

        validation.validate_password(password)
        if user.check_password(password):
            raise GraphQLError(
                _("You must enter a password different from your current one.")
            )
        with session_scope() as db_session:
            user.password = ModelUserAccount.generate_hash(password)
            return ResetPassword(ok=True)


class ToggleFavoriteItem(graphene.Mutation):
    class Arguments:
        item_id = graphene.UUID(required=True)
        is_favorite = graphene.Boolean(required=True)

    user = graphene.Field(User, required=True)

    def mutate(self, info, **kwargs):
        if not current_user.is_authenticated:
            raise GraphQLError(_("You are not logged in."))
        item_id = kwargs.get("item_id")
        is_favorite = kwargs.get("is_favorite")
        user_account_id = current_user.get_id()
        with session_scope() as db_session:
            ModelFavoriteItem.toggle_favorite(
                db_session, user_account_id, item_id, is_favorite
            )
        return ToggleFavoriteItem(user=current_user._get_current_object())


class EditBuildSettings(graphene.Mutation):
    class Arguments:
        gender = graphene.NonNull(BuildGenderEnum)
        build_default_class_id = graphene.UUID()

    user_setting = graphene.Field(UserSetting, required=True)

    def mutate(self, info, **kwargs):
        if not current_user.is_authenticated:
            raise GraphQLError(_("You are not logged in."))
        gender = kwargs.get("gender")
        build_default_class_id = kwargs.get("build_default_class_id")
        user_account_id = current_user.get_id()
        with session_scope() as db_session:
            user_setting = (
                db_session.query(ModelUserSetting)
                .filter_by(user_id=user_account_id)
                .one()
            )
            user_setting.build_gender = BuildGender(gender)
            user_setting.build_class_id = build_default_class_id
        return EditBuildSettings(user_setting=user_setting)


class ChangeProfilePicture(graphene.Mutation):
    class Arguments:
        picture = graphene.String(required=True)

    user = graphene.NonNull(User)

    def mutate(self, info, **kwargs):

        picture = kwargs.get("picture")
        with session_scope() as db_session:
            curr_user = current_user._get_current_object()
            if not current_user.is_authenticated:
                raise GraphQLError(_("You are not logged in."))
            if picture not in ALLOWED_PROFILE_PICTURE_URLS:
                raise GraphQLError(
                    _("An error has ocurred while changing the profile picture.")
                )

            curr_user.profile_picture = picture
            return ChangeProfilePicture(user=curr_user)


class StatFilter(graphene.InputObjectType):
    stat = graphene.NonNull(StatEnum)
    min_value = graphene.Int()
    max_value = graphene.Int()


class ItemFilters(graphene.InputObjectType):
    stats = graphene.NonNull(graphene.List(graphene.NonNull(StatFilter)))
    max_level = graphene.NonNull(graphene.Int)
    search = graphene.String(required=True)
    item_type_ids = graphene.NonNull(graphene.List(graphene.NonNull(graphene.UUID)))


class SetFilters(graphene.InputObjectType):
    stats = graphene.NonNull(graphene.List(graphene.NonNull(StatFilter)))
    max_level = graphene.NonNull(graphene.Int)
    search = graphene.String(required=True)


class ItemNameObject(graphene.InputObjectType):
    name = graphene.String()
    image_id = graphene.String(required=True)


class Query(graphene.ObjectType):
    current_user = graphene.Field(User)

    def resolve_current_user(self, info):
        if current_user.is_authenticated:
            return current_user._get_current_object()
        return None

    # Get list of data
    items = relay.ConnectionField(
        graphene.NonNull(ItemConnection), filters=graphene.Argument(ItemFilters)
    )

    def resolve_items(self, info, **kwargs):
        locale = str(get_locale())
        filters = kwargs.get("filters")

        current_locale_translations = aliased(ModelItemTranslation)

        items_query = (
            db.session.query(ModelItem)
            .join(ModelItem.item_translations.of_type(current_locale_translations))
            .filter(current_locale_translations.locale == locale)
        )

        if filters:
            search = filters.search.strip()
            if filters.stats:
                items_query = items_query.join(ModelItemStat)
                stat_sq = (
                    db.session.query(
                        ModelItemStat.item_id,
                        func.count(ModelItemStat.uuid).label("num_stats_matched"),
                    )
                    .filter(
                        or_(
                            and_(
                                ModelItemStat.stat == Stat(stat_filter.stat).name,
                                or_(
                                    ModelItemStat.max_value.between(
                                        stat_filter.min_value
                                        if stat_filter.min_value != None
                                        else float(-inf),
                                        stat_filter.max_value
                                        if stat_filter.max_value != None
                                        else float(inf),
                                    ),
                                    ModelItemStat.min_value.between(
                                        stat_filter.min_value
                                        if stat_filter.min_value != None
                                        else float(-inf),
                                        stat_filter.max_value
                                        if stat_filter.max_value != None
                                        else float(inf),
                                    ),
                                ),
                            )
                            for stat_filter in filters.stats
                        )
                    )
                    .group_by(ModelItemStat.item_id)
                    .subquery()
                )
                items_query = items_query.join(
                    stat_sq, ModelItem.uuid == stat_sq.c.item_id
                ).filter(stat_sq.c.num_stats_matched == len(filters.stats))
            if filters.max_level != None:
                items_query = items_query.filter(ModelItem.level <= filters.max_level)
            if filters.search:
                all_translations = aliased(ModelItemTranslation)
                items_query = (
                    items_query.join(
                        ModelItem.item_translations.of_type(all_translations)
                    )
                    .join(ModelSet, isouter=True)
                    .join(ModelSetTranslation, isouter=True)
                    .filter(
                        func.upper(all_translations.name).contains(
                            func.upper(filters.search.strip())
                        )
                        | func.upper(ModelSetTranslation.name).contains(
                            func.upper(filters.search.strip())
                        )
                    )
                )
            if filters.item_type_ids:
                items_query = items_query.filter(
                    ModelItem.item_type_id.in_(filters.item_type_ids)
                )

        return items_query.order_by(
            ModelItem.level.desc(), current_locale_translations.name.asc()
        ).all()

    sets = relay.ConnectionField(
        graphene.NonNull(SetConnection), filters=graphene.Argument(SetFilters)
    )

    def resolve_sets(self, info, **kwargs):
        locale = str(get_locale())
        filters = kwargs.get("filters")
        current_locale_translations = aliased(ModelSetTranslation)

        set_query = (
            db.session.query(ModelSet)
            .join(ModelSet.set_translation.of_type(current_locale_translations))
            .filter(current_locale_translations.locale == locale)
        )

        level_sq = (
            db.session.query(ModelItem.set_id, func.max(ModelItem.level).label("level"))
            .group_by(ModelItem.set_id)
            .subquery()
        )
        set_query = set_query.join(level_sq, ModelSet.uuid == level_sq.c.set_id)

        if filters:
            if filters.stats:
                set_query = set_query.join(ModelSetBonus)
                stat_sq = (
                    db.session.query(ModelSetBonus.set_id, ModelSetBonus.stat)
                    .filter(
                        or_(
                            and_(
                                ModelSetBonus.stat == Stat(stat_filter.stat).name,
                                ModelSetBonus.value.between(
                                    stat_filter.min_value
                                    if stat_filter.min_value != None
                                    else float(-inf),
                                    stat_filter.max_value
                                    if stat_filter.max_value != None
                                    else float(inf),
                                ),
                            )
                            for stat_filter in filters.stats
                        )
                    )
                    .group_by(ModelSetBonus.set_id, ModelSetBonus.stat)
                    .subquery()
                )

                bonus_sq = (
                    db.session.query(
                        ModelSetBonus.set_id,
                        func.count(distinct(stat_sq.c.stat)).label("num_stats_matched"),
                    )
                    .join(stat_sq, ModelSetBonus.set_id == stat_sq.c.set_id)
                    .group_by(ModelSetBonus.set_id)
                    .subquery()
                )

                set_query = set_query.join(
                    bonus_sq, ModelSet.uuid == bonus_sq.c.set_id
                ).filter(bonus_sq.c.num_stats_matched == len(filters.stats))
            if filters.max_level != None:
                set_query = set_query.filter(level_sq.c.level <= filters.max_level)
            if filters.search:
                all_translations = aliased(ModelSetTranslation)
                set_query = (
                    set_query.join(ModelSet.set_translation.of_type(all_translations))
                    .join(ModelItem)
                    .join(ModelItemTranslation)
                    .filter(
                        func.upper(all_translations.name).contains(
                            func.upper(filters.search.strip())
                        )
                        | func.upper(ModelItemTranslation.name).contains(
                            func.upper(filters.search.strip())
                        )
                    )
                    .group_by(
                        ModelSet.uuid,
                        level_sq.c.level,
                        current_locale_translations.name,
                    )
                )

        return set_query.order_by(
            level_sq.c.level.desc(), current_locale_translations.name.asc()
        ).all()

    custom_sets = relay.ConnectionField(graphene.NonNull(CustomSetConnection),)

    def resolve_custom_sets(self, info, **kwargs):
        return (
            db.session.query(ModelCustomSet)
            .order_by(ModelCustomSet.last_modified.desc())
            .all()
        )

    classes = graphene.NonNull(graphene.List(graphene.NonNull(Class)))

    def resolve_classes(self, info):
        return db.session.query(ModelClass).all()

    # Retrieve record by uuid
    class_by_id = graphene.Field(Class, id=graphene.UUID(required=True))

    def resolve_class_by_id(self, info, id):
        return db.session.query(ModelClass).get(id)

    user_by_id = graphene.Field(User, id=graphene.UUID(required=True))

    def resolve_user_by_id(self, info, id):
        return db.session.query(ModelUserAccount).get(id)

    item_by_id = graphene.Field(Item, id=graphene.UUID(required=True))

    def resolve_item_by_id(self, info, id):
        return db.session.query(ModelItem).get(id)

    set_by_id = graphene.Field(Set, id=graphene.UUID(required=True), required=True)

    def resolve_set_by_id(self, info, id):
        return db.session.query(ModelSet).get(id)

    custom_set_by_id = graphene.Field(CustomSet, id=graphene.UUID(required=True))

    def resolve_custom_set_by_id(self, info, id):
        return db.session.query(ModelCustomSet).get(id)

    item_slots = graphene.NonNull(graphene.List(graphene.NonNull(ItemSlot)))

    def resolve_item_slots(self, info):
        return db.session.query(ModelItemSlot).order_by(ModelItemSlot.order).all()

    locale = graphene.NonNull(graphene.String)

    def resolve_locale(self, info):
        return str(get_locale())

    classic = graphene.NonNull(graphene.Boolean)

    def resolve_classic(self, info):
        if current_user.is_authenticated:
            return current_user.settings.classic
        return session.get("classic", False)

    items_by_name = graphene.NonNull(
        graphene.List(graphene.NonNull(Item)),
        item_name_objs=graphene.NonNull(
            graphene.List(graphene.NonNull(ItemNameObject))
        ),
    )

    user_by_name = graphene.Field(User, username=graphene.String(required=True))

    def resolve_user_by_name(self, info, username):
        return ModelUserAccount.find_by_username(username)

    def resolve_items_by_name(self, info, **kwargs):
        item_name_objs = kwargs.get("item_name_objs")
        num_slots = db.session.query(ModelItemSlot).count()
        if len(item_name_objs) > num_slots:
            raise GraphQLError("Invalid request.")
        result = []
        for obj in item_name_objs:
            item = (
                db.session.query(ModelItem)
                .filter(ModelItem.image_url.contains("/{}.png".format(obj.image_id)))
                .one_or_none()
            )
            if not item:
                item = (
                    db.session.query(ModelItem)
                    .join(ModelItemTranslation)
                    .filter(ModelItemTranslation.name == obj.name)
                    .one_or_none()
                )
            if item:
                result.append(item)
        return result

    custom_set_tags = graphene.NonNull(graphene.List(graphene.NonNull(CustomSetTag)))

    def resolve_custom_set_tags(self, info):
        return db.session.query(ModelCustomSetTag).all()

    item_suggestions = graphene.NonNull(
        graphene.List(graphene.NonNull(Item)),
        num_suggestions=graphene.Int(),
        eligible_item_type_ids=graphene.List(graphene.NonNull(graphene.UUID)),
        equipped_item_ids=graphene.NonNull(
            graphene.List(graphene.NonNull(graphene.UUID))
        ),
        level=graphene.NonNull(graphene.Int),
    )

    def resolve_item_suggestions(self, info, num_suggestions=10, **kwargs):
        eligible_item_type_ids = kwargs.get("eligible_item_type_ids")
        equipped_item_ids = kwargs.get("equipped_item_ids")
        level = kwargs.get("level")
        if not equipped_item_ids:
            return []

        if not eligible_item_type_ids:
            slot_alias = aliased(ModelItemSlot)
            subquery = (
                ~db.session.query(slot_alias)
                .join(slot_alias.equipped_items)
                .filter(
                    ModelEquippedItem.uuid.in_(equipped_item_ids),
                    ModelEquippedItem.item_slot_id == ModelItemSlot.uuid,
                )
                .exists()
            )
            empty_slots = db.session.query(ModelItemSlot).filter(subquery).all()

            eligible_item_type_ids = [
                item_type.uuid
                for item_slot in empty_slots
                for item_type in item_slot.item_types
            ]

        if not eligible_item_type_ids:
            return []

        item_ids = [
            t[0]
            for t in db.session.query(ModelEquippedItem.item_id).filter(
                ModelEquippedItem.uuid.in_(equipped_item_ids)
            )
        ]

        suggested_item_ids = get_ordered_suggestions(item_ids)
        suggested_items = (
            db.session.query(ModelItem)
            .filter(ModelItem.uuid.in_(suggested_item_ids))
            .filter(ModelItem.item_type_id.in_(eligible_item_type_ids))
            .filter(ModelItem.level <= level)
            .all()
        )
        results = sorted(
            suggested_items, key=lambda x: suggested_item_ids.index(str(x.uuid)),
        )
        return results[:num_suggestions]


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_custom_set_item = UpdateCustomSetItem.Field()
    delete_custom_set_item = DeleteCustomSetItem.Field()
    mage_equipped_item = MageEquippedItem.Field()
    set_equipped_item_exo = SetEquippedItemExo.Field()
    edit_custom_set_metadata = EditCustomSetMetadata.Field()
    edit_custom_set_default_class = EditCustomSetDefaultClass.Field()
    edit_custom_set_stats = EditCustomSetStats.Field()
    equip_set = EquipSet.Field()
    equip_multiple_items = EquipMultipleItems.Field()
    create_custom_set = CreateCustomSet.Field()
    toggle_private_custom_set = TogglePrivateCustomSet.Field()
    resend_verification_email = ResendVerificationEmail.Field()
    change_locale = ChangeLocale.Field()
    change_classic = ChangeClassic.Field()
    change_password = ChangePassword.Field()
    request_password_reset = RequestPasswordReset.Field()
    reset_password = ResetPassword.Field()
    copy_custom_set = CopyCustomSet.Field()
    restart_custom_set = RestartCustomSet.Field()
    delete_custom_set = DeleteCustomSet.Field()
    toggle_favorite_item = ToggleFavoriteItem.Field()
    import_custom_set = ImportCustomSet.Field()
    add_tag_to_custom_set = AddTagToCustomSet.Field()
    remove_tag_from_custom_set = RemoveTagFromCustomSet.Field()
    edit_build_settings = EditBuildSettings.Field()
    change_profile_picture = ChangeProfilePicture.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
