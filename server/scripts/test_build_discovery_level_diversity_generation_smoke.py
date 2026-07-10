import os
import sys
import unittest
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    BuildDiscoveryQuery,
    build_discovery_response,
    clear_build_discovery_response_cache,
)


RUN_LEVEL_DIVERSITY_SMOKE = os.getenv("BUILD_DISCOVERY_LEVEL_DIVERSITY_SMOKE") == "1"
LEVEL_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_LEVELS"
ELEMENT_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_ELEMENTS"
BUDGET_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_BUDGET_TIERS"
TARGET_FILTER = "BUILD_DISCOVERY_LEVEL_DIVERSITY_TARGETS"


@dataclass(frozen=True)
class LevelDiversityTarget:
    name: str
    level: int
    element: str
    budget_tier: int
    ap: int
    mp: int
    range_target: Optional[int]


LEVEL_DIVERSITY_TARGETS = (
    LevelDiversityTarget("level_50_strength_7_3_1_budget1", 50, "strength", 1, 7, 3, 1),
    LevelDiversityTarget("level_50_intelligence_7_4_0_budget1", 50, "intelligence", 1, 7, 4, 0),
    LevelDiversityTarget("level_50_chance_7_5_1_budget2", 50, "chance", 2, 7, 5, 1),
    LevelDiversityTarget("level_60_strength_10_4_2_budget2", 60, "strength", 2, 10, 4, 2),
    LevelDiversityTarget("level_60_intelligence_10_4_3_budget2", 60, "intelligence", 2, 10, 4, 3),
    LevelDiversityTarget("level_60_chance_9_3_2_budget1", 60, "chance", 1, 9, 3, 2),
    LevelDiversityTarget("level_60_agility_9_3_none_budget1", 60, "agility", 1, 9, 3, None),
    LevelDiversityTarget("level_80_agility_10_5_1_budget2", 80, "agility", 2, 10, 5, 1),
    LevelDiversityTarget("level_80_strength_9_5_2_budget1", 80, "strength", 1, 9, 5, 2),
    LevelDiversityTarget("level_100_strength_12_5_none_budget2", 100, "strength", 2, 12, 5, None),
    LevelDiversityTarget("level_120_intelligence_11_5_1_budget2", 120, "intelligence", 2, 11, 5, 1),
    LevelDiversityTarget("level_120_chance_12_5_1_budget3", 120, "chance", 3, 12, 5, 1),
    LevelDiversityTarget("level_120_agility_11_4_1_budget1", 120, "agility", 1, 11, 4, 1),
    LevelDiversityTarget("level_150_strength_9_4_2_budget1", 150, "strength", 1, 9, 4, 2),
    LevelDiversityTarget("level_150_intelligence_12_5_2_budget3", 150, "intelligence", 3, 12, 5, 2),
    LevelDiversityTarget("level_150_chance_12_4_2_budget2", 150, "chance", 2, 12, 4, 2),
    LevelDiversityTarget("level_150_agility_11_5_2_budget2", 150, "agility", 2, 11, 5, 2),
    LevelDiversityTarget("level_160_strength_12_5_3_budget3", 160, "strength", 3, 12, 5, 3),
    LevelDiversityTarget("level_160_intelligence_12_5_2_budget2", 160, "intelligence", 2, 12, 5, 2),
    LevelDiversityTarget("level_160_chance_11_6_none_budget3", 160, "chance", 3, 11, 6, None),
    LevelDiversityTarget("level_160_agility_12_6_3_budget4", 160, "agility", 4, 12, 6, 3),
    LevelDiversityTarget("level_180_strength_12_5_3_budget3", 180, "strength", 3, 12, 5, 3),
    LevelDiversityTarget("level_199_strength_12_6_2_budget4", 199, "strength", 4, 12, 6, 2),
    LevelDiversityTarget("level_199_intelligence_12_5_2_budget3", 199, "intelligence", 3, 12, 5, 2),
    LevelDiversityTarget("level_199_chance_10_6_3_budget2", 199, "chance", 2, 10, 6, 3),
    LevelDiversityTarget("level_199_agility_10_5_2_budget2", 199, "agility", 2, 10, 5, 2),
    LevelDiversityTarget("level_199_strength_12_6_5_budget4", 199, "strength", 4, 12, 6, 5),
)


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


def query_for_target(target: LevelDiversityTarget) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        level=target.level,
        elements=(target.element,),
        ap_target=target.ap,
        mp_target=target.mp,
        range_target=target.range_target,
        budget_tier=target.budget_tier,
        exo_policy="none" if target.budget_tier < 3 else "allow",
        limit=1,
        top_k=25,
        beam_width=100,
        per_signature_cap=10,
        relevant_set_limit=40,
    )


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
