import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from build_discovery_prod_benchmark_pipeline import (
    DISCOVERY_FILENAME,
    GENERATED_RESULTS_FILENAME,
    REVIEW_PACKET_FILENAME,
    SUMMARY_FILENAME,
    build_summary,
    run_pipeline,
)


def discovery_report():
    return {
        "reportVersion": "build-discovery-prod-benchmark-discovery-v1",
        "profiles": [
            {
                "className": "Iop",
                "element": "strength",
                "ap": 11,
                "mp": 6,
                "range": 0,
                "sampleCount": 5,
            }
        ],
    }


def generated_results():
    return {
        "reportVersion": "build-discovery-prod-candidate-generated-results-v1",
        "profileCount": 2,
        "generatedCount": 1,
        "skippedCount": 1,
        "generatedCandidates": [{"id": "iop_strength_11_6_0"}],
        "skippedCandidates": [
            {
                "id": "cra_intelligence_11_6_6",
                "status": "unsupported",
                "unsupportedReasons": ["Build Discovery v1 currently supports Iop only."],
            }
        ],
    }


def review_packet():
    return {
        "reportVersion": "build-discovery-prod-benchmark-review-packet-v1",
        "supportedGeneratedBenchmarkPrompts": [{"prompt": "200 strength Iop 11/6/0"}],
        "futureBenchmarkPrompts": [{"prompt": "200 intelligence Cra 11/6/6"}],
    }


class BuildDiscoveryProdBenchmarkPipelineTest(unittest.TestCase):
    def test_build_summary_records_artifact_paths_and_counts(self):
        output_dir = Path("/tmp/prod-pipeline")

        summary = build_summary(
            discovery_report(),
            generated_results(),
            review_packet(),
            output_dir,
        )

        self.assertEqual(summary["profileCount"], 2)
        self.assertEqual(summary["generatedCount"], 1)
        self.assertEqual(summary["skippedCount"], 1)
        self.assertEqual(summary["supportedBenchmarkPromptCount"], 1)
        self.assertEqual(summary["futureBenchmarkPromptCount"], 1)
        self.assertEqual(
            summary["artifacts"]["discoveryReport"],
            str(output_dir / DISCOVERY_FILENAME),
        )
        self.assertEqual(
            summary["artifacts"]["reviewPacket"],
            str(output_dir / REVIEW_PACKET_FILENAME),
        )
        self.assertEqual(summary["supportedGeneratedCandidateIds"], ["iop_strength_11_6_0"])
        self.assertEqual(summary["skippedCandidateStatuses"][0]["status"], "unsupported")

    def test_run_pipeline_writes_stable_artifacts(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch(
                "build_discovery_prod_benchmark_pipeline.prod_database_url",
                return_value="postgresql://readonly",
            ):
                summary = run_pipeline(
                    output_dir=temp_dir,
                    sample_limit=25,
                    top_items=3,
                    candidate_limit=2,
                    discovery_fn=lambda *args, **kwargs: discovery_report(),
                    candidate_results_fn=lambda report, candidate_limit: generated_results(),
                    review_packet_fn=lambda report: review_packet(),
                )

            output_path = Path(temp_dir)
            self.assertTrue((output_path / DISCOVERY_FILENAME).exists())
            self.assertTrue((output_path / GENERATED_RESULTS_FILENAME).exists())
            self.assertTrue((output_path / REVIEW_PACKET_FILENAME).exists())
            self.assertTrue((output_path / SUMMARY_FILENAME).exists())
            self.assertEqual(
                json.loads((output_path / SUMMARY_FILENAME).read_text()),
                summary,
            )


if __name__ == "__main__":
    unittest.main()
