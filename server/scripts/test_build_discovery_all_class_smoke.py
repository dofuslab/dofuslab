import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_discovery_all_class_smoke import timing_summary


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


if __name__ == "__main__":
    unittest.main()
