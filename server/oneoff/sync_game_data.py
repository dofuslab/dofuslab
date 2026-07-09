#!/usr/bin/env python3
"""
Sync sets and items, then regenerate derived build-discovery data.

This command intentionally has one user decision point:
1. load source JSON
2. preview all set/item creates, updates, and deletes
3. ask for one confirmation
4. apply sets, apply items, commit, regenerate the build discovery index
"""

from __future__ import annotations

from app import session_scope
from oneoff.generate_build_discovery_index import write_index
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


def print_summary(
    sets_to_create: list,
    sets_to_update: list,
    sets_to_delete: list,
    items_to_create: list,
    items_to_update: list,
    items_to_delete: list,
) -> None:
    print("\n=== COMBINED GAME DATA SYNC SUMMARY ===")
    print(
        "Sets: "
        f"{len(sets_to_create)} create, "
        f"{len(sets_to_update)} update, "
        f"{len(sets_to_delete)} delete"
    )
    print(
        "Items: "
        f"{len(items_to_create)} create, "
        f"{len(items_to_update)} update, "
        f"{len(items_to_delete)} delete"
    )
    if sets_to_delete or items_to_delete:
        print("\nThis sync will delete database rows not present in source JSON.")


def has_work(
    sets_to_create: list,
    sets_to_update: list,
    sets_to_delete: list,
    items_to_create: list,
    items_to_update: list,
    items_to_delete: list,
) -> bool:
    return any(
        (
            sets_to_create,
            sets_to_update,
            sets_to_delete,
            items_to_create,
            items_to_update,
            items_to_delete,
        )
    )


def main() -> None:
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
        sets_to_create, sets_to_update, sets_to_delete = preview_set_changes(
            db_session,
            all_sets,
            all_set_ids,
            "sync all",
        )
        items_to_create, items_to_update, items_to_delete = preview_item_changes(
            db_session,
            all_items,
            all_item_ids,
            "sync all",
        )

    print_summary(
        sets_to_create,
        sets_to_update,
        sets_to_delete,
        items_to_create,
        items_to_update,
        items_to_delete,
    )
    if not has_work(
        sets_to_create,
        sets_to_update,
        sets_to_delete,
        items_to_create,
        items_to_update,
        items_to_delete,
    ):
        print("No changes needed.")
        return

    confirmation = input("\nType SYNC to apply all set/item changes and regenerate indexes: ")
    if confirmation != "SYNC":
        print("Operation cancelled.")
        return

    print("\nApplying set and item changes...")
    with session_scope() as db_session:
        created_sets, updated_sets, skipped_sets, errored_sets, deleted_sets = execute_set_sync_all(
            db_session,
            all_sets,
            all_set_ids,
        )
        (
            created_items,
            updated_items,
            skipped_items,
            errored_items,
            deleted_items,
        ) = execute_item_sync_all(
            db_session,
            all_items,
            all_item_ids,
        )

    print("\n=== APPLIED GAME DATA SYNC ===")
    print(
        "Sets: "
        f"{len(created_sets)} created, "
        f"{len(updated_sets)} updated, "
        f"{len(deleted_sets)} deleted, "
        f"{len(skipped_sets)} skipped, "
        f"{len(errored_sets)} errored"
    )
    print(
        "Items: "
        f"{len(created_items)} created, "
        f"{len(updated_items)} updated, "
        f"{len(deleted_items)} deleted, "
        f"{len(skipped_items)} skipped, "
        f"{len(errored_items)} errored"
    )

    print("\nRegenerating build discovery index...")
    write_index(source="db")


if __name__ == "__main__":
    main()
