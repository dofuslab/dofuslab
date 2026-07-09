import unittest
import importlib
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

schema_module = importlib.import_module("app.schema")
schema = schema_module.schema


class BuildDiscoveryGraphQLTest(unittest.TestCase):
    def test_build_discovery_query_exposes_product_contract(self):
        response = {
            "query": {"className": "Iop", "elements": ["intelligence"], "limit": 3},
            "builds": [],
            "diagnostics": {"resultCount": 0},
        }

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "build_discovery_response", return_value=response) as build_discovery:
                result = schema.execute(
                    """
                    query {
                      buildDiscovery(
                        elements: ["intelligence"]
                        apTarget: 12
                        mpTarget: 6
                        rangeTarget: 2
                        budgetTier: 3
                        exoPolicy: "allow"
                        lockedItemIds: ["100"]
                        avoidedItemIds: ["200"]
                        limit: 3
                      )
                    }
                    """
                )

        self.assertIsNone(result.errors)
        self.assertEqual(result.data["buildDiscovery"], response)
        query = build_discovery.call_args.args[0]
        self.assertEqual(query.elements, ("intelligence",))
        self.assertEqual(query.ap_target, 12)
        self.assertEqual(query.mp_target, 6)
        self.assertEqual(query.range_target, 2)
        self.assertEqual(query.budget_tier, 3)
        self.assertEqual(query.exo_policy, "allow")
        self.assertEqual(query.locked_item_ids, ("100",))
        self.assertEqual(query.avoided_item_ids, ("200",))
        self.assertEqual(query.limit, 3)

    def test_build_discovery_query_rejects_unbounded_limit(self):
        for limit in (0, 50):
            with self.subTest(limit=limit):
                result = schema.execute(
                    """
                    query($limit: Int!) {
                      buildDiscovery(elements: ["strength"], limit: $limit)
                    }
                    """,
                    variables={"limit": limit},
                )

                self.assertIsNotNone(result.errors)
                self.assertIn("limit must be between 1 and 5", str(result.errors[0]))

    def test_build_discovery_query_rejects_out_of_scope_class(self):
        result = schema.execute(
            """
            query {
              buildDiscovery(className: "Cra", elements: ["intelligence"])
            }
            """
        )

        self.assertIsNotNone(result.errors)
        self.assertIn("supports Iop only", str(result.errors[0]))

    def test_build_discovery_query_requires_generated_index(self):
        with patch.object(schema_module, "load_build_discovery_index", return_value=None):
            result = schema.execute(
                """
                query {
                  buildDiscovery(elements: ["strength"])
                }
                """
            )

        self.assertIsNotNone(result.errors)
        self.assertIn("index is not available", str(result.errors[0]))


if __name__ == "__main__":
    unittest.main()
