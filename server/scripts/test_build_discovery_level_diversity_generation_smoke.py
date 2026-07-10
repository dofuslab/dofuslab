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
    LEVEL_DIVERSITY_TARGETS,
    LevelDiversityTarget,
    query_for_target,
)


RUN_LEVEL_DIVERSITY_SMOKE = os.getenv("BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE") == "1"
LEVEL_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS"
ELEMENT_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_ELEMENTS"
BUDGET_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_BUDGET_TIERS"
TARGET_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS"


def selected_csv_values(env_name, allowed_values, *, coerce=str):
    configured = os.getenv(env_name)
    if not configured or configured == "all":
        return tuple(allowed_values)
    requested = set()
    for raw_value in configured.split(","):
        value = raw_value.strip()
        if not value:
            continue
        try:
            requested.add(coerce(value))
        except ValueError as exc:
            raise ValueError(f"{env_name} contains invalid value: {value}") from exc
    invalid = requested - set(allowed_values)
    if invalid:
        raise ValueError(
            f"{env_name} contains unsupported value(s): "
            + ", ".join(str(value) for value in sorted(invalid))
        )
    return tuple(value for value in allowed_values if value in requested)


def selected_level_diversity_targets():
    allowed_levels = tuple(dict.fromkeys(target.level for target in LEVEL_DIVERSITY_TARGETS))
    allowed_elements = tuple(dict.fromkeys(target.element for target in LEVEL_DIVERSITY_TARGETS))
    allowed_budgets = tuple(dict.fromkeys(target.budget_tier for target in LEVEL_DIVERSITY_TARGETS))
    allowed_names = tuple(target.name for target in LEVEL_DIVERSITY_TARGETS)

    selected_levels = set(selected_csv_values(LEVEL_FILTER, allowed_levels, coerce=int))
    selected_elements = set(selected_csv_values(ELEMENT_FILTER, allowed_elements))
    selected_budgets = set(selected_csv_values(BUDGET_FILTER, allowed_budgets, coerce=int))
    selected_names = set(selected_csv_values(TARGET_FILTER, allowed_names))

    for target in LEVEL_DIVERSITY_TARGETS:
        if target.level not in selected_levels:
            continue
        if target.element not in selected_elements:
            continue
        if target.budget_tier not in selected_budgets:
            continue
        if target.name not in selected_names:
            continue
        yield target


class BuildDiscoveryLevelDiversitySmokeShapeTest(unittest.TestCase):
    def test_level_diversity_matrix_covers_prod_derived_targets(self):
        self.assertEqual(len(LEVEL_DIVERSITY_TARGETS), 27)
        self.assertEqual({target.element for target in LEVEL_DIVERSITY_TARGETS}, {"strength", "intelligence", "chance", "agility"})
        self.assertTrue(any(target.range_target is None for target in LEVEL_DIVERSITY_TARGETS))
        self.assertIn(50, {target.level for target in LEVEL_DIVERSITY_TARGETS})
        self.assertIn(199, {target.level for target in LEVEL_DIVERSITY_TARGETS})

    def test_level_diversity_matrix_can_be_filtered_for_iteration(self):
        with patch.dict(
            os.environ,
            {
                LEVEL_FILTER: "50,100",
                ELEMENT_FILTER: "strength",
                BUDGET_FILTER: "1,2",
            },
        ):
            targets = list(selected_level_diversity_targets())

        self.assertEqual(
            [target.name for target in targets],
            ["level_50_strength_7_3_1_budget1", "level_100_strength_12_5_none_budget2"],
        )

    def test_level_diversity_queries_validate(self):
        for target in LEVEL_DIVERSITY_TARGETS:
            with self.subTest(target=target.name):
                query_for_target(target).validate()


@unittest.skipUnless(
    RUN_LEVEL_DIVERSITY_SMOKE,
    "set BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE=1 to run no-cache Level Diversity generation smoke",
)
class BuildDiscoveryLevelDiversityGenerationSmokeTest(unittest.TestCase):
    def setUp(self):
        clear_build_discovery_response_cache()

    def test_level_diversity_generation_smoke(self):
        targets = list(selected_level_diversity_targets())
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
