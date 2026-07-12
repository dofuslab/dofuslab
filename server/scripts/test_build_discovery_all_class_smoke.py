import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_discovery_all_class_smoke import target_query, timing_summary, validate_response
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


if __name__ == "__main__":
    unittest.main()
