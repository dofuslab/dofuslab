"""Shared fixtures for tests that exercise the real Flask GraphQL endpoint."""

from dataclasses import dataclass, field
import importlib
import os

import pytest
from dotenv import load_dotenv

from tests.graphql._target_safety import assert_safe_test_services


load_dotenv()
assert_safe_test_services(os.environ)

from app import app, limiter, session_scope
from app.database.enums import BuildGender
from app.database.model_custom_set import ModelCustomSet
from app.database.model_favorite_item import ModelFavoriteItem
from app.database.model_class import ModelClass
from app.database.model_custom_set_tag import ModelCustomSetTag
from app.database.model_item import ModelItem
from app.database.model_item_slot_translation import ModelItemSlotTranslation
from app.database.model_set import ModelSet
from app.database.model_user import ModelUserAccount
from app.database.model_user_setting import ModelUserSetting
from sqlalchemy import func


schema_module = importlib.import_module("app.schema")


TEST_PASSWORD = "Backend123"


class GraphQLResponseError(AssertionError):
    pass


class GraphQLClient:
    def __init__(self, created_records):
        self.client = app.test_client()
        self.created_records = created_records

    def execute(self, document, variables=None, expect_errors=False):
        response = self.client.post(
            "/api/graphql",
            json={"query": document, "variables": variables or {}},
            headers={"Accept-Language": "en"},
        )
        payload = response.get_json()
        with self.client.session_transaction() as client_session:
            for custom_set_id in client_session.get("owned_custom_sets", []):
                self.created_records.custom_set(str(custom_set_id))
            user_id = client_session.get("_user_id")
            if user_id:
                self.created_records.user(str(user_id))
        if response.status_code != 200:
            raise GraphQLResponseError(
                "GraphQL returned HTTP {}: {}".format(response.status_code, payload)
            )
        if not expect_errors and payload.get("errors"):
            raise GraphQLResponseError(str(payload["errors"]))
        return payload

    def login(self, email, password=TEST_PASSWORD):
        payload = self.execute(
            """
            mutation Login($email: String!, $password: String!) {
              loginUser(email: $email, password: $password, remember: false) {
                ok
                user { id email username verified }
              }
            }
            """,
            {"email": email, "password": password},
        )
        return payload["data"]["loginUser"]["user"]

    def logout(self):
        return self.execute("mutation { logoutUser { ok } }")


@dataclass
class CreatedRecords:
    custom_set_ids: list = field(default_factory=list)
    user_ids: list = field(default_factory=list)
    user_emails: list = field(default_factory=list)

    def custom_set(self, custom_set_id):
        if custom_set_id not in self.custom_set_ids:
            self.custom_set_ids.append(custom_set_id)
        return custom_set_id

    def user(self, user_id):
        if user_id not in self.user_ids:
            self.user_ids.append(user_id)
        return user_id

    def user_email(self, email):
        if email not in self.user_emails:
            self.user_emails.append(email)
        return email


@pytest.fixture
def isolate_external_services(monkeypatch):
    """Disable throttling and make outbound mail jobs observable but inert."""
    monkeypatch.setattr(limiter, "enabled", False)
    enqueued = []

    def record_enqueue(*args, **kwargs):
        enqueued.append((args, kwargs))
        return None

    monkeypatch.setattr(schema_module.q, "enqueue", record_enqueue)
    return enqueued


@pytest.fixture
def graphql_client(created_records):
    client = GraphQLClient(created_records)
    yield client
    with client.client.session_transaction() as client_session:
        client_session.clear()


@pytest.fixture
def second_graphql_client(created_records):
    client = GraphQLClient(created_records)
    yield client
    with client.client.session_transaction() as client_session:
        client_session.clear()


@pytest.fixture
def created_records():
    records = CreatedRecords()
    yield records
    with session_scope() as db_session:
        if records.user_emails:
            for user in db_session.query(ModelUserAccount).filter(
                ModelUserAccount.email.in_(records.user_emails)
            ):
                records.user(str(user.uuid))

        custom_sets = db_session.query(ModelCustomSet).filter(
            ModelCustomSet.uuid.in_(records.custom_set_ids),
        )
        for custom_set in custom_sets.all():
            db_session.delete(custom_set)
        db_session.flush()

        if records.user_ids:
            db_session.query(ModelFavoriteItem).filter(
                ModelFavoriteItem.user_account_id.in_(records.user_ids)
            ).delete(synchronize_session=False)
            owned_custom_sets = db_session.query(ModelCustomSet).filter(
                ModelCustomSet.owner_id.in_(records.user_ids)
            )
            for custom_set in owned_custom_sets.all():
                db_session.delete(custom_set)
            db_session.flush()
            db_session.query(ModelUserSetting).filter(
                ModelUserSetting.user_id.in_(records.user_ids)
            ).delete(synchronize_session=False)
            db_session.query(ModelUserAccount).filter(
                ModelUserAccount.uuid.in_(records.user_ids)
            ).delete(synchronize_session=False)


@pytest.fixture
def user_factory(created_records):
    counter = {"value": 0}

    def create(*, verified=True, password=TEST_PASSWORD):
        counter["value"] += 1
        suffix = "{}-{}".format(id(created_records), counter["value"])
        with session_scope() as db_session:
            user = ModelUserAccount(
                username="pytest_user_{}".format(suffix),
                email="pytest-{}@example.invalid".format(suffix),
                password=ModelUserAccount.generate_hash(password),
                profile_picture="profile-pictures/ProPic_Emerald_1.png",
                verified=verified,
            )
            db_session.add(user)
            db_session.flush()
            db_session.add(
                ModelUserSetting(
                    user_id=user.uuid,
                    locale="en",
                    classic=True,
                    build_gender=BuildGender.MALE,
                    build_class_id=None,
                )
            )
            user_id = str(user.uuid)
            email = user.email
        created_records.user(user_id)
        return {"id": user_id, "email": email, "password": password}

    return create


@pytest.fixture
def create_build(created_records):
    def create(client):
        payload = client.execute(
            """
            mutation {
              createCustomSet {
                customSet {
                  id name level buildGender hasEditPermission
                  stats { baseStrength scrolledStrength }
                  equippedItems { id }
                }
              }
            }
            """
        )
        custom_set = payload["data"]["createCustomSet"]["customSet"]
        created_records.custom_set(custom_set["id"])
        return custom_set

    return create


@pytest.fixture(scope="session")
def catalog_ids():
    """Resolve deterministic IDs from the disposable committed-data seed."""
    with session_scope() as db_session:
        item = (
            db_session.query(ModelItem)
            .join(ModelItem.item_type)
            .filter(ModelItem.item_type.has())
            .order_by(ModelItem.dofus_db_id, ModelItem.dofus_db_mount_id)
            .first()
        )
        assert item is not None and item.item_type.eligible_item_slots

        weapon_slot = (
            db_session.query(ModelItemSlotTranslation)
            .filter_by(locale="en", name="Weapon")
            .one()
        )
        weapon = next(
            seeded_item
            for seeded_item in db_session.query(ModelItem).order_by(
                ModelItem.dofus_db_id
            )
            if weapon_slot.item_slot in seeded_item.item_type.eligible_item_slots
        )

        ui_set = (
            db_session.query(ModelSet)
            .join(ModelItem, ModelItem.set_id == ModelSet.uuid)
            .group_by(ModelSet.uuid)
            .order_by(func.count(ModelItem.uuid).desc(), ModelSet.dofus_db_id)
            .first()
        )
        assert ui_set is not None
        set_item_ids = sorted(str(set_item.uuid) for set_item in ui_set.items)
        tag = (
            db_session.query(ModelCustomSetTag).order_by(ModelCustomSetTag.uuid).first()
        )
        character_class = db_session.query(ModelClass).order_by(ModelClass.uuid).first()
        assert tag is not None and character_class is not None

        return {
            "item": str(item.uuid),
            "item_slot": str(item.item_type.eligible_item_slots[0].uuid),
            "weapon": str(weapon.uuid),
            "weapon_slot": str(weapon_slot.item_slot_id),
            "set": str(ui_set.uuid),
            "set_items": set_item_ids,
            "tag": str(tag.uuid),
            "class": str(character_class.uuid),
        }


def error_messages(payload):
    return [error["message"] for error in payload.get("errors", [])]
