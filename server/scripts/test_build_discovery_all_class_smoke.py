import unittest
import sys
from pathlib import Path
from argparse import Namespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_discovery_all_class_smoke import (
    run_smoke_report,
    score_ratio_validation_error,
    target_query,
    timing_summary,
    validate_response,
)
from build_discovery_all_class_smoke import SmokeTarget


class BuildDiscoveryAllClassSmokeTest(unittest.TestCase):
    def test_timing_summary_reports_nearest_rank_p95(self):
        self.assertEqual(
            timing_summary([40, 10, 30, 20]),
            {"minMs": 10, "avgMs": 25.0, "p95Ms": 40, "maxMs": 40},
        )

    def test_timing_summary_handles_empty_values(self):
        self.assertEqual(
            timing_summary([]),
            {"minMs": None, "avgMs": None, "p95Ms": None, "maxMs": None},
        )

    def test_validate_response_rejects_score_below_floor(self):
        query = target_query(
            SmokeTarget("test", "Iop", "strength", 200, 4, 12, 6, None, 4, "opti", "test")
        )

        errors = validate_response(
            query,
            {
                "build": {
                    "score": 99.0,
                    "conditionFailures": [],
                    "totals": {"AP": 12, "MP": 6, "Range": 0},
                },
                "scoring": {"rangeSoftWeight": 0.5, "spellCandidateCount": 1},
                "objectiveWeights": {"Range": 0.5},
            },
            min_score=100.0,
        )

        self.assertIn("score 99.0 below floor 100.0", errors)

    def test_validate_response_accepts_score_at_floor(self):
        query = target_query(
            SmokeTarget("test", "Iop", "strength", 200, 4, 12, 6, None, 4, "opti", "test")
        )

        errors = validate_response(
            query,
            {
                "build": {
                    "score": 100.0,
                    "conditionFailures": [],
                    "totals": {"AP": 12, "MP": 6, "Range": 0},
                },
                "scoring": {"rangeSoftWeight": 0.5, "spellCandidateCount": 1},
                "objectiveWeights": {"Range": 0.5},
            },
            min_score=100.0,
        )

        self.assertEqual(errors, [])

    def test_score_ratio_validation_accepts_fast_score_near_reference(self):
        self.assertIsNone(score_ratio_validation_error(97.0, 100.0, 0.97))

    def test_score_ratio_validation_rejects_fast_score_below_reference_floor(self):
        self.assertEqual(
            score_ratio_validation_error(96.0, 100.0, 0.97),
            "fast score ratio 0.9600 below floor 0.9700",
        )

    def test_score_ratio_validation_handles_missing_scores(self):
        self.assertEqual(
            score_ratio_validation_error(None, 100.0, 0.97),
            "fast score missing for reference comparison",
        )
        self.assertEqual(
            score_ratio_validation_error(100.0, None, 0.97),
            "reference score missing for reference comparison",
        )

    def test_run_smoke_report_summarizes_rows_without_cli_io(self):
        args = Namespace(
            target_set="all-class-level-200",
            target=["trusted_iop_strength_opti_damage"],
            skip_warmup=True,
            max_total_search_p95_ms=5000,
            max_elapsed_p95_ms=5000,
            compare_reference=False,
            min_reference_score_ratio=0.97,
        )

        with patch(
            "build_discovery_all_class_smoke.run_target",
            return_value={
                "target": {
                    "name": "trusted_iop_strength_opti_damage",
                    "class_name": "Iop",
                    "element": "strength",
                    "budget_tier": 4,
                    "range_target": None,
                },
                "status": "passed",
                "elapsedMs": 123.4,
                "timings": {"totalSearchMs": 100.0},
            },
        ):
            report = run_smoke_report(args)

        self.assertEqual(report["summary"]["targetCount"], 1)
        self.assertEqual(report["summary"]["failed"], 0)
        self.assertEqual(report["summary"]["elapsedMs"]["p95Ms"], 123.4)
        self.assertFalse(report["summary"]["referenceComparison"]["enabled"])


if __name__ == "__main__":
    unittest.main()
