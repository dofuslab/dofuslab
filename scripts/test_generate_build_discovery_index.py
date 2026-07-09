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
        with patch("oneoff.generate_build_discovery_index.load_all_item_records", return_value=[]):
            with patch("oneoff.generate_build_discovery_index.load_sets", return_value={}):
                index = build_index()

        self.assertEqual(index["schemaVersion"], 1)
        self.assertIn("generatedAt", index)
        self.assertEqual(index["datasetVersion"], index["generatedAt"])


if __name__ == "__main__":
    unittest.main()
