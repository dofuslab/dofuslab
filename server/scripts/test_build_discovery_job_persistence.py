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
    persist_build_discovery_job,
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
        self.assertEqual(job["result"]["status"], "complete")

    def test_schema_exposes_build_discovery_job_lookup(self):
        query_fields = Query._meta.fields

        self.assertIn("build_discovery_job", query_fields)
        self.assertIn("id", query_fields["build_discovery_job"].args)


if __name__ == "__main__":
    unittest.main()
