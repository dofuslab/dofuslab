import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    build_discovery_response,
    clear_build_discovery_response_cache,
)
from scripts.build_discovery_level_diversity_targets import (  # noqa: E402
    AP_MP_RANGE_COVERAGE_TARGETS,
    query_for_target,
)
from scripts.build_discovery_level_diversity_matrix import validate_best_build  # noqa: E402
from scripts.test_build_discovery_level_diversity_generation_smoke import (  # noqa: E402
    BUDGET_FILTER,
    ELEMENT_FILTER,
    LEVEL_FILTER,
    TARGET_FILTER,
    selected_csv_values,
)


RUN_COVERAGE_SMOKE = os.getenv("BUILD_DISCOVERY_AP_MP_RANGE_COVERAGE_SMOKE") == "1"


def selected_coverage_targets():
    allowed_levels = tuple(dict.fromkeys(target.level for target in AP_MP_RANGE_COVERAGE_TARGETS))
    allowed_elements = tuple(dict.fromkeys(target.element for target in AP_MP_RANGE_COVERAGE_TARGETS))
    allowed_budgets = tuple(dict.fromkeys(target.budget_tier for target in AP_MP_RANGE_COVERAGE_TARGETS))
    allowed_names = tuple(target.name for target in AP_MP_RANGE_COVERAGE_TARGETS)

    selected_levels = set(selected_csv_values(LEVEL_FILTER, allowed_levels, coerce=int))
    selected_elements = set(selected_csv_values(ELEMENT_FILTER, allowed_elements))
    selected_budgets = set(selected_csv_values(BUDGET_FILTER, allowed_budgets, coerce=int))
    selected_names = set(selected_csv_values(TARGET_FILTER, allowed_names))

    for target in AP_MP_RANGE_COVERAGE_TARGETS:
        if target.level not in selected_levels:
            continue
        if target.element not in selected_elements:
            continue
        if target.budget_tier not in selected_budgets:
            continue
        if target.name not in selected_names:
            continue
        yield target


class BuildDiscoveryApMpRangeCoverageSmokeShapeTest(unittest.TestCase):
    def test_coverage_matrix_samples_ap_mp_range_edges(self):
        self.assertEqual(len(AP_MP_RANGE_COVERAGE_TARGETS), 12)
        self.assertTrue(any(target.ap == 12 for target in AP_MP_RANGE_COVERAGE_TARGETS))
        self.assertTrue(any(target.mp == 6 for target in AP_MP_RANGE_COVERAGE_TARGETS))
        self.assertTrue(any(target.range_target == 6 for target in AP_MP_RANGE_COVERAGE_TARGETS))
        self.assertTrue(any(target.range_target is None for target in AP_MP_RANGE_COVERAGE_TARGETS))
        self.assertEqual(
            {target.element for target in AP_MP_RANGE_COVERAGE_TARGETS},
            {"strength", "intelligence", "chance", "agility"},
        )

    def test_coverage_matrix_can_be_filtered_for_iteration(self):
        with patch.dict(
            os.environ,
            {
                LEVEL_FILTER: "20,200",
                ELEMENT_FILTER: "chance,agility",
            },
        ):
            targets = list(selected_coverage_targets())

        self.assertEqual(
            [target.name for target in targets],
            [
                "coverage_level_20_chance_range_budget1",
                "coverage_level_200_agility_cap_budget4",
            ],
        )

    def test_coverage_queries_validate(self):
        for target in AP_MP_RANGE_COVERAGE_TARGETS:
            with self.subTest(target=target.name):
                query_for_target(target).validate()


@unittest.skipUnless(
    RUN_COVERAGE_SMOKE,
    "set BUILD_DISCOVERY_AP_MP_RANGE_COVERAGE_SMOKE=1 to run no-cache AP/MP/Range coverage generation smoke",
)
class BuildDiscoveryApMpRangeCoverageGenerationSmokeTest(unittest.TestCase):
    def setUp(self):
        clear_build_discovery_response_cache()

    def test_coverage_generation_smoke(self):
        targets = list(selected_coverage_targets())
        self.assertGreater(len(targets), 0)

        for target in targets:
            query = query_for_target(target)
            with self.subTest(target=target.name):
                response = build_discovery_response(query, use_cache=False)
                self.assertGreater(len(response["builds"]), 0)
                build = response["builds"][0]
                self.assertEqual(validate_best_build(target, query, build), [])
                totals = build["totals"]
                self.assertEqual(build["conditionFailures"], [])
                self.assertGreaterEqual(totals["AP"], query.ap_target)
                self.assertLessEqual(totals["AP"], MAX_AP)
                self.assertGreaterEqual(totals["MP"], query.mp_target)
                self.assertLessEqual(totals["MP"], MAX_MP)
                if query.range_target is not None:
                    self.assertGreaterEqual(totals["Range"], query.range_target)
                self.assertLessEqual(totals["Range"], MAX_RANGE)


if __name__ == "__main__":
    unittest.main()
