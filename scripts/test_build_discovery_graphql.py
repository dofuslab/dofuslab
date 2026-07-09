import unittest
import importlib
from pathlib import Path
import sys
from unittest.mock import Mock, patch
from dogpile.cache.api import NO_VALUE

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

        cache_region = Mock()
        cache_region.get.return_value = None

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
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
        self.assertEqual(result.data["buildDiscovery"]["query"], response["query"])
        self.assertEqual(result.data["buildDiscovery"]["builds"], response["builds"])
        self.assertEqual(result.data["buildDiscovery"]["diagnostics"]["resultCount"], 0)
        self.assertFalse(result.data["buildDiscovery"]["diagnostics"]["appCacheHit"])
        self.assertEqual(result.data["buildDiscovery"]["cache"]["status"], "miss")
        self.assertEqual(result.data["buildDiscovery"]["cache"]["storage"], "app_cache")
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

    def test_build_discovery_query_uses_app_cache_for_identical_requests(self):
        cache_store = {}
        response = {
            "cacheKey": "prototype-cache-key",
            "cache": {"status": "miss", "storage": "process_memory"},
            "diagnostics": {"cacheHit": False, "resultCount": 1},
            "builds": [{"score": 100}],
        }
        cache_region = Mock()
        cache_region.get.side_effect = lambda key: cache_store.get(key)
        cache_region.set.side_effect = lambda key, value: cache_store.setdefault(key, value)

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(schema_module, "build_discovery_response", return_value=response) as build_discovery:
                        first = schema.execute(
                            """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 3)
                            }
                            """
                        )
                        second = schema.execute(
                            """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 3)
                            }
                            """
                        )

        self.assertIsNone(first.errors)
        self.assertIsNone(second.errors)
        build_discovery.assert_called_once()
        self.assertFalse(first.data["buildDiscovery"]["diagnostics"]["appCacheHit"])
        self.assertEqual(first.data["buildDiscovery"]["cache"]["storage"], "app_cache")
        self.assertTrue(second.data["buildDiscovery"]["diagnostics"]["appCacheHit"])
        self.assertEqual(second.data["buildDiscovery"]["diagnostics"]["elapsedMs"], 0.0)
        self.assertEqual(second.data["buildDiscovery"]["cache"]["status"], "hit")
        self.assertEqual(second.data["buildDiscovery"]["cache"]["storage"], "app_cache")
        self.assertEqual(cache_region.get.call_count, 2)
        cache_region.set.assert_called_once()
        stored_response = cache_store[cache_region.set.call_args.args[0]]
        self.assertFalse(stored_response["diagnostics"]["appCacheHit"])
        self.assertEqual(stored_response["cache"]["status"], "miss")

    def test_build_discovery_app_cache_treats_dogpile_no_value_as_miss(self):
        cache_region = Mock()
        cache_region.get.return_value = NO_VALUE

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(
                        schema_module,
                        "build_discovery_response",
                        return_value={
                            "cacheKey": "prototype-cache-key",
                            "cache": {"status": "miss", "storage": "process_memory"},
                            "diagnostics": {"cacheHit": False, "resultCount": 0},
                            "builds": [],
                        },
                    ) as build_discovery:
                        result = schema.execute(
                            """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 3)
                            }
                            """
                        )

        self.assertIsNone(result.errors)
        build_discovery.assert_called_once()
        cache_region.set.assert_called_once()

    def test_build_discovery_app_cache_misses_when_query_changes(self):
        cache_store = {}
        cache_region = Mock()
        cache_region.get.side_effect = lambda key: cache_store.get(key)
        cache_region.set.side_effect = lambda key, value: cache_store.setdefault(key, value)

        def fake_response(query, use_cache):
            return {
                "cacheKey": f"prototype-{query.limit}",
                "cache": {"status": "miss", "storage": "process_memory"},
                "diagnostics": {"cacheHit": False, "resultCount": query.limit},
                "builds": [],
            }

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(schema_module, "build_discovery_response", side_effect=fake_response) as build_discovery:
                        first = schema.execute(
                            """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 3)
                            }
                            """
                        )
                        changed = schema.execute(
                            """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 4)
                            }
                            """
                        )

        self.assertIsNone(first.errors)
        self.assertIsNone(changed.errors)
        self.assertEqual(build_discovery.call_count, 2)
        self.assertEqual(cache_region.set.call_count, 2)
        self.assertNotEqual(cache_region.set.call_args_list[0].args[0], cache_region.set.call_args_list[1].args[0])

    def test_build_discovery_app_cache_misses_when_dataset_version_changes(self):
        cache_store = {}
        cache_region = Mock()
        cache_region.get.side_effect = lambda key: cache_store.get(key)
        cache_region.set.side_effect = lambda key, value: cache_store.setdefault(key, value)

        def fake_response(query, use_cache):
            return {
                "cacheKey": "prototype-cache-key",
                "cache": {"status": "miss", "storage": "process_memory"},
                "diagnostics": {"cacheHit": False, "resultCount": 0},
                "builds": [],
            }

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", side_effect=["dataset-v1", "dataset-v2"]):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(schema_module, "build_discovery_response", side_effect=fake_response) as build_discovery:
                        query = """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 3)
                            }
                            """
                        first = schema.execute(query)
                        changed_dataset = schema.execute(query)

        self.assertIsNone(first.errors)
        self.assertIsNone(changed_dataset.errors)
        self.assertEqual(build_discovery.call_count, 2)
        self.assertEqual(cache_region.set.call_count, 2)
        self.assertNotEqual(cache_region.set.call_args_list[0].args[0], cache_region.set.call_args_list[1].args[0])

    def test_build_discovery_app_cache_miss_bypasses_prototype_process_cache(self):
        cache_region = Mock()
        cache_region.get.return_value = None

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(
                        schema_module,
                        "build_discovery_response",
                        return_value={
                            "cacheKey": "prototype-cache-key",
                            "cache": {"status": "miss", "storage": "process_memory"},
                            "diagnostics": {"cacheHit": False, "resultCount": 0},
                            "builds": [],
                        },
                    ) as build_discovery:
                        result = schema.execute(
                            """
                            query {
                              buildDiscovery(elements: ["strength"], limit: 3)
                            }
                            """
                        )

        self.assertIsNone(result.errors)
        self.assertFalse(build_discovery.call_args.kwargs["use_cache"])

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
            with patch.object(schema_module, "cache_region") as cache_region:
                result = schema.execute(
                    """
                    query {
                      buildDiscovery(elements: ["strength"])
                    }
                    """
                )

        self.assertIsNotNone(result.errors)
        self.assertIn("index is not available", str(result.errors[0]))
        cache_region.get.assert_not_called()


if __name__ == "__main__":
    unittest.main()
