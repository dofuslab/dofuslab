"""Isolated tests for recommendation database guardrails."""

import importlib.util
from pathlib import Path
import unittest


MODULE_PATH = Path(__file__).parents[1] / "app" / "suggester" / "database_limits.py"
SPEC = importlib.util.spec_from_file_location(
    "suggestion_database_limits", str(MODULE_PATH)
)
database_limits = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(database_limits)


class FakeSession:
    def __init__(self):
        self.executions = []

    def execute(self, statement, parameters):
        self.executions.append((statement, parameters))


class DatabaseLimitTests(unittest.TestCase):
    def test_timeout_is_parameterized_and_transaction_local(self):
        session = FakeSession()

        database_limits.apply_statement_timeout(session, 12345)

        self.assertEqual(
            session.executions,
            [
                (
                    database_limits.STATEMENT_TIMEOUT_SQL,
                    {"statement_timeout_ms": "12345"},
                )
            ],
        )
        self.assertIn("set_config", database_limits.STATEMENT_TIMEOUT_SQL)
        self.assertIn("true", database_limits.STATEMENT_TIMEOUT_SQL)

    def test_non_positive_timeout_is_rejected_before_database_access(self):
        session = FakeSession()

        with self.assertRaisesRegex(ValueError, "greater than zero"):
            database_limits.apply_statement_timeout(session, 0)

        self.assertEqual(session.executions, [])


if __name__ == "__main__":
    unittest.main()
