import unittest
from pathlib import Path
import sys
import json
import tempfile
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

import oneoff.build_discovery_prototype as build_discovery_prototype
from oneoff.generate_build_discovery_index import (
    EVERGREEN_ITEM_IDS,
    build_index,
    build_item_indexes,
    item_flags,
    level_bucket_name,
    load_db_item_records,
    load_db_sets,
    normalize_source_item,
    normalize_source_weapon_stats,
    serializable_item,
)


class GenerateBuildDiscoveryIndexTest(unittest.TestCase):
    def test_level_bucket_name_uses_four_search_buckets(self):
        self.assertEqual(level_bucket_name(1), "1-99")
        self.assertEqual(level_bucket_name(99), "1-99")
        self.assertEqual(level_bucket_name(100), "100-149")
        self.assertEqual(level_bucket_name(149), "100-149")
        self.assertEqual(level_bucket_name(150), "150-179")
        self.assertEqual(level_bucket_name(179), "150-179")
        self.assertEqual(level_bucket_name(180), "180-200")
        self.assertEqual(level_bucket_name(200), "180-200")
        self.assertIsNone(level_bucket_name(201))

    def test_build_item_indexes_keeps_evergreen_low_level_gear_outside_normal_bucket(self):
        items = [
            {
                "dofusID": "2469",
                "itemType": "Ring",
                "level": 60,
                "_stats": {"AP": 1},
            },
            {
                "dofusID": "level_200_ring",
                "itemType": "Ring",
                "level": 200,
                "_stats": {"Strength": 100},
            },
        ]

        indexes = build_item_indexes(items)

        self.assertIn("2469", EVERGREEN_ITEM_IDS)
        self.assertIn("2469", indexes["normalGearByLevelBucket"]["1-99"])
        self.assertIn("2469", indexes["evergreenItemIds"])
        self.assertIn("level_200_ring", indexes["normalGearByLevelBucket"]["180-200"])

    def test_build_item_indexes_separates_dofus_like_and_pet_mount_pools(self):
        items = [
            {"dofusID": "694", "itemType": "Dofus", "level": 110, "_stats": {"Strength": 80}},
            {"dofusID": "16333", "itemType": "Trophy", "level": 100, "_stats": {"AP": 1}},
            {"dofusID": "7712", "itemType": "Pet", "level": 20, "_stats": {"Strength": 90}},
            {"dofusID": "33044", "itemType": "Mount", "level": 60, "_stats": {"Strength": 100}},
        ]

        indexes = build_item_indexes(items)

        self.assertIn("694", indexes["dofusTrophyPrysmaraditeByLevelBucket"]["100-149"])
        self.assertIn("16333", indexes["dofusTrophyPrysmaraditeByLevelBucket"]["100-149"])
        self.assertIn("7712", indexes["petMountIds"])
        self.assertIn("33044", indexes["petMountIds"])
        self.assertNotIn("7712", indexes["normalGearByLevelBucket"]["1-99"])

    def test_item_flags_marks_action_stats_and_exo_eligibility(self):
        flags = item_flags(
            {
                "dofusID": "hat",
                "itemType": "Hat",
                "_stats": {"AP": 1, "MP": -1, "Range": 2},
            }
        )

        self.assertTrue(flags["givesAP"])
        self.assertTrue(flags["givesRange"])
        self.assertTrue(flags["hasNegativeMP"])
        self.assertTrue(flags["isExoEligible"])
        self.assertEqual(flags["actionStats"], {"AP": 1, "MP": -1, "Range": 2})

    def test_serializable_item_includes_internal_id_for_generated_imports(self):
        item = serializable_item(
            {
                "uuid": "internal-hat-uuid",
                "dofusID": "hat",
                "name": {"en": "Indexed Hat"},
                "itemType": "Hat",
                "level": 200,
                "stats": [],
            }
        )

        self.assertEqual(item["id"], "hat")
        self.assertEqual(item["internalId"], "internal-hat-uuid")

    def test_runtime_indexed_candidate_ids_use_target_bucket_and_special_pools(self):
        index = {
            "schemaVersion": 1,
            "levelBuckets": [
                {"name": "1-99", "minLevel": 1, "maxLevel": 99},
                {"name": "100-149", "minLevel": 100, "maxLevel": 149},
                {"name": "150-179", "minLevel": 150, "maxLevel": 179},
                {"name": "180-200", "minLevel": 180, "maxLevel": 200},
            ],
            "indexes": {
                "normalGearByLevelBucket": {
                    "1-99": ["low_normal"],
                    "100-149": ["mid_normal"],
                    "150-179": ["late_mid_normal"],
                    "180-200": ["endgame_normal"],
                },
                "dofusTrophyPrysmaraditeByLevelBucket": {
                    "1-99": ["low_dofus"],
                    "100-149": ["mid_trophy"],
                    "150-179": ["late_mid_dofus"],
                    "180-200": ["endgame_prysm"],
                },
                "petMountIds": ["pet"],
                "evergreenItemIds": ["gelano"],
            },
        }
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as file:
            json.dump(index, file)
            path = file.name

        try:
            with patch.object(build_discovery_prototype, "BUILD_DISCOVERY_INDEX_PATH", path):
                build_discovery_prototype.load_build_discovery_index.cache_clear()
                candidate_ids = build_discovery_prototype.indexed_candidate_item_ids(200)
        finally:
            Path(path).unlink(missing_ok=True)
            build_discovery_prototype.load_build_discovery_index.cache_clear()

        self.assertEqual(
            candidate_ids,
            {
                "endgame_normal",
                "late_mid_normal",
                "low_dofus",
                "mid_trophy",
                "late_mid_dofus",
                "endgame_prysm",
                "pet",
                "gelano",
            },
        )

    def test_runtime_index_rejects_unsupported_schema_version(self):
        index = {
            "schemaVersion": 999,
            "levelBuckets": [],
            "indexes": {},
        }
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as file:
            json.dump(index, file)
            path = file.name

        try:
            with patch.object(build_discovery_prototype, "BUILD_DISCOVERY_INDEX_PATH", path):
                build_discovery_prototype.load_build_discovery_index.cache_clear()
                with self.assertRaises(ValueError):
                    build_discovery_prototype.load_build_discovery_index()
        finally:
            Path(path).unlink(missing_ok=True)
            build_discovery_prototype.load_build_discovery_index.cache_clear()

    def test_generated_index_includes_dataset_version(self):
        with patch("oneoff.generate_build_discovery_index.load_db_item_records", return_value=[]):
            with patch("oneoff.generate_build_discovery_index.load_db_sets", return_value={}):
                with patch(
                    "oneoff.generate_build_discovery_index.derive_all_spell_profiles",
                    return_value={
                        "profileVersion": "test-profile-version",
                        "levels": [200],
                        "profiles": [{"className": "Cra"}],
                    },
                ):
                    index = build_index(source="db")

        self.assertEqual(index["schemaVersion"], 1)
        self.assertIn("generatedAt", index)
        self.assertEqual(index["datasetVersion"], index["generatedAt"])
        self.assertEqual(index["spellProfiles"]["profiles"], [{"className": "Cra"}])

    def test_build_index_defaults_to_db_source_for_importable_generated_builds(self):
        db_item = {
            "uuid": "internal-hat-uuid",
            "dofusID": "100",
            "name": {"en": "Indexed Hat"},
            "itemType": "Hat",
            "level": 200,
            "stats": [],
        }

        with patch("oneoff.generate_build_discovery_index.load_db_item_records", return_value=[db_item]) as db_items:
            with patch("oneoff.generate_build_discovery_index.load_db_sets", return_value={}) as db_sets:
                with patch("oneoff.generate_build_discovery_index.load_source_json") as source_json:
                    index = build_index()

        db_items.assert_called_once_with()
        db_sets.assert_called_once_with()
        source_json.assert_not_called()
        self.assertEqual(index["items"][0]["internalId"], "internal-hat-uuid")

    def test_build_index_can_use_json_source_for_local_smoke_checks(self):
        source_data = {
            "items.json": [],
            "weapons.json": [],
            "pets.json": [],
            "mounts.json": [],
            "sets.json": [],
        }

        with patch("oneoff.generate_build_discovery_index.load_source_json", side_effect=source_data.get):
            with patch("oneoff.generate_build_discovery_index.load_db_item_records") as db_items:
                with patch("oneoff.generate_build_discovery_index.load_db_sets") as db_sets:
                    index = build_index(source="json")

        db_items.assert_not_called()
        db_sets.assert_not_called()
        self.assertEqual(index["items"], [])
        self.assertEqual(index["spellProfiles"]["profiles"], [])
        self.assertEqual(index["spellProfiles"]["source"], "unavailable_for_json_index_source")

    def test_db_item_loader_disables_generated_index_path_during_call(self):
        original_path = "existing-generated-index.json"

        def load_items_from_db():
            self.assertEqual(build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH, "")
            return ({"dofusID": "1"},)

        with patch.object(build_discovery_prototype, "BUILD_DISCOVERY_INDEX_PATH", original_path):
            with patch.object(
                build_discovery_prototype,
                "load_all_item_records",
                side_effect=load_items_from_db,
            ):
                self.assertEqual(load_db_item_records(), ({"dofusID": "1"},))
            self.assertEqual(build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH, original_path)

    def test_db_set_loader_disables_generated_index_path_during_call(self):
        original_path = "existing-generated-index.json"

        def load_sets_from_db():
            self.assertEqual(build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH, "")
            return {"1": {"id": "1"}}

        with patch.object(build_discovery_prototype, "BUILD_DISCOVERY_INDEX_PATH", original_path):
            with patch.object(
                build_discovery_prototype,
                "load_sets",
                side_effect=load_sets_from_db,
            ):
                self.assertEqual(load_db_sets(), {"1": {"id": "1"}})
            self.assertEqual(build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH, original_path)

    def test_normalize_source_item_uses_mount_dofus_id(self):
        item = normalize_source_item(
            {
                "mountDofusID": "33000",
                "name": {"en": "Feathered Dragoturkey"},
                "itemType": "Mount",
                "level": 60,
                "stats": [],
            },
            "mounts.json",
        )

        self.assertEqual(item["dofusID"], "33000")
        self.assertIsNone(item["setID"])
        self.assertEqual(item["buffs"], [])
        self.assertEqual(item["conditions"], {"conditions": {}, "customConditions": {}})

    def test_normalize_source_item_stringifies_set_id(self):
        item = normalize_source_item(
            {
                "dofusID": 123,
                "name": {"en": "Set Hat"},
                "itemType": "Hat",
                "setID": 456,
                "level": 200,
                "stats": [],
            },
            "items.json",
        )

        self.assertEqual(item["dofusID"], "123")
        self.assertEqual(item["setID"], "456")

    def test_normalize_source_weapon_stats_uses_runtime_weapon_effects(self):
        weapon_stats = normalize_source_weapon_stats(
            {
                "apCost": 4,
                "weapon_effects": [
                    {"stat": "Neutral damage", "minStat": 10, "maxStat": 14},
                    {"stat": "Unsupported", "minStat": 1, "maxStat": 2},
                ],
            }
        )

        self.assertEqual(
            weapon_stats["weaponEffects"],
            [{"effectType": "NEUTRAL_DAMAGE", "minDamage": 10, "maxDamage": 14}],
        )

    def test_build_index_from_json_source_uses_patched_local_loader(self):
        source_data = {
            "items.json": [
                {
                    "dofusID": 100,
                    "name": {"en": "Indexed Hat"},
                    "itemType": "Hat",
                    "setID": 200,
                    "level": 200,
                    "stats": [{"stat": "Strength", "maxStat": 100}],
                }
            ],
            "weapons.json": [
                {
                    "dofusID": "300",
                    "name": {"en": "Indexed Sword"},
                    "itemType": "Sword",
                    "setID": None,
                    "level": 200,
                    "stats": [],
                    "weaponStats": {
                        "apCost": 4,
                        "weapon_effects": [
                            {"stat": "Earth steal", "minStat": None, "maxStat": 12}
                        ],
                    },
                }
            ],
            "pets.json": [],
            "mounts.json": [
                {
                    "mountDofusID": "33000",
                    "name": {"en": "Indexed Mount"},
                    "itemType": "Mount",
                    "level": 60,
                    "stats": [],
                }
            ],
            "sets.json": [
                {
                    "id": 200,
                    "name": {"en": "Indexed Set"},
                    "bonuses": {},
                }
            ],
        }

        with patch("oneoff.generate_build_discovery_index.load_source_json", side_effect=source_data.get):
            index = build_index(source="json")

        items_by_id = {item["id"]: item for item in index["items"]}
        self.assertEqual(items_by_id["100"]["setID"], "200")
        self.assertEqual(items_by_id["33000"]["itemType"], "Mount")
        self.assertEqual(items_by_id["300"]["weaponStats"]["weaponEffects"], [
            {"effectType": "EARTH_STEAL", "minDamage": 0, "maxDamage": 12}
        ])
        self.assertEqual(index["sets"]["200"]["id"], "200")


if __name__ == "__main__":
    unittest.main()
