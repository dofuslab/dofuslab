import unittest
import importlib
import uuid
from contextlib import contextmanager
from pathlib import Path
import sys
from types import SimpleNamespace
from unittest.mock import Mock, patch
from dogpile.cache.api import NO_VALUE

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

schema_module = importlib.import_module("app.schema")
utils_module = importlib.import_module("app.utils")
schema = schema_module.schema


@contextmanager
def mocked_session_scope(db_session):
    yield db_session


class BuildDiscoveryGraphQLTest(unittest.TestCase):
    def test_generated_request_class_name_reads_query_class_name(self):
        self.assertEqual(
            schema_module.generated_request_class_name(
                {"query": {"className": "Iop"}}
            ),
            "Iop",
        )
        self.assertIsNone(schema_module.generated_request_class_name({}))
        self.assertIsNone(
            schema_module.generated_request_class_name({"query": {"className": ""}})
        )

    def test_generated_default_class_id_ignores_non_build_discovery_sources(self):
        db_session = Mock()

        self.assertIsNone(
            schema_module.generated_default_class_id(
                db_session,
                "other_source",
                {"query": {"className": "Iop"}},
            )
        )
        db_session.query.assert_not_called()

    def test_generation_request_display_summary_uses_safe_query_metadata(self):
        generation_request = SimpleNamespace(
            source="build_discovery",
            dataset_version="dataset-v1",
            solver_version="solver-v1",
            request_payload={
                "query": {
                    "className": "Iop",
                    "elements": ["chance", 123],
                    "apTarget": 12,
                    "mpTarget": 6,
                    "rangeTarget": 0,
                },
                "ignored": {"raw": "payload"},
            },
        )

        self.assertEqual(
            schema_module.generation_request_query_metadata(generation_request),
            generation_request.request_payload["query"],
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_source_label(generation_request, None),
            "Build Discovery",
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_query_class_name(generation_request, None),
            "Iop",
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_query_elements(generation_request, None),
            ["chance"],
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_query_ap_target(generation_request, None),
            12,
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_query_mp_target(generation_request, None),
            6,
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_query_range_target(generation_request, None),
            0,
        )
        self.assertEqual(
            schema_module.GenerationRequest.resolve_display_summary(generation_request, None),
            "Build Discovery - Iop chance 12/6/0 - dataset dataset-v1 - solver solver-v1",
        )

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

    def test_start_build_discovery_reports_async_recommendation_for_slow_fresh_result(self):
        response = {
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "cacheKey": "slow-cache-key",
            "status": "complete",
            "query": {"className": "Iop", "elements": ["strength"], "apTarget": 12},
            "builds": [{"score": 100}],
            "diagnostics": {
                "elapsedMs": 6100.0,
                "cacheHit": False,
                "resultCount": 1,
            },
        }
        cache_region = Mock()
        cache_region.get.return_value = None

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(schema_module, "build_discovery_response", return_value=response) as build_discovery:
                        result = schema.execute(
                            """
                            mutation {
                              startBuildDiscovery(elements: ["strength"], apTarget: 12, limit: 1) {
                                job {
                                  id
                                  status
                                  progress
                                  freshThresholdMs
                                  elapsedMs
                                  cacheHit
                                  syncRecommended
                                  asyncRecommended
                                  generationRequest {
                                    id
                                  }
                                  generationRequestSource
                                  datasetVersion
                                  solverVersion
                                  requestPayload
                                  result
                                }
                              }
                            }
                            """
                        )

        self.assertIsNone(result.errors)
        build_discovery.assert_called_once()
        job = result.data["startBuildDiscovery"]["job"]
        self.assertEqual(job["id"], "slow-cache-key")
        self.assertEqual(job["status"], "succeeded")
        self.assertEqual(job["progress"], 100)
        self.assertEqual(job["freshThresholdMs"], 5000.0)
        self.assertEqual(job["elapsedMs"], 6100.0)
        self.assertFalse(job["cacheHit"])
        self.assertFalse(job["syncRecommended"])
        self.assertTrue(job["asyncRecommended"])
        self.assertIsNone(job["generationRequest"])
        self.assertEqual(job["generationRequestSource"], "build_discovery")
        self.assertEqual(job["datasetVersion"], "dataset-v1")
        self.assertEqual(job["solverVersion"], "solver-v1")
        self.assertEqual(job["requestPayload"]["query"], response["query"])
        self.assertEqual(job["requestPayload"]["resultKey"], "slow-cache-key")
        self.assertEqual(job["result"]["builds"], response["builds"])

    def test_start_build_discovery_reports_sync_recommendation_for_cached_result(self):
        cached_response = {
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "cacheKey": "cached-key",
            "status": "complete",
            "query": {"className": "Iop"},
            "builds": [],
            "cache": {"status": "miss", "storage": "app_cache"},
            "diagnostics": {
                "elapsedMs": 4500.0,
                "cacheHit": False,
                "appCacheHit": False,
                "resultCount": 0,
            },
        }
        cache_region = Mock()
        cache_region.get.return_value = cached_response

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(schema_module, "build_discovery_response") as build_discovery:
                        result = schema.execute(
                            """
                            mutation {
                              startBuildDiscovery(elements: ["strength"], limit: 1) {
                                job {
                                  id
                                  elapsedMs
                                  cacheHit
                                  syncRecommended
                                  asyncRecommended
                                  result
                                }
                              }
                            }
                            """
                        )

        self.assertIsNone(result.errors)
        build_discovery.assert_not_called()
        job = result.data["startBuildDiscovery"]["job"]
        self.assertEqual(job["id"], "cached-key")
        self.assertEqual(job["elapsedMs"], 0.0)
        self.assertTrue(job["cacheHit"])
        self.assertTrue(job["syncRecommended"])
        self.assertFalse(job["asyncRecommended"])
        self.assertEqual(job["result"]["cache"]["status"], "hit")

    def test_import_generated_custom_set_creates_build_and_provenance_atomically(self):
        custom_set_id = uuid.uuid4()
        first_item_id = uuid.uuid4()
        second_item_id = uuid.uuid4()
        class_id = uuid.uuid4()
        first_item = SimpleNamespace(uuid=first_item_id)
        second_item = SimpleNamespace(uuid=second_item_id)
        custom_set = SimpleNamespace(
            uuid=custom_set_id,
            default_class_id=None,
            equip_items=Mock(),
        )
        db_session = Mock()
        db_session.query.return_value.filter.return_value.one.side_effect = [
            first_item,
            second_item,
        ]

        with patch.object(
            schema_module, "session_scope", return_value=mocked_session_scope(db_session)
        ), patch.object(
            schema_module, "get_or_create_custom_set", return_value=custom_set
        ) as get_custom_set, patch.object(
            schema_module, "edit_custom_set_metadata"
        ) as edit_metadata, patch.object(
            schema_module, "generated_default_class_id", return_value=class_id
        ) as generated_class, patch.object(
            utils_module, "current_user", SimpleNamespace(is_authenticated=False)
        ):
            result = schema.execute(
                """
                mutation ImportGeneratedCustomSet($items: [CustomSetImportedItemInput!]!, $payload: GenericScalar) {
                  importGeneratedCustomSet(
                    items: $items
                    name: "Generated Strength Iop #100"
                    level: 200
                    source: "build_discovery"
                    datasetVersion: "dataset-v1"
                    solverVersion: "solver-v1"
                    requestPayload: $payload
                  ) {
                    generationRequest {
                      source
                      datasetVersion
                      solverVersion
                      requestPayload
                    }
                  }
                }
                """,
                variables={
                    "items": [
                        {"id": str(first_item_id), "apExo": True},
                        {"id": str(second_item_id), "rangeExo": True},
                    ],
                    "payload": {"query": {"className": "Iop", "element": "strength"}},
                },
            )

        self.assertIsNone(result.errors)
        get_custom_set.assert_called_once_with(None, db_session)
        edit_metadata.assert_called_once_with(
            custom_set,
            "Generated Strength Iop #100",
            200,
        )
        generated_class.assert_called_once_with(
            db_session,
            "build_discovery",
            {"query": {"className": "Iop", "element": "strength"}},
        )
        self.assertEqual(custom_set.default_class_id, class_id)
        custom_set.equip_items.assert_called_once_with(
            [
                {
                    "item": first_item,
                    "ap_exo": True,
                    "mp_exo": None,
                    "range_exo": None,
                },
                {
                    "item": second_item,
                    "ap_exo": None,
                    "mp_exo": None,
                    "range_exo": True,
                },
            ],
            db_session,
        )
        generation_request = db_session.add.call_args.args[0]
        self.assertEqual(generation_request.custom_set_id, custom_set_id)
        self.assertEqual(generation_request.source, "build_discovery")
        self.assertEqual(generation_request.dataset_version, "dataset-v1")
        self.assertEqual(generation_request.solver_version, "solver-v1")
        self.assertEqual(
            generation_request.request_payload,
            {"query": {"className": "Iop", "element": "strength"}},
        )
        self.assertEqual(
            result.data["importGeneratedCustomSet"]["generationRequest"]["source"],
            "build_discovery",
        )
        self.assertEqual(
            result.data["importGeneratedCustomSet"]["generationRequest"]["requestPayload"],
            {"query": {"className": "Iop", "element": "strength"}},
        )

    def test_import_generated_custom_set_keeps_other_sources_default_class_unchanged(self):
        custom_set_id = uuid.uuid4()
        item_id = uuid.uuid4()
        existing_class_id = uuid.uuid4()
        item = SimpleNamespace(uuid=item_id)
        custom_set = SimpleNamespace(
            uuid=custom_set_id,
            default_class_id=existing_class_id,
            equip_items=Mock(),
        )
        db_session = Mock()
        db_session.query.return_value.filter.return_value.one.return_value = item

        with patch.object(
            schema_module, "session_scope", return_value=mocked_session_scope(db_session)
        ), patch.object(
            schema_module, "get_or_create_custom_set", return_value=custom_set
        ), patch.object(
            schema_module, "edit_custom_set_metadata"
        ) as edit_metadata, patch.object(
            utils_module, "current_user", SimpleNamespace(is_authenticated=False)
        ):
            result = schema.execute(
                """
                mutation ImportGeneratedCustomSet($items: [CustomSetImportedItemInput!]!, $payload: GenericScalar) {
                  importGeneratedCustomSet(
                    items: $items
                    name: "Generated Other"
                    level: 200
                    source: "other_generator"
                    datasetVersion: "dataset-v1"
                    solverVersion: "solver-v1"
                    requestPayload: $payload
                  ) {
                    generationRequest {
                      source
                      datasetVersion
                      solverVersion
                      requestPayload
                    }
                  }
                }
                """,
                variables={
                    "items": [{"id": str(item_id)}],
                    "payload": {"query": {"className": "Iop"}},
                },
            )

        self.assertIsNone(result.errors)
        edit_metadata.assert_called_once_with(custom_set, "Generated Other", 200)
        self.assertEqual(custom_set.default_class_id, existing_class_id)

    def test_import_generated_custom_set_sets_generated_default_class(self):
        custom_set_id = uuid.uuid4()
        item_id = uuid.uuid4()
        class_id = uuid.uuid4()
        item = SimpleNamespace(uuid=item_id)
        custom_set = SimpleNamespace(
            uuid=custom_set_id,
            default_class_id=None,
            equip_items=Mock(),
        )
        db_session = Mock()
        db_session.query.return_value.filter.return_value.one.return_value = item

        with patch.object(
            schema_module, "session_scope", return_value=mocked_session_scope(db_session)
        ), patch.object(
            schema_module, "get_or_create_custom_set", return_value=custom_set
        ), patch.object(
            schema_module, "edit_custom_set_metadata"
        ), patch.object(
            schema_module, "generated_default_class_id", return_value=class_id
        ) as generated_class, patch.object(
            utils_module, "current_user", SimpleNamespace(is_authenticated=False)
        ):
            result = schema.execute(
                """
                mutation ImportGeneratedCustomSet($items: [CustomSetImportedItemInput!]!, $payload: GenericScalar) {
                  importGeneratedCustomSet(
                    items: $items
                    name: "Generated Build Discovery"
                    level: 200
                    source: "build_discovery"
                    requestPayload: $payload
                  ) {
                    generationRequest {
                      source
                    }
                  }
                }
                """,
                variables={
                    "items": [{"id": str(item_id)}],
                    "payload": {"query": {"className": "Iop"}},
                },
            )

        self.assertIsNone(result.errors)
        generated_class.assert_called_once_with(
            db_session,
            "build_discovery",
            {"query": {"className": "Iop"}},
        )
        self.assertEqual(custom_set.default_class_id, class_id)

    def test_import_generated_custom_set_rejects_invalid_provenance_metadata(self):
        cases = [
            ("source", "a" * 81, "Generation source is too long"),
            ("datasetVersion", "a" * 121, "Generation version is too long"),
            ("solverVersion", "a" * 121, "Generation version is too long"),
        ]
        for argument, value, expected_error in cases:
            with self.subTest(argument=argument):
                arguments = {
                    "source": '"build_discovery"',
                    "datasetVersion": '"dataset-v1"',
                    "solverVersion": '"solver-v1"',
                }
                arguments[argument] = f'"{value}"'
                with patch.object(utils_module, "current_user", SimpleNamespace(is_authenticated=False)):
                    result = schema.execute(
                        f"""
                    mutation ImportGeneratedCustomSet($items: [CustomSetImportedItemInput!]!) {{
                      importGeneratedCustomSet(
                        items: $items
                        name: "Generated Build Discovery"
                        level: 200
                        source: {arguments["source"]}
                            datasetVersion: {arguments["datasetVersion"]}
                            solverVersion: {arguments["solverVersion"]}
                          ) {{
                            generationRequest {{
                              source
                            }}
                          }}
                        }}
                        """,
                        variables={"items": [{"id": str(uuid.uuid4())}]},
                    )

                self.assertIsNotNone(result.errors)
                self.assertIn(expected_error, str(result.errors[0]))

    def test_import_generated_custom_set_rejects_empty_items(self):
        with patch.object(utils_module, "current_user", SimpleNamespace(is_authenticated=False)):
            result = schema.execute(
                """
                mutation ImportGeneratedCustomSet($items: [CustomSetImportedItemInput!]!) {
                  importGeneratedCustomSet(
                    items: $items
                    name: "Generated Build Discovery"
                    level: 200
                    source: "build_discovery"
                  ) {
                    generationRequest {
                      source
                    }
                  }
                }
                """,
                variables={"items": []},
            )

        self.assertIsNotNone(result.errors)
        self.assertIn("Generated builds must include at least one item", str(result.errors[0]))

    def test_import_generated_custom_set_rejects_large_request_payload(self):
        with patch.object(utils_module, "current_user", SimpleNamespace(is_authenticated=False)):
            result = schema.execute(
                """
                mutation ImportGeneratedCustomSet($items: [CustomSetImportedItemInput!]!, $payload: GenericScalar) {
                  importGeneratedCustomSet(
                    items: $items
                    name: "Generated Build Discovery"
                    level: 200
                    source: "build_discovery"
                    requestPayload: $payload
                  ) {
                    generationRequest {
                      source
                    }
                  }
                }
                """,
                variables={
                    "items": [{"id": str(uuid.uuid4())}],
                    "payload": {"notes": "x" * 20000},
                },
            )

        self.assertIsNotNone(result.errors)
        self.assertIn("Generation request payload is too large", str(result.errors[0]))

    def test_build_discovery_query_omitted_args_match_client_contract_defaults(self):
        cache_region = Mock()
        cache_region.get.return_value = None

        with patch.object(schema_module, "load_build_discovery_index", return_value={}):
            with patch.object(schema_module, "dataset_version", return_value="dataset-v1"):
                with patch.object(schema_module, "cache_region", cache_region):
                    with patch.object(
                        schema_module,
                        "build_discovery_response",
                        return_value={
                            "query": {"className": "Iop"},
                            "builds": [],
                            "diagnostics": {"resultCount": 0},
                        },
                    ) as build_discovery:
                        result = schema.execute(
                            """
                            query {
                              buildDiscovery
                            }
                            """
                        )

        self.assertIsNone(result.errors)
        query = build_discovery.call_args.args[0]
        self.assertEqual(query.class_name, "Iop")
        self.assertEqual(query.level, 200)
        self.assertEqual(query.mode, "pvm")
        self.assertEqual(query.elements, ("strength",))
        self.assertEqual(query.ap_target, 11)
        self.assertEqual(query.mp_target, 6)
        self.assertEqual(query.range_target, 0)
        self.assertEqual(query.damage_survivability_preset, 3)
        self.assertEqual(query.budget_tier, 2)
        self.assertEqual(query.exo_policy, "allow")
        self.assertEqual(query.weapon_policy, "stat_stick_allowed")
        self.assertEqual(query.locked_item_ids, ())
        self.assertEqual(query.avoided_item_ids, ())
        self.assertEqual(query.limit, 5)
        self.assertFalse(build_discovery.call_args.kwargs["use_cache"])

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
