#!/usr/bin/env python3
"""
Sync Set Script

This script synchronizes sets between input JSON files and the database.
It supports:
- Creating new sets from input files
- Updating existing sets with new data
- Deleting sets that are no longer present in input files (when using 'sync all')

Usage:
- 'upsert all': Updates all sets in the input file, creates missing ones (no deletion)
- 'sync all': Updates all sets AND deletes sets not found in the input file
- 'individual upsert': Select and upsert a specific set

The script handles sets using dofus_db_id.
"""

import json
import os
from sqlalchemy import or_
from app import session_scope
from app.database.model_set import ModelSet
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set_bonus import ModelSetBonus
from app.database.model_set_bonus_translation import ModelSetBonusTranslation
from oneoff.enums import to_stat_enum

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_set_bonuses(db_session, set_object, data):
    for num_items in data["bonuses"]:
        bonuses = data["bonuses"][num_items]
        for bonus in bonuses:
            bonus_obj = ModelSetBonus(
                set_id=set_object.uuid,
                num_items=int(num_items),
            )
            if bonus["stat"]:
                bonus_obj.stat = to_stat_enum[bonus["stat"]]
                bonus_obj.value = bonus["value"]
            else:
                for locale in bonus["altStat"]:
                    for custom_bonus in bonus["altStat"][locale]:
                        bonus_translation = ModelSetBonusTranslation(
                            set_bonus_id=bonus_obj.uuid,
                            locale=locale,
                            custom_stat=custom_bonus,
                        )
                        db_session.add(bonus_translation)
                        bonus_obj.set_bonus_translation.append(bonus_translation)

            db_session.add(bonus_obj)


def create_set_translations(db_session, set_object, data):
    for locale in data["name"]:
        if data["name"][locale]:
            translation = ModelSetTranslation(
                set_id=set_object.uuid, locale=locale, name=data["name"][locale]
            )
            db_session.add(translation)


def update_set(db_session, set_object, data):
    set_object.dofus_db_id = data["id"]
    db_session.query(ModelSetTranslation).filter(
        ModelSetTranslation.set_id == set_object.uuid
    ).delete()
    create_set_translations(db_session, set_object, data)

    db_session.query(ModelSetBonus).filter(
        ModelSetBonus.set_id == set_object.uuid
    ).delete()
    create_set_bonuses(db_session, set_object, data)


def create_set(db_session, data):
    set_object = ModelSet(dofus_db_id=data["id"])
    db_session.add(set_object)
    db_session.flush()

    create_set_translations(db_session, set_object, data)
    create_set_bonuses(db_session, set_object, data)


def update_or_create_set(
    db_session,
    set_id,
    data,
):
    """
    Update existing set or create new set.
    Returns True if set was created, False if set was updated, None if set was skipped.
    Raises ValueError for error cases (multiple sets with same ID).
    """
    database_set = (
        db_session.query(ModelSet).filter(ModelSet.dofus_db_id == set_id).all()
    )
    
    if len(database_set) > 1:
        raise ValueError(f"Multiple sets with ID {set_id} exist in the database")
    elif len(database_set) == 1:
        # Update existing set
        set_object = (
            db_session.query(ModelSet)
            .filter(ModelSet.uuid == database_set[0].uuid)
            .one()
        )
        update_set(db_session, set_object, data)
        return False  # Set was updated
    elif len(database_set) == 0:
        # Create new set
        create_set(db_session, data)
        return True  # Set was created successfully


def load_all_sets():
    """Load all sets from the sets JSON file into memory."""
    all_sets = []
    all_set_ids = set()
    
    print("Loading sets file...")
    file_path = os.path.join(app_root, "app/database/data/sets.json")
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            data = json.load(file)
            all_sets = data
            
            # Collect all set IDs
            for record in data:
                set_id = record["id"]
                all_set_ids.add(set_id)
                
        print(f"Loaded {len(data)} sets from sets.json")
    else:
        print("Warning: sets.json not found")
    
    print(f"Total sets loaded: {len(all_set_ids)}")
    return all_sets, all_set_ids


def get_sets_to_delete(db_session, input_set_ids):
    """
    Get sets from database that are not present in the input file.
    Uses SQL filtering for better performance.
    Returns a list of sets that should be deleted.
    """
    if not input_set_ids:
        return []
    
    # Find sets not in input_set_ids using SQL NOT IN
    sets_to_delete = db_session.query(ModelSet).filter(
        ModelSet.dofus_db_id.notin_(input_set_ids)
    ).all()
    
    return sets_to_delete


def delete_sets_not_in_file(db_session, sets_to_delete):
    """
    Delete sets that are not found in the input file.
    The cascade relationships will handle deletion of related records.
    """
    deleted_sets = []
    
    for set_obj in sets_to_delete:
        set_id = set_obj.dofus_db_id
        set_name = "Unknown"
        
        # Try to get the set name from translations
        translation = db_session.query(ModelSetTranslation).filter_by(
            set_id=set_obj.uuid, locale="en"
        ).first()
        if translation:
            set_name = translation.name
        
        print("Deleting set [{}]: {}".format(set_id, set_name))
        deleted_sets.append("[{}]: {}".format(set_id, set_name))
        
        # Delete the set (cascade will handle related records)
        db_session.delete(set_obj)
    
    return deleted_sets


def preview_changes(db_session, all_sets, all_set_ids, operation_type):
    """Preview sets that would be created/updated and deleted."""
    sets_to_create = []
    sets_to_update = []
    sets_to_delete = []
    
    print(f"\n=== PREVIEW: {operation_type.upper()} ===")
    
    # Check what sets would be created/updated
    for record in all_sets:
        set_id = record["id"]
        set_name = record["name"]["en"]
        
        # Check if set exists in database
        existing_sets = db_session.query(ModelSet).filter(
            ModelSet.dofus_db_id == set_id
        ).all()
        
        if len(existing_sets) == 0:
            sets_to_create.append((set_id, set_name))
        else:
            sets_to_update.append((set_id, set_name))
    
    # Check what sets would be deleted (only for sync all)
    if operation_type == "sync all":
        sets_to_delete = get_sets_to_delete(db_session, all_set_ids)
    
    # Display preview
    if sets_to_create:
        print(f"\nSets to CREATE ({len(sets_to_create)}):")
        for set_id, set_name in sets_to_create:
            print(f"  [{set_id}] (dofusID): {set_name}")
    
    if sets_to_update:
        print(f"\nSets to UPDATE: {len(sets_to_update)} sets")
    
    if sets_to_delete:
        print(f"\nSets to DELETE ({len(sets_to_delete)}):")
        for set_obj in sets_to_delete:
            set_id = set_obj.dofus_db_id
            set_name = "Unknown"
            translation = db_session.query(ModelSetTranslation).filter_by(
                set_id=set_obj.uuid, locale="en"
            ).first()
            if translation:
                set_name = translation.name
            print(f"  [{set_id}] (dofusID): {set_name}")
    
    return sets_to_create, sets_to_update, sets_to_delete


def execute_upsert_all(db_session, all_sets):
    """Execute upsert all operation."""
    created_sets = []
    updated_sets = []
    skipped_sets = []
    errored_sets = []
    
    for record in all_sets:
        set_id = record["id"]
        set_name = record["name"]["en"]
        
        try:
            result = update_or_create_set(
                db_session,
                set_id,
                record,
            )
            
            if result is True:
                created_sets.append(f"[{set_id}]: {set_name}")
            elif result is False:
                updated_sets.append(f"[{set_id}]: {set_name}")
            elif result is None:
                skipped_sets.append(f"[{set_id}]: {set_name}")
        except ValueError as e:
            error_msg = f"[{set_id}]: {set_name} - {e}"
            errored_sets.append(error_msg)
            print(f"Error processing set {error_msg}")
            # Continue processing other sets
    
    return created_sets, updated_sets, skipped_sets, errored_sets


def execute_sync_all(db_session, all_sets, all_set_ids):
    """Execute sync all operation (upsert + delete)."""
    # First do upsert
    created_sets, updated_sets, skipped_sets, errored_sets = execute_upsert_all(db_session, all_sets)
    
    # Then delete sets not in input file
    sets_to_delete = get_sets_to_delete(db_session, all_set_ids)
    deleted_sets = []
    
    if sets_to_delete:
        deleted_sets = delete_sets_not_in_file(db_session, sets_to_delete)
    
    return created_sets, updated_sets, skipped_sets, errored_sets, deleted_sets


def execute_individual_upsert(db_session, all_sets):
    """Execute individual upsert operation."""
    # Create ID to record map
    id_to_record_map = {}
    for record in all_sets:
        id_to_record_map[record["id"]] = record
    
    print(f"\nAvailable sets ({len(id_to_record_map)} total):")
    for set_id, record in list(id_to_record_map.items())[:10]:  # Show first 10
        print(f"  {set_id}: {record['name']['en']}")
    if len(id_to_record_map) > 10:
        print(f"  ... and {len(id_to_record_map) - 10} more sets")
    
    while True:
        set_id = input(f"Enter set ID: ")
        if set_id in id_to_record_map:
            record = id_to_record_map[set_id]
            set_name = record["name"]["en"]
            
            try:
                result = update_or_create_set(db_session, set_id, record)
                
                if result is True:
                    return [f"[{set_id}]: {set_name}"], [], [], []
                elif result is False:
                    return [], [f"[{set_id}]: {set_name}"], [], []
                elif result is None:
                    return [], [], [f"[{set_id}]: {set_name}"], []
            except ValueError as e:
                error_msg = f"[{set_id}]: {set_name} - {e}"
                print(f"Error processing set {error_msg}")
                print("Please try a different set ID.")
                return [], [], [], [error_msg]
        else:
            print("Set ID not found. Please try again.")


def sync_set():
    """Main sync function with improved developer experience."""
    print("=== DOFUS LAB SET SYNC ===")
    
    # Load all sets from file
    all_sets, all_set_ids = load_all_sets()
    
    if not all_sets:
        print("No sets loaded. Exiting.")
        return
    
    # Present options to user
    print("\nAvailable operations:")
    print("  1. upsert all - Update existing sets and create missing ones (no deletion)")
    print("  2. sync all - Full sync: upsert all + delete sets not in file")
    print("  3. individual upsert - Select and upsert a specific set")
    print("  4. quit")
    
    while True:
        choice = input("\nSelect operation (1-4): ").strip()
        
        if choice == "4" or choice.lower() == "q":
            print("Exiting.")
            return
        
        with session_scope() as db_session:
            if choice == "1":  # upsert all
                print("\n=== UPSERT ALL ===")
                sets_to_create, sets_to_update, _ = preview_changes(db_session, all_sets, all_set_ids, "upsert all")
                
                if not sets_to_create and not sets_to_update:
                    print("No changes needed.")
                    continue
                
                confirm = input(f"\nProceed with upserting {len(sets_to_create)} new sets and updating {len(sets_to_update)} existing sets? (Y/n): ")
                if confirm.lower() == 'y':
                    created_sets, updated_sets, skipped_sets, errored_sets = execute_upsert_all(db_session, all_sets)
                    db_session.commit()
                    print(f"Successfully upserted {len(created_sets)} new sets and updated {len(updated_sets)} existing sets.")
                    if skipped_sets:
                        print(f"Skipped {len(skipped_sets)} sets.")
                    if errored_sets:
                        print(f"Failed to process {len(errored_sets)} sets due to errors.")
                else:
                    print("Operation cancelled.")
            
            elif choice == "2":  # sync all
                print("\n=== SYNC ALL ===")
                sets_to_create, sets_to_update, sets_to_delete = preview_changes(db_session, all_sets, all_set_ids, "sync all")
                
                if not sets_to_create and not sets_to_update and not sets_to_delete:
                    print("No changes needed.")
                    continue
                
                # Extra confirmation for large deletions
                if sets_to_delete and len(sets_to_delete) > 50:
                    print(f"\nWARNING: You are about to delete {len(sets_to_delete)} sets.")
                    confirm_large = input("Type 'DELETE' to confirm large deletion: ")
                    if confirm_large != "DELETE":
                        print("Operation cancelled.")
                        continue
                
                confirm = input(f"\nProceed with syncing {len(sets_to_create)} new sets, updating {len(sets_to_update)} existing sets, and deleting {len(sets_to_delete)} sets? (y/N): ")
                if confirm.lower() == 'y':
                    created_sets, updated_sets, skipped_sets, errored_sets, deleted_sets = execute_sync_all(db_session, all_sets, all_set_ids)
                    db_session.commit()
                    print(f"Successfully synced: {len(created_sets)} sets created, {len(updated_sets)} sets updated, {len(deleted_sets)} sets deleted.")
                    if skipped_sets:
                        print(f"Skipped {len(skipped_sets)} sets.")
                    if errored_sets:
                        print(f"Failed to process {len(errored_sets)} sets due to errors.")
                else:
                    print("Operation cancelled.")
            
            elif choice == "3":  # individual upsert
                print("\n=== INDIVIDUAL UPSERT ===")
                created_sets, updated_sets, skipped_sets, errored_sets = execute_individual_upsert(db_session, all_sets)
                if created_sets or updated_sets or skipped_sets or errored_sets:
                    db_session.commit()
                    if created_sets:
                        print(f"Successfully created {len(created_sets)} sets.")
                    if updated_sets:
                        print(f"Successfully updated {len(updated_sets)} sets.")
                    if skipped_sets:
                        print(f"Skipped {len(skipped_sets)} sets.")
                    if errored_sets:
                        print(f"Failed to process {len(errored_sets)} sets due to errors.")
            
            else:
                print("Invalid choice. Please select 1-4.")


if __name__ == "__main__":
    sync_set()
