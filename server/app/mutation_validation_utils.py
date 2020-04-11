from app.database.model_user import ModelUserAccount
from app.database import base
from flask_babel import _
from graphql import GraphQLError
import graphene
import re


def validate_registration(username, email, password):
    validate_username(username)
    validate_email(email)
    validate_password(password)


def validate_email(email):
    regex = re.compile("[^@]+@[^@]+\.[^@]+")
    if not regex.fullmatch(email):
        raise GraphQLError(_("The email you entered is invalid."))
    db_user = ModelUserAccount.find_by_email(email)
    if db_user:
        raise GraphQLError(_("There already exists a user with that email."))


def validate_username(username):
    # regex from https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
    regex = re.compile("^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$")
    if not regex.fullmatch(username):
        raise GraphQLError(_("The display name you entered is invalid."))
    db_user = ModelUserAccount.find_by_username(username)
    if db_user:
        raise GraphQLError(_("There already exists a user with that display name."))


def validate_password(password):
    # regex from https://stackoverflow.com/questions/5859632/regular-expression-for-password-validation
    regex = re.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$")
    if not regex.fullmatch(password):
        raise GraphQLError(
            _(
                "Passwords must have a minimum of 8 characters, at least one lowercase letter, one uppercase letter, and one number."
            )
        )
