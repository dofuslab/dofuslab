import json
import tempfile
import unittest
from pathlib import Path

from build_discovery_local_readiness_pipeline import (
    BENCHMARK_COMPARISON_FILENAME,
    BENCHMARK_GENERATED_RESULTS_FILENAME,
    READINESS_FILENAME,
    STRICT_CACHE_FILENAME,
    SUMMARY_FILENAME,
    WARM_CACHE_FILENAME,
    build_summary,
    run_pipeline,
    state_paths_from_dir,
)


def cache_report(status: str, cache_hits: int = 8, cache_misses: int = 0) -> dict:
    return {
        "status": status,
        "summary": {
            "rowCount": cache_hits + cache_misses,
            "cacheHits": cache_hits,
            "cacheMisses": cache_misses,
            "emptyResults": 0,
            "cacheHitElapsed": {"p95Ms": 120.0},
        },
    }


def readiness_report(status: str = "incomplete") -> dict:
    return {
        "status": status,
        "assumptionsReview": {
            "ledgerExists": True,
            "ledgerAssumptionCount": 181,
            "gameplayReviewQuestionCount": 15,
        },
        "blockers": ["prod readonly database URL is not available"],
    }


def benchmark_generated_results() -> dict:
    return {
        "reportVersion": "build-discovery-benchmark-generated-results-v1",
        "benchmarks": {"benchmark-1": {"builds": [{"score": 120}]}},
    }


def benchmark_comparison_report() -> dict:
    return {
        "errorCount": 0,
        "benchmarks": [
            {
                "id": "benchmark-1",
                "generatedComparison": {
                    "status": "generated_meets_or_beats_benchmark",
                    "benchmarkScore": 100,
                    "bestGeneratedScore": 120,
                    "delta": 20,
                },
            }
        ],
    }


def benchmark_fixture() -> dict:
    return {
        "scoreTolerance": 0,
        "benchmarks": {
            "benchmark-1": {
                "status": "generated_meets_or_beats_benchmark",
                "benchmarkScore": 100,
                "bestGeneratedScore": 120,
                "delta": 20,
            }
        },
    }


class BuildDiscoveryLocalReadinessPipelineTest(unittest.TestCase):
    def test_state_paths_from_dir_uses_expected_filenames(self):
        state_dir = Path("/tmp/build-discovery-state")

        paths = state_paths_from_dir(state_dir)

        self.assertEqual(
            paths["readiness_checklist_path"],
            state_dir / "build-discovery-readiness-checklist.md",
        )
        self.assertEqual(
            paths["gameplay_review_packet_path"],
            state_dir / "build-discovery-gameplay-review-packet.md",
        )
        self.assertEqual(
            paths["assumptions_ledger_path"],
            state_dir / "build-discovery-assumptions.md",
        )
        self.assertEqual(
            paths["assumptions_review_index_path"],
            state_dir / "build-discovery-assumptions-review-index.md",
        )

    def test_build_summary_records_artifact_paths_and_statuses(self):
        output_dir = Path("/tmp/local-readiness")

        summary = build_summary(
            cache_report("pass"),
            cache_report("fail", cache_hits=7, cache_misses=1),
            benchmark_generated_results(),
            benchmark_comparison_report(),
            [],
            readiness_report(),
            output_dir,
        )

        self.assertEqual(summary["warmCacheStatus"], "pass")
        self.assertEqual(summary["strictCacheStatus"], "fail")
        self.assertEqual(summary["benchmarkGeneratedStatus"], "pass")
        self.assertEqual(summary["benchmarkComparisonStatus"], "pass")
        self.assertEqual(summary["readinessStatus"], "incomplete")
        self.assertEqual(summary["assumptionsReview"]["ledgerAssumptionCount"], 181)
        self.assertEqual(
            summary["artifacts"]["strictCachePrewarmReport"],
            str(output_dir / STRICT_CACHE_FILENAME),
        )
        self.assertEqual(summary["strictCacheSummary"]["cacheMisses"], 1)

    def test_build_summary_marks_skipped_benchmarks_as_not_checked(self):
        output_dir = Path("/tmp/local-readiness")

        summary = build_summary(
            cache_report("pass"),
            cache_report("pass"),
            None,
            None,
            [],
            readiness_report(),
            output_dir,
        )

        self.assertEqual(summary["benchmarkGeneratedStatus"], "not_checked")
        self.assertEqual(summary["benchmarkComparisonStatus"], "not_checked")
        self.assertIsNone(summary["artifacts"]["benchmarkGeneratedResults"])
        self.assertIsNone(summary["artifacts"]["benchmarkComparisonReport"])

    def test_run_pipeline_writes_artifacts_and_feeds_evidence_to_readiness(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            checklist_path = Path(temp_dir) / "checklist.md"
            gameplay_path = Path(temp_dir) / "gameplay.md"
            assumptions_path = Path(temp_dir) / "assumptions.md"
            review_index_path = Path(temp_dir) / "review-index.md"
            prod_review_packet_path = Path(temp_dir) / "prod-review-packet.json"
            fixture_path = Path(temp_dir) / "fixture.json"
            fixture_path.write_text(json.dumps(benchmark_fixture()), encoding="utf-8")
            calls = []
            readiness_kwargs = {}

            def fake_cache_prewarm(require_all_hits, max_hit_p95_ms, max_hit_elapsed_ms):
                calls.append((require_all_hits, max_hit_p95_ms, max_hit_elapsed_ms))
                return cache_report("pass")

            def fake_readiness(**kwargs):
                readiness_kwargs.update(kwargs)
                return readiness_report()

            summary = run_pipeline(
                output_dir=temp_dir,
                max_hit_p95_ms=250,
                max_hit_elapsed_ms=400,
                readiness_checklist_path=checklist_path,
                gameplay_review_packet_path=gameplay_path,
                assumptions_ledger_path=assumptions_path,
                assumptions_review_index_path=review_index_path,
                prod_benchmark_review_packet_path=prod_review_packet_path,
                benchmark_fixture_path=fixture_path,
                cache_prewarm_fn=fake_cache_prewarm,
                benchmark_generated_results_fn=benchmark_generated_results,
                benchmark_comparison_report_fn=lambda generated: benchmark_comparison_report(),
                readiness_fn=fake_readiness,
            )

            output_path = Path(temp_dir)
            self.assertTrue((output_path / WARM_CACHE_FILENAME).exists())
            self.assertTrue((output_path / STRICT_CACHE_FILENAME).exists())
            self.assertTrue((output_path / BENCHMARK_GENERATED_RESULTS_FILENAME).exists())
            self.assertTrue((output_path / BENCHMARK_COMPARISON_FILENAME).exists())
            self.assertTrue((output_path / READINESS_FILENAME).exists())
            self.assertTrue((output_path / SUMMARY_FILENAME).exists())
            self.assertEqual(calls, [(False, None, None), (True, 250, 400)])
            self.assertEqual(
                readiness_kwargs["cache_prewarm_report_path"],
                output_path / STRICT_CACHE_FILENAME,
            )
            self.assertEqual(readiness_kwargs["assumptions_ledger_path"], assumptions_path)
            self.assertEqual(
                readiness_kwargs["assumptions_review_index_path"],
                review_index_path,
            )
            self.assertEqual(
                readiness_kwargs["prod_benchmark_review_packet_path"],
                prod_review_packet_path,
            )
            self.assertEqual(
                readiness_kwargs["benchmark_comparison_report_path"],
                output_path / BENCHMARK_COMPARISON_FILENAME,
            )
            self.assertEqual(readiness_kwargs["benchmark_fixture_path"], fixture_path)
            self.assertEqual(readiness_kwargs["max_cache_hit_p95_ms"], 250)
            self.assertEqual(summary["benchmarkComparisonStatus"], "pass")
            self.assertEqual(
                json.loads((output_path / SUMMARY_FILENAME).read_text()),
                summary,
            )

    def test_run_pipeline_can_skip_benchmark_artifacts(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            readiness_kwargs = {}

            def fake_readiness(**kwargs):
                readiness_kwargs.update(kwargs)
                return readiness_report()

            summary = run_pipeline(
                output_dir=temp_dir,
                include_benchmark_comparison=False,
                cache_prewarm_fn=lambda require_all_hits, max_p95, max_elapsed: cache_report("pass"),
                readiness_fn=fake_readiness,
            )

            output_path = Path(temp_dir)
            self.assertFalse((output_path / BENCHMARK_GENERATED_RESULTS_FILENAME).exists())
            self.assertFalse((output_path / BENCHMARK_COMPARISON_FILENAME).exists())
            self.assertIsNone(readiness_kwargs["benchmark_comparison_report_path"])
            self.assertEqual(summary["benchmarkComparisonStatus"], "not_checked")


if __name__ == "__main__":
    unittest.main()
