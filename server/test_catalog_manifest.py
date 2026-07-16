import importlib.util
from pathlib import Path
import unittest


module_path = Path(__file__).parent / "app" / "catalog_manifest.py"
spec = importlib.util.spec_from_file_location("catalog_manifest", module_path)
catalog_manifest_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catalog_manifest_module)


class CatalogManifestTest(unittest.TestCase):
    def test_formats_database_revision_for_wire_contract(self):
        self.assertEqual(
            catalog_manifest_module.catalog_manifest(42),
            {"schemaVersion": 2, "version": "42"},
        )

    def test_formatter_has_no_cached_database_state(self):
        self.assertEqual(
            catalog_manifest_module.catalog_manifest(7)["version"], "7"
        )
        self.assertEqual(
            catalog_manifest_module.catalog_manifest(8)["version"], "8"
        )

    def test_etag_changes_for_schema_or_database_revision(self):
        first = {"schemaVersion": 2, "version": "7"}
        self.assertEqual(
            catalog_manifest_module.catalog_manifest_etag(first),
            "catalog-v2-r7",
        )
        self.assertNotEqual(
            catalog_manifest_module.catalog_manifest_etag(first),
            catalog_manifest_module.catalog_manifest_etag(
                {"schemaVersion": 3, "version": "7"}
            ),
        )
        self.assertNotEqual(
            catalog_manifest_module.catalog_manifest_etag(first),
            catalog_manifest_module.catalog_manifest_etag(
                {"schemaVersion": 2, "version": "8"}
            ),
        )


if __name__ == "__main__":
    unittest.main()
