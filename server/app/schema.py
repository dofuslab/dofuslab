from app.database.model_item_stat import ModelItemStat
from app.database.model_item_condition import ModelItemCondition
from app.database.model_item_type import ModelItemType
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item import ModelItem
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set import ModelSet
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.model_equipped_item_exo import ModelEquippedItemExo
from app.database.model_equipped_item import ModelEquippedItem
from app.database.model_custom_set import ModelCustomSet
from app.database.model_user import ModelUser
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
from app.database.base import Base, session_scope
from app.database.enums import Stat
import app.mutation_validation_utils as validation
import graphene
import uuid
from graphql import GraphQLError
from flask_login import login_required, login_user, current_user, logout_user


class GlobalNode(graphene.Interface):
    id = graphene.UUID(required=True)

    def resolve_id(self, info):
        return self.uuid


StatEnum = graphene.Enum.from_enum(Stat)


class ItemStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemStat
        interfaces = (GlobalNode,)


class ItemCondtions(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemCondition
        interfaces = (GlobalNode,)


class ItemSlot(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemSlot
        interfaces = (GlobalNode,)


class ItemType(SQLAlchemyObjectType):
    eligible_item_slots = graphene.List(ItemSlot)  # Use list instead of connection

    class Meta:
        model = ModelItemType
        interfaces = (GlobalNode,)


class Item(SQLAlchemyObjectType):
    stats = graphene.NonNull(
        graphene.List(graphene.NonNull(ItemStats))  # Use list instead of connection
    )
    conditions = graphene.NonNull(graphene.List(graphene.NonNull(ItemCondtions)))

    class Meta:
        model = ModelItem
        interfaces = (GlobalNode,)


class SetBonus(SQLAlchemyObjectType):
    class Meta:
        model = ModelSetBonus
        interfaces = (GlobalNode,)


class Set(SQLAlchemyObjectType):
    class Meta:
        model = ModelSet
        interfaces = (GlobalNode,)


class EquippedItemExo(SQLAlchemyObjectType):
    class Meta:
        model = ModelEquippedItemExo
        interfaces = (GlobalNode,)


class EquippedItem(SQLAlchemyObjectType):
    class Meta:
        model = ModelEquippedItem
        interfaces = (GlobalNode,)
        only_fields = ("id", "item", "slot", "exos")


class CustomSet(SQLAlchemyObjectType):
    equipped_items = graphene.NonNull(graphene.List(graphene.NonNull(EquippedItem)))

    class Meta:
        model = ModelCustomSet
        interfaces = (GlobalNode,)


class CustomSetStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSetStat
        interfaces = (GlobalNode,)


class User(SQLAlchemyObjectType):
    access_token = graphene.String(required=True)

    class Meta:
        model = ModelUser
        interfaces = (GlobalNode,)
        only_fields = ("id", "username", "email", "custom_sets")


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

    def mutate(self, info, **kwargs):
        custom_set = ModelCustomSet(
            name=kwargs.get("name"),
            description=kwargs.get("description"),
            created_at=kwargs.get("created_at"),
            level=kwargs.get("level"),
        )
        with session_scope() as session:
            # Add associated items to the custom set
            # Modify to take in item objects
            if kwargs.get("items"):
                items = kwargs.get("items")

                for item in items:
                    item_record = (
                        session.query(ModelItem).filter(ModelItem.name == item).first()
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

                session.add(custom_set_stats)
                custom_set.stats = custom_set_stats

            if kwargs.get("exos"):
                exos = kwargs.get("exos")
                for exo in exos:
                    equipped_item_exo = ModelEquippedItemExos(
                        stat=exo.stat, value=exo.value
                    )

                    session.add(equipped_item_exo)
                    custom_set.exos.append(exo)

            session.add(custom_set)

            # current_user = (
            #     db_session.query(ModelUser)
            #     .filter(ModelUser.username == kwargs.get("owner_username"))
            #     .first()
            # )
            # current_user.custom_sets.append(custom_set)

        return CreateCustomSet(custom_set=custom_set)


class UpdateCustomSetItem(graphene.Mutation):
    class Arguments:
        # if null, create new set
        custom_set_id = graphene.UUID()
        item_slot_id = graphene.UUID()
        item_id = graphene.UUID()

    custom_set = graphene.Field(CustomSet, required=True)

    def mutate(self, info, **kwargs):
        custom_set_id = kwargs.get("custom_set_id")
        item_slot_id = kwargs.get("item_slot_id")
        item_id = kwargs.get("item_id")
        with session_scope() as session:
            if custom_set_id:
                custom_set = ModelCustomSet.query.get(custom_set_id)
                if custom_set.owner_id != current_user.get_id():
                    raise GraphQLError("You don't have permission to edit that set.")
            else:
                custom_set = ModelCustomSet(owner_id=current_user.get_id())
                session.add(custom_set)
            custom_set.equip_item(session, item_id, item_slot_id)

        return UpdateCustomSetItem(custom_set=custom_set)


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
        except Exception as e:
            raise GraphQLError("An error occurred while registering.")

        return RegisterUser(user=user, ok=True)


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(User)
    ok = graphene.Boolean(required=True)

    def mutate(self, info, **kwargs):
        if current_user.is_authenticated:
            raise GraphQLError("You are already logged in.")
        email = kwargs.get("email")
        password = kwargs.get("password")
        user = ModelUser.find_by_email(email)
        auth_error = GraphQLError("Invalid username or password.")
        if not user:
            raise auth_error
        if not user.check_password(password):
            raise auth_error
        login_user(user, remember=True)

        return LoginUser(user=user, ok=True)


class LogoutUser(graphene.Mutation):
    ok = graphene.Boolean(required=True)

    def mutate(self, info):
        if current_user.is_authenticated:
            logout_user()
        return LogoutUser(ok=True)


class Query(graphene.ObjectType):
    current_user = graphene.Field(User)

    def resolve_current_user(self, info):
        if current_user.is_authenticated:
            return current_user._get_current_object()
        return None

    # Get list of data
    items = graphene.NonNull(graphene.List(graphene.NonNull(Item)))

    def resolve_items(self, info):
        query = Item.get_query(info)
        return query.all()

    custom_sets = graphene.List(CustomSet)

    def resolve_custom_sets(self, info):
        query = CustomSet.get_query(info)
        return query.all()

    # Retrieve record by uuid
    user_by_id = graphene.Field(User, id=graphene.UUID(required=True))

    def resolve_user_by_id(self, info, id):
        query = User.get_query(info)
        return query.filter_by(uuid=id).one_or_none()

    # also query for set and return it
    item_by_id = graphene.Field(Item, id=graphene.UUID(required=True))

    def resolve_item_by_id(self, info, id):
        query = Item.get_query(info)
        return query.filter_by(uuid=id).one_or_none()

    set_by_id = graphene.Field(Set, id=graphene.UUID(required=True))

    def resolve_set_by_id(self, info, id):
        query = Set.get_query(info)
        return query.filter_by(uuid=id).one_or_none()

    custom_set_by_id = graphene.Field(CustomSet, id=graphene.UUID(required=True))

    def resolve_custom_set_by_id(self, info, id):
        query = CustomSet.get_query(info)
        return query.filter_by(uuid=id).one_or_none()

    item_slots = graphene.NonNull(graphene.List(graphene.NonNull(ItemSlot)))

    def resolve_item_slots(self, info):
        query = ItemSlot.get_query(info)
        return query.all()


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    create_custom_set = CreateCustomSet.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_custom_set_item = UpdateCustomSetItem.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
