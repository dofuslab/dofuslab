from database.model_user import ModelUser
from database import base
from graphql import GraphQLError
import graphene


def check_for_existing_user(username):
    db_user = (
        base.db_session.query(ModelUser)
        .filter(ModelUser.username == username)
        .first()
    )

    if db_user == None:
        print('no existing user found, creating new user')
        return

    raise GraphQLError('Username already exists')
