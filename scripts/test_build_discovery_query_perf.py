import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import BuildDiscoveryQuery
from oneoff.build_discovery_query_perf import measure_query, percentile, timing_summary


class BuildDiscoveryQueryPerfTest(unittest.TestCase):
    def test_percentile_and_summary_are_stable_for_small_samples(self):
        self.assertEqual(percentile([10, 20, 30], 0.95), 30)
        self.assertEqual(
            timing_summary([10, 20, 30]),
            {"minMs": 10, "avgMs": 20, "p95Ms": 30, "maxMs": 30},
        )

    def test_measure_query_reports_cache_hits(self):
        responses = [
            {"diagnostics": {"cacheHit": False, "resultCount": 2}, "cacheKey": "key"},
            {"diagnostics": {"cacheHit": True, "resultCount": 2}, "cacheKey": "key"},
            {"diagnostics": {"cacheHit": True, "resultCount": 2}, "cacheKey": "key"},
        ]

        with patch(
            "oneoff.build_discovery_query_perf.build_discovery_response",
            side_effect=responses,
        ):
            report = measure_query(BuildDiscoveryQuery(), runs=3, use_cache=True)

        self.assertEqual(report["runs"], 3)
        self.assertEqual(report["cacheHits"], 2)
        self.assertEqual(report["resultCount"], 2)
        self.assertEqual(report["cacheKey"], "key")


if __name__ == "__main__":
    unittest.main()
