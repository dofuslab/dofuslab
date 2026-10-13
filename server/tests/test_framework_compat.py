from uuid import uuid4

import pytest
from flask import jsonify
from flask_limiter.errors import RateLimitExceeded

from app import app, bcrypt, db, limiter
from app.database.enums import BuildGender
from app.database.model_user import ModelUserAccount
from app.database.model_user_setting import ModelUserSetting


@app.get("/_framework-compat/limited")
@limiter.limit("2/minute")
def framework_compat_limited():
    return {"ok": True}


@app.get("/_framework-compat/error")
def framework_compat_error():
    raise RuntimeError("framework compatibility probe")


@app.errorhandler(RuntimeError)
def framework_compat_error_handler(error):
    return jsonify(error=type(error).__name__), 500


@pytest.fixture()
def user():
    suffix = uuid4().hex
    account = ModelUserAccount(
        username=f"compat-{suffix}",
        email=f"compat-{suffix}@example.invalid",
        password=bcrypt.generate_password_hash("Password1"),
        profile_picture="profile-pictures/ProPic_Emerald_1.png",
        verified=True,
    )
    db.session.add(account)
    db.session.flush()
    db.session.add(
        ModelUserSetting(
            user_id=account.uuid,
            locale="en",
            classic=True,
            build_gender=BuildGender.MALE,
        )
    )
    db.session.commit()
    yield account
    db.session.query(ModelUserSetting).filter_by(user_id=account.uuid).delete()
    db.session.query(ModelUserAccount).filter_by(uuid=account.uuid).delete()
    db.session.commit()


def graphql(client, query):
    return client.post("/api/graphql", json={"query": query})


def test_login_session_query_and_logout_round_trip(user):
    client = app.test_client()

    login = graphql(
        client,
        """
        mutation {
          loginUser(email: "%s", password: "Password1", remember: false) {
            ok
            user { username }
          }
        }
        """ % user.email,
    )
    assert login.status_code == 200
    assert login.get_json()["data"]["loginUser"] == {
        "ok": True,
        "user": {"username": user.username},
    }
    session_cookie = client.get_cookie(app.config["SESSION_COOKIE_NAME"])
    assert session_cookie is not None
    assert session_cookie.http_only is True
    assert session_cookie.same_site == "Lax"

    current = graphql(client, "{ currentUser { username } }")
    assert current.get_json()["data"]["currentUser"]["username"] == user.username

    logout = graphql(client, "mutation { logoutUser { ok } }")
    assert logout.get_json()["data"]["logoutUser"]["ok"] is True
    current = graphql(client, "{ currentUser { username } }")
    assert current.get_json()["data"]["currentUser"] is None


def test_graphql_schema_and_validation_error_contract_remain_stable():
    client = app.test_client()
    schema_response = graphql(
        client,
        "{ __schema { mutationType { fields { name } } } }",
    )
    mutation_names = {
        field["name"]
        for field in schema_response.get_json()["data"]["__schema"]["mutationType"][
            "fields"
        ]
    }
    assert {
        "registerUser",
        "loginUser",
        "logoutUser",
        "createCustomSet",
    } <= mutation_names

    invalid = graphql(
        client,
        'mutation { loginUser(email: "missing@example.invalid") { ok } }',
    )
    assert invalid.status_code == 400
    messages = [error["message"] for error in invalid.get_json()["errors"]]
    assert any('argument "password"' in message for message in messages)


def test_limiter_and_registered_error_handler_work_with_flask_3():
    limiter.reset()
    client = app.test_client()
    assert client.get("/_framework-compat/limited").status_code == 200
    assert client.get("/_framework-compat/limited").status_code == 200
    limited = client.get("/_framework-compat/limited")
    assert limited.status_code == 429
    assert isinstance(limited.get_json(), dict) or limited.content_type.startswith(
        "text/html"
    )

    error = client.get("/_framework-compat/error")
    assert error.status_code == 500
    assert error.get_json() == {"error": "RuntimeError"}
