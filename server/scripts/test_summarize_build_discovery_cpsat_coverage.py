from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


SERVER_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))

from scripts.summarize_build_discovery_cpsat_coverage import coverage_report


def write_split(path: Path, *, target_id: str, status: str = "generated", solver: str = "cpsat") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "results": [
                    {
                        "target": {
                            "id": target_id,
                            "element": "strength",
                            "budgetTier": 1,
                            "apTarget": 7,
                            "mpTarget": 3,
                            "rangeTarget": None,
                        },
                        "status": status,
                        "diagnostics": {
                            "solver": solver,
                            "solverStatus": "OPTIMAL",
                            "elapsedMs": 1.0,
                        },
                    }
                ]
            }
        ),
        encoding="utf-8",
    )


class BuildDiscoveryCpsatCoverageSummaryTest(unittest.TestCase):
    def test_counts_only_generated_cpsat_milestone2_split_reports(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            valid_id = "milestone2_l200_strength_7_3_none_budget1"
            write_split(root / "build-discovery-cpsat-example-split" / "valid.json", target_id=valid_id)
            write_split(
                root / "build-discovery-cpsat-example-split" / "prototype.json",
                target_id="milestone2_l200_strength_7_3_0_budget1",
                solver="prototype",
            )
            write_split(
                root / "build-discovery-cpsat-example-split" / "invalid.json",
                target_id="milestone2_l200_strength_7_3_1_budget1",
                status="invalid",
            )
            write_split(
                root / "build-discovery-cpsat-example-split" / "other.json",
                target_id="coverage_level_1_strength_min_budget1",
            )

            report = coverage_report(root)

        self.assertEqual(report["targetCount"], 3072)
        self.assertEqual(report["generatedCpsatTargetCount"], 1)
        self.assertEqual(report["coveragePercent"], 0.03)
        self.assertEqual(report["byElement"], {"strength": 1})
        self.assertEqual(report["byBudgetTier"], {1: 1})
        self.assertEqual(report["byAp"], {7: 1})
        self.assertEqual(report["byMp"], {3: 1})
        self.assertEqual(report["byRange"], {"none": 1})
        self.assertEqual(report["bySolverStatus"], {"OPTIMAL": 1})


if __name__ == "__main__":
    unittest.main()
