"""Schema-level regression tests for anonymous and authenticated sessions."""

import pytest

from app import session_scope
from app.database.model_custom_set import ModelCustomSet

from conftest import error_messages


pytestmark = pytest.mark.usefixtures("isolate_external_services")


READ_BUILD = """
query ReadBuild($id: UUID!) {
  customSetById(id: $id) {
    id name level hasEditPermission
    stats { baseStrength scrolledStrength }
    equippedItems { id item { id } slot { id } }
  }
}
"""

EDIT_BUILD = """
mutation EditBuild($id: UUID!, $name: String!, $level: Int!) {
  editCustomSetMetadata(customSetId: $id, name: $name, level: $level) {
    customSet { id name level hasEditPermission }
  }
}
"""


def test_anonymous_build_round_trip_and_cross_session_recovery(
    graphql_client,
    second_graphql_client,
    create_build,
    created_records,
):
    original = create_build(graphql_client)
    build_id = original["id"]

    edited = graphql_client.execute(
        EDIT_BUILD,
        {"id": build_id, "name": "Anonymous draft", "level": 199},
    )["data"]["editCustomSetMetadata"]["customSet"]
    assert edited == {
        "id": build_id,
        "name": "Anonymous draft",
        "level": 199,
        "hasEditPermission": True,
    }

    same_session = graphql_client.execute(READ_BUILD, {"id": build_id})["data"]
    assert same_session["customSetById"]["hasEditPermission"] is True

    # The build itself is public/readable by UUID, but the Redis-backed session is
    # the edit capability for an ownerless anonymous build.
    other_session = second_graphql_client.execute(READ_BUILD, {"id": build_id})["data"][
        "customSetById"
    ]
    assert other_session["name"] == "Anonymous draft"
    assert other_session["hasEditPermission"] is False
    denied = second_graphql_client.execute(
        EDIT_BUILD,
        {"id": build_id, "name": "Stolen", "level": 1},
        expect_errors=True,
    )
    assert error_messages(denied) == ["You don't have permission to edit that build."]

    # copyCustomSet intentionally accepts a public source and gives the copy to
    # the current session. This is the recovery path after session loss.
    copied = second_graphql_client.execute(
        """
        mutation Copy($id: UUID!) {
          copyCustomSet(customSetId: $id) {
            customSet { id name level hasEditPermission parentCustomSetId }
          }
        }
        """,
        {"id": build_id},
    )["data"]["copyCustomSet"]["customSet"]
    created_records.custom_set(copied["id"])
    assert copied["name"] == "Anonymous draft copy"
    assert copied["level"] == 199
    assert copied["parentCustomSetId"] == build_id
    assert copied["hasEditPermission"] is True


def test_login_claims_anonymous_build_for_durable_user_ownership(
    graphql_client,
    second_graphql_client,
    create_build,
    user_factory,
):
    anonymous_build = create_build(graphql_client)
    user = user_factory()

    graphql_client.login(user["email"])
    with session_scope() as db_session:
        persisted = db_session.query(ModelCustomSet).get(anonymous_build["id"])
        assert str(persisted.owner_id) == user["id"]

    graphql_client.logout()
    graphql_client.login(user["email"])
    assert (
        graphql_client.execute(READ_BUILD, {"id": anonymous_build["id"]})["data"][
            "customSetById"
        ]["hasEditPermission"]
        is True
    )

    denied = second_graphql_client.execute(
        EDIT_BUILD,
        {"id": anonymous_build["id"], "name": "Other user", "level": 1},
        expect_errors=True,
    )
    assert error_messages(denied) == ["You don't have permission to edit that build."]


def test_locale_and_classic_preferences_round_trip_for_anonymous_session(
    graphql_client,
):
    assert graphql_client.execute("query { locale classic }")["data"] == {
        "locale": "en",
        "classic": False,
    }
    assert graphql_client.execute(
        'mutation { changeLocale(locale: "fr") { ok } '
        "changeClassic(classic: true) { ok } }"
    )["data"] == {
        "changeLocale": {"ok": True},
        "changeClassic": {"ok": True},
    }
    assert (
        graphql_client.execute(
            "query { locale classic itemSlots { id name } classes { id name } }"
        )["data"]["classic"]
        is True
    )


def test_unknown_build_read_is_null_and_edit_is_a_domain_error(graphql_client):
    missing_id = "00000000-0000-0000-0000-000000000001"
    assert graphql_client.execute(READ_BUILD, {"id": missing_id})["data"] == {
        "customSetById": None
    }
    edited = graphql_client.execute(
        EDIT_BUILD,
        {"id": missing_id, "name": "Missing", "level": 1},
        expect_errors=True,
    )
    # This currently documents a defect boundary: the endpoint must report an
    # error and must not create or mutate data. The exact internal exception is
    # deliberately not asserted as desirable behavior.
    assert edited.get("errors")
    with session_scope() as db_session:
        assert db_session.query(ModelCustomSet).get(missing_id) is None
