"""Fail-closed loading and validation for game-data synchronization."""

import json
import os


class SyncValidationError(ValueError):
    """Raised before a database transaction when source data is unsafe to sync."""


def load_required_json(data_dir, filename, expected_type):
    path = os.path.join(data_dir, filename)
    if not os.path.isfile(path):
        raise SyncValidationError("Required input file is missing: {}".format(path))
    try:
        with open(path, "r", encoding="utf-8") as source:
            data = json.load(source)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SyncValidationError("Could not load {}: {}".format(path, exc)) from exc
    if not isinstance(data, expected_type):
        raise SyncValidationError(
            "{} must contain a {}, not {}".format(
                path, expected_type.__name__, type(data).__name__
            )
        )
    if not data:
        raise SyncValidationError("Required input file is empty: {}".format(path))
    return data


def load_and_validate_sets(data_dir):
    records = load_required_json(data_dir, "sets.json", list)
    seen = set()
    for index, record in enumerate(records):
        try:
            set_id = str(record["id"])
            record["name"]["en"]
        except (KeyError, TypeError) as exc:
            raise SyncValidationError(
                "sets.json record {} is missing an id or English name".format(index)
            ) from exc
        if set_id in seen:
            raise SyncValidationError(
                "Duplicate set ID in sets.json: {}".format(set_id)
            )
        seen.add(set_id)
    return records, seen


def load_and_validate_items(data_dir, family_names):
    families = {}
    regular_ids = set()
    mount_ids = set()
    regular_origins = {}

    for family in family_names:
        records = load_required_json(data_dir, "{}.json".format(family), list)
        families[family] = records
        for index, record in enumerate(records):
            id_field = "mountDofusID" if family == "mounts" else "dofusID"
            try:
                item_id = str(record[id_field])
                record["name"]["en"]
            except (KeyError, TypeError) as exc:
                raise SyncValidationError(
                    "{}.json record {} is missing {} or an English name".format(
                        family, index, id_field
                    )
                ) from exc
            target_ids = mount_ids if family == "mounts" else regular_ids
            if item_id in target_ids:
                origin = "mounts" if family == "mounts" else regular_origins[item_id]
                raise SyncValidationError(
                    "Duplicate item ID {} in {} and {}".format(item_id, origin, family)
                )
            target_ids.add(item_id)
            if family != "mounts":
                regular_origins[item_id] = family

    collisions = regular_ids & mount_ids
    if collisions:
        sample = ", ".join(sorted(collisions)[:10])
        raise SyncValidationError(
            "Item/mount ID namespace collision(s): {}".format(sample)
        )
    return families, {"regular": regular_ids, "mounts": mount_ids}


def load_and_validate_classes(data_dir):
    classes = load_required_json(data_dir, "spells.json", list)
    class_names = set()
    spell_ids = set()
    spell_levels = {}

    for class_index, class_record in enumerate(classes):
        try:
            class_name = class_record["names"]["en"]
            pairs = class_record["spells"]
        except (KeyError, TypeError) as exc:
            raise SyncValidationError(
                "spells.json class {} is missing names.en or spells".format(class_index)
            ) from exc
        if class_name in class_names:
            raise SyncValidationError("Duplicate class name: {}".format(class_name))
        class_names.add(class_name)
        if not pairs:
            raise SyncValidationError("Class {} has no spell pairs".format(class_name))

        for pair_index, pair in enumerate(pairs):
            if not isinstance(pair, list) or len(pair) != 2:
                raise SyncValidationError(
                    "{} spell pair {} must contain exactly two spells".format(
                        class_name, pair_index
                    )
                )
            for spell in pair:
                try:
                    spell_id = str(spell["dofusID"])
                    effects = spell["effects"]
                    spell["name"]["en"]
                except (KeyError, TypeError) as exc:
                    raise SyncValidationError(
                        "Invalid spell record in {} pair {}".format(
                            class_name, pair_index
                        )
                    ) from exc
                if spell_id in spell_ids:
                    raise SyncValidationError(
                        "Duplicate spell dofusID: {}".format(spell_id)
                    )
                spell_ids.add(spell_id)
                levels = [str(effect["level"]) for effect in effects]
                if len(levels) != len(set(levels)):
                    raise SyncValidationError(
                        "Spell {} has duplicate effect levels".format(spell_id)
                    )
                spell_levels[spell_id] = set(levels)
    return classes, spell_ids, spell_levels


def load_and_validate_buffs(data_dir, spell_ids, spell_levels):
    buffs = load_required_json(data_dir, "buffs.json", dict)
    if not isinstance(buffs.get("spells"), dict) or not isinstance(
        buffs.get("items"), list
    ):
        raise SyncValidationError(
            "buffs.json must contain spells and items collections"
        )

    seen_spell_ids = set()
    for class_name, spell_records in buffs["spells"].items():
        if not isinstance(spell_records, list):
            raise SyncValidationError(
                "Buff class {} must contain a list".format(class_name)
            )
        for spell in spell_records:
            spell_id = str(spell.get("dofusID"))
            if spell_id in seen_spell_ids:
                raise SyncValidationError(
                    "Duplicate spell buff dofusID: {}".format(spell_id)
                )
            if spell_id not in spell_ids:
                raise SyncValidationError(
                    "Buff references unknown spell dofusID {}".format(spell_id)
                )
            seen_spell_ids.add(spell_id)
            seen_levels = set()
            for level in spell.get("levels", []):
                level_number = str(level.get("level"))
                if level_number in seen_levels:
                    raise SyncValidationError(
                        "Duplicate buff level {} for spell {}".format(
                            level_number, spell_id
                        )
                    )
                if level_number not in spell_levels[spell_id]:
                    raise SyncValidationError(
                        "Buff references missing level {} for spell {}".format(
                            level_number, spell_id
                        )
                    )
                seen_levels.add(level_number)

    seen_item_names = set()
    for item in buffs["items"]:
        item_name = item.get("name")
        if not item_name:
            raise SyncValidationError("Item buff is missing an English item name")
        if item_name in seen_item_names:
            raise SyncValidationError("Duplicate item buff name: {}".format(item_name))
        seen_item_names.add(item_name)
    return buffs


def load_and_validate_all(data_dir, item_family_names):
    sets, set_ids = load_and_validate_sets(data_dir)
    items, item_ids = load_and_validate_items(data_dir, item_family_names)
    missing_set_ids = sorted(
        {
            str(record["setID"])
            for records in items.values()
            for record in records
            if record.get("setID") is not None and str(record["setID"]) not in set_ids
        }
    )
    if missing_set_ids:
        raise SyncValidationError(
            "Items reference set IDs missing from sets.json: {}".format(
                ", ".join(missing_set_ids[:10])
            )
        )
    classes, spell_ids, spell_levels = load_and_validate_classes(data_dir)
    buffs = load_and_validate_buffs(data_dir, spell_ids, spell_levels)
    return sets, set_ids, items, item_ids, classes, buffs
