"""Offline integrity checks for the committed importer output."""

import json
from pathlib import Path


DATA_DIR = Path(__file__).parents[1] / "app" / "database" / "data"
LOCALES = {"de", "en", "es", "fr", "it", "pt"}


def load(name):
    with (DATA_DIR / name).open(encoding="utf-8") as data_file:
        return json.load(data_file)


def assert_localized(record, field):
    translations = record[field]
    assert set(translations) == LOCALES
    assert all(
        isinstance(value, str) and value.strip() for value in translations.values()
    )


def assert_unique_numeric_ids(records, field):
    ids = [str(record[field]) for record in records]
    assert all(identifier.isdigit() for identifier in ids)
    assert len(ids) == len(set(ids))
    return set(ids)


def test_equipment_ids_locales_and_references_are_consistent():
    item_types = load("item_types.json")
    type_names = {record["en"] for record in item_types}
    assert len(type_names) == len(item_types)
    for item_type in item_types:
        assert set(item_type) == LOCALES
        assert all(value.strip() for value in item_type.values())

    sets = load("sets.json")
    set_ids = assert_unique_numeric_ids(sets, "id")
    for item_set in sets:
        assert_localized(item_set, "name")

    equipment_ids = set()
    for filename, id_field in (
        ("items.json", "dofusID"),
        ("weapons.json", "dofusID"),
        ("pets.json", "dofusID"),
        ("mounts.json", "mountDofusID"),
    ):
        records = load(filename)
        record_ids = assert_unique_numeric_ids(records, id_field)
        assert not equipment_ids.intersection(record_ids)
        equipment_ids.update(record_ids)

        for record in records:
            assert_localized(record, "name")
            assert record["itemType"] in type_names
            assert 1 <= record["level"] <= 200
            if record.get("setID"):
                assert str(record["setID"]) in set_ids


def test_slots_only_reference_committed_item_types():
    type_names = {record["en"] for record in load("item_types.json")}
    slots = load("item_slots.json")
    assert slots

    for slot in slots:
        assert_localized(slot, "name")
        assert slot["types"]
        assert set(slot["types"]).issubset(type_names)
        assert slot.get("quantity", 1) > 0


def test_spell_ids_variants_and_locales_are_consistent():
    classes = load("spells.json")
    assert classes
    spell_ids = []

    for dofus_class in classes:
        assert_localized(dofus_class, "names")
        assert dofus_class["spells"]
        for variant_pair in dofus_class["spells"]:
            assert len(variant_pair) == 2
            for spell in variant_pair:
                spell_ids.append(str(spell["dofusID"]))
                assert_localized(spell, "name")
                assert_localized(spell, "description")
                assert spell["effects"]
                effect_levels = [effect["level"] for effect in spell["effects"]]
                assert len(effect_levels) == len(set(effect_levels))

    assert all(spell_id.isdigit() for spell_id in spell_ids)
    assert len(spell_ids) == len(set(spell_ids))
