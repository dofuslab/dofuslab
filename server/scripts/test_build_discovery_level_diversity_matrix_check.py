import unittest

from check_build_discovery_level_diversity_matrix import validate_report
from build_discovery_level_diversity_matrix import (
    LEVEL_DIVERSITY_TARGETS,
    REPORT_VERSION,
    query_for_matrix_target,
    query_for_target,
    query_summary,
    target_summary,
    targets_for_set,
)
from oneoff.build_discovery_prototype import (
    characteristic_point_cost,
    characteristic_points_for_level,
    legal_base_allocation_options,
)


def valid_result(target):
    query = query_for_target(target)
    primary_stat = {
        "strength": "Strength",
        "intelligence": "Intelligence",
        "chance": "Chance",
        "agility": "Agility",
    }[target.element]
    base_points = legal_base_allocation_options(target.level)[-1]
    vitality_points = characteristic_points_for_level(target.level) - characteristic_point_cost(base_points)
    best_build = {
        "score": 100.0,
        "totals": {"AP": target.ap, "MP": target.mp, "Range": target.range_target or 0, "Vitality": 1000},
        "sets": {},
        "exos": {},
        "conditionFailures": [],
        "baseAllocation": {primary_stat: base_points, "Vitality": vitality_points},
        "items": {
            "amulet": {
                "id": f"item-{target.name}",
                "name": "Example Amulet",
                "type": "Amulet",
                "level": target.level,
                "stats": [],
            }
        },
    }
    return {
        "target": target_summary(target),
        "query": query_summary(query),
        "status": "generated",
        "resultCount": 1,
        "validationErrors": [],
        "bestBuild": best_build,
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

    def test_validate_report_accepts_target_subset(self):
        target = targets_for_set("prod-level-sample")[0]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": 1,
            "generatedCount": 1,
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": [valid_result(target)],
        }

        self.assertEqual(
            validate_report(
                report,
                target_set="prod-level-sample",
                target_names={target.name},
            ),
            [],
        )

    def test_validate_report_checks_all_candidate_builds(self):
        report = valid_report()
        target = LEVEL_DIVERSITY_TARGETS[0]
        query = query_for_matrix_target(target, query_limit=2)
        result = report["results"][0]
        invalid_candidate = {
            **result["bestBuild"],
            "totals": {**result["bestBuild"]["totals"], "AP": 99},
        }
        result["query"] = query_summary(query)
        result["resultCount"] = 2
        result["candidateBuilds"] = [result["bestBuild"], invalid_candidate]

        failures = validate_report(report)

        self.assertTrue(
            any("candidateBuilds[1] current-code validation failed" in failure for failure in failures),
            failures,
        )

    def test_validate_report_requires_candidate_payload_for_multi_candidate_result(self):
        report = valid_report()
        target = LEVEL_DIVERSITY_TARGETS[0]
        query = query_for_matrix_target(target, query_limit=2)
        result = report["results"][0]
        result["query"] = query_summary(query)
        result["resultCount"] = 2

        failures = validate_report(report)

        self.assertTrue(
            any("missing candidateBuilds for multi-candidate result" in failure for failure in failures),
            failures,
        )

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

    def test_validate_report_accepts_prod_level_sample_target_set(self):
        results = [valid_result(target) for target in targets_for_set("prod-level-sample")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="prod-level-sample"), [])

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

    def test_validate_report_accepts_grid_next_minimum_2_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-minimum-2")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-minimum-2"), [])

    def test_validate_report_accepts_grid_next_minimum_3_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-minimum-3")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-minimum-3"), [])

    def test_validate_report_accepts_grid_next_cap_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-cap")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-cap"), [])

    def test_validate_report_accepts_grid_next_cap_2_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-cap-2")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-cap-2"), [])

    def test_validate_report_accepts_grid_next_cap_3_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-cap-3")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-cap-3"), [])

    def test_validate_report_accepts_grid_next_cap_4_target_set(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-cap-4")]
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results),
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(validate_report(report, target_set="grid-next-cap-4"), [])

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

    def test_validate_report_can_allow_no_build_rows(self):
        results = [valid_result(target) for target in targets_for_set("grid-next-cap")]
        results[0]["status"] = "no_build"
        results[0]["resultCount"] = 0
        results[0]["validationErrors"] = ["no build returned"]
        results[0]["bestBuildSummary"] = None
        report = {
            "reportVersion": REPORT_VERSION,
            "targetCount": len(results),
            "generatedCount": len(results) - 1,
            "noBuildCount": 1,
            "invalidCount": 0,
            "results": results,
        }

        self.assertEqual(
            validate_report(report, target_set="grid-next-cap", allow_no_build=True),
            [],
        )

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

    def test_validate_report_rejects_stale_query_identity(self):
        report = valid_report()
        report["results"][0]["query"]["budgetTier"] = 99

        failures = validate_report(report)

        self.assertTrue(any("query does not match current query definition" in failure for failure in failures))

    def test_validate_report_rejects_missing_full_best_build(self):
        report = valid_report()
        report["results"][0].pop("bestBuild")

        failures = validate_report(report)

        self.assertTrue(any("missing full bestBuild artifact" in failure for failure in failures))

    def test_validate_report_rejects_item_over_budget(self):
        report = valid_report()
        first_build = report["results"][0]["bestBuild"]
        first_build["items"]["dofus_1"] = {
            "id": "7754",
            "dofusID": "7754",
            "name": "Ochre Dofus",
            "type": "Dofus",
            "level": 180,
            "stats": [],
        }

        failures = validate_report(report)

        self.assertTrue(any("availability tier" in failure for failure in failures))

    def test_validate_report_rejects_exos_when_policy_is_none(self):
        report = valid_report()
        tier_one_index = next(
            index
            for index, result in enumerate(report["results"])
            if result["query"]["budgetTier"] == 1
        )
        report["results"][tier_one_index]["bestBuild"]["exos"] = {"AP": {"itemId": "item-id"}}

        failures = validate_report(report)

        self.assertTrue(any("generated exos present under effective exoPolicy=none" in failure for failure in failures))

    def test_validate_report_rejects_base_allocation_above_level_budget(self):
        report = valid_report()
        low_level_index = next(
            index
            for index, result in enumerate(report["results"])
            if result["target"]["level"] < 100
        )
        report["results"][low_level_index]["bestBuild"]["baseAllocation"] = {"Strength": 398, "Vitality": 3}

        failures = validate_report(report)

        self.assertTrue(any("baseAllocation spends" in failure for failure in failures))


if __name__ == "__main__":
    unittest.main()
