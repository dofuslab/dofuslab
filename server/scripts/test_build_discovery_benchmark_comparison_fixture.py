import unittest

from check_build_discovery_benchmark_comparison import validate_report


def report(status="generated_meets_or_beats_benchmark", score=100.0):
    return {
        "errorCount": 0,
        "benchmarks": [
            {
                "id": "benchmark-1",
                "generatedComparison": {
                    "status": status,
                    "benchmarkScore": score,
                    "bestGeneratedScore": 120.0,
                    "delta": 20.0,
                },
            }
        ],
    }


class BuildDiscoveryBenchmarkComparisonFixtureTest(unittest.TestCase):
    def test_validate_report_accepts_scores_within_tolerance(self):
        fixture = {
            "scoreTolerance": 1.0,
            "benchmarks": {
                "benchmark-1": {
                    "status": "generated_meets_or_beats_benchmark",
                    "benchmarkScore": 100.5,
                    "bestGeneratedScore": 120.0,
                    "delta": 19.5,
                }
            },
        }

        self.assertEqual(validate_report(report(), fixture), [])

    def test_validate_report_rejects_status_and_score_drift(self):
        fixture = {
            "scoreTolerance": 0.25,
            "benchmarks": {
                "benchmark-1": {
                    "status": "benchmark_scores_higher",
                    "benchmarkScore": 100.0,
                    "bestGeneratedScore": 130.0,
                    "delta": 30.0,
                }
            },
        }

        failures = validate_report(report(), fixture)

        self.assertTrue(any("status changed" in failure for failure in failures))
        self.assertTrue(any("bestGeneratedScore drifted" in failure for failure in failures))

    def test_validate_report_rejects_missing_and_extra_benchmarks(self):
        fixture = {
            "scoreTolerance": 1.0,
            "benchmarks": {
                "missing-benchmark": {
                    "status": "generated_meets_or_beats_benchmark",
                    "benchmarkScore": 100.0,
                    "bestGeneratedScore": 120.0,
                    "delta": 20.0,
                }
            },
        }

        failures = validate_report(report(), fixture)

        self.assertTrue(any("missing benchmark report" in failure for failure in failures))
        self.assertTrue(any("unexpected benchmark reports" in failure for failure in failures))


if __name__ == "__main__":
    unittest.main()
