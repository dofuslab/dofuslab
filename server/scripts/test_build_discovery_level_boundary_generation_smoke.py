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
    BOUNDARY_LEVEL_TARGETS,
    query_for_target,
)
from scripts.test_build_discovery_level_diversity_generation_smoke import (  # noqa: E402
    BUDGET_FILTER,
    ELEMENT_FILTER,
    LEVEL_FILTER,
    TARGET_FILTER,
    selected_csv_values,
)


RUN_BOUNDARY_SMOKE = os.getenv("BUILD_DISCOVERY_LEVEL_BOUNDARY_SMOKE") == "1"


def selected_boundary_targets():
    allowed_levels = tuple(dict.fromkeys(target.level for target in BOUNDARY_LEVEL_TARGETS))
    allowed_elements = tuple(dict.fromkeys(target.element for target in BOUNDARY_LEVEL_TARGETS))
    allowed_budgets = tuple(dict.fromkeys(target.budget_tier for target in BOUNDARY_LEVEL_TARGETS))
    allowed_names = tuple(target.name for target in BOUNDARY_LEVEL_TARGETS)

    selected_levels = set(selected_csv_values(LEVEL_FILTER, allowed_levels, coerce=int))
    selected_elements = set(selected_csv_values(ELEMENT_FILTER, allowed_elements))
    selected_budgets = set(selected_csv_values(BUDGET_FILTER, allowed_budgets, coerce=int))
    selected_names = set(selected_csv_values(TARGET_FILTER, allowed_names))

    for target in BOUNDARY_LEVEL_TARGETS:
        if target.level not in selected_levels:
            continue
        if target.element not in selected_elements:
            continue
        if target.budget_tier not in selected_budgets:
            continue
        if target.name not in selected_names:
            continue
        yield target


class BuildDiscoveryLevelBoundarySmokeShapeTest(unittest.TestCase):
    def test_boundary_matrix_covers_level_transition_edges(self):
        self.assertEqual(len(BOUNDARY_LEVEL_TARGETS), 10)
        self.assertEqual(
            {target.level for target in BOUNDARY_LEVEL_TARGETS},
            {1, 19, 20, 99, 100, 149, 150, 179, 180, 200},
        )
        self.assertEqual(
            {target.element for target in BOUNDARY_LEVEL_TARGETS},
            {"strength", "intelligence", "chance", "agility"},
        )

    def test_boundary_matrix_can_be_filtered_for_iteration(self):
        with patch.dict(
            os.environ,
            {
                LEVEL_FILTER: "1,99",
                ELEMENT_FILTER: "strength,agility",
                BUDGET_FILTER: "1",
            },
        ):
            targets = list(selected_boundary_targets())

        self.assertEqual(
            [target.name for target in targets],
            [
                "boundary_level_1_strength_6_3_none_budget1",
                "boundary_level_99_agility_6_3_none_budget1",
            ],
        )

    def test_boundary_queries_validate(self):
        for target in BOUNDARY_LEVEL_TARGETS:
            with self.subTest(target=target.name):
                query_for_target(target).validate()


@unittest.skipUnless(
    RUN_BOUNDARY_SMOKE,
    "set BUILD_DISCOVERY_LEVEL_BOUNDARY_SMOKE=1 to run no-cache boundary generation smoke",
)
class BuildDiscoveryLevelBoundaryGenerationSmokeTest(unittest.TestCase):
    def setUp(self):
        clear_build_discovery_response_cache()

    def test_boundary_generation_smoke(self):
        targets = list(selected_boundary_targets())
        self.assertGreater(len(targets), 0)

        for target in targets:
            query = query_for_target(target)
            with self.subTest(target=target.name):
                response = build_discovery_response(query, use_cache=False)
                self.assertGreater(len(response["builds"]), 0)
                build = response["builds"][0]
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
