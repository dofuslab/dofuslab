import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_discovery_cpsat_production_gate import (
    EXPECTED_MEMORY_BYTES,
    MAX_PROCESS_RSS_BYTES,
    run_gate,
)


def passing_smoke(_args):
    return {
        "summary": {
            "targetCount": 19,
            "passed": 19,
            "failed": 0,
            "failures": [],
            "totalSearchMs": {"p95Ms": 3900.0},
            "elapsedMs": {"p95Ms": 4400.0},
        }
    }


class BuildDiscoveryCpsatProductionGateTest(unittest.TestCase):
    def test_gate_records_production_profile_measurements(self):
        calls = []

        def cache_report(**kwargs):
            calls.append(kwargs)
            return {
                "status": "pass",
                "failures": [],
                "summary": {"cacheHitElapsed": {"p95Ms": 75.0}},
            }

        report = run_gate(
            cache_report_fn=cache_report,
            smoke_runner=passing_smoke,
            context_fn=lambda: {
                "cpuCount": 2.0,
                "cpuSource": "cgroup-v2",
                "memoryLimitBytes": EXPECTED_MEMORY_BYTES,
                "memorySource": "cgroup-v2",
            },
            peak_rss_fn=lambda: 256 * 1024**2,
        )

        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["profile"]["workers"], 2)
        self.assertEqual(report["profile"]["concurrency"], 1)
        self.assertEqual(report["measurements"]["qualityMatrix"], {"passed": 19, "total": 19})
        self.assertEqual(report["measurements"]["warmCacheMissP95Ms"], 3900.0)
        self.assertEqual(report["measurements"]["cacheHitP95Ms"], 75.0)
        self.assertEqual(report["measurements"]["endToEndP95Ms"], 4400.0)
        self.assertEqual(calls, [
            {"require_all_hits": False},
            {"require_all_hits": True, "max_hit_p95_ms": 100.0},
        ])

    def test_gate_fails_profile_context_quality_latency_and_rss(self):
        def failing_smoke(_args):
            report = passing_smoke(_args)
            report["summary"].update(targetCount=19, passed=18, failures=["elapsed p95 exceeded"])
            return report

        report = run_gate(
            cache_report_fn=lambda **kwargs: {
                "status": "fail" if kwargs["require_all_hits"] else "pass",
                "failures": ["one row missed"] if kwargs["require_all_hits"] else [],
                "summary": {"cacheHitElapsed": {"p95Ms": 700.0}},
            },
            workers=4,
            concurrency=2,
            smoke_runner=failing_smoke,
            context_fn=lambda: {"cpuCount": 4.0, "memoryLimitBytes": 1024**3},
            peak_rss_fn=lambda: MAX_PROCESS_RSS_BYTES + 1,
        )

        self.assertEqual(report["status"], "fail")
        self.assertTrue(any("workers must be 2" in failure for failure in report["failures"]))
        self.assertTrue(any("quality matrix" in failure for failure in report["failures"]))
        self.assertTrue(any("cache hit" in failure for failure in report["failures"]))
        self.assertTrue(any("peak RSS" in failure for failure in report["failures"]))

    def test_unobservable_memory_limit_is_recorded_without_context_failure(self):
        report = run_gate(
            cache_report_fn=lambda **kwargs: {
                "status": "pass", "failures": [],
                "summary": {"cacheHitElapsed": {"p95Ms": 10.0}},
            },
            smoke_runner=passing_smoke,
            context_fn=lambda: {"cpuCount": 2.0, "memoryLimitBytes": None},
            peak_rss_fn=lambda: None,
        )
        self.assertEqual(report["status"], "pass")
        self.assertIsNone(report["executionContext"]["memoryLimitBytes"])


if __name__ == "__main__":
    unittest.main()
