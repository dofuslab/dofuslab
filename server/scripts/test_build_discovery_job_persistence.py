import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.schema import (  # noqa: E402
    Query,
    build_discovery_job_result,
    build_discovery_job_from_model,
    build_discovery_request_payload,
    create_queued_build_discovery_job,
    persist_build_discovery_job,
)
from app.tasks import (  # noqa: E402
    build_discovery_query_from_payload,
    mark_build_discovery_worker_cache_miss,
)
from oneoff.build_discovery_prototype import BuildDiscoveryQuery  # noqa: E402


class FakeSession:
    def __init__(self):
        self.added = []

    def add(self, model):
        self.added.append(model)

    def flush(self):
        for model in self.added:
            if model.uuid is None:
                model.uuid = uuid4()


class BuildDiscoveryJobPersistenceTest(unittest.TestCase):
    def test_request_payload_keeps_display_and_cache_identity_query_shapes(self):
        query = BuildDiscoveryQuery(
            elements=("chance",),
            ap_target=12,
            budget_tier=4,
            limit=3,
        )

        payload = build_discovery_request_payload(query, result_key="cache-key")

        self.assertEqual(payload["query"]["elements"], ["chance"])
        self.assertEqual(payload["query"]["apTarget"], 12)
        self.assertNotIn("limit", payload["query"])
        self.assertEqual(payload["queryIdentity"]["limit"], 3)
        self.assertEqual(payload["resultKey"], "cache-key")

    def test_persist_build_discovery_job_captures_result_metadata(self):
        query = BuildDiscoveryQuery(elements=("agility",))
        response = {
            "status": "complete",
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "cacheKey": "cache-key",
            "diagnostics": {"elapsedMs": 6200.5, "appCacheHit": False},
            "query": {"elements": ["agility"]},
        }
        session = FakeSession()

        job_model = persist_build_discovery_job(query, response, session)

        self.assertEqual(session.added, [job_model])
        self.assertEqual(job_model.status, "succeeded")
        self.assertEqual(job_model.progress, 100)
        self.assertEqual(job_model.dataset_version, "dataset-v1")
        self.assertEqual(job_model.solver_version, "solver-v1")
        self.assertEqual(job_model.elapsed_ms, 6200.5)
        self.assertEqual(job_model.result_payload, response)
        self.assertEqual(job_model.request_payload["resultKey"], "cache-key")
        self.assertEqual(job_model.request_payload["query"]["elements"], ["agility"])
        self.assertEqual(
            job_model.request_payload["queryIdentity"]["elements"],
            ["agility"],
        )
        self.assertIsNotNone(job_model.uuid)

    def test_create_queued_build_discovery_job_captures_request_metadata(self):
        query = BuildDiscoveryQuery(elements=("intelligence",), limit=3)
        session = FakeSession()

        job_model = create_queued_build_discovery_job(query, session)

        self.assertEqual(session.added, [job_model])
        self.assertEqual(job_model.status, "queued")
        self.assertEqual(job_model.progress, 0)
        self.assertEqual(job_model.request_payload["query"]["elements"], ["intelligence"])
        self.assertEqual(job_model.request_payload["queryIdentity"]["limit"], 3)
        self.assertIsNone(job_model.result_payload)
        self.assertIsNotNone(job_model.dataset_version)
        self.assertIsNotNone(job_model.solver_version)
        self.assertIsNotNone(job_model.uuid)

    def test_job_result_uses_persisted_job_id_and_request_payload(self):
        query = BuildDiscoveryQuery()
        request_payload = {"query": {"className": "Iop"}, "resultKey": "cache-key"}
        response = {
            "status": "complete",
            "datasetVersion": "dataset-v1",
            "solverVersion": "solver-v1",
            "cacheKey": "cache-key",
            "diagnostics": {"elapsedMs": 100.0, "appCacheHit": True},
        }

        job = build_discovery_job_result(
            query,
            response,
            job_id="job-id",
            request_payload=request_payload,
        )

        self.assertEqual(job["id"], "job-id")
        self.assertIs(job["request_payload"], request_payload)
        self.assertEqual(job["status"], "succeeded")
        self.assertTrue(job["sync_recommended"])
        self.assertFalse(job["async_recommended"])
        self.assertIs(job["result"], response)

    def test_job_model_adapter_returns_persisted_job_payload(self):
        generation_request = object()
        job_id = uuid4()
        job_model = SimpleNamespace(
            uuid=job_id,
            status="succeeded",
            progress=100,
            elapsed_ms=5100.25,
            generation_request=generation_request,
            dataset_version="dataset-v1",
            solver_version="solver-v1",
            request_payload={"query": {"className": "Iop"}},
            error_payload=None,
            result_payload={
                "status": "complete",
                "diagnostics": {"elapsedMs": 5100.25, "appCacheHit": False},
            },
        )

        job = build_discovery_job_from_model(job_model)

        self.assertEqual(job["id"], str(job_id))
        self.assertEqual(job["status"], "succeeded")
        self.assertEqual(job["progress"], 100)
        self.assertEqual(job["elapsed_ms"], 5100.25)
        self.assertFalse(job["sync_recommended"])
        self.assertTrue(job["async_recommended"])
        self.assertIs(job["generation_request"], generation_request)
        self.assertEqual(job["dataset_version"], "dataset-v1")
        self.assertEqual(job["solver_version"], "solver-v1")
        self.assertEqual(job["request_payload"], {"query": {"className": "Iop"}})
        self.assertIsNone(job["error_payload"])
        self.assertEqual(job["result"]["status"], "complete")

    def test_job_model_adapter_handles_queued_job_without_result(self):
        job_model = SimpleNamespace(
            uuid=uuid4(),
            status="queued",
            progress=0,
            elapsed_ms=None,
            generation_request=None,
            dataset_version="dataset-v1",
            solver_version="solver-v1",
            request_payload={"query": {"className": "Iop"}},
            error_payload={"message": "worker failed"},
            result_payload=None,
        )

        job = build_discovery_job_from_model(job_model)

        self.assertEqual(job["status"], "queued")
        self.assertEqual(job["progress"], 0)
        self.assertFalse(job["sync_recommended"])
        self.assertTrue(job["async_recommended"])
        self.assertEqual(job["error_payload"], {"message": "worker failed"})
        self.assertIsNone(job["result"])

    def test_worker_query_parser_uses_cache_identity_payload(self):
        query = build_discovery_query_from_payload(
            {
                "query": {"elements": ["strength"], "limit": 5},
                "queryIdentity": {
                    "className": "Iop",
                    "level": 200,
                    "elements": ["chance"],
                    "mode": "pvm",
                    "apTarget": 12,
                    "mpTarget": 6,
                    "rangeTarget": 0,
                    "damageSurvivabilityPreset": 3,
                    "budgetTier": 4,
                    "exoPolicy": "allow",
                    "weaponPolicy": "stat_stick_allowed",
                    "lockedItemIds": ["1"],
                    "avoidedItemIds": ["2"],
                    "limit": 3,
                    "topK": 10,
                    "beamWidth": 20,
                    "perSignatureCap": 30,
                    "relevantSetLimit": 40,
                    "maxSharedItems": 4,
                },
            }
        )

        self.assertEqual(query.elements, ("chance",))
        self.assertEqual(query.ap_target, 12)
        self.assertEqual(query.limit, 3)
        self.assertEqual(query.locked_item_ids, ("1",))
        self.assertEqual(query.avoided_item_ids, ("2",))
        self.assertEqual(query.max_shared_items, 4)

    def test_worker_query_parser_defaults_missing_max_shared_items(self):
        query = build_discovery_query_from_payload({"queryIdentity": {}})

        self.assertEqual(query.max_shared_items, 10)

    def test_worker_cache_miss_annotation_keeps_response_copy(self):
        response = {"diagnostics": {"elapsedMs": 10.5}}

        annotated = mark_build_discovery_worker_cache_miss(response)

        self.assertIsNot(annotated, response)
        self.assertEqual(annotated["cache"], {"status": "miss", "storage": "app_cache"})
        self.assertFalse(annotated["diagnostics"]["appCacheHit"])

    def test_schema_exposes_build_discovery_job_lookup(self):
        query_fields = Query._meta.fields

        self.assertIn("build_discovery_job", query_fields)
        self.assertIn("id", query_fields["build_discovery_job"].args)


if __name__ == "__main__":
    unittest.main()
