import unittest

from check_build_discovery_level_diversity_matrix import validate_report
from build_discovery_level_diversity_matrix import LEVEL_DIVERSITY_TARGETS, REPORT_VERSION, targets_for_set


def valid_result(target):
    return {
        "target": {"id": target.name},
        "status": "generated",
        "resultCount": 1,
        "validationErrors": [],
        "bestBuildSummary": {
            "score": 100.0,
            "totals": {"AP": target.ap, "MP": target.mp, "Range": target.range_target or 0, "Vitality": 1000},
            "items": ["Example Item"],
        },
    }


def valid_report():
    results = [valid_result(target) for target in LEVEL_DIVERSITY_TARGETS]
    return {
        "reportVersion": REPORT_VERSION,
        "targetCount": len(results),
        "generatedCount": len(results),
        "noBuildCount": 0,
        "invalidCount": 0,
        "results": results,
    }


class BuildDiscoveryLevelDiversityMatrixCheckTest(unittest.TestCase):
    def test_validate_report_accepts_complete_generated_matrix(self):
        self.assertEqual(validate_report(valid_report()), [])

    def test_validate_report_accepts_boundary_target_set(self):
        results = [valid_result(target) for target in targets_for_set("boundary")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="boundary"), [])

    def test_validate_report_accepts_coverage_target_set(self):
        results = [valid_result(target) for target in targets_for_set("coverage")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="coverage"), [])

    def test_validate_report_accepts_grid_next_minimum_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-minimum")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-minimum"), [])

    def test_validate_report_rejects_missing_target(self):
        report = valid_report()
        report["results"] = report["results"][1:]

        failures = validate_report(report)

        self.assertTrue(any("missing target reports" in failure for failure in failures))

    def test_validate_report_rejects_no_build_rows(self):
        report = valid_report()
        report["noBuildCount"] = 1
        report["generatedCount"] -= 1
        report["results"][0]["status"] = "no_build"
        report["results"][0]["resultCount"] = 0
        report["results"][0]["bestBuildSummary"] = None

        failures = validate_report(report)

        self.assertTrue(any("noBuildCount" in failure for failure in failures))
        self.assertTrue(any("status is no_build" in failure for failure in failures))
        self.assertTrue(any("missing bestBuildSummary" in failure for failure in failures))

    def test_validate_report_rejects_invalid_rows(self):
        report = valid_report()
        report["invalidCount"] = 1
        report["generatedCount"] -= 1
        report["results"][0]["status"] = "invalid"
        report["results"][0]["validationErrors"] = ["AP total 13 exceeds cap 12"]

        failures = validate_report(report)

        self.assertTrue(any("invalidCount" in failure for failure in failures))
        self.assertTrue(any("status is invalid" in failure for failure in failures))
        self.assertTrue(any("validationErrors is not empty" in failure for failure in failures))


if __name__ == "__main__":
    unittest.main()
