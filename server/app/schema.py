from app import db
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_type import ModelItemType
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_weapon_stat import ModelWeaponStat
from app.database.model_item import ModelItem
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_equipped_item import ModelEquippedItem
from app.database.model_custom_set import ModelCustomSet
from app.database.model_user import ModelUser
from app.database.model_spell_effect import ModelSpellEffect
from app.database.model_spell_stat_translation import ModelSpellStatTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell import ModelSpell
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_class import ModelClass
from app.utils import get_or_create_custom_set, save_custom_sets
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
from app.database.base import Base
from app.database.enums import Stat, WeaponEffectTypes
from app import supported_languages
import app.mutation_validation_utils as validation
import graphene
import uuid
from graphql import GraphQLError
from flask import session
from flask_login import login_required, login_user, current_user, logout_user
from functools import lru_cache
from sqlalchemy import func, distinct

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


StatEnum = graphene.Enum.from_enum(Stat)
EffectEnum = graphene.Enum.from_enum(WeaponEffectTypes)


class ItemStat(SQLAlchemyObjectType):
    custom_stat = graphene.String()

    def resolve_custom_stat(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = (
            db.session.query(ModelItemStatTranslation)
            .filter(ModelItemStatTranslation.item_stat_id == self.uuid)
            .filter(ModelItemStatTranslation.locale == locale)
            .one_or_none()
        )

        if query:
            return query.custom_stat

    class Meta:
        model = ModelItemStat
        interfaces = (GlobalNode,)


class ItemSlot(SQLAlchemyObjectType):
    # https://github.com/graphql-python/graphene/issues/110
    item_types = graphene.NonNull(graphene.List(graphene.NonNull(lambda: ItemType)))

    class Meta:
        model = ModelItemSlot
        interfaces = (GlobalNode,)


class ItemType(SQLAlchemyObjectType):
    eligible_item_slots = graphene.NonNull(graphene.List(graphene.NonNull(ItemSlot)))

    class Meta:
        model = ModelItemType
        interfaces = (GlobalNode,)


class WeaponEffect(SQLAlchemyObjectType):
    class Meta:
        model = ModelWeaponEffect
        interfaces = (GlobalNode,)


class WeaponStat(SQLAlchemyObjectType):
    class Meta:
        model = ModelWeaponStat
        interfaces = (GlobalNode,)


class Item(SQLAlchemyObjectType):
    stats = graphene.NonNull(graphene.List(graphene.NonNull(ItemStat)))
    item_type = graphene.NonNull(ItemType)
    name = graphene.String(required=True)

    def resolve_name(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = db.session.query(ModelItemTranslation)
        return (
            query.filter(ModelItemTranslation.locale == locale)
            .filter(ModelItemTranslation.item_id == self.uuid)
            .one()
            .name
        )

    class Meta:
        model = ModelItem
        interfaces = (GlobalNode,)


class ItemConnection(NonNullConnection):
    class Meta:
        node = Item


class SetBonus(SQLAlchemyObjectType):
    custom_stat = graphene.String()

    def resolve_custom_stat(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = (
            db.session.query(ModelSetBonusTranslation)
            .filter(ModelSetBonusTranslation.set_bonus_id == self.uuid)
            .filter(ModelSetBonusTranslation.locale == locale)
            .one_or_none()
        )

        if query:
            return query.custom_stat

    class Meta:
        model = ModelSetBonus
        interfaces = (GlobalNode,)


class Set(SQLAlchemyObjectType):
    items = graphene.NonNull(graphene.List(graphene.NonNull(Item)))
    bonuses = graphene.NonNull(graphene.List(graphene.NonNull(SetBonus)))
    name = graphene.String(required=True)

    def resolve_name(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = db.session.query(ModelSetTranslation)
        return (
            query.filter(ModelSetTranslation.locale == locale)
            .filter(ModelSetTranslation.set_id == self.uuid)
            .one()
            .name
        )

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
        only_fields = ("id", "item", "slot", "exos")


class CustomSetStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSetStat
        interfaces = (GlobalNode,)


class CustomSet(SQLAlchemyObjectType):
    equipped_items = graphene.NonNull(graphene.List(graphene.NonNull(EquippedItem)))
    stats = graphene.NonNull(CustomSetStats)

    class Meta:
        model = ModelCustomSet
        interfaces = (GlobalNode,)


class User(SQLAlchemyObjectType):
    access_token = graphene.String(required=True)

    class Meta:
        model = ModelUser
        interfaces = (GlobalNode,)
        only_fields = ("id", "username", "email", "custom_sets")


class SpellEffects(SQLAlchemyObjectType):
    class Meta:
        model = ModelSpellEffect
        interfaces = (GlobalNode,)


class SpellStats(SQLAlchemyObjectType):
    aoe = graphene.String()
    spell_effects = graphene.NonNull(graphene.List(graphene.NonNull(SpellEffects)))

    def resolve_aoe(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = (
            db.session.query(ModelSpellStatTranslation)
            .filter(ModelSpellStatTranslation.locale == locale)
            .filter(ModelSpellStatTranslation.spell_stat_id == self.uuid)
            .one_or_none()
        )

        if query:
            return query.aoe_type

    class Meta:
        model = ModelSpellStats
        interfaces = (GlobalNode,)


class Spell(SQLAlchemyObjectType):
    name = graphene.String(required=True)
    description = graphene.String(required=True)
    spell_stats = graphene.NonNull(graphene.List(graphene.NonNull(SpellStats)))

    def resolve_name(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = db.session.query(ModelSpellTranslation)
        return (
            query.filter(ModelSpellTranslation.locale == locale)
            .filter(ModelSpellTranslation.spell_id == self.uuid)
            .one()
            .name
        )

    def resolve_description(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
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
    spell_variant_pairs = graphene.NonNull(
        graphene.List(graphene.NonNull(SpellVariantPair))
    )

    def resolve_name(self, info):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        query = db.session.query(ModelClassTranslation)
        return (
            query.filter(ModelClassTranslation.locale == locale)
            .filter(ModelClassTranslation.class_id == self.uuid)
            .one()
            .name
        )

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


base_stat_list = [
    "base_vitality",
    "base_wisdom",
    "base_strength",
    "base_intelligence",
    "base_chance",
    "base_agility",
]
scrolled_stat_list = [
    "scrolled_vitality",
    "scrolled_wisdom",
    "scrolled_strength",
    "scrolled_intelligence",
    "scrolled_chance",
    "scrolled_agility",
]


class EditCustomSetStats(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        stats = graphene.NonNull(CustomSetStatsInput)

    custom_set = graphene.Field(CustomSet, required=True)

    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        stats = kwargs.get("stats")
        for base_stat in base_stat_list:
            if stats[base_stat] < 0 or stats[base_stat] > 999:
                raise GraphQLError("Invalid value for stat.")
        for scrolled_stat in scrolled_stat_list:
            if stats[scrolled_stat] < 0 or stats[scrolled_stat] > 100:
                raise GraphQLError("Invalid value for stat.")
        custom_set = get_or_create_custom_set(custom_set_id)
        for stat in base_stat_list + scrolled_stat_list:
            setattr(custom_set.stats, stat, stats[stat])
        db.session.commit()

        return EditCustomSetStats(custom_set=custom_set)


class EditCustomSetMetadata(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        name = graphene.String()
        level = graphene.Int(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        name = kwargs.get("name")
        level = kwargs.get("level")
        if len(name) > 50:
            raise GraphQLError("The set name is too long.")
        if level < 1 or level > 200:
            raise GraphQLError("Invalid set level (must be 1-200).")
        custom_set = get_or_create_custom_set(custom_set_id)
        custom_set.name = name
        custom_set.level = level
        db.session.commit()

        return EditCustomSetMetadata(custom_set=custom_set)


class UpdateCustomSetItem(graphene.Mutation):
    class Arguments:
        # if null, create new set
        custom_set_id = graphene.UUID()
        item_slot_id = graphene.UUID(required=True)
        item_id = graphene.UUID()

    custom_set = graphene.Field(CustomSet, required=True)

    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        item_slot_id = kwargs.get("item_slot_id")
        item_id = kwargs.get("item_id")
        custom_set = get_or_create_custom_set(custom_set_id)
        custom_set.equip_item(item_id, item_slot_id)
        db.session.commit()

        return UpdateCustomSetItem(custom_set=custom_set)


class EquipSet(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID()
        set_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        set_id = kwargs.get("set_id")
        custom_set = get_or_create_custom_set(custom_set_id)
        set_obj = db.session.query(ModelSet).get(set_id)
        custom_set.equip_set(set_obj)
        db.session.commit()

        return EquipSet(custom_set=custom_set)


class MageEquippedItem(graphene.Mutation):
    class Arguments:
        equipped_item_id = graphene.UUID(required=True)
        stats = graphene.NonNull(graphene.List(graphene.NonNull(CustomSetExosInput)))

    equipped_item = graphene.Field(EquippedItem, required=True)

    def mutate(self, info, **kwargs):
        equipped_item_id = kwargs.get("equipped_item_id")
        stats = kwargs.get("stats")
        equipped_item = db.session.query(ModelEquippedItem).get(equipped_item_id)
        if (
            equipped_item.custom_set.owner_id
            and equipped_item.custom_set.owner_id != current_user.get_id()
        ):
            raise GraphQLError("You don't have permission to edit that set.")
        db.session.query(ModelEquippedItemExo).filter_by(
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
            db.session.add_all(exo_models)
        db.session.commit()

        return MageEquippedItem(equipped_item=equipped_item)


# used for exo shortcuts for AP, MP, range
class SetEquippedItemExo(graphene.Mutation):
    class Arguments:
        equipped_item_id = graphene.UUID(required=True)
        stat = graphene.NonNull(StatEnum)
        has_stat = graphene.Boolean(required=True)  # True if adding, False if removing

    equipped_item = graphene.Field(EquippedItem, required=True)

    def mutate(self, info, **kwargs):
        equipped_item_id = kwargs.get("equipped_item_id")
        stat = Stat(kwargs.get("stat"))
        has_stat = kwargs.get("has_stat")
        equipped_item = db.session.query(ModelEquippedItem).get(equipped_item_id)
        if (
            equipped_item.custom_set.owner_id
            and equipped_item.custom_set.owner_id != current_user.get_id()
        ):
            raise GraphQLError("You don't have permission to edit that set.")
        if stat != Stat.AP and stat != Stat.MP and stat != Stat.RANGE:
            raise GraphQLError("Invalid stat to set exo")
        exo_obj = (
            db.session.query(ModelEquippedItemExo)
            .filter_by(equipped_item_id=equipped_item_id, stat=stat)
            .one_or_none()
        )
        if not exo_obj and has_stat:
            exo_obj = ModelEquippedItemExo(
                stat=stat, value=1, equipped_item_id=equipped_item_id
            )
            db.session.add(exo_obj)
        if exo_obj and not has_stat:
            db.session.delete(exo_obj)
        db.session.commit()

        return SetEquippedItemExo(equipped_item=equipped_item)


class DeleteCustomSetItem(graphene.Mutation):
    class Arguments:
        custom_set_id = graphene.UUID(required=True)
        item_slot_id = graphene.UUID(required=True)

    custom_set = graphene.Field(CustomSet, required=True)

    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        item_slot_id = kwargs.get("item_slot_id")
        custom_set = db.session.query(ModelCustomSet).get(custom_set_id)
        if custom_set.owner_id and custom_set.owner_id != current_user.get_id():
            raise GraphQLError("You don't have permission to edit that set.")
        custom_set.unequip_item(item_slot_id)
        db.session.commit()

        return DeleteCustomSetItem(custom_set=custom_set)


class RegisterUser(graphene.Mutation):
    class Arguments:
        username = graphene.NonNull(graphene.String)
        email = graphene.NonNull(graphene.String)
        password = graphene.NonNull(graphene.String)

    user = graphene.Field(User)
    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        username = kwargs.get("username")
        email = kwargs.get("email")
        password = kwargs.get("password")
        validation.validate_registration(username, email, password)
        try:
            if current_user.is_authenticated:
                raise GraphQLError("You are already logged in.")
            user = ModelUser(
                username=username,
                email=email,
                password=ModelUser.generate_hash(password),
            )
            user.save_to_db()
            login_user(user)
            save_custom_sets()
        except Exception as e:
            raise GraphQLError("An error occurred while registering.")

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
            raise GraphQLError("You are already logged in.")
        email = kwargs.get("email")
        password = kwargs.get("password")
        remember = kwargs.get("remember")
        user = ModelUser.find_by_email(email)
        auth_error = GraphQLError("Invalid username or password.")
        if not user:
            raise auth_error
        if not user.check_password(password):
            raise auth_error
        login_user(user, remember=remember)
        save_custom_sets()
        return LoginUser(user=user, ok=True)


class LogoutUser(graphene.Mutation):
    ok = graphene.Boolean(required=True)

    def mutate(self, info):
        if current_user.is_authenticated:
            logout_user()
        return LogoutUser(ok=True)


class ItemFilters(graphene.InputObjectType):
    stats = graphene.NonNull(graphene.List(graphene.NonNull(StatEnum)))
    max_level = graphene.NonNull(graphene.Int)
    search = graphene.String(required=True)
    item_type_ids = graphene.NonNull(graphene.List(graphene.NonNull(graphene.UUID)))


class SetFilters(graphene.InputObjectType):
    stats = graphene.NonNull(graphene.List(graphene.NonNull(StatEnum)))
    max_level = graphene.NonNull(graphene.Int)
    search = graphene.String(required=True)


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
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        filters = kwargs.get("filters")
        items_query = (
            db.session.query(ModelItem)
            .join(ModelItemTranslation)
            .filter_by(locale=locale)
        )
        if filters:
            search = filters.search.strip()
            if filters.stats:
                items_query = items_query.join(ModelItemStat)
                stat_names = set(map(lambda x: Stat(x).name, filters.stats))
                stat_sq = (
                    db.session.query(
                        ModelItemStat.item_id,
                        func.count(ModelItemStat.uuid).label("num_stats_matched"),
                    )
                    .filter(
                        ModelItemStat.stat.in_(stat_names), ModelItemStat.max_value > 0
                    )
                    .group_by(ModelItemStat.item_id)
                    .subquery()
                )
                items_query = items_query.join(
                    stat_sq, ModelItem.uuid == stat_sq.c.item_id
                ).filter(stat_sq.c.num_stats_matched == len(stat_names))
            if filters.max_level:
                items_query = items_query.filter(ModelItem.level <= filters.max_level)
            if filters.search:
                items_query = (
                    items_query.join(ModelSet, isouter=True)
                    .join(ModelSetTranslation, isouter=True)
                    .filter(
                        func.upper(ModelItemTranslation.name).contains(
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
            ModelItem.level.desc(), ModelItemTranslation.name.asc()
        ).all()

    sets = relay.ConnectionField(
        graphene.NonNull(SetConnection), filters=graphene.Argument(SetFilters)
    )

    def resolve_sets(self, info, **kwargs):
        locale = info.context.accept_languages.best_match(
            supported_languages, default="en"
        )
        filters = kwargs.get("filters")
        set_query = (
            db.session.query(ModelSet)
            .join(ModelSetTranslation)
            .filter_by(locale=locale)
        )

        level_sq = (
            db.session.query(ModelItem.set_id, func.max(ModelItem.level).label("level"))
            .group_by(ModelItem.set_id)
            .subquery()
        )
        set_query = set_query.join(level_sq, ModelSet.uuid == level_sq.c.set_id)

        if filters:
            search = filters.search.strip()
            if filters.stats:
                set_query = set_query.join(ModelSetBonus)
                stat_names = set(map(lambda x: Stat(x).name, filters.stats))
                stat_sq = (
                    db.session.query(ModelSetBonus.set_id, ModelSetBonus.stat)
                    .group_by(ModelSetBonus.set_id, ModelSetBonus.stat)
                    .filter(ModelSetBonus.stat.in_(stat_names), ModelSetBonus.value > 0)
                ).subquery()
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
                ).filter(bonus_sq.c.num_stats_matched == len(stat_names))
            if filters.max_level:
                set_query = set_query.filter(level_sq.c.level <= filters.max_level)
            if filters.search:
                set_query = (
                    set_query.join(ModelItem)
                    .join(ModelItemTranslation)
                    .filter(
                        func.upper(ModelSetTranslation.name).contains(
                            func.upper(filters.search.strip())
                        )
                        | func.upper(ModelItemTranslation.name).contains(
                            func.upper(filters.search.strip())
                        )
                    )
                    .group_by(ModelSet.uuid, level_sq.c.level, ModelSetTranslation.name)
                )

        return set_query.order_by(
            level_sq.c.level.desc(), ModelSetTranslation.name.asc()
        ).all()

    custom_sets = graphene.List(CustomSet)

    def resolve_custom_sets(self, info):
        return db.session.query(ModelCustomSet).all()

    classes = graphene.List(Class)

    def resolve_classes(self, info):
        return db.session.query(ModelClass).all()

    # Retrieve record by uuid
    class_by_id = graphene.Field(Class, id=graphene.UUID(required=True))

    def resolve_class_by_id(self, info, id):
        return db.session.query(ModelClass).get(id)

    user_by_id = graphene.Field(User, id=graphene.UUID(required=True))

    def resolve_user_by_id(self, info, id):
        return db.session.query(ModelUser).get(id)

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


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_custom_set_item = UpdateCustomSetItem.Field()
    delete_custom_set_item = DeleteCustomSetItem.Field()
    mage_equipped_item = MageEquippedItem.Field()
    set_equipped_item_exo = SetEquippedItemExo.Field()
    edit_custom_set_metadata = EditCustomSetMetadata.Field()
    edit_custom_set_stats = EditCustomSetStats.Field()
    equip_set = EquipSet.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
