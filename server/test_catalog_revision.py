import importlib.util
from pathlib import Path
import sys
import types
import unittest


class ComparableField:
    def __eq__(self, other):
        return ("id", other)


class StubCatalogRevision:
    id = ComparableField()


model_module = types.ModuleType("app.database.model_catalog_revision")
model_module.ModelCatalogRevision = StubCatalogRevision
stubbed_module_names = (
    "app",
    "app.database",
    "app.database.model_catalog_revision",
)
previous_modules = {
    name: sys.modules.get(name) for name in stubbed_module_names
}
try:
    sys.modules["app"] = types.ModuleType("app")
    sys.modules["app.database"] = types.ModuleType("app.database")
    sys.modules["app.database.model_catalog_revision"] = model_module

    module_path = Path(__file__).parent / "app" / "catalog_revision.py"
    spec = importlib.util.spec_from_file_location("catalog_revision", module_path)
    catalog_revision_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(catalog_revision_module)
finally:
    for module_name, previous_module in previous_modules.items():
        if previous_module is None:
            sys.modules.pop(module_name, None)
        else:
            sys.modules[module_name] = previous_module


class RevisionRow:
    def __init__(self, revision):
        self.revision = revision


class FakeQuery:
    def __init__(self, row):
        self.row = row
        self.locked = False
        self.filter_expression = None

    def filter(self, expression):
        self.filter_expression = expression
        return self

    def with_for_update(self):
        self.locked = True
        return self

    def one(self):
        return self.row


class FakeSession:
    def __init__(self, revision):
        self.row = RevisionRow(revision)
        self.query_object = FakeQuery(self.row)
        self.flush_count = 0

    def query(self, model):
        self.queried_model = model
        return self.query_object

    def flush(self):
        self.flush_count += 1


class CatalogRevisionTest(unittest.TestCase):
    def test_reads_current_revision_each_time(self):
        session = FakeSession(4)
        self.assertEqual(
            catalog_revision_module.get_catalog_revision(session), 4
        )
        self.assertFalse(session.query_object.locked)

    def test_advance_locks_flushes_and_returns_incremented_revision(self):
        session = FakeSession(9)
        self.assertEqual(
            catalog_revision_module.advance_catalog_revision(session), 10
        )
        self.assertEqual(session.row.revision, 10)
        self.assertTrue(session.query_object.locked)
        self.assertEqual(session.flush_count, 1)

    def test_change_guard_does_not_advance_for_skips_or_errors_only(self):
        session = FakeSession(3)
        result = catalog_revision_module.advance_catalog_revision_for_changes(
            session, [], []
        )
        self.assertIsNone(result)
        self.assertEqual(session.row.revision, 3)
        self.assertEqual(session.flush_count, 0)

    def test_change_guard_advances_once_for_any_number_of_change_groups(self):
        session = FakeSession(3)
        result = catalog_revision_module.advance_catalog_revision_for_changes(
            session, ["created"], ["updated"], ["deleted"]
        )
        self.assertEqual(result, 4)
        self.assertEqual(session.flush_count, 1)


if __name__ == "__main__":
    unittest.main()
