from app.database.model_user import ModelUserAccount
from flask_babel import _
from graphql import GraphQLError
import re


def validate_registration(username: str, email: str, password: str) -> None:
    validate_username(username)
    validate_email(email)
    validate_password(password)


def validate_email(email: str) -> None:
    regex = re.compile(r"[^@]+@[^@]+\.[^@]+")
    if not regex.fullmatch(email):
        raise GraphQLError(_("The email you entered is invalid."))
    db_user = ModelUserAccount.find_by_email(email)
    if db_user:
        raise GraphQLError(_("There already exists a user with that email."))


def validate_username(username: str) -> None:
    # regex from https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
    regex = re.compile("^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$")
    if not regex.fullmatch(username):
        raise GraphQLError(_("The display name you entered is invalid."))
    db_user = ModelUserAccount.find_by_username(username)
    if db_user:
        raise GraphQLError(_("There already exists a user with that display name."))


def validate_password(password: str) -> None:
    # regex from https://stackoverflow.com/questions/5859632/regular-expression-for-password-validation
    regex = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")
    if not regex.fullmatch(password):
        raise GraphQLError(
            _(
                "Passwords must have a minimum of 8 characters, at least one lowercase letter, one uppercase letter, and one number."
            )
        )
