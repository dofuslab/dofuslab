import argparse
import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import BuildDiscoveryQuery
from oneoff.build_discovery_query_perf import (
    SUPPORTED_IOP_ELEMENTS,
    measure_element_matrix,
    measure_query,
    percentile,
    timing_summary,
    validate_cli_bounds,
    validate_index_source,
)


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

    def test_measure_element_matrix_reports_supported_element_rows(self):
        seen_elements = []

        def fake_response(query, use_cache):
            element = query.elements[0]
            seen_elements.append(element)
            return {
                "diagnostics": {"cacheHit": False, "resultCount": 1},
                "cacheKey": f"key-{element}",
            }

        query = BuildDiscoveryQuery(ap_target=12, mp_target=6, range_target=1, limit=4)

        with patch(
            "oneoff.build_discovery_query_perf.build_discovery_response",
            side_effect=fake_response,
        ):
            report = measure_element_matrix(query, runs=1, use_cache=True)

        self.assertEqual(report["elements"], list(SUPPORTED_IOP_ELEMENTS))
        self.assertEqual(report["runs"], 1)
        self.assertTrue(report["cacheEnabled"])
        self.assertEqual(
            [row["element"] for row in report["results"]],
            list(SUPPORTED_IOP_ELEMENTS),
        )
        self.assertEqual(
            [row["cacheKey"] for row in report["results"]],
            [f"key-{element}" for element in SUPPORTED_IOP_ELEMENTS],
        )
        self.assertEqual(seen_elements, list(SUPPORTED_IOP_ELEMENTS))

    def test_measure_element_matrix_constructs_element_specific_queries(self):
        captured_queries = []

        def fake_response(query, use_cache):
            captured_queries.append(query)
            element = query.elements[0]
            return {
                "diagnostics": {"cacheHit": use_cache, "resultCount": 2},
                "cacheKey": f"cache-{element}",
            }

        query = BuildDiscoveryQuery(
            elements=("strength",),
            ap_target=11,
            mp_target=6,
            range_target=0,
            budget_tier=3,
            exo_policy="opti",
            limit=3,
            top_k=10,
            beam_width=50,
            per_signature_cap=20,
            relevant_set_limit=30,
        )

        with patch(
            "oneoff.build_discovery_query_perf.build_discovery_response",
            side_effect=fake_response,
        ):
            report = measure_element_matrix(query, runs=1, use_cache=True)

        self.assertEqual(len(captured_queries), len(SUPPORTED_IOP_ELEMENTS))
        self.assertEqual(
            {row["cacheKey"] for row in report["results"]},
            {f"cache-{element}" for element in SUPPORTED_IOP_ELEMENTS},
        )
        for element, captured_query in zip(SUPPORTED_IOP_ELEMENTS, captured_queries):
            self.assertEqual(captured_query.elements, (element,))
            self.assertEqual(captured_query.ap_target, query.ap_target)
            self.assertEqual(captured_query.mp_target, query.mp_target)
            self.assertEqual(captured_query.range_target, query.range_target)
            self.assertEqual(captured_query.budget_tier, query.budget_tier)
            self.assertEqual(captured_query.exo_policy, query.exo_policy)
            self.assertEqual(captured_query.limit, query.limit)
            self.assertEqual(captured_query.top_k, query.top_k)
            self.assertEqual(captured_query.beam_width, query.beam_width)
            self.assertEqual(captured_query.per_signature_cap, query.per_signature_cap)
            self.assertEqual(captured_query.relevant_set_limit, query.relevant_set_limit)

    def test_cli_bounds_reject_unbounded_runs(self):
        parser = argparse.ArgumentParser()
        args = argparse.Namespace(
            runs=1000,
            limit=1,
            top_k=1,
            beam_width=1,
            per_signature_cap=1,
            relevant_set_limit=1,
        )

        with self.assertRaises(SystemExit):
            validate_cli_bounds(parser, args)

    def test_index_source_rejects_missing_index_without_allow_db(self):
        parser = argparse.ArgumentParser()

        with patch(
            "oneoff.build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH",
            str(Path(__file__).with_name("missing-build-discovery-index.json")),
        ):
            with self.assertRaises(SystemExit):
                validate_index_source(parser, allow_db=False)

    def test_index_source_allows_explicit_db_fallback(self):
        parser = argparse.ArgumentParser()

        with patch("oneoff.build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH", ""):
            validate_index_source(parser, allow_db=True)


if __name__ == "__main__":
    unittest.main()
