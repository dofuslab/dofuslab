#!/usr/bin/env python3
"""
Sync Item Script

This script synchronizes items between input JSON files and the database.
It supports:
- Creating new items from input files
- Updating existing items with new data
- Deleting items that are no longer present in input files (when using 'sync all')

Usage:
- 'upsert all': Updates all items in the input file, creates missing ones (no deletion)
- 'add missing items': Only creates items that don't exist in the database
- 'sync all': Updates all items AND deletes items not found in the input file
- Individual item ID: Updates/creates a specific item

The script handles both regular items (using dofus_db_id) and mounts (using dofus_db_mount_id).
"""

import json
import os
from sqlalchemy import or_
from app import session_scope
from app.database.model_set import ModelSet
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_stat_translation import ModelItemStatTranslation
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_item_type import ModelItemType
from app.database.model_item_type_translation import ModelItemTypeTranslation
from app.database.model_weapon_effect import ModelWeaponEffect
from app.database.model_weapon_stat import ModelWeaponStat
from app.database.model_equipped_item import ModelEquippedItem
from oneoff.enums import to_stat_enum, to_effect_enum

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

allowed_file_names = [
    "items",
    "mounts",
    "pets",
    "weapons",
]
languages = ["en", "fr", "pt", "it", "es", "de"]


def update_or_create_item(
    db_session,
    item_id,
    record,
):
    """
    Update existing item or create new item.
    Returns True if item was created, False if item was updated, None if item was skipped.
    Raises ValueError for error cases (multiple items with same ID).
    """
    if "mountDofusID" in record:
        database_item = (
            db_session.query(ModelItem)
            .filter(ModelItem.dofus_db_mount_id == item_id)
            .all()
        )
    else:
        database_item = (
            db_session.query(ModelItem).filter(ModelItem.dofus_db_id == item_id).all()
        )
    
    if len(database_item) > 1:
        raise ValueError(f"Multiple items with ID {item_id} exist in the database")
    elif len(database_item) == 1:
        # Update existing item
        item = database_item[0]
        item.dofus_db_id = record.get("dofusID", None)
        item.dofus_db_mount_id = record.get("mountDofusID", None)
        item.level = record["level"]
        item.image_url = record["imageUrl"]
        new_set_id = record.get("setID", None)
        new_set_db_id = (
            (
                db_session.query(ModelSet)
                .filter(ModelSet.dofus_db_id == record["setID"])
                .one()
            ).uuid
            if new_set_id != None
            else None
        )
        if item.set_id != new_set_db_id:
            item.set_id = new_set_db_id
        create_item_translations(db_session, record, item)
        db_session.query(ModelItemStat).filter_by(item_id=item.uuid).delete()
        create_item_stats(db_session, record, item)
        if "conditions" in record:
            conditions = {
                "conditions": record["conditions"].get("conditions", {}),
                "customConditions": record["conditions"].get("customConditions", {}),
            }
            item.conditions = conditions
        if "weaponStats" in record:
            create_weapon_stat(db_session, record, item)
        return False  # Item was updated
    elif len(database_item) == 0:
        # Create new item
        result = create_item(db_session, record)
        if not result:
            return None  # Item was skipped (e.g., Living object)
        return True  # Item was created successfully


def create_item(db_session, record):
    item_types = {}
    with open(os.path.join(app_root, "app/database/data/item_types.json"), "r") as file:
        data = json.load(file)
        for item_type_record in data:
            item_type = (
                db_session.query(ModelItemTypeTranslation)
                .filter_by(locale="en", name=item_type_record["en"])
                .one()
                .item_type
            )
            item_types[item_type_record["en"]] = item_type
    if record["itemType"] == "Living object":
        return False
    item = ModelItem(
        dofus_db_id=record.get("dofusID", None),
        dofus_db_mount_id=record.get("mountDofusID", None),
        item_type_id=item_types[record["itemType"]].uuid,
        level=record["level"],
        image_url=record["imageUrl"],
    )

    if record.get("setID", None):
        set = (
            db_session.query(ModelSet)
            .filter(ModelSet.dofus_db_id == record["setID"])
            .one()
        )
        set.items.append(item)

    if "conditions" in record:
        conditions = {
            "conditions": record["conditions"].get("conditions", {}),
            "customConditions": record["conditions"].get("customConditions", {}),
        }
        item.conditions = conditions
    db_session.add(item)
    db_session.flush()

    for locale in record["name"]:
        if record["name"][locale] == None:
            continue
        item_translations = ModelItemTranslation(
            item_id=item.uuid,
            locale=locale,
            name=record["name"][locale],
        )
        db_session.add(item_translations)
    create_item_stats(db_session, record, item)
    create_weapon_stat(db_session, record, item)
    return True


def create_item_stats(db_session, record, item):
    i = 0

    ## Needed? Doesn't seem to be doing much?
    item.dofus_db_id = record.get("dofusID", None)

    for stat in record.get("stats", []):
        item_stat = ModelItemStat(
            item_id=item.uuid,
            stat=to_stat_enum[stat["stat"]],
            min_value=stat["minStat"],
            max_value=stat["maxStat"],
            order=i,
        )
        db_session.add(item_stat)
        i = i + 1
    if record["customStats"]:
        num_of_stats = len(record["customStats"]["en"])

        for j in range(num_of_stats):
            item_stat = ModelItemStat(order=i + j, item_id=item.uuid)
            db_session.add(item_stat)
            db_session.flush()
            for locale in record["customStats"]:
                custom_stat = record["customStats"][locale][j]
                stat_translation = ModelItemStatTranslation(
                    item_stat_id=item_stat.uuid,
                    locale=locale,
                    custom_stat=custom_stat,
                )
                db_session.add(stat_translation)


def create_item_translations(db_session, record, item):
    db_session.query(ModelItemTranslation).filter_by(item_id=item.uuid).delete()
    for locale in languages:
        if record["name"].get(locale):
            item_translation = ModelItemTranslation(
                item_id=item.uuid, locale=locale, name=record["name"][locale]
            )
            db_session.add(item_translation)


def create_weapon_stat(db_session, record, item):
    if not "weaponStats" in record:
        return
    db_session.query(ModelWeaponStat).filter_by(item_id=item.uuid).delete()

    weapon_stat = ModelWeaponStat(
        item_id=item.uuid,
        ap_cost=record["weaponStats"]["apCost"],
        uses_per_turn=record["weaponStats"]["usesPerTurn"],
        min_range=record["weaponStats"]["minRange"],
        max_range=record["weaponStats"]["maxRange"],
    )

    if record["weaponStats"]["baseCritChance"] > 0:
        weapon_stat.base_crit_chance = (record["weaponStats"]["baseCritChance"],)
        weapon_stat.crit_bonus_damage = (record["weaponStats"]["critBonusDamage"],)

    db_session.add(weapon_stat)
    db_session.flush()

    for effect in record["weaponStats"]["weapon_effects"]:
        weapon_effects = ModelWeaponEffect(
            weapon_stat_id=weapon_stat.uuid,
            effect_type=to_effect_enum[effect["stat"]],
            min_damage=effect["minStat"],
            max_damage=effect["maxStat"],
        )
        db_session.add(weapon_effects)


def get_items_to_delete(db_session, input_item_ids, file_name):
    """
    Get items from database that are not present in the input file.
    Uses SQL filtering for better performance.
    Returns a list of items that should be deleted.
    """
    if not input_item_ids:
        return []
    
    if file_name == "all":
        # For all files, find items not in input_item_ids using SQL NOT IN
        # This covers both regular items and mounts
        items_to_delete = db_session.query(ModelItem).filter(
            or_(
                ModelItem.dofus_db_id.notin_(input_item_ids),
                ModelItem.dofus_db_mount_id.notin_(input_item_ids)
            )
        ).all()
    elif file_name == "mounts":
        # For mounts, find items not in input_item_ids using SQL NOT IN
        items_to_delete = db_session.query(ModelItem).filter(
            ModelItem.dofus_db_mount_id.notin_(input_item_ids)
        ).all()
    else:
        # For regular items, find items not in input_item_ids using SQL NOT IN
        items_to_delete = db_session.query(ModelItem).filter(
            ModelItem.dofus_db_id.notin_(input_item_ids)
        ).all()
    
    return items_to_delete


def delete_items_not_in_file(db_session, items_to_delete, file_name):
    """
    Delete items that are not found in the input file.
    The cascade relationships will handle deletion of related records.
    """
    deleted_items = []
    
    for item in items_to_delete:
        item_id = item.dofus_db_mount_id if file_name == "mounts" else item.dofus_db_id
        item_name = "Unknown"
        
        # Try to get the item name from translations
        translation = db_session.query(ModelItemTranslation).filter_by(
            item_id=item.uuid, locale="en"
        ).first()
        if translation:
            item_name = translation.name
        
        print("Deleting item [{}]: {}".format(item_id, item_name))
        deleted_items.append("[{}]: {}".format(item_id, item_name))
        
        # Delete the item (cascade will handle related records)
        db_session.delete(item)
    
    return deleted_items


def load_all_items():
    """Load all items from all allowed JSON files into memory."""
    all_items = {}
    all_item_ids = set()
    
    print("Loading all item files...")
    for file_name in allowed_file_names:
        file_path = os.path.join(app_root, "app/database/data/{}.json".format(file_name))
        if os.path.exists(file_path):
            print(f"Loading {file_name}...")
            with open(file_path, "r") as file:
                data = json.load(file)
                all_items[file_name] = data
                
                # Collect all item IDs
                for record in data:
                    if file_name == "mounts":
                        item_id = record["mountDofusID"]
                        all_item_ids.add(item_id)
                    else:
                        item_id = record["dofusID"]
                        all_item_ids.add(item_id)
                        
            print(f"Loaded {len(data)} items from {file_name}")
        else:
            print(f"Warning: {file_name}.json not found")
            all_items[file_name] = []
    
    print(f"Total items loaded: {len(all_item_ids)}")
    return all_items, all_item_ids


def preview_changes(db_session, all_items, all_item_ids, operation_type):
    """Preview items that would be created/updated and deleted."""
    items_to_create = []
    items_to_update = []
    items_to_delete = []
    
    print(f"\n=== PREVIEW: {operation_type.upper()} ===")
    
    # Check what items would be created/updated
    for file_name, data in all_items.items():
        for record in data:
            item_id = record.get("mountDofusID") if file_name == "mounts" else record.get("dofusID")
            item_name = record["name"]["en"]
            
            # Check if item exists in database
            if file_name == "mounts":
                existing_items = db_session.query(ModelItem).filter(
                    ModelItem.dofus_db_mount_id == item_id
                ).all()
            else:
                existing_items = db_session.query(ModelItem).filter(
                    ModelItem.dofus_db_id == item_id
                ).all()
            
            if len(existing_items) == 0:
                items_to_create.append((item_id, item_name, file_name))
            else:
                items_to_update.append((item_id, item_name, file_name))
    
    # Check what items would be deleted (only for sync all)
    if operation_type == "sync all":
        items_to_delete = get_items_to_delete(db_session, all_item_ids, "all")
    
    # Display preview
    if items_to_create:
        print(f"\nItems to CREATE ({len(items_to_create)}):")
        for item_id, item_name, file_name in items_to_create:
            id_type = "mountDofusID" if file_name == "mounts" else "dofusID"
            print(f"  [{item_id}] ({id_type}): {item_name}")
    
    if items_to_update:
        print(f"\nItems to UPDATE: {len(items_to_update)} items")
    
    if items_to_delete:
        print(f"\nItems to DELETE ({len(items_to_delete)}):")
        print(f"{'dofusID':<12} {'EN Name':<40} {'Equipped Items':<15}")
        print("-" * 70)
        
        for item in items_to_delete:
            # Determine if it's a mount or regular item
            if item.dofus_db_mount_id:
                item_id = item.dofus_db_mount_id
                id_type = "mountDofusID"
            else:
                item_id = item.dofus_db_id
                id_type = "dofusID"
            
            item_name = "Unknown"
            translation = db_session.query(ModelItemTranslation).filter_by(
                item_id=item.uuid, locale="en"
            ).first()
            if translation:
                item_name = translation.name
            
            # Count equipped items associated with this item
            equipped_count = db_session.query(ModelEquippedItem).filter_by(
                item_id=item.uuid
            ).count()
            
            # Truncate long names for table formatting
            display_name = item_name[:37] + "..." if len(item_name) > 40 else item_name
            print(f"{item_id:<12} {display_name:<40} {equipped_count:<15}")
    
    return items_to_create, items_to_update, items_to_delete


def execute_upsert_all(db_session, all_items):
    """Execute upsert all operation."""
    created_items = []
    updated_items = []
    skipped_items = []
    errored_items = []
    
    for file_name, data in all_items.items():
        for record in data:
            item_id = record.get("mountDofusID") if file_name == "mounts" else record.get("dofusID")
            item_name = record["name"]["en"]
            
            try:
                result = update_or_create_item(
                    db_session,
                    item_id,
                    record,
                )
                
                if result is True:
                    created_items.append(f"[{item_id}]: {item_name}")
                elif result is False:
                    updated_items.append(f"[{item_id}]: {item_name}")
                elif result is None:
                    skipped_items.append(f"[{item_id}]: {item_name}")
            except ValueError as e:
                error_msg = f"[{item_id}]: {item_name} - {e}"
                errored_items.append(error_msg)
                print(f"Error processing item {error_msg}")
                # Continue processing other items
    
    return created_items, updated_items, skipped_items, errored_items


def execute_sync_all(db_session, all_items, all_item_ids):
    """Execute sync all operation (upsert + delete)."""
    # First do upsert
    created_items, updated_items, skipped_items, errored_items = execute_upsert_all(db_session, all_items)
    
    # Then delete items not in input files
    items_to_delete = get_items_to_delete(db_session, all_item_ids, "all")
    deleted_items = []
    
    if items_to_delete:
        deleted_items = delete_items_not_in_file(db_session, items_to_delete, "all")
    
    return created_items, updated_items, skipped_items, errored_items, deleted_items


def execute_individual_upsert(db_session, all_items):
    """Execute individual upsert operation."""
    # Let user select file
    print("\nAvailable files:")
    for i, file_name in enumerate(allowed_file_names, 1):
        item_count = len(all_items.get(file_name, []))
        print(f"  {i}. {file_name} ({item_count} items)")
    
    while True:
        try:
            file_choice = int(input("Select file number: ")) - 1
            if 0 <= file_choice < len(allowed_file_names):
                selected_file = allowed_file_names[file_choice]
                break
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    # Let user enter item ID
    data = all_items[selected_file]
    id_to_record_map = {}
    
    for record in data:
        if selected_file == "mounts":
            id_to_record_map[record["mountDofusID"]] = record
        else:
            id_to_record_map[record["dofusID"]] = record
    
    print(f"\nAvailable items in {selected_file}:")
    for item_id, record in list(id_to_record_map.items())[:10]:  # Show first 10
        print(f"  {item_id}: {record['name']['en']}")
    if len(id_to_record_map) > 10:
        print(f"  ... and {len(id_to_record_map) - 10} more items")
    
    while True:
        item_id = input(f"Enter ID ({selected_file}): ")
        if item_id in id_to_record_map:
            record = id_to_record_map[item_id]
            item_name = record["name"]["en"]
            
            try:
                result = update_or_create_item(db_session, item_id, record)
                
                if result is True:
                    return [f"[{item_id}]: {item_name}"], [], [], []
                elif result is False:
                    return [], [f"[{item_id}]: {item_name}"], [], []
                elif result is None:
                    return [], [], [f"[{item_id}]: {item_name}"], []
            except ValueError as e:
                error_msg = f"[{item_id}]: {item_name} - {e}"
                print(f"Error processing item {error_msg}")
                print("Please try a different item ID.")
                return [], [], [], [error_msg]
        else:
            print("Item ID not found. Please try again.")


def sync_item():
    """Main sync function with improved developer experience."""
    print("=== DOFUS LAB ITEM SYNC ===")
    
    # Load all items from all files
    all_items, all_item_ids = load_all_items()
    
    if not any(all_items.values()):
        print("No items loaded. Exiting.")
        return
    
    # Present options to user
    print("\nAvailable operations:")
    print("  1. upsert all - Update existing items and create missing ones (no deletion)")
    print("  2. sync all - Full sync: upsert all + delete items not in files")
    print("  3. individual upsert - Select and upsert a specific item")
    print("  4. quit")
    
    while True:
        choice = input("\nSelect operation (1-4): ").strip()
        
        if choice == "4" or choice.lower() == "q":
            print("Exiting.")
            return
        
        with session_scope() as db_session:
            if choice == "1":  # upsert all
                print("\n=== UPSERT ALL ===")
                items_to_create, items_to_update, _ = preview_changes(db_session, all_items, all_item_ids, "upsert all")
                
                if not items_to_create and not items_to_update:
                    print("No changes needed.")
                    continue
                
                confirm = input(f"\nProceed with upserting {len(items_to_create)} new items and updating {len(items_to_update)} existing items? (Y/n): ")
                if confirm.lower() == 'y' or confirm == '':
                    created_items, updated_items, skipped_items, errored_items = execute_upsert_all(db_session, all_items)
                    db_session.commit()
                    print(f"Successfully upserted {len(created_items)} new items and updated {len(updated_items)} existing items.")
                    if skipped_items:
                        print(f"Skipped {len(skipped_items)} items (e.g., Living objects).")
                    if errored_items:
                        print(f"Failed to process {len(errored_items)} items due to errors.")
                else:
                    print("Operation cancelled.")
            
            elif choice == "2":  # sync all
                print("\n=== SYNC ALL ===")
                items_to_create, items_to_update, items_to_delete = preview_changes(db_session, all_items, all_item_ids, "sync all")
                
                if not items_to_create and not items_to_update and not items_to_delete:
                    print("No changes needed.")
                    continue
                
                # Extra confirmation for large deletions
                if items_to_delete and len(items_to_delete) > 50:
                    print(f"\nWARNING: You are about to delete {len(items_to_delete)} items.")
                    confirm_large = input("Type 'DELETE' to confirm large deletion: ")
                    if confirm_large != "DELETE":
                        print("Operation cancelled.")
                        continue
                
                confirm = input(f"\nProceed with syncing {len(items_to_create)} new items, updating {len(items_to_update)} existing items, and deleting {len(items_to_delete)} items? (y/N): ")
                if confirm.lower() == 'y':
                    created_items, updated_items, skipped_items, errored_items, deleted_items = execute_sync_all(db_session, all_items, all_item_ids)
                    db_session.commit()
                    print(f"Successfully synced: {len(created_items)} items created, {len(updated_items)} items updated, {len(deleted_items)} items deleted.")
                    if skipped_items:
                        print(f"Skipped {len(skipped_items)} items (e.g., Living objects).")
                    if errored_items:
                        print(f"Failed to process {len(errored_items)} items due to errors.")
                else:
                    print("Operation cancelled.")
            
            elif choice == "3":  # individual upsert
                print("\n=== INDIVIDUAL UPSERT ===")
                created_items, updated_items, skipped_items, errored_items = execute_individual_upsert(db_session, all_items)
                if created_items or updated_items or skipped_items or errored_items:
                    db_session.commit()
                    if created_items:
                        print(f"Successfully created {len(created_items)} items.")
                    if updated_items:
                        print(f"Successfully updated {len(updated_items)} items.")
                    if skipped_items:
                        print(f"Skipped {len(skipped_items)} items (e.g., Living objects).")
                    if errored_items:
                        print(f"Failed to process {len(errored_items)} items due to errors.")
            
            else:
                print("Invalid choice. Please select 1-4.")


if __name__ == "__main__":
    sync_item()
