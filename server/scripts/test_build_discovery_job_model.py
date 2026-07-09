import importlib.util
import sys
import unittest
from pathlib import Path

from sqlalchemy import Float
from sqlalchemy.dialects.postgresql import UUID

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database.model_build_discovery_job import ModelBuildDiscoveryJob


class BuildDiscoveryJobModelTest(unittest.TestCase):
    def test_model_declares_minimal_async_job_columns(self):
        columns = ModelBuildDiscoveryJob.__table__.columns

        self.assertEqual(ModelBuildDiscoveryJob.__tablename__, "build_discovery_job")
        self.assertIsInstance(columns["uuid"].type, UUID)
        self.assertFalse(columns["status"].nullable)
        self.assertFalse(columns["progress"].nullable)
        self.assertIsInstance(columns["elapsed_ms"].type, Float)
        self.assertIn("request_payload", columns)
        self.assertIn("result_payload", columns)
        self.assertIn("error_payload", columns)
        self.assertIn("dataset_version", columns)
        self.assertIn("solver_version", columns)
        self.assertIn("elapsed_ms", columns)
        self.assertIn("generation_request_id", columns)
        self.assertIn("creation_date", columns)
        self.assertIn("last_modified", columns)

    def test_model_indexes_job_lookup_columns(self):
        indexes = {
            tuple(index.columns.keys())
            for index in ModelBuildDiscoveryJob.__table__.indexes
        }

        self.assertIn(("status",), indexes)
        self.assertIn(("generation_request_id",), indexes)
        self.assertIn(("creation_date",), indexes)
        self.assertIn(("last_modified",), indexes)

    def test_migration_stacks_after_generation_request(self):
        migration_path = (
            Path(__file__).resolve().parents[1]
            / "app"
            / "migrations"
            / "versions"
            / "395c1a10243a_add_build_discovery_job.py"
        )
        spec = importlib.util.spec_from_file_location(
            "build_discovery_job_migration",
            migration_path,
        )
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)

        self.assertEqual(migration.revision, "395c1a10243a")
        self.assertEqual(migration.down_revision, "395c1a102439")


if __name__ == "__main__":
    unittest.main()
