#!/usr/bin/env python3
"""Atomically reconcile classes, spell pairs, spells, and all buffs."""

import os

from app import session_scope
from app.database.model_buff import ModelBuff
from app.database.model_class import ModelClass
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_spell import ModelSpell
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from oneoff.sync_buff import add_item_buffs, add_spell_buff_for_level
from oneoff.sync_spell import create_spell_stats, create_spell_translations
from oneoff.sync_validation import load_and_validate_buffs, load_and_validate_classes


app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_dir = os.path.join(app_root, "app/database/data")


def load_class_sources():
    classes, spell_ids, spell_levels = load_and_validate_classes(data_dir)
    buffs = load_and_validate_buffs(data_dir, spell_ids, spell_levels)
    return classes, buffs


def _class_by_english_name(db_session, name):
    rows = (
        db_session.query(ModelClass)
        .join(ModelClassTranslation)
        .filter(
            ModelClassTranslation.locale == "en", ModelClassTranslation.name == name
        )
        .all()
    )
    if len(rows) > 1:
        raise ValueError("Multiple classes have English name {}".format(name))
    return rows[0] if rows else None


def _upsert_class(db_session, record):
    english_name = record["names"]["en"]
    class_object = _class_by_english_name(db_session, english_name)
    created = class_object is None
    if created:
        class_object = ModelClass()
        db_session.add(class_object)
        db_session.flush()
    class_object.male_face_image_url = "class/face/{}_M.png".format(english_name)
    class_object.female_face_image_url = "class/face/{}_F.png".format(english_name)
    class_object.male_sprite_image_url = "class/sprite/{}_M.png".format(english_name)
    class_object.female_sprite_image_url = "class/sprite/{}_F.png".format(english_name)

    existing = {
        row.locale: row
        for row in db_session.query(ModelClassTranslation)
        .filter_by(class_id=class_object.uuid)
        .all()
    }
    for locale, row in existing.items():
        if locale not in record["names"]:
            db_session.delete(row)
    for locale, name in record["names"].items():
        row = existing.get(locale)
        if row is None:
            db_session.add(
                ModelClassTranslation(
                    class_id=class_object.uuid, locale=locale, name=name
                )
            )
        else:
            row.name = name
    return class_object, created


def preview_class_changes(db_session, classes):
    source_ids = {
        str(spell["dofusID"])
        for class_record in classes
        for pair in class_record["spells"]
        for spell in pair
    }
    existing_spells = db_session.query(ModelSpell).all()
    non_null_ids = [
        spell.dofus_db_id for spell in existing_spells if spell.dofus_db_id is not None
    ]
    if len(non_null_ids) != len(set(non_null_ids)):
        raise ValueError(
            "Database contains duplicate non-null spell dofus_db_id values"
        )
    classes_to_create = sum(
        _class_by_english_name(db_session, record["names"]["en"]) is None
        for record in classes
    )
    existing_id_set = set(non_null_ids)
    pair_changes = 0
    for class_record in classes:
        class_object = _class_by_english_name(db_session, class_record["names"]["en"])
        for pair in class_record["spells"]:
            pair_ids = {str(spell["dofusID"]) for spell in pair}
            members = [
                spell for spell in existing_spells if spell.dofus_db_id in pair_ids
            ]
            pair_ids_in_db = {spell.spell_variant_pair_id for spell in members}
            correct = len(members) == 2 and len(pair_ids_in_db) == 1
            if correct and class_object is not None:
                candidate = db_session.query(ModelSpellVariantPair).get(
                    next(iter(pair_ids_in_db))
                )
                current_members = {
                    spell.dofus_db_id
                    for spell in existing_spells
                    if spell.spell_variant_pair_id == candidate.uuid
                }
                correct = (
                    candidate.class_id == class_object.uuid
                    and current_members == pair_ids
                )
            if not correct:
                pair_changes += 1
    return {
        "classes_create": classes_to_create,
        "classes_update": len(classes) - classes_to_create,
        "spells_create": len(source_ids - existing_id_set),
        "spells_update": len(source_ids & existing_id_set),
        "spells_delete": sum(
            spell.dofus_db_id not in source_ids for spell in existing_spells
        ),
        "legacy_null_spells": sum(
            spell.dofus_db_id is None for spell in existing_spells
        ),
        "pairs_reconcile": pair_changes,
    }


def reconcile_classes_and_spells(db_session, classes):
    existing_spells = db_session.query(ModelSpell).all()
    by_id = {}
    for spell in existing_spells:
        if spell.dofus_db_id is None:
            continue
        if spell.dofus_db_id in by_id:
            raise ValueError(
                "Multiple spells have dofus_db_id {}".format(spell.dofus_db_id)
            )
        by_id[spell.dofus_db_id] = spell

    source_ids = set()
    classes_created = pairs_created = spells_created = spells_updated = 0
    for class_record in classes:
        class_object, created = _upsert_class(db_session, class_record)
        classes_created += int(created)
        db_session.flush()
        for pair_records in class_record["spells"]:
            expected_ids = {str(record["dofusID"]) for record in pair_records}
            source_ids.update(expected_ids)
            members = [
                by_id[spell_id] for spell_id in expected_ids if spell_id in by_id
            ]
            db_pair_ids = {spell.spell_variant_pair_id for spell in members}
            pair_object = None
            if len(members) == 2 and len(db_pair_ids) == 1:
                candidate = db_session.query(ModelSpellVariantPair).get(
                    next(iter(db_pair_ids))
                )
                current_ids = {
                    spell.dofus_db_id
                    for spell in db_session.query(ModelSpell)
                    .filter_by(spell_variant_pair_id=candidate.uuid)
                    .all()
                }
                if (
                    candidate.class_id == class_object.uuid
                    and current_ids == expected_ids
                ):
                    pair_object = candidate
            if pair_object is None:
                pair_object = ModelSpellVariantPair(class_id=class_object.uuid)
                db_session.add(pair_object)
                db_session.flush()
                pairs_created += 1

            for record in pair_records:
                dofus_id = str(record["dofusID"])
                spell = by_id.get(dofus_id)
                if spell is None:
                    spell = ModelSpell(dofus_db_id=dofus_id)
                    db_session.add(spell)
                    by_id[dofus_id] = spell
                    spells_created += 1
                else:
                    spells_updated += 1
                spell.spell_variant_pair_id = pair_object.uuid
                spell.image_url = record.get("imageUrl", "")
                spell.is_trap = record.get("isTrap", False)
                db_session.flush()
                create_spell_translations(db_session, record, spell)
                create_spell_stats(db_session, record, spell)

    stale_spells = [
        spell for spell in existing_spells if spell.dofus_db_id not in source_ids
    ]
    for spell in stale_spells:
        db_session.delete(spell)
    db_session.flush()
    empty_pairs = []
    for pair in db_session.query(ModelSpellVariantPair).all():
        if (
            db_session.query(ModelSpell)
            .filter_by(spell_variant_pair_id=pair.uuid)
            .count()
            == 0
        ):
            empty_pairs.append(pair)
    for pair in empty_pairs:
        db_session.delete(pair)
    return {
        "classes_created": classes_created,
        "classes_updated": len(classes) - classes_created,
        "pairs_created": pairs_created,
        "pairs_deleted": len(empty_pairs),
        "spells_created": spells_created,
        "spells_updated": spells_updated,
        "spells_deleted": len(stale_spells),
    }


def rebuild_all_buffs(db_session, buffs):
    db_session.query(ModelBuff).delete(synchronize_session=False)
    spell_buff_count = item_buff_count = 0
    for spell_records in buffs["spells"].values():
        for spell_record in spell_records:
            spell = (
                db_session.query(ModelSpell)
                .filter_by(dofus_db_id=str(spell_record["dofusID"]))
                .one()
            )
            for level in spell_record["levels"]:
                spell_stat = (
                    db_session.query(ModelSpellStats)
                    .filter_by(spell_id=spell.uuid, level=level["level"])
                    .one()
                )
                add_spell_buff_for_level(db_session, spell_stat.uuid, level)
                spell_buff_count += len(level["buffs"])
    for item_record in buffs["items"]:
        item_id = (
            db_session.query(ModelItemTranslation)
            .filter_by(locale="en", name=item_record["name"])
            .one()
            .item_id
        )
        add_item_buffs(db_session, item_id, item_record)
        item_buff_count += len(item_record["buffs"])
    return spell_buff_count, item_buff_count


def execute_class_sync(db_session, classes, buffs):
    result = reconcile_classes_and_spells(db_session, classes)
    result["spell_buffs"], result["item_buffs"] = rebuild_all_buffs(db_session, buffs)
    return result


def sync_class():
    classes, buffs = load_class_sources()
    with session_scope() as db_session:
        preview = preview_class_changes(db_session, classes)
    print("=== CLASS/SPELL/BUFF SYNC PREVIEW ===")
    for key in sorted(preview):
        print("{}: {}".format(key, preview[key]))
    if input("Type SYNC CLASSES to apply in one transaction: ") != "SYNC CLASSES":
        print("Operation cancelled.")
        return
    with session_scope() as db_session:
        result = execute_class_sync(db_session, classes, buffs)
    print("Class/spell/buff sync complete:")
    for key in sorted(result):
        print("{}: {}".format(key, result[key]))


if __name__ == "__main__":
    sync_class()
