from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    jwt_refresh_token_required,
    get_jwt_identity,
    get_raw_jwt,
)
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_condition import ModelItemCondition
from app.database.model_item_type import ModelItemType
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_item import ModelItem
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_equipped_item import ModelEquippedItem
from app.database.model_custom_set import ModelCustomSet
from app.database.model_user import ModelUser
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
from app.database import base
from app.database.enums import Stat
import app.mutation_validation_utils as validation
import graphene
from graphql import GraphQLError

StatEnum = graphene.Enum.from_enum(Stat)


class ItemStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemStat
        interfaces = (graphene.relay.Node,)


class ItemCondtions(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemCondition
        interfaces = (graphene.relay.Node,)


class ItemSlot(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemSlot
        interfaces = (graphene.relay.Node,)


class ItemType(SQLAlchemyObjectType):
    eligible_item_slots = graphene.List(ItemSlot)  # Use list instead of connection

    class Meta:
        model = ModelItemType
        interfaces = (graphene.relay.Node,)


class ItemTranslation(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemTranslation
        interfaces = (graphene.relay.Node,)


class Item(SQLAlchemyObjectType):
    stats = graphene.NonNull(
        graphene.List(graphene.NonNull(ItemStats))  # Use list instead of connection
    )
    conditions = graphene.NonNull(graphene.List(graphene.NonNull(ItemCondtions)))
    item_translations = graphene.NonNull(
        graphene.List(graphene.NonNull(ItemTranslation))
    )

    class Meta:
        model = ModelItem
        interfaces = (graphene.relay.Node,)


class SetBonus(SQLAlchemyObjectType):
    class Meta:
        model = ModelSetBonus
        interfaces = (graphene.relay.Node,)


class SetTranslation(SQLAlchemyObjectType):
    class Meta:
        model = ModelSetTranslation
        interfaces = (graphene.relay.Node,)


class Set(SQLAlchemyObjectType):
    bonuses = graphene.NonNull(graphene.List(graphene.NonNull(SetBonus)))
    set_translation = graphene.NonNull(graphene.List(graphene.NonNull(SetTranslation)))

    class Meta:
        model = ModelSet
        interfaces = (graphene.relay.Node,)


class EquippedItemExo(SQLAlchemyObjectType):
    class Meta:
        model = ModelEquippedItemExo
        interfaces = (graphene.relay.Node,)


class EquippedItem(SQLAlchemyObjectType):
    class Meta:
        model = ModelEquippedItem
        interfaces = (graphene.relay.Node,)


class CustomSet(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSet
        interfaces = (graphene.relay.Node,)


class CustomSetStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSetStat
        interfaces = (graphene.relay.Node,)


class CustomSetStatsInput(graphene.InputObjectType):
    scrolled_vitality = graphene.Int()
    scrolled_wisdom = graphene.Int()
    scrolled_strength = graphene.Int()
    scrolled_intelligence = graphene.Int()
    scrolled_chance = graphene.Int()
    scrolled_agility = graphene.Int()

    base_vitality = graphene.Int()
    base_wisdom = graphene.Int()
    base_strength = graphene.Int()
    base_intelligence = graphene.Int()
    base_chance = graphene.Int()
    base_agility = graphene.Int()


class CustomSetExosInput(graphene.InputObjectType):
    stat = StatEnum
    value = graphene.Int()


class CreateCustomSet(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        description = graphene.String()
        owner_username = graphene.String()
        created_at = graphene.types.datetime.DateTime()
        level = graphene.NonNull(graphene.Int)

        items = graphene.NonNull(graphene.List(graphene.String))
        stats = CustomSetStatsInput()
        exos = graphene.NonNull(graphene.List(CustomSetExosInput))

    custom_set = graphene.Field(CustomSet)

    @jwt_required
    def mutate(self, into, **kwargs):
        custom_set = ModelCustomSet(
            name=kwargs.get("name"),
            description=kwargs.get("description"),
            created_at=kwargs.get("created_at"),
            level=kwargs.get("level"),
        )

        # Add associated items to the custom set
        # Modify to take in item objects
        if kwargs.get("items"):
            items = kwargs.get("items")
            for item in items:
                item_record = (
                    base.db_session.query(ModelItem)
                    .filter(ModelItem.name == item)
                    .first()
                )
                custom_set.items.append(item_record)

        # Create database entry for the stats then add to the custom set
        if kwargs.get("stats"):
            stats = kwargs.get("stats")
            custom_set_stats = ModelCustomSetStat(
                scrolled_vitality=stats.scrolled_vitality,
                scrolled_wisdom=stats.scrolled_wisdom,
                scrolled_strength=stats.scrolled_strength,
                scrolled_intelligence=stats.scrolled_intelligence,
                scrolled_chance=stats.scrolled_chance,
                scrolled_agility=stats.scrolled_agility,
                base_vitality=stats.base_vitality,
                base_wisdom=stats.base_wisdom,
                base_strength=stats.base_strength,
                base_intelligence=stats.base_intelligence,
                base_chance=stats.base_chance,
                base_agility=stats.base_agility,
            )

            base.db_session.add(custom_set_stats)
            custom_set.stats = custom_set_stats

        if kwargs.get("exos"):
            exos = kwargs.get("exos")
            for exo in exos:
                equipped_item_exo = ModelEquippedItemExos(
                    stat=exo.stat, value=exo.value
                )

                base.db_session.add(equipped_item_exo)
                custom_set.exos.append(exo)

        base.db_session.add(custom_set)

        current_user = (
            base.db_session.query(ModelUser)
            .filter(ModelUser.username == kwargs.get("owner_username"))
            .first()
        )
        current_user.custom_sets.append(custom_set)

        base.db_session.commit()

        return CreateCustomSet(custom_set=custom_set)


class User(SQLAlchemyObjectType):
    access_token = graphene.String(required=True)

    class Meta:
        model = ModelUser
        interfaces = (graphene.relay.Node,)
        only_fields = ("uuid", "id", "username", "email", "custom_sets")


class RegisterUser(graphene.Mutation):
    class Arguments:
        username = graphene.NonNull(graphene.String)
        email = graphene.NonNull(graphene.String)
        password = graphene.NonNull(graphene.String)

    access_token = graphene.String(required=True)
    refresh_token = graphene.String(required=True)

    def mutate(self, info, **kwargs):
        username = kwargs.get("username")
        email = kwargs.get("email")
        password = kwargs.get("password")
        validation.validate_registration(username, email, password)
        try:
            user = ModelUser(
                username=username,
                email=email,
                password=ModelUser.generate_hash(password),
            )
            user.save_to_db()
            access_token = create_access_token(identity=username)
            refresh_token = create_refresh_token(identity=username)
        except Exception as e:
            print(e)
            raise GraphQLError("An error occurred while registering.")

        return RegisterUser(access_token=access_token, refresh_token=refresh_token)


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    access_token = graphene.String(required=True)
    refresh_token = graphene.String(required=True)

    def mutate(self, info, **kwargs):
        email = kwargs.get("email")
        password = kwargs.get("password")
        user = ModelUser.find_by_email(email)
        auth_error = GraphQLError("Invalid username or password.")
        if not user:
            raise auth_error
        if not user.check_password(password):
            raise auth_error
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        return LoginUser(access_token=access_token, refresh_token=refresh_token)


class Query(graphene.ObjectType):
    # Get list of data
    items = graphene.NonNull(graphene.List(graphene.NonNull(Item)))

    def resolve_items(self, info):
        query = Item.get_query(info)
        return query.all()

    sets = graphene.NonNull(graphene.List(graphene.NonNull(Set)))

    def resolve_sets(self, info):
        query = Set.get_query(info)
        return query.all()

    custom_sets = graphene.List(CustomSet)

    def resolve_custom_sets(self, info):
        query = CustomSet.get_query(info)
        return query.all()

    # Retrieve record by uuid
    user_by_uuid = graphene.Field(User, uuid=graphene.String(required=True))

    def resolve_user_by_uuid(self, info, uuid):
        query = User.get_query(info)
        return query.filter(uuid == uuid).first()

    item_by_uuid = graphene.Field(Item, uuid=graphene.String(required=True))

    def resolve_item_by_uuid(self, info, uuid):
        query = Item.get_query(info)
        return query.filter(uuid == uuid).first()

    set_by_uuid = graphene.Field(Set, uuid=graphene.String(required=True))

    def resolve_set_by_uuid(self, info, uuid):
        query = Set.get_query(info)
        return query.filter(uuid == uuid).first()

    custom_set_by_uuid = graphene.Field(CustomSet, uuid=graphene.String(required=True))

    def resolve_custom_set_by_uuid(self, info, uuid):
        query = CustomSet.get_query(info)
        return query.filter(uuid == uuid).first()


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    create_custom_set = CreateCustomSet.Field()
    login_user = LoginUser.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
