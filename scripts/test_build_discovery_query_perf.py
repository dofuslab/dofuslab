import argparse
import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import BuildDiscoveryQuery
from oneoff.build_discovery_query_perf import (
    DEFAULT_P95_THRESHOLD_MS,
    LOCAL_VALIDATION_PROFILE_ID,
    LOCAL_VALIDATION_QUERY,
    LOCAL_VALIDATION_SUITE_ID,
    LOCAL_VALIDATION_SUITE_PROFILES,
    REPORT_VERSION,
    SUITE_REPORT_VERSION,
    SUPPORTED_IOP_ELEMENTS,
    configure_index_path,
    main,
    measure_element_matrix,
    measure_query,
    percentile,
    timing_summary,
    validate_local_element_matrix,
    validate_local_query_suite,
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

    def test_local_validation_report_records_profile_metadata_and_passes_nonempty_results(self):
        rows = [
            {
                "element": element,
                "runs": 1,
                "cacheEnabled": False,
                "cacheHits": 0,
                "timings": {"minMs": 10, "avgMs": 10, "p95Ms": 10, "maxMs": 10},
                "resultCount": 1,
                "cacheKey": f"key-{element}",
            }
            for element in SUPPORTED_IOP_ELEMENTS
        ]

        with patch(
            "oneoff.build_discovery_query_perf.measure_element_matrix",
            return_value={
                "elements": list(SUPPORTED_IOP_ELEMENTS),
                "runs": 1,
                "cacheEnabled": False,
                "results": rows,
            },
        ) as measure:
            report = validate_local_element_matrix(runs=1, use_cache=False)

        measure.assert_called_once_with(
            LOCAL_VALIDATION_QUERY,
            1,
            False,
            elements=SUPPORTED_IOP_ELEMENTS,
        )
        self.assertEqual(report["reportVersion"], REPORT_VERSION)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["profile"]["id"], LOCAL_VALIDATION_PROFILE_ID)
        self.assertEqual(report["thresholds"]["p95Ms"], DEFAULT_P95_THRESHOLD_MS)
        self.assertEqual(report["queryParams"]["apTarget"], 11)
        self.assertEqual(report["queryParams"]["mpTarget"], 6)
        self.assertEqual(report["queryParams"]["rangeTarget"], 0)
        self.assertEqual(report["queryParams"]["budgetTier"], 4)
        self.assertEqual(report["queryParams"]["exoPolicy"], "allow")
        self.assertEqual(report["queryParams"]["limit"], 3)
        self.assertEqual(report["queryParams"]["topK"], 10)
        self.assertEqual(report["queryParams"]["beamWidth"], 75)
        self.assertEqual(report["queryParams"]["perSignatureCap"], 20)
        self.assertEqual(report["queryParams"]["relevantSetLimit"], 60)
        self.assertEqual(report["queryParams"]["elements"], list(SUPPORTED_IOP_ELEMENTS))
        self.assertEqual(
            set(report["expectedProfiles"]),
            set(SUPPORTED_IOP_ELEMENTS),
        )
        self.assertEqual(
            [row["validation"]["status"] for row in report["results"]],
            ["pass", "pass", "pass", "pass"],
        )

    def test_local_validation_report_fails_empty_results_and_p95_threshold(self):
        rows = [
            {
                "element": "strength",
                "runs": 1,
                "cacheEnabled": False,
                "cacheHits": 0,
                "timings": {"minMs": 6000, "avgMs": 6000, "p95Ms": 6000, "maxMs": 6000},
                "resultCount": 0,
                "cacheKey": "key-strength",
            },
            {
                "element": "agility",
                "runs": 1,
                "cacheEnabled": False,
                "cacheHits": 0,
                "timings": {"minMs": 100, "avgMs": 100, "p95Ms": 100, "maxMs": 100},
                "resultCount": 1,
                "cacheKey": "key-agility",
            },
        ]

        with patch(
            "oneoff.build_discovery_query_perf.measure_element_matrix",
            return_value={
                "elements": ["strength", "agility"],
                "runs": 1,
                "cacheEnabled": False,
                "results": rows,
            },
        ):
            report = validate_local_element_matrix(
                runs=1,
                use_cache=False,
                p95_threshold_ms=5000,
                elements=("strength", "agility"),
            )

        self.assertEqual(report["status"], "fail")
        self.assertEqual(
            report["results"][0]["validation"]["failures"],
            ["empty_results", "p95_threshold_exceeded"],
        )
        self.assertEqual(report["results"][1]["validation"]["status"], "pass")

    def test_local_validation_report_fails_missing_element_result(self):
        with patch(
            "oneoff.build_discovery_query_perf.measure_element_matrix",
            return_value={
                "elements": ["strength", "agility"],
                "runs": 1,
                "cacheEnabled": False,
                "results": [
                    {
                        "element": "strength",
                        "runs": 1,
                        "cacheEnabled": False,
                        "cacheHits": 0,
                        "timings": {"minMs": 100, "avgMs": 100, "p95Ms": 100, "maxMs": 100},
                        "resultCount": 1,
                        "cacheKey": "key-strength",
                    }
                ],
            },
        ):
            report = validate_local_element_matrix(
                runs=1,
                use_cache=False,
                elements=("strength", "agility"),
            )

        self.assertEqual(report["status"], "fail")
        self.assertEqual(
            [row["element"] for row in report["results"]],
            ["strength", "agility"],
        )
        self.assertEqual(
            report["results"][1]["validation"]["failures"],
            ["missing_element_result"],
        )

    def test_local_validation_suite_records_two_ap_profiles(self):
        profile_reports = []

        def fake_validate(query, runs, use_cache, p95_threshold_ms, elements, profile_id, profile_label):
            profile_reports.append((query, runs, use_cache, p95_threshold_ms, elements, profile_id, profile_label))
            return {
                "reportVersion": REPORT_VERSION,
                "status": "pass",
                "profile": {"id": profile_id, "label": profile_label},
                "queryParams": {"apTarget": query.ap_target, "elements": list(elements)},
                "results": [],
            }

        with patch(
            "oneoff.build_discovery_query_perf.validate_local_element_matrix",
            side_effect=fake_validate,
        ):
            report = validate_local_query_suite(
                runs=2,
                use_cache=False,
                p95_threshold_ms=DEFAULT_P95_THRESHOLD_MS,
            )

        self.assertEqual(report["reportVersion"], SUITE_REPORT_VERSION)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["suite"]["id"], LOCAL_VALIDATION_SUITE_ID)
        self.assertEqual(report["thresholds"]["p95Ms"], DEFAULT_P95_THRESHOLD_MS)
        self.assertEqual(report["runs"], 2)
        self.assertFalse(report["cacheEnabled"])
        self.assertEqual(len(report["profiles"]), 2)
        self.assertEqual(
            [profile["query"].ap_target for profile in LOCAL_VALIDATION_SUITE_PROFILES],
            [11, 12],
        )
        self.assertEqual([call[0].ap_target for call in profile_reports], [11, 12])
        self.assertEqual([call[1] for call in profile_reports], [2, 2])
        self.assertEqual([call[4] for call in profile_reports], [SUPPORTED_IOP_ELEMENTS, SUPPORTED_IOP_ELEMENTS])

    def test_local_validation_suite_fails_if_any_profile_fails(self):
        with patch(
            "oneoff.build_discovery_query_perf.validate_local_element_matrix",
            side_effect=[
                {"status": "pass", "profile": {"id": "ok"}, "results": []},
                {"status": "fail", "profile": {"id": "bad"}, "results": []},
            ],
        ):
            report = validate_local_query_suite(runs=1, use_cache=False)

        self.assertEqual(report["status"], "fail")
        self.assertEqual(
            [profile["status"] for profile in report["profiles"]],
            ["pass", "fail"],
        )

    def test_configure_index_path_updates_prototype_and_clears_caches(self):
        from oneoff import build_discovery_prototype

        original_path = build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH
        index_path = str(Path(__file__).with_name("temp-build-discovery-index.json"))

        try:
            with patch("oneoff.build_discovery_query_perf.clear_prototype_data_caches") as clear_caches:
                configure_index_path(index_path)

            self.assertEqual(build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH, index_path)
            clear_caches.assert_called_once_with()
        finally:
            build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH = original_path

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

    def test_validate_local_suite_refuses_db_fallback_even_when_allow_db_is_passed(self):
        argv = ["build_discovery_query_perf.py", "--validate-local-suite", "--allow-db"]

        with patch.object(sys, "argv", argv):
            with patch("oneoff.build_discovery_prototype.BUILD_DISCOVERY_INDEX_PATH", ""):
                with patch("oneoff.build_discovery_query_perf.validate_local_query_suite") as validate_suite:
                    with self.assertRaises(SystemExit):
                        main()

        validate_suite.assert_not_called()

    def test_validate_local_modes_are_mutually_exclusive(self):
        argv = ["build_discovery_query_perf.py", "--validate-local-profile", "--validate-local-suite"]

        with patch.object(sys, "argv", argv):
            with patch("oneoff.build_discovery_query_perf.validate_local_query_suite") as validate_suite:
                with patch("oneoff.build_discovery_query_perf.validate_local_element_matrix") as validate_profile:
                    with self.assertRaises(SystemExit):
                        main()

        validate_suite.assert_not_called()
        validate_profile.assert_not_called()


if __name__ == "__main__":
    unittest.main()
