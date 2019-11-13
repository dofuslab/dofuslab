from database.model_item import ModelItem
from database.model_set import ModelSet
from database.model_custom_set import ModelCustomSet
from database.model_user import ModelUser
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
import graphene

class Item(SQLAlchemyObjectType):
    class Meta:
        model = ModelItem
        interfaces = (graphene.relay.Node,)

class Set(SQLAlchemyObjectType):
    class Meta:
        model = ModelSet
        interfaces = (graphene.relay.Node,)

class CustomSet(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSet
        interfaces = (graphene.relay.Node,)

class User(SQLAlchemyObjectType):
    class Meta:
        model = ModelUser
        interfaces = (graphene.relay.Node,)

class Query(graphene.ObjectType):
    node = graphene.relay.Node.Field()
    item = graphene.relay.Node.Field(Item)
    all_items = SQLAlchemyConnectionField(Item)
    set = graphene.relay.Node.Field(Set)
    all_sets = SQLAlchemyConnectionField(Set)
    custom_set = graphene.relay.Node.Field(CustomSet)
    all_custom_sets = SQLAlchemyConnectionField(CustomSet)
    user = graphene.relay.Node.Field(User)
    all_users = SQLAlchemyConnectionField(User)

schema = graphene.Schema(query=Query)
