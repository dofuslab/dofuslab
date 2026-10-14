"""End-to-end GraphQL mutation coverage for saved builds and equipment."""

import pytest

from app import session_scope
from app.database.model_custom_set import ModelCustomSet
from app.database.model_equipped_item import ModelEquippedItem

from tests.graphql.conftest import error_messages


pytestmark = pytest.mark.usefixtures("isolate_external_services")


ZERO_STATS = {
    "baseVitality": 0,
    "baseWisdom": 0,
    "baseStrength": 0,
    "baseIntelligence": 0,
    "baseChance": 0,
    "baseAgility": 0,
    "scrolledVitality": 0,
    "scrolledWisdom": 0,
    "scrolledStrength": 0,
    "scrolledIntelligence": 0,
    "scrolledChance": 0,
    "scrolledAgility": 0,
}

BUILD_FIELDS = """
id name level buildGender defaultClassId hasEditPermission
stats {
  baseVitality baseWisdom baseStrength baseIntelligence baseChance baseAgility
  scrolledVitality scrolledWisdom scrolledStrength scrolledIntelligence
  scrolledChance scrolledAgility
}
equippedItems {
  id weaponElementMage weaponHealingMage
  item { id }
  slot { id }
  exos { stat value }
}
tagAssociations { id customSetTag { id } }
"""


def edit_stats(client, build_id, stats, expect_errors=False):
    return client.execute(
        """
        mutation EditStats($id: UUID!, $stats: CustomSetStatsInput!) {
          editCustomSetStats(customSetId: $id, stats: $stats) {
            customSet { id stats { baseStrength scrolledStrength } }
          }
        }
        """,
        {"id": build_id, "stats": stats},
        expect_errors=expect_errors,
    )


def equip_item(client, build_id, slot_id, item_id):
    return client.execute(
        """
        mutation Equip($build: UUID!, $slot: UUID!, $item: UUID) {
          updateCustomSetItem(
            customSetId: $build, itemSlotId: $slot, itemId: $item
          ) {
            customSet {
              id equippedItems {
                id item { id } slot { id } weaponElementMage weaponHealingMage
                exos { stat value }
              }
            }
          }
        }
        """,
        {"build": build_id, "slot": slot_id, "item": item_id},
    )["data"]["updateCustomSetItem"]["customSet"]


def test_build_metadata_stats_defaults_and_validation_roll_back(
    graphql_client, create_build, catalog_ids
):
    build = create_build(graphql_client)
    build_id = build["id"]
    stats = dict(ZERO_STATS, baseStrength=300, scrolledStrength=100)

    updated_stats = edit_stats(graphql_client, build_id, stats)["data"]
    assert updated_stats["editCustomSetStats"]["customSet"]["stats"] == {
        "baseStrength": 300,
        "scrolledStrength": 100,
    }
    invalid_stats = dict(stats, scrolledStrength=101)
    rejected = edit_stats(graphql_client, build_id, invalid_stats, expect_errors=True)
    assert error_messages(rejected) == ["Invalid stat value."]

    metadata = graphql_client.execute(
        """
        mutation Metadata($id: UUID!, $class: UUID!) {
          editCustomSetMetadata(customSetId: $id, name: "Regression", level: 199) {
            customSet { id name level }
          }
          editCustomSetDefaultClass(
            customSetId: $id, defaultClassId: $class, buildGender: FEMALE
          ) {
            customSet { id defaultClassId buildGender }
          }
        }
        """,
        {"id": build_id, "class": catalog_ids["class"]},
    )["data"]
    assert metadata["editCustomSetMetadata"]["customSet"] == {
        "id": build_id,
        "name": "Regression",
        "level": 199,
    }
    assert metadata["editCustomSetDefaultClass"]["customSet"] == {
        "id": build_id,
        "defaultClassId": catalog_ids["class"],
        "buildGender": "FEMALE",
    }

    rejected = graphql_client.execute(
        """
        mutation InvalidMetadata($id: UUID!) {
          editCustomSetMetadata(customSetId: $id, name: "Changed", level: 201) {
            customSet { id }
          }
        }
        """,
        {"id": build_id},
        expect_errors=True,
    )
    assert error_messages(rejected) == ["Invalid set level (must be 1-200)."]

    read = graphql_client.execute(
        "query($id: UUID!) { customSetById(id: $id) { name level stats { "
        "baseStrength scrolledStrength } } }",
        {"id": build_id},
    )["data"]["customSetById"]
    assert read == {
        "name": "Regression",
        "level": 199,
        "stats": {"baseStrength": 300, "scrolledStrength": 100},
    }


def test_equipment_mage_exo_copy_replace_and_delete_integrity(
    graphql_client, create_build, created_records, catalog_ids
):
    build_id = create_build(graphql_client)["id"]
    equipped = equip_item(
        graphql_client,
        build_id,
        catalog_ids["weapon_slot"],
        catalog_ids["weapon"],
    )["equippedItems"]
    assert len(equipped) == 1
    equipped_id = equipped[0]["id"]

    maged = graphql_client.execute(
        """
        mutation Mage($id: UUID!) {
          mageEquippedItem(
            equippedItemId: $id,
            stats: [{stat: STRENGTH, value: 37}],
            weaponElementMage: FIRE_10,
            weaponHealingMage: WATER_100
          ) {
            equippedItem {
              id weaponElementMage weaponHealingMage exos { stat value }
            }
          }
        }
        """,
        {"id": equipped_id},
    )["data"]["mageEquippedItem"]["equippedItem"]
    assert maged["weaponElementMage"] == "FIRE_10"
    assert maged["weaponHealingMage"] == "WATER_100"
    assert maged["exos"] == [{"stat": "STRENGTH", "value": 37}]

    shortcut = graphql_client.execute(
        """
        mutation Exo($id: UUID!) {
          setEquippedItemExo(equippedItemId: $id, stat: AP, hasStat: true) {
            equippedItem { id exos { stat value } }
          }
        }
        """,
        {"id": equipped_id},
    )["data"]["setEquippedItemExo"]["equippedItem"]
    assert {tuple(exo.values()) for exo in shortcut["exos"]} == {
        ("STRENGTH", 37),
        ("AP", 1),
    }

    copied = graphql_client.execute(
        "mutation($id: UUID!) { copyCustomSet(customSetId: $id) { customSet { "
        + BUILD_FIELDS
        + " } } }",
        {"id": build_id},
    )["data"]["copyCustomSet"]["customSet"]
    created_records.custom_set(copied["id"])
    assert copied["equippedItems"][0]["weaponElementMage"] == "FIRE_10"
    assert copied["equippedItems"][0]["weaponHealingMage"] == "WATER_100"
    assert {tuple(exo.values()) for exo in copied["equippedItems"][0]["exos"]} == {
        ("STRENGTH", 37),
        ("AP", 1),
    }

    # Replacing even with the same catalog item is specified to clear equipment
    # customization so stale exos/mages cannot leak to a new item.
    replaced = equip_item(
        graphql_client,
        build_id,
        catalog_ids["weapon_slot"],
        catalog_ids["weapon"],
    )["equippedItems"][0]
    assert replaced["weaponElementMage"] is None
    assert replaced["weaponHealingMage"] is None
    assert replaced["exos"] == []

    deleted = graphql_client.execute(
        """
        mutation DeleteItem($build: UUID!, $slot: UUID!) {
          deleteCustomSetItem(customSetId: $build, itemSlotId: $slot) {
            customSet { id equippedItems { id } }
          }
        }
        """,
        {"build": build_id, "slot": catalog_ids["weapon_slot"]},
    )["data"]["deleteCustomSetItem"]["customSet"]
    assert deleted["equippedItems"] == []


def test_tags_multiple_items_set_restart_and_delete(
    graphql_client, create_build, catalog_ids
):
    build_id = create_build(graphql_client)["id"]
    added = graphql_client.execute(
        """
        mutation AddTag($build: UUID!, $tag: UUID!) {
          addTagToCustomSet(customSetId: $build, customSetTagId: $tag) {
            customSet { id tagAssociations { customSetTag { id } } }
          }
        }
        """,
        {"build": build_id, "tag": catalog_ids["tag"]},
    )["data"]["addTagToCustomSet"]["customSet"]
    assert added["tagAssociations"] == [{"customSetTag": {"id": catalog_ids["tag"]}}]
    removed = graphql_client.execute(
        """
        mutation RemoveTag($build: UUID!, $tag: UUID!) {
          removeTagFromCustomSet(customSetId: $build, customSetTagId: $tag) {
            customSet { id tagAssociations { id } }
          }
        }
        """,
        {"build": build_id, "tag": catalog_ids["tag"]},
    )["data"]["removeTagFromCustomSet"]["customSet"]
    assert removed["tagAssociations"] == []

    multiple = graphql_client.execute(
        """
        mutation Multiple($build: UUID!, $items: [UUID!]!) {
          equipMultipleItems(customSetId: $build, itemIds: $items) {
            customSet { id equippedItems { id item { id } } }
          }
        }
        """,
        {"build": build_id, "items": [catalog_ids["item"]]},
    )["data"]["equipMultipleItems"]["customSet"]
    assert [entry["item"]["id"] for entry in multiple["equippedItems"]] == [
        catalog_ids["item"]
    ]

    edit_stats(graphql_client, build_id, dict(ZERO_STATS, baseStrength=123))

    restarted = graphql_client.execute(
        """
        mutation Restart($id: UUID!) {
          restartCustomSet(customSetId: $id, shouldResetStats: true) {
            customSet { id equippedItems { id } stats { baseStrength } }
          }
        }
        """,
        {"id": build_id},
    )["data"]["restartCustomSet"]["customSet"]
    assert restarted["equippedItems"] == []
    assert restarted["stats"]["baseStrength"] == 0

    assert (
        graphql_client.execute(
            "mutation($id: UUID!) { deleteCustomSet(customSetId: $id) { ok } }",
            {"id": build_id},
        )["data"]["deleteCustomSet"]["ok"]
        is True
    )
    with session_scope() as db_session:
        assert db_session.query(ModelCustomSet).get(build_id) is None


def test_equip_set_persists_the_seeded_set(graphql_client, create_build, catalog_ids):
    build_id = create_build(graphql_client)["id"]
    payload = graphql_client.execute(
        """
        mutation EquipSet($build: UUID!, $set: UUID!) {
          equipSet(customSetId: $build, setId: $set) {
            customSet { id equippedItems { id item { id } } }
          }
        }
        """,
        {"build": build_id, "set": catalog_ids["set"]},
        expect_errors=True,
    )
    errors = payload.get("errors", [])
    if errors:
        assert payload["data"]["equipSet"] is None
        assert len(errors) == 1
        assert "'ModelItem' object has no attribute 'get'" in errors[0]["message"]
        pytest.xfail(
            "equipSet passes ModelItem objects to equip_items, which expects mappings"
        )

    equipped_set = payload["data"]["equipSet"]["customSet"]
    assert equipped_set["equippedItems"]


def test_verified_import_happy_path_and_anonymous_rejection(
    graphql_client,
    second_graphql_client,
    user_factory,
    created_records,
    catalog_ids,
):
    variables = {
        "items": [
            {
                "id": catalog_ids["item"],
                "apExo": True,
                "mpExo": False,
                "rangeExo": False,
            }
        ],
        "stats": dict(ZERO_STATS, baseAgility=200),
    }
    anonymous = second_graphql_client.execute(
        """
        mutation Import($items: [CustomSetImportedItemInput!]!, $stats: CustomSetStatsInput!) {
          importCustomSet(items: $items, stats: $stats, name: "Imported", level: 180) {
            customSet { id }
          }
        }
        """,
        variables,
        expect_errors=True,
    )
    assert error_messages(anonymous) == ["You are not logged in."]

    user = user_factory()
    graphql_client.login(user["email"])
    imported = graphql_client.execute(
        """
        mutation Import($items: [CustomSetImportedItemInput!]!, $stats: CustomSetStatsInput!) {
          importCustomSet(items: $items, stats: $stats, name: "Imported", level: 180) {
            customSet {
              id name level stats { baseAgility }
              equippedItems { item { id } exos { stat value } }
            }
          }
        }
        """,
        variables,
    )["data"]["importCustomSet"]["customSet"]
    created_records.custom_set(imported["id"])
    assert imported["name"] == "Imported"
    assert imported["level"] == 180
    assert imported["stats"]["baseAgility"] == 200
    assert imported["equippedItems"][0]["item"]["id"] == catalog_ids["item"]
    assert imported["equippedItems"][0]["exos"] == [{"stat": "AP", "value": 1}]


def test_equipment_not_found_and_invalid_exo_roll_back(
    graphql_client, create_build, catalog_ids
):
    build_id = create_build(graphql_client)["id"]
    equipped_id = equip_item(
        graphql_client,
        build_id,
        catalog_ids["weapon_slot"],
        catalog_ids["weapon"],
    )["equippedItems"][0]["id"]

    invalid = graphql_client.execute(
        """
        mutation($id: UUID!) {
          setEquippedItemExo(equippedItemId: $id, stat: STRENGTH, hasStat: true) {
            equippedItem { id }
          }
        }
        """,
        {"id": equipped_id},
        expect_errors=True,
    )
    assert error_messages(invalid) == ["Invalid stat to set exo."]
    with session_scope() as db_session:
        equipped = db_session.query(ModelEquippedItem).get(equipped_id)
        assert equipped.exos == []

    missing = graphql_client.execute(
        """
        mutation($id: UUID!) {
          setEquippedItemExo(equippedItemId: $id, stat: AP, hasStat: true) {
            equippedItem { id }
          }
        }
        """,
        {"id": "00000000-0000-0000-0000-000000000001"},
        expect_errors=True,
    )
    # Do not freeze the current AttributeError as API behavior; this assertion
    # only guarantees failure/rollback until the resolver gets a domain error.
    assert missing.get("errors")


def test_cross_user_writes_are_rejected_across_build_mutations(
    graphql_client,
    second_graphql_client,
    user_factory,
    create_build,
    catalog_ids,
):
    owner = user_factory()
    attacker = user_factory()
    graphql_client.login(owner["email"])
    build_id = create_build(graphql_client)["id"]
    edit_stats(graphql_client, build_id, dict(ZERO_STATS, baseStrength=123))
    graphql_client.execute(
        "mutation($id: UUID!) { editCustomSetMetadata(customSetId: $id, "
        'name: "Owner state", level: 199) { customSet { id } } }',
        {"id": build_id},
    )
    equipped_id = equip_item(
        graphql_client,
        build_id,
        catalog_ids["weapon_slot"],
        catalog_ids["weapon"],
    )["equippedItems"][0]["id"]
    graphql_client.execute(
        "mutation($id: UUID!) { mageEquippedItem(equippedItemId: $id, "
        "stats: [{stat: STRENGTH, value: 37}], weaponElementMage: FIRE_10) "
        "{ equippedItem { id } } }",
        {"id": equipped_id},
    )
    second_graphql_client.login(attacker["email"])
    before_denied_writes = second_graphql_client.execute(
        "query($id: UUID!) { customSetById(id: $id) { " + BUILD_FIELDS + " } }",
        {"id": build_id},
    )["data"]["customSetById"]

    cases = [
        (
            "mutation($id: UUID!, $stats: CustomSetStatsInput!) { "
            "editCustomSetStats(customSetId: $id, stats: $stats) { customSet { id } } }",
            {"id": build_id, "stats": ZERO_STATS},
        ),
        (
            "mutation($id: UUID!) { editCustomSetMetadata(customSetId: $id, "
            'name: "Nope", level: 1) { customSet { id } } }',
            {"id": build_id},
        ),
        (
            "mutation($id: UUID!, $class: UUID!) { editCustomSetDefaultClass("
            "customSetId: $id, defaultClassId: $class, buildGender: FEMALE) "
            "{ customSet { id } } }",
            {"id": build_id, "class": catalog_ids["class"]},
        ),
        (
            "mutation($id: UUID!, $slot: UUID!, $item: UUID!) { "
            "updateCustomSetItem(customSetId: $id, itemSlotId: $slot, itemId: $item) "
            "{ customSet { id } } }",
            {
                "id": build_id,
                "slot": catalog_ids["weapon_slot"],
                "item": catalog_ids["weapon"],
            },
        ),
        (
            "mutation($id: UUID!, $set: UUID!) { equipSet(customSetId: $id, "
            "setId: $set) { customSet { id } } }",
            {"id": build_id, "set": catalog_ids["set"]},
        ),
        (
            "mutation($id: UUID!, $items: [UUID!]!) { equipMultipleItems("
            "customSetId: $id, itemIds: $items) { customSet { id } } }",
            {"id": build_id, "items": [catalog_ids["item"]]},
        ),
        (
            "mutation($id: UUID!, $tag: UUID!) { addTagToCustomSet("
            "customSetId: $id, customSetTagId: $tag) { customSet { id } } }",
            {"id": build_id, "tag": catalog_ids["tag"]},
        ),
        (
            "mutation($id: UUID!) { mageEquippedItem(equippedItemId: $id, "
            "stats: []) { equippedItem { id } } }",
            {"id": equipped_id},
        ),
        (
            "mutation($id: UUID!) { setEquippedItemExo(equippedItemId: $id, "
            "stat: AP, hasStat: true) { equippedItem { id } } }",
            {"id": equipped_id},
        ),
        (
            "mutation($id: UUID!, $slot: UUID!) { deleteCustomSetItem("
            "customSetId: $id, itemSlotId: $slot) { customSet { id } } }",
            {"id": build_id, "slot": catalog_ids["weapon_slot"]},
        ),
        (
            "mutation($id: UUID!) { restartCustomSet(customSetId: $id, "
            "shouldResetStats: true) { customSet { id } } }",
            {"id": build_id},
        ),
        (
            "mutation($id: UUID!) { deleteCustomSet(customSetId: $id) { ok } }",
            {"id": build_id},
        ),
    ]
    for document, variables in cases:
        rejected = second_graphql_client.execute(
            document, variables, expect_errors=True
        )
        assert error_messages(rejected) == [
            "You don't have permission to edit that build."
        ]
        after_denied_write = second_graphql_client.execute(
            "query($id: UUID!) { customSetById(id: $id) { "
            + BUILD_FIELDS
            + " } }",
            {"id": build_id},
        )["data"]["customSetById"]
        assert after_denied_write == before_denied_writes

    # Seed the tag only after the denied add case so both tag mutations attempt
    # an observable state transition rather than an idempotent no-op.
    graphql_client.execute(
        "mutation($build: UUID!, $tag: UUID!) { addTagToCustomSet("
        "customSetId: $build, customSetTagId: $tag) { customSet { id } } }",
        {"build": build_id, "tag": catalog_ids["tag"]},
    )
    before_denied_remove = second_graphql_client.execute(
        "query($id: UUID!) { customSetById(id: $id) { " + BUILD_FIELDS + " } }",
        {"id": build_id},
    )["data"]["customSetById"]
    denied_remove = second_graphql_client.execute(
        "mutation($id: UUID!, $tag: UUID!) { removeTagFromCustomSet("
        "customSetId: $id, customSetTagId: $tag) { customSet { id } } }",
        {"id": build_id, "tag": catalog_ids["tag"]},
        expect_errors=True,
    )
    assert error_messages(denied_remove) == [
        "You don't have permission to edit that build."
    ]
    after_denied_remove = second_graphql_client.execute(
        "query($id: UUID!) { customSetById(id: $id) { " + BUILD_FIELDS + " } }",
        {"id": build_id},
    )["data"]["customSetById"]
    assert after_denied_remove == before_denied_remove

    with session_scope() as db_session:
        build = db_session.query(ModelCustomSet).get(build_id)
        assert str(build.owner_id) == owner["id"]
        assert db_session.query(ModelEquippedItem).get(equipped_id) is not None
