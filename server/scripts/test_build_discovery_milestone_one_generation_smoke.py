import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    MIN_AP,
    MIN_MP,
    MIN_RANGE,
    REQUIRED_AP,
    REQUIRED_MP,
    REQUIRED_RANGE,
    BuildDiscoveryQuery,
    build_discovery_response,
    clear_build_discovery_response_cache,
)


RUN_MILESTONE_ONE_SMOKE = os.getenv("BUILD_DISCOVERY_MILESTONE_ONE_SMOKE") == "1"

ELEMENTS = ("strength", "intelligence", "chance", "agility")
BUDGET_TIERS = (1, 2, 3, 4)
TARGET_PROFILES = (
    ("low", MIN_AP, MIN_MP, MIN_RANGE),
    ("default", REQUIRED_AP, REQUIRED_MP, REQUIRED_RANGE),
    ("high", MAX_AP, MAX_MP, MAX_RANGE),
)


def milestone_one_smoke_queries():
    for element in ELEMENTS:
        for budget_tier in BUDGET_TIERS:
            for profile_name, ap, mp, range_target in TARGET_PROFILES:
                yield profile_name, BuildDiscoveryQuery(
                    elements=(element,),
                    budget_tier=budget_tier,
                    ap_target=ap,
                    mp_target=mp,
                    range_target=range_target,
                    limit=1,
                )


class BuildDiscoveryMilestoneOneGenerationSmokeShapeTest(unittest.TestCase):
    def test_smoke_matrix_samples_elements_budgets_and_action_stat_bounds(self):
        rows = list(milestone_one_smoke_queries())

        self.assertEqual(len(rows), 48)
        self.assertEqual({query.primary_element for _, query in rows}, set(ELEMENTS))
        self.assertEqual({query.budget_tier for _, query in rows}, set(BUDGET_TIERS))
        self.assertEqual(
            {(name, query.ap_target, query.mp_target, query.range_target) for name, query in rows},
            set(TARGET_PROFILES),
        )


@unittest.skipUnless(
    RUN_MILESTONE_ONE_SMOKE,
    "set BUILD_DISCOVERY_MILESTONE_ONE_SMOKE=1 to run bounded no-cache Milestone 1 generation smoke",
)
class BuildDiscoveryMilestoneOneGenerationSmokeTest(unittest.TestCase):
    def setUp(self):
        clear_build_discovery_response_cache()

    def test_bounded_milestone_one_generation_smoke(self):
        for profile_name, query in milestone_one_smoke_queries():
            with self.subTest(
                element=query.primary_element,
                budget_tier=query.budget_tier,
                profile=profile_name,
                ap=query.ap_target,
                mp=query.mp_target,
                range=query.range_target,
            ):
                response = build_discovery_response(query, use_cache=False)
                self.assertGreater(len(response["builds"]), 0)

                build = response["builds"][0]
                totals = build["totals"]
                self.assertEqual(build["conditionFailures"], [])
                self.assertGreaterEqual(totals["AP"], query.ap_target)
                self.assertLessEqual(totals["AP"], MAX_AP)
                self.assertGreaterEqual(totals["MP"], query.mp_target)
                self.assertLessEqual(totals["MP"], MAX_MP)
                self.assertGreaterEqual(totals["Range"], query.range_target)
                self.assertLessEqual(totals["Range"], MAX_RANGE)


if __name__ == "__main__":
    unittest.main()
