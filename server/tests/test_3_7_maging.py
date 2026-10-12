"""Run against a migrated, seeded local database: pytest tests/test_3_7_maging.py."""

from app import app, limiter, session_scope
from app.database.model_item import ModelItem
from app.database.model_item_slot_translation import ModelItemSlotTranslation
from app.database.model_custom_set import ModelCustomSet


def test_independent_mage_persistence_copy_and_reset(monkeypatch):
    monkeypatch.setattr(limiter, "enabled", False)
    client = app.test_client()
    build_ids = []

    def query(document, variables=None, allow_errors=False):
        response = client.post(
            "/api/graphql",
            json={"query": document, "variables": variables or {}},
            headers={"Accept-Language": "en"},
        )
        result = response.get_json()
        assert response.status_code == 200
        if not allow_errors:
            assert not result.get("errors"), result.get("errors")
        return result

    with session_scope() as db:
        weapon_id = str(db.query(ModelItem).filter_by(dofus_db_id="1355").one().uuid)
        slot_id = str(
            db.query(ModelItemSlotTranslation)
            .filter_by(locale="en", name="Weapon")
            .one()
            .item_slot_id
        )

    fields = "id weaponElementMage weaponHealingMage"
    mage_mutation = (
        "mutation($id: UUID!, $damage: WeaponElementMage, $healing: WeaponElementMage) { "
        "mageEquippedItem(equippedItemId: $id, stats: [], weaponElementMage: $damage, "
        "weaponHealingMage: $healing) { equippedItem { " + fields + " } } }"
    )
    try:
        build = query("mutation { createCustomSet { customSet { id } } }")["data"][
            "createCustomSet"
        ]["customSet"]["id"]
        build_ids.append(build)
        equipped = query(
            "mutation($build: UUID!, $slot: UUID!, $item: UUID!) { "
            "updateCustomSetItem(customSetId: $build, itemSlotId: $slot, itemId: $item) { "
            "customSet { equippedItems { " + fields + " } } } }",
            {"build": build, "slot": slot_id, "item": weapon_id},
        )["data"]["updateCustomSetItem"]["customSet"]["equippedItems"][0]
        result = query(
            mage_mutation,
            {"id": equipped["id"], "damage": "FIRE_10", "healing": "WATER_100"},
        )["data"]["mageEquippedItem"]["equippedItem"]
        assert result["weaponElementMage"] == "FIRE_10"
        assert result["weaponHealingMage"] == "WATER_100"

        read = query(
            "query($id: UUID!) { customSetById(id: $id) { equippedItems { "
            + fields
            + " } } }",
            {"id": build},
        )["data"]["customSetById"]["equippedItems"][0]
        assert read == result
        copied = query(
            "mutation($id: UUID!) { copyCustomSet(customSetId: $id) { customSet { "
            "id equippedItems { " + fields + " } } } }",
            {"id": build},
        )["data"]["copyCustomSet"]["customSet"]
        build_ids.append(copied["id"])
        assert copied["equippedItems"][0]["weaponElementMage"] == "FIRE_10"
        assert copied["equippedItems"][0]["weaponHealingMage"] == "WATER_100"

        rejected = query(
            mage_mutation,
            {"id": equipped["id"], "damage": "AIR_100", "healing": "WATER_68"},
            allow_errors=True,
        )
        assert rejected.get("errors")
        legacy = query(
            "mutation($id: UUID!) { mageEquippedItem(equippedItemId: $id, stats: [], "
            "weaponElementMage: FIRE_85) { equippedItem { " + fields + " } } }",
            {"id": equipped["id"]},
        )["data"]["mageEquippedItem"]["equippedItem"]
        assert legacy["weaponElementMage"] == "FIRE_100"
        assert legacy["weaponHealingMage"] == "WATER_100"

        cleared = query(
            mage_mutation,
            {"id": equipped["id"], "damage": None, "healing": "WATER_100"},
        )["data"]["mageEquippedItem"]["equippedItem"]
        assert cleared["weaponElementMage"] is None
        assert cleared["weaponHealingMage"] == "WATER_100"
        cleared = query(
            mage_mutation, {"id": equipped["id"], "damage": "FIRE_100", "healing": None}
        )["data"]["mageEquippedItem"]["equippedItem"]
        assert cleared["weaponElementMage"] == "FIRE_100"
        assert cleared["weaponHealingMage"] is None
        replaced = query(
            "mutation($build: UUID!, $slot: UUID!, $item: UUID!) { "
            "updateCustomSetItem(customSetId: $build, itemSlotId: $slot, itemId: $item) { "
            "customSet { equippedItems { " + fields + " } } } }",
            {"build": build, "slot": slot_id, "item": weapon_id},
        )["data"]["updateCustomSetItem"]["customSet"]["equippedItems"][0]
        assert replaced["weaponElementMage"] is None
        assert replaced["weaponHealingMage"] is None
    finally:
        with session_scope() as db:
            for build_id in build_ids:
                db.delete(db.query(ModelCustomSet).get(build_id))
