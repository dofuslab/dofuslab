#!/usr/bin/env python3
"""Synchronize all set and item-family JSON data with one confirmation."""

from app import session_scope
from oneoff.sync_item import (
    execute_sync_all as execute_item_sync_all,
    load_all_items,
    preview_changes as preview_item_changes,
)
from oneoff.sync_set import (
    execute_sync_all as execute_set_sync_all,
    load_all_sets,
    preview_changes as preview_set_changes,
)


def print_summary(set_changes, item_changes):
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


def sync_game_data():
    """Preview and apply all set and item-family changes atomically."""
    print("=== DOFUS LAB GAME DATA SYNC ===")
    print("Loading source data...")
    all_sets, all_set_ids = load_all_sets()
    all_items, all_item_ids = load_all_items()

    if not all_sets:
        print("No sets loaded. Exiting.")
        return
    if not any(all_items.values()):
        print("No items loaded. Exiting.")
        return

    with session_scope() as db_session:
        set_changes = preview_set_changes(db_session, all_sets, all_set_ids, "sync all")
        item_changes = preview_item_changes(
            db_session, all_items, all_item_ids, "sync all"
        )

    print_summary(set_changes, item_changes)
    if not any((*set_changes, *item_changes)):
        print("No changes needed.")
        return

    confirmation = input("\nType SYNC to apply all set and item changes: ")
    if confirmation != "SYNC":
        print("Operation cancelled.")
        return

    print("\nApplying set and item changes...")
    with session_scope() as db_session:
        set_results = execute_set_sync_all(db_session, all_sets, all_set_ids)
        item_results = execute_item_sync_all(db_session, all_items, all_item_ids)

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


if __name__ == "__main__":
    sync_game_data()
