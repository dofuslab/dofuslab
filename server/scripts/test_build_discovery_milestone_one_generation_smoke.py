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
SMOKE_ELEMENTS_FILTER = "BUILD_DISCOVERY_MILESTONE_ONE_SMOKE_ELEMENTS"
SMOKE_BUDGET_TIERS_FILTER = "BUILD_DISCOVERY_MILESTONE_ONE_SMOKE_BUDGET_TIERS"
SMOKE_PROFILES_FILTER = "BUILD_DISCOVERY_MILESTONE_ONE_SMOKE_PROFILES"

ELEMENTS = ("strength", "intelligence", "chance", "agility")
BUDGET_TIERS = (1, 2, 3, 4)
TARGET_PROFILES = (
    ("low", MIN_AP, MIN_MP, MIN_RANGE),
    ("default", REQUIRED_AP, REQUIRED_MP, REQUIRED_RANGE),
    ("high", MAX_AP, MAX_MP, MAX_RANGE),
)


def selected_values(env_name, allowed_values, *, coerce=str):
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


def milestone_one_smoke_queries():
    yield from milestone_one_smoke_queries_for(ELEMENTS, BUDGET_TIERS, tuple(profile[0] for profile in TARGET_PROFILES))


def selected_milestone_one_smoke_queries():
    selected_elements = selected_values(SMOKE_ELEMENTS_FILTER, ELEMENTS)
    selected_budget_tiers = selected_values(SMOKE_BUDGET_TIERS_FILTER, BUDGET_TIERS, coerce=int)
    selected_profiles = selected_values(
        SMOKE_PROFILES_FILTER,
        tuple(profile[0] for profile in TARGET_PROFILES),
    )
    yield from milestone_one_smoke_queries_for(selected_elements, selected_budget_tiers, selected_profiles)


def milestone_one_smoke_queries_for(elements, budget_tiers, profiles):
    for element in elements:
        for budget_tier in budget_tiers:
            for profile_name, ap, mp, range_target in TARGET_PROFILES:
                if profile_name not in profiles:
                    continue
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

    def test_smoke_matrix_can_be_filtered_for_iteration(self):
        with patch.dict(
            os.environ,
            {
                SMOKE_ELEMENTS_FILTER: "strength,chance",
                SMOKE_BUDGET_TIERS_FILTER: "1,4",
                SMOKE_PROFILES_FILTER: "low",
            },
        ):
            rows = list(selected_milestone_one_smoke_queries())

        self.assertEqual(len(rows), 4)
        self.assertEqual({query.primary_element for _, query in rows}, {"strength", "chance"})
        self.assertEqual({query.budget_tier for _, query in rows}, {1, 4})
        self.assertEqual({profile_name for profile_name, _ in rows}, {"low"})

    def test_smoke_filters_fail_loudly_on_unknown_values(self):
        with patch.dict(os.environ, {SMOKE_ELEMENTS_FILTER: "strenght"}):
            with self.assertRaises(ValueError):
                list(selected_milestone_one_smoke_queries())

    def test_smoke_filters_fail_loudly_on_malformed_budget_tier(self):
        with patch.dict(os.environ, {SMOKE_BUDGET_TIERS_FILTER: "cheap"}):
            with self.assertRaises(ValueError):
                list(selected_milestone_one_smoke_queries())


@unittest.skipUnless(
    RUN_MILESTONE_ONE_SMOKE,
    "set BUILD_DISCOVERY_MILESTONE_ONE_SMOKE=1 to run bounded no-cache Milestone 1 generation smoke",
)
class BuildDiscoveryMilestoneOneGenerationSmokeTest(unittest.TestCase):
    def setUp(self):
        clear_build_discovery_response_cache()

    def test_bounded_milestone_one_generation_smoke(self):
        rows = list(selected_milestone_one_smoke_queries())
        self.assertGreater(len(rows), 0)

        for profile_name, query in rows:
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
