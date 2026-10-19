#!/usr/bin/env python3
"""Synchronize every game-data family with one confirmation and transaction."""

import os

from app import session_scope
from oneoff.sync_item import (
    allowed_file_names,
    execute_sync_all as execute_item_sync_all,
    preview_changes as preview_item_changes,
)
from oneoff.sync_set import (
    execute_sync_all as execute_set_sync_all,
    preview_changes as preview_set_changes,
)
from oneoff.sync_class import execute_class_sync, preview_class_changes
from oneoff.sync_validation import load_and_validate_all


app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def print_summary(set_changes, item_changes, class_changes):
    sets_to_create, sets_to_update, sets_to_delete = set_changes
    items_to_create, items_to_update, items_to_delete = item_changes

    print("\n=== COMBINED GAME DATA SYNC SUMMARY ===")
    print(
        f"Sets: {len(sets_to_create)} create, "
        f"{len(sets_to_update)} update, {len(sets_to_delete)} delete"
    )
    print(
        f"Items: {len(items_to_create)} create, "
        f"{len(items_to_update)} update, {len(items_to_delete)} delete"
    )
    if sets_to_delete or items_to_delete:
        print("\nThis sync will delete database rows not present in source JSON.")
    print(
        "Classes: {classes_create} create, {classes_update} preserve/update; "
        "spells: {spells_create} create, {spells_update} rebuild, "
        "{spells_delete} delete; pairs: {pairs_reconcile} reconcile".format(
            **class_changes
        )
    )
    if class_changes["legacy_null_spells"]:
        print(
            "Legacy NULL-ID spells to replace safely: {}".format(
                class_changes["legacy_null_spells"]
            )
        )


def sync_game_data():
    """Preview and apply all set and item-family changes atomically."""
    print("=== DOFUS LAB GAME DATA SYNC ===")
    print("Loading source data...")
    data_dir = os.path.join(app_root, "app/database/data")
    (
        all_sets,
        all_set_ids,
        all_items,
        all_item_ids,
        all_classes,
        all_buffs,
    ) = load_and_validate_all(data_dir, allowed_file_names)

    with session_scope() as db_session:
        set_changes = preview_set_changes(db_session, all_sets, all_set_ids, "sync all")
        item_changes = preview_item_changes(
            db_session, all_items, all_item_ids, "sync all"
        )
        class_changes = preview_class_changes(db_session, all_classes)

    print_summary(set_changes, item_changes, class_changes)
    if not any((*set_changes, *item_changes)) and not any(class_changes.values()):
        print("No changes needed.")
        return

    confirmation = input("\nType SYNC ALL GAME DATA to apply all changes atomically: ")
    if confirmation != "SYNC ALL GAME DATA":
        print("Operation cancelled.")
        return

    print("\nApplying sets, items, classes, spells, and buffs...")
    with session_scope() as db_session:
        set_results = execute_set_sync_all(db_session, all_sets, all_set_ids)
        item_results = execute_item_sync_all(db_session, all_items, all_item_ids)
        class_results = execute_class_sync(db_session, all_classes, all_buffs)

    created_sets, updated_sets, skipped_sets, errored_sets, deleted_sets = set_results
    (
        created_items,
        updated_items,
        skipped_items,
        errored_items,
        deleted_items,
    ) = item_results

    print("\n=== APPLIED GAME DATA SYNC ===")
    print(
        f"Sets: {len(created_sets)} created, {len(updated_sets)} updated, "
        f"{len(deleted_sets)} deleted, {len(skipped_sets)} skipped, "
        f"{len(errored_sets)} errored"
    )
    print(
        f"Items: {len(created_items)} created, {len(updated_items)} updated, "
        f"{len(deleted_items)} deleted, {len(skipped_items)} skipped, "
        f"{len(errored_items)} errored"
    )
    print(
        "Classes/spells: {classes_created} classes created, "
        "{spells_created} spells created, {spells_updated} spells rebuilt, "
        "{spells_deleted} spells deleted, {pairs_created} pairs created, "
        "{pairs_deleted} empty pairs deleted; {spell_buffs} spell buffs and "
        "{item_buffs} item buffs rebuilt".format(**class_results)
    )


if __name__ == "__main__":
    sync_game_data()
