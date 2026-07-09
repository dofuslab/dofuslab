import json
import tempfile
import unittest
from pathlib import Path

from build_discovery_local_readiness_pipeline import (
    READINESS_FILENAME,
    STRICT_CACHE_FILENAME,
    SUMMARY_FILENAME,
    WARM_CACHE_FILENAME,
    build_summary,
    run_pipeline,
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
        "blockers": ["prod readonly database URL is not available"],
    }


class BuildDiscoveryLocalReadinessPipelineTest(unittest.TestCase):
    def test_build_summary_records_artifact_paths_and_statuses(self):
        output_dir = Path("/tmp/local-readiness")

        summary = build_summary(
            cache_report("pass"),
            cache_report("fail", cache_hits=7, cache_misses=1),
            readiness_report(),
            output_dir,
        )

        self.assertEqual(summary["warmCacheStatus"], "pass")
        self.assertEqual(summary["strictCacheStatus"], "fail")
        self.assertEqual(summary["readinessStatus"], "incomplete")
        self.assertEqual(
            summary["artifacts"]["strictCachePrewarmReport"],
            str(output_dir / STRICT_CACHE_FILENAME),
        )
        self.assertEqual(summary["strictCacheSummary"]["cacheMisses"], 1)

    def test_run_pipeline_writes_artifacts_and_feeds_strict_cache_to_readiness(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            checklist_path = Path(temp_dir) / "checklist.md"
            gameplay_path = Path(temp_dir) / "gameplay.md"
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
                cache_prewarm_fn=fake_cache_prewarm,
                readiness_fn=fake_readiness,
            )

            output_path = Path(temp_dir)
            self.assertTrue((output_path / WARM_CACHE_FILENAME).exists())
            self.assertTrue((output_path / STRICT_CACHE_FILENAME).exists())
            self.assertTrue((output_path / READINESS_FILENAME).exists())
            self.assertTrue((output_path / SUMMARY_FILENAME).exists())
            self.assertEqual(calls, [(False, None, None), (True, 250, 400)])
            self.assertEqual(
                readiness_kwargs["cache_prewarm_report_path"],
                output_path / STRICT_CACHE_FILENAME,
            )
            self.assertEqual(readiness_kwargs["max_cache_hit_p95_ms"], 250)
            self.assertEqual(
                json.loads((output_path / SUMMARY_FILENAME).read_text()),
                summary,
            )


if __name__ == "__main__":
    unittest.main()
