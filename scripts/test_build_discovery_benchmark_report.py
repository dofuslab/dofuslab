import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import BuildState
from oneoff.build_discovery_benchmark_report import (
    BENCHMARKS,
    REPORT_VERSION,
    build_report,
    generated_score_comparison,
)


def state(score: float, ap: int, mp: int, range_: int) -> BuildState:
    build_state = BuildState()
    build_state.score = score
    build_state.stats.update(
        {
            "AP": ap,
            "MP": mp,
            "Range": range_,
            "Strength": 1000,
            "Power": 200,
            "Vitality": 3500,
        }
    )
    build_state.base_allocation = {"Strength": 398, "Vitality": 103}
    return build_state


class BuildDiscoveryBenchmarkReportTest(unittest.TestCase):
    def test_benchmark_catalog_covers_prd_dofuslab_strength_iop_refs(self):
        ids = {benchmark.id for benchmark in BENCHMARKS}

        self.assertEqual(len(BENCHMARKS), 5)
        self.assertIn("saone_budget_11_6_strength_iop", ids)
        self.assertIn("strong_11_6_strength_iop", ids)
        self.assertIn("strong_12_ap_high_damage_strength_iop", ids)
        self.assertIn("strong_12_ap_strength_iop", ids)
        self.assertIn("additional_working_strength_iop", ids)
        self.assertEqual(
            {benchmark.element for benchmark in BENCHMARKS},
            {"strength"},
        )
        self.assertEqual(
            {(benchmark.target.ap, benchmark.target.mp, benchmark.target.range) for benchmark in BENCHMARKS},
            {(11, 6, 0), (12, 6, 0)},
        )

    def test_build_report_uses_injected_scorer_and_compares_generated_scores(self):
        benchmark = BENCHMARKS[0]

        def fake_scorer(url, target):
            self.assertEqual(url, benchmark.url)
            self.assertEqual(target, benchmark.target)
            return {
                "name": "Human benchmark",
                "entries": [{"slot": "amulet", "name": "Benchmark Amulet"}],
                "scores": {
                    "rawSourceBase": state(950, 11, 6, 0),
                    "normalizedSourceBase": state(975, 11, 6, 0),
                    "normalizedPrototypeBase": state(1000, 11, 6, 0),
                },
            }

        report = build_report(
            benchmarks=(benchmark,),
            scorer=fake_scorer,
            generated_results={
                "builds": [
                    {"id": "generated-1", "label": "Recommended", "score": 1025},
                ],
            },
        )

        self.assertEqual(report["reportVersion"], REPORT_VERSION)
        self.assertEqual(report["benchmarkCount"], 1)
        benchmark_report = report["benchmarks"][0]
        self.assertEqual(benchmark_report["id"], benchmark.id)
        self.assertEqual(benchmark_report["sourceBuildName"], "Human benchmark")
        self.assertEqual(benchmark_report["scores"]["normalizedPrototypeBase"]["score"], 1000)
        self.assertEqual(
            benchmark_report["generatedComparison"]["status"],
            "generated_meets_or_beats_benchmark",
        )
        self.assertEqual(benchmark_report["generatedComparison"]["delta"], 25)

    def test_generated_score_comparison_reports_benchmark_lead(self):
        comparison = generated_score_comparison(
            1200,
            [{"id": "generated-1", "label": "Recommended", "score": 1100}],
        )

        self.assertEqual(comparison["status"], "benchmark_scores_higher")
        self.assertEqual(comparison["delta"], -100)
        self.assertIn("benchmark", comparison["reason"].lower())

    def test_generated_score_comparison_handles_missing_generated_scores(self):
        comparison = generated_score_comparison(1200, [])

        self.assertEqual(comparison["status"], "not_compared")

    def test_build_report_can_capture_per_benchmark_errors(self):
        benchmark = BENCHMARKS[0]

        def failing_scorer(url, target):
            raise RuntimeError("local data unavailable")

        report = build_report(
            benchmarks=(benchmark,),
            scorer=failing_scorer,
            allow_errors=True,
        )

        self.assertEqual(report["benchmarkCount"], 1)
        self.assertEqual(report["errorCount"], 1)
        self.assertEqual(report["benchmarks"][0]["status"], "error")
        self.assertEqual(report["benchmarks"][0]["error"]["type"], "RuntimeError")
        self.assertEqual(report["benchmarks"][0]["generatedComparison"]["status"], "not_compared")


if __name__ == "__main__":
    unittest.main()
