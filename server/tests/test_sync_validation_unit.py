import json
import os
import tempfile
import unittest

from oneoff.item_diff import (
    desired_stat_descriptors,
    diff_stat_descriptors,
    project_stat_diff,
)
from oneoff.sync_validation import SyncValidationError, load_and_validate_items


def item(item_id, stats=None, custom_stats=None):
    return {
        "dofusID": str(item_id),
        "name": {"en": "Item {}".format(item_id)},
        "stats": stats or [],
        "customStats": custom_stats or {},
    }


class ItemStatDiffTest(unittest.TestCase):
    def assert_diff_projects_to_desired(self, existing, desired):
        diff = diff_stat_descriptors(existing, desired)
        self.assertEqual(project_stat_diff(existing, desired, diff), desired)
        return diff

    def test_unchanged_import_is_noop(self):
        desired = desired_stat_descriptors(
            item("1", [{"stat": "Strength", "minStat": 10, "maxStat": 20}])
        )
        diff = self.assert_diff_projects_to_desired(desired, desired)
        self.assertEqual(diff["creates"], [])
        self.assertEqual(diff["updates"], [])
        self.assertEqual(diff["deletes"], [])

    def test_added_changed_removed_and_negative_stats(self):
        existing = desired_stat_descriptors(
            item(
                "1",
                [
                    {"stat": "Strength", "minStat": 1, "maxStat": 5},
                    {"stat": "Agility", "minStat": 3, "maxStat": 8},
                ],
            )
        )
        desired = desired_stat_descriptors(
            item(
                "1",
                [
                    {"stat": "Strength", "minStat": -10, "maxStat": -2},
                    {"stat": "Chance", "minStat": 4, "maxStat": 9},
                ],
            )
        )
        diff = self.assert_diff_projects_to_desired(existing, desired)
        self.assertEqual(len(diff["updates"]), 1)
        self.assertEqual(len(diff["creates"]), 1)
        self.assertEqual(len(diff["deletes"]), 1)

    def test_order_only_change_is_an_update_not_recreation(self):
        existing = desired_stat_descriptors(
            item(
                "1",
                [
                    {"stat": "Strength", "minStat": 1, "maxStat": 5},
                    {"stat": "Agility", "minStat": 3, "maxStat": 8},
                ],
            )
        )
        desired = list(reversed([dict(value) for value in existing]))
        for order, descriptor in enumerate(desired):
            descriptor["order"] = order
        diff = self.assert_diff_projects_to_desired(existing, desired)
        self.assertEqual(len(diff["updates"]), 2)
        self.assertEqual(diff["creates"], [])
        self.assertEqual(diff["deletes"], [])

    def test_custom_stats_participate_in_identity_and_order(self):
        record = item(
            "1",
            custom_stats={
                "en": ["First custom", "Second custom"],
                "fr": ["Premier", "Deuxieme"],
            },
        )
        desired = desired_stat_descriptors(record)
        diff = self.assert_diff_projects_to_desired(desired, desired)
        self.assertFalse(diff["creates"] or diff["updates"] or diff["deletes"])


class SourceValidationTest(unittest.TestCase):
    family_names = ["items", "mounts", "pets", "weapons"]

    def write(self, root, family, records):
        with open(
            os.path.join(root, "{}.json".format(family)), "w", encoding="utf-8"
        ) as target:
            json.dump(records, target)

    def populate(self, root):
        self.write(root, "items", [item("1")])
        self.write(root, "pets", [item("2")])
        self.write(root, "weapons", [item("3")])
        mount = item("4")
        mount["mountDofusID"] = mount.pop("dofusID")
        self.write(root, "mounts", [mount])

    def test_missing_file_fails_closed(self):
        with tempfile.TemporaryDirectory() as root:
            self.populate(root)
            os.remove(os.path.join(root, "weapons.json"))
            with self.assertRaises(SyncValidationError):
                load_and_validate_items(root, self.family_names)

    def test_duplicate_regular_id_fails_closed(self):
        with tempfile.TemporaryDirectory() as root:
            self.populate(root)
            self.write(root, "pets", [item("1")])
            with self.assertRaisesRegex(SyncValidationError, "Duplicate item ID"):
                load_and_validate_items(root, self.family_names)

    def test_item_mount_namespace_collision_fails_closed(self):
        with tempfile.TemporaryDirectory() as root:
            self.populate(root)
            mount = item("1")
            mount["mountDofusID"] = mount.pop("dofusID")
            self.write(root, "mounts", [mount])
            with self.assertRaisesRegex(SyncValidationError, "namespace collision"):
                load_and_validate_items(root, self.family_names)


if __name__ == "__main__":
    unittest.main()
