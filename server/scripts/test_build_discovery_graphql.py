"""GraphQL contract tests for synchronous Build Discovery."""

import importlib
import unittest
import uuid
from contextlib import contextmanager
from types import SimpleNamespace
from unittest.mock import Mock, patch

schema_module = importlib.import_module("app.schema")
graphql_module = importlib.import_module("app.build_discovery_graphql")
promotion_module = importlib.import_module("app.build_discovery_promotion")
app_module = importlib.import_module("app")
utils_module = importlib.import_module("app.utils")
schema = schema_module.schema


@contextmanager
def mocked_session_scope(db_session):
    yield db_session


def query_input(**overrides):
    value = {
        "className": "Iop",
        "level": 200,
        "element": "strength",
        "apTarget": 11,
        "mpTarget": 6,
        "rangeTarget": None,
        "damageSurvivabilityPreset": 3,
        "budgetTier": 2,
        "exoPolicy": "allow",
        "weaponPolicy": "stat_stick_allowed",
        "lockedItemIds": [],
        "avoidedItemIds": [],
        "resultLimit": 3,
    }
    value.update(overrides)
    return value


def generated_build(item_id=None):
    item_id = item_id or str(uuid.uuid4())
    return {
        "score": 123.0,
        "baseAllocation": {"Strength": 300},
        "conditionFailures": [],
        "totals": {"AP": 11, "MP": 6},
        "sets": {},
        "exos": {"AP": {"itemId": "100", "slot": "ring_1"}},
        "items": {
            "ring_1": {
                "id": "100",
                "internalId": item_id,
                "name": "Test Ring",
                "type": "Ring",
                "level": 200,
                "set": None,
            }
        },
    }


class BuildDiscoveryGraphQLTest(unittest.TestCase):
    def setUp(self):
        self.request_context = app_module.app.test_request_context(
            "/graphql", environ_base={"REMOTE_ADDR": "192.0.2.10"}
        )
        self.request_context.push()

    def tearDown(self):
        self.request_context.pop()

    def test_build_discovery_is_typed_synchronous_and_preserves_null_range(self):
        response = {
            "status": "complete",
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "cacheKey": "cache-key",
            "cache": {"status": "miss", "storage": "app_cache", "solver": "cpsat"},
            "diagnostics": {"elapsedMs": 12.5, "resultCount": 1},
            "warnings": [],
            "builds": [generated_build()],
        }
        with patch.object(
            graphql_module, "require_build_discovery_index"
        ), patch.object(
            graphql_module, "build_discovery_cached_response", return_value=response
        ) as solve, patch.object(
            graphql_module,
            "sign_build_discovery_candidate",
            return_value="signed",
        ):
            result = schema.execute(
                """
                mutation Discover($input: BuildDiscoveryInput!) {
                  buildDiscovery(input: $input) {
                    status datasetVersion solverVersion cacheKey
                    query { className rangeTarget resultLimit }
                    diagnostics { elapsedMs resultCount }
                    builds {
                      promotionToken score
                      baseAllocation { name value }
                      totals { name value }
                      exos { stat itemId slot }
                      items { slot id internalId name type level set }
                    }
                  }
                }
                """,
                variables={"input": query_input()},
            )

        self.assertIsNone(result.errors)
        payload = result.data["buildDiscovery"]
        self.assertEqual(payload["status"], "COMPLETE")
        self.assertIsNone(payload["query"]["rangeTarget"])
        self.assertEqual(payload["builds"][0]["promotionToken"], "signed")
        self.assertEqual(payload["builds"][0]["baseAllocation"][0]["value"], 300.0)
        self.assertIsNone(solve.call_args.args[0].range_target)

    def test_no_valid_build_is_a_domain_result(self):
        response = {
            "status": "no_valid_build",
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "cache": {"status": "miss", "storage": "app_cache"},
            "diagnostics": {"resultCount": 0},
            "warnings": ["No build satisfies these constraints."],
            "noBuildReason": {"code": "infeasible"},
            "builds": [],
        }
        with patch.object(
            graphql_module, "require_build_discovery_index"
        ), patch.object(
            graphql_module, "build_discovery_cached_response", return_value=response
        ):
            result = schema.execute(
                """
                mutation Discover($input: BuildDiscoveryInput!) {
                  buildDiscovery(input: $input) {
                    status warnings builds { score }
                    noBuildReason { code }
                  }
                }
                """,
                variables={"input": query_input()},
            )

        self.assertIsNone(result.errors)
        self.assertEqual(result.data["buildDiscovery"]["status"], "NO_VALID_BUILD")
        self.assertEqual(result.data["buildDiscovery"]["builds"], [])

    def test_public_input_is_bounded_and_has_no_solver_tuning(self):
        result = schema.execute(
            """
            query Contract {
              __schema {
                queryType { fields { name } }
                mutationType { fields { name } }
              }
              __type(name: "BuildDiscoveryInput") { inputFields { name } }
              customSetFilters: __type(name: "CustomSetFilters") {
                inputFields { name }
              }
            }
            """
        )
        self.assertIsNone(result.errors)
        query_fields = {
            field["name"] for field in result.data["__schema"]["queryType"]["fields"]
        }
        mutation_fields = {
            field["name"] for field in result.data["__schema"]["mutationType"]["fields"]
        }
        input_fields = {field["name"] for field in result.data["__type"]["inputFields"]}
        custom_set_filter_fields = {
            field["name"] for field in result.data["customSetFilters"]["inputFields"]
        }
        self.assertNotIn("buildDiscoveryJob", query_fields)
        self.assertIn("buildDiscovery", mutation_fields)
        self.assertNotIn("startBuildDiscovery", mutation_fields)
        self.assertNotIn("generated", custom_set_filter_fields)
        self.assertTrue(
            {"topK", "beamWidth", "perSignatureCap", "relevantSetLimit"}.isdisjoint(
                input_fields
            )
        )

        for limit in (0, 6):
            with self.subTest(limit=limit):
                bounded = schema.execute(
                    """
                    mutation Discover($input: BuildDiscoveryInput!) {
                      buildDiscovery(input: $input) { status }
                    }
                    """,
                    variables={"input": query_input(resultLimit=limit)},
                )
                self.assertIn(
                    "resultLimit must be between 1 and 5", str(bounded.errors[0])
                )

        for max_shared_items in (-1, 17):
            with self.subTest(max_shared_items=max_shared_items):
                bounded = schema.execute(
                    """
                    mutation Discover($input: BuildDiscoveryInput!) {
                      buildDiscovery(input: $input) { status }
                    }
                    """,
                    variables={
                        "input": query_input(maxSharedItems=max_shared_items)
                    },
                )
                self.assertIn(
                    "maxSharedItems must be between 0 and 16",
                    str(bounded.errors[0]),
                )

        for field_name in ("lockedItemIds", "avoidedItemIds"):
            with self.subTest(field_name=field_name):
                controlled = schema.execute(
                    """
                    mutation Discover($input: BuildDiscoveryInput!) {
                      buildDiscovery(input: $input) { status }
                    }
                    """,
                    variables={"input": query_input(**{field_name: ["1"] * 51})},
                )
                self.assertIn(
                    f"{field_name} cannot contain more than 50 items",
                    str(controlled.errors[0]),
                )

    def test_promotion_uses_signed_server_candidate_atomically(self):
        item_id = uuid.uuid4()
        class_id = uuid.uuid4()
        custom_set = SimpleNamespace(
            uuid=uuid.uuid4(), default_class_id=None, equip_items=Mock()
        )
        item = SimpleNamespace(uuid=item_id)
        db_session = Mock()
        db_session.query.return_value.filter.return_value.one.return_value = item
        payload = {
            "source": "build_discovery",
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "query": {"className": "Iop", "level": 200, "elements": ["strength"]},
            "build": generated_build(str(item_id)),
        }
        verified_user = SimpleNamespace(
            is_authenticated=True,
            _get_current_object=lambda: SimpleNamespace(verified=True),
        )

        with patch.object(
            promotion_module,
            "decode_build_discovery_promotion_token",
            return_value=payload,
        ), patch.object(
            promotion_module,
            "session_scope",
            return_value=mocked_session_scope(db_session),
        ), patch.object(
            promotion_module, "get_or_create_custom_set", return_value=custom_set
        ), patch.object(
            promotion_module, "edit_custom_set_metadata"
        ) as edit_metadata, patch.object(
            promotion_module, "edit_custom_set_stats"
        ) as edit_stats, patch.object(
            promotion_module, "generated_default_class_id", return_value=class_id
        ), patch.object(
            utils_module, "current_user", verified_user
        ):
            result = schema.execute(
                """
                mutation Promote($token: String!) {
                  importGeneratedCustomSet(
                    name: "Generated Strength Iop"
                    promotionToken: $token
                  ) {
                    generationRequest { source datasetVersion solverVersion }
                  }
                }
                """,
                variables={"token": "signed"},
            )

        self.assertIsNone(result.errors)
        edit_metadata.assert_called_once_with(custom_set, "Generated Strength Iop", 200)
        self.assertEqual(edit_stats.call_args.args[1]["base_strength"], 300)
        self.assertEqual(custom_set.default_class_id, class_id)
        equipped = custom_set.equip_items.call_args.args[0][0]
        self.assertTrue(equipped["ap_exo"])
        generation_request = db_session.add.call_args.args[0]
        self.assertEqual(generation_request.source, "build_discovery")
        self.assertEqual(generation_request.dataset_version, "dataset-v1")

    def test_invalid_or_expired_promotion_token_is_rejected(self):
        with patch.object(
            promotion_module, "decode_token", return_value=False
        ) as decode:
            with self.assertRaisesRegex(Exception, "expired or is invalid"):
                promotion_module.decode_build_discovery_promotion_token("tampered")
        decode.assert_called_once_with(
            "tampered",
            promotion_module.PROMOTION_TOKEN_SALT,
            expiration=3600,
        )


if __name__ == "__main__":
    unittest.main()
