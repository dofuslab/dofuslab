"""End-to-end GraphQL coverage for account and preference mutations."""

import importlib
import re

import pytest

from app import session_scope
from app.database.model_favorite_item import ModelFavoriteItem
from app.database.model_user import ModelUserAccount
from app.database.model_user_setting import ModelUserSetting
from app.utils import ALLOWED_PROFILE_PICTURE_URLS

from tests.graphql.conftest import TEST_PASSWORD, error_messages


schema_module = importlib.import_module("app.schema")
pytestmark = pytest.mark.usefixtures("isolate_external_services")


REGISTER = """
mutation Register($username: String!, $email: String!, $password: String!) {
  registerUser(
    username: $username,
    email: $email,
    password: $password,
    gender: MALE
  ) {
    ok
    user { id username email verified settings { locale classic buildGender } }
  }
}
"""


def test_register_resend_logout_and_login_flow(
    graphql_client, created_records, isolate_external_services
):
    variables = {
        "username": "pytest_register_flow",
        "email": "pytest-register-flow@example.invalid",
        "password": TEST_PASSWORD,
    }
    registered = graphql_client.execute(REGISTER, variables)["data"]["registerUser"]
    created_records.user(registered["user"]["id"])
    assert registered["ok"] is True
    assert registered["user"] == {
        "id": registered["user"]["id"],
        "username": variables["username"],
        "email": variables["email"],
        "verified": False,
        "settings": {"locale": "en", "classic": True, "buildGender": "MALE"},
    }
    assert len(isolate_external_services) == 1
    assert isolate_external_services[0][0][1] == variables["email"]

    assert (
        graphql_client.execute("mutation { resendVerificationEmail { ok } }")["data"][
            "resendVerificationEmail"
        ]["ok"]
        is True
    )
    assert len(isolate_external_services) == 2

    assert graphql_client.logout()["data"]["logoutUser"]["ok"] is True
    assert graphql_client.logout()["data"]["logoutUser"]["ok"] is True
    anonymous_resend = graphql_client.execute(
        "mutation { resendVerificationEmail { ok } }", expect_errors=True
    )
    assert error_messages(anonymous_resend) == ["You must be signed in to do that."]
    invalid = graphql_client.execute(
        """
        mutation($email: String!) {
          loginUser(email: $email, password: "wrong", remember: false) { ok }
        }
        """,
        {"email": variables["email"]},
        expect_errors=True,
    )
    assert error_messages(invalid) == ["Invalid username or password."]
    assert graphql_client.login(variables["email"])["email"] == variables["email"]


def test_registration_validation_and_queue_failure_roll_back(
    graphql_client, monkeypatch
):
    invalid = graphql_client.execute(
        REGISTER,
        {
            "username": "x",
            "email": "not-an-email",
            "password": "weak",
        },
        expect_errors=True,
    )
    assert invalid.get("errors")

    failed_email = "pytest-queue-failure@example.invalid"

    def fail_enqueue(*_args, **_kwargs):
        raise RuntimeError("synthetic queue failure")

    monkeypatch.setattr(schema_module.q, "enqueue", fail_enqueue)
    failed = graphql_client.execute(
        REGISTER,
        {
            "username": "pytest_queue_failure",
            "email": failed_email,
            "password": TEST_PASSWORD,
        },
        expect_errors=True,
    )
    assert error_messages(failed) == ["An error occurred while registering."]
    with session_scope() as db_session:
        assert ModelUserAccount.find_by_email(failed_email) is None


def test_authenticated_preferences_profile_favorite_and_settings(
    graphql_client, user_factory, catalog_ids
):
    user = user_factory()

    anonymous = graphql_client.execute(
        "mutation($id: UUID!) { toggleFavoriteItem(itemId: $id, isFavorite: true) "
        "{ user { id } } }",
        {"id": catalog_ids["item"]},
        expect_errors=True,
    )
    assert error_messages(anonymous) == ["You are not logged in."]
    anonymous_profile = graphql_client.execute(
        'mutation { changeProfilePicture(picture: "profile-pictures/ProPic_Emerald_1.png") '
        "{ user { id } } }",
        expect_errors=True,
    )
    assert error_messages(anonymous_profile) == ["You are not logged in."]

    graphql_client.login(user["email"])
    data = graphql_client.execute(
        """
        mutation UpdateAccount($item: UUID!, $class: UUID!, $picture: String!) {
          changeLocale(locale: "fr") { ok }
          changeClassic(classic: false) { ok }
          toggleFavoriteItem(itemId: $item, isFavorite: true) {
            user { id favoriteItems { id } }
          }
          editBuildSettings(gender: FEMALE, buildDefaultClassId: $class) {
            userSetting { buildGender buildClassId }
          }
          changeProfilePicture(picture: $picture) {
            user { id profilePicture }
          }
        }
        """,
        {
            "item": catalog_ids["item"],
            "class": catalog_ids["class"],
            "picture": ALLOWED_PROFILE_PICTURE_URLS[-1],
        },
    )["data"]
    assert data["changeLocale"]["ok"] is True
    assert data["changeClassic"]["ok"] is True
    assert data["toggleFavoriteItem"]["user"]["favoriteItems"] == [
        {"id": catalog_ids["item"]}
    ]
    assert data["editBuildSettings"]["userSetting"] == {
        "buildGender": "FEMALE",
        "buildClassId": catalog_ids["class"],
    }
    assert data["changeProfilePicture"]["user"]["profilePicture"] == (
        ALLOWED_PROFILE_PICTURE_URLS[-1]
    )
    # The locale query follows Accept-Language; persistence is verified in the
    # user setting below. Classic is also mirrored in the server-side session.
    assert graphql_client.execute("query { locale classic }")["data"] == {
        "locale": "en",
        "classic": False,
    }

    invalid_picture = graphql_client.execute(
        'mutation { changeProfilePicture(picture: "https://example.invalid/x") '
        "{ user { id } } }",
        expect_errors=True,
    )
    assert error_messages(invalid_picture) == [
        "An error has ocurred while changing the profile picture."
    ]
    with session_scope() as db_session:
        favorite = (
            db_session.query(ModelFavoriteItem)
            .filter_by(user_account_id=user["id"], item_id=catalog_ids["item"])
            .one()
        )
        assert favorite is not None
        setting = db_session.query(ModelUserSetting).filter_by(user_id=user["id"]).one()
        persisted_user = db_session.query(ModelUserAccount).get(user["id"])
        assert setting.locale == "fr"
        assert setting.classic is False
        assert persisted_user.profile_picture == ALLOWED_PROFILE_PICTURE_URLS[-1]


def test_password_change_request_and_token_reset(
    graphql_client, user_factory, isolate_external_services
):
    user = user_factory()
    graphql_client.login(user["email"])

    wrong = graphql_client.execute(
        'mutation { changePassword(oldPassword: "wrong", '
        'newPassword: "Changed123") { ok } }',
        expect_errors=True,
    )
    assert error_messages(wrong) == ["Incorrect password."]
    changed = graphql_client.execute(
        'mutation { changePassword(oldPassword: "Backend123", '
        'newPassword: "Changed123") { ok } }'
    )
    assert changed["data"]["changePassword"]["ok"] is True
    graphql_client.logout()
    graphql_client.login(user["email"], "Changed123")
    graphql_client.logout()

    requested = graphql_client.execute(
        "mutation($email: String!) { requestPasswordReset(email: $email) { ok } }",
        {"email": user["email"]},
    )
    assert requested["data"]["requestPasswordReset"]["ok"] is True
    assert isolate_external_services[-1][0][1] == user["email"]

    queued_email_html = isolate_external_services[-1][0][3]
    token_match = re.search(r"reset-password\?token=([^\"'<\s]+)", queued_email_html)
    assert token_match is not None
    token = token_match.group(1)
    invalid = graphql_client.execute(
        'mutation { resetPassword(token: "bad-token", '
        'password: "Finalpass123") { ok } }',
        expect_errors=True,
    )
    assert error_messages(invalid) == [
        "The link is invalid or expired. Please request a new one."
    ]
    reset = graphql_client.execute(
        "mutation($token: String!) { resetPassword(token: $token, "
        'password: "Finalpass123") { ok } }',
        {"token": token},
    )
    assert reset["data"]["resetPassword"]["ok"] is True
    graphql_client.login(user["email"], "Finalpass123")


def test_verified_user_cannot_resend_verification(graphql_client, user_factory):
    user = user_factory(verified=True)
    graphql_client.login(user["email"])
    rejected = graphql_client.execute(
        "mutation { resendVerificationEmail { ok } }", expect_errors=True
    )
    assert error_messages(rejected) == ["Your account is already verified."]
