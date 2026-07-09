import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    BASE_AP,
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    MIN_AP,
    MIN_MP,
    MIN_RANGE,
    BASE_AP_STRATEGIES,
    BuildDiscoveryQuery,
    DEFAULT_AP_STRATEGIES,
    BuildTarget,
    effective_ap_strategies_for_target,
    effective_exo_policy,
    query_cache_identity,
    result_warnings,
    target_semantics_response,
)


class BuildDiscoveryQueryContractTest(unittest.TestCase):
    def test_milestone_one_base_ap_uses_level_100_plus_baseline(self):
        self.assertEqual(BASE_AP, 7)
        self.assertEqual(MIN_AP, BASE_AP)

    def test_level_200_milestone_one_action_stat_bounds_are_supported(self):
        lower = BuildDiscoveryQuery(
            ap_target=MIN_AP,
            mp_target=MIN_MP,
            range_target=MIN_RANGE,
        )
        lower.validate()
        self.assertEqual(lower.target.ap, 7)
        self.assertEqual(lower.target.mp, 3)
        self.assertEqual(lower.target.range, 0)

        upper = BuildDiscoveryQuery(
            ap_target=MAX_AP,
            mp_target=MAX_MP,
            range_target=MAX_RANGE,
        )
        upper.validate()
        self.assertEqual(upper.target.ap, 12)
        self.assertEqual(upper.target.mp, 6)
        self.assertEqual(upper.target.range, 6)

    def test_query_contract_accepts_supported_elements_budgets_and_bounds(self):
        for element in ("strength", "intelligence", "chance", "agility"):
            for budget_tier in range(1, 5):
                for ap, mp, range_target in (
                    (MIN_AP, MIN_MP, MIN_RANGE),
                    (11, 6, 0),
                    (MAX_AP, MAX_MP, MAX_RANGE),
                ):
                    with self.subTest(
                        element=element,
                        budget_tier=budget_tier,
                        ap=ap,
                        mp=mp,
                        range=range_target,
                    ):
                        query = BuildDiscoveryQuery(
                            elements=(element,),
                            budget_tier=budget_tier,
                            ap_target=ap,
                            mp_target=mp,
                            range_target=range_target,
                        )
                        query.validate()
                        identity = query_cache_identity(query)
                        self.assertEqual(identity["elements"], [element])
                        self.assertEqual(identity["budgetTier"], budget_tier)
                        self.assertEqual(identity["apTarget"], ap)
                        self.assertEqual(identity["mpTarget"], mp)
                        self.assertEqual(identity["rangeTarget"], range_target)

    def test_query_contract_accepts_full_level_200_action_target_grid(self):
        seen = 0
        for element in ("strength", "intelligence", "chance", "agility"):
            for budget_tier in range(1, 5):
                for ap in range(MIN_AP, MAX_AP + 1):
                    for mp in range(MIN_MP, MAX_MP + 1):
                        for range_target in range(MIN_RANGE, MAX_RANGE + 1):
                            query = BuildDiscoveryQuery(
                                elements=(element,),
                                budget_tier=budget_tier,
                                ap_target=ap,
                                mp_target=mp,
                                range_target=range_target,
                            )
                            query.validate()
                            identity = query_cache_identity(query)
                            self.assertEqual(identity["elements"], [element])
                            self.assertEqual(identity["budgetTier"], budget_tier)
                            self.assertEqual(identity["apTarget"], ap)
                            self.assertEqual(identity["mpTarget"], mp)
                            self.assertEqual(identity["rangeTarget"], range_target)
                            seen += 1

        self.assertEqual(
            seen,
            4
            * 4
            * (MAX_AP - MIN_AP + 1)
            * (MAX_MP - MIN_MP + 1)
            * (MAX_RANGE - MIN_RANGE + 1),
        )

    def test_low_budget_forces_no_exo_policy(self):
        for budget_tier in (1, 2):
            for exo_policy in ("allow", "opti"):
                with self.subTest(budget_tier=budget_tier, exo_policy=exo_policy):
                    query = BuildDiscoveryQuery(
                        budget_tier=budget_tier,
                        exo_policy=exo_policy,
                    )
                    self.assertEqual(effective_exo_policy(query), "none")

        self.assertEqual(
            effective_exo_policy(BuildDiscoveryQuery(budget_tier=3, exo_policy="allow")),
            "allow",
        )
        self.assertEqual(
            effective_exo_policy(BuildDiscoveryQuery(budget_tier=4, exo_policy="opti")),
            "opti",
        )

    def test_base_ap_target_allows_base_ap_strategy(self):
        strategies = effective_ap_strategies_for_target(
            BuildTarget(ap=MIN_AP, mp=MIN_MP, range=MIN_RANGE),
            DEFAULT_AP_STRATEGIES,
        )

        self.assertEqual(strategies[0], BASE_AP_STRATEGIES[0])
        self.assertEqual(strategies[0].name, "base_ap")
        self.assertFalse(strategies[0].require_amulet_ap)
        self.assertFalse(strategies[0].require_ap_exo)
        self.assertEqual(strategies[0].min_secondary_ap_sources, 0)

    def test_high_ap_target_keeps_default_ap_strategy_shape(self):
        strategies = effective_ap_strategies_for_target(
            BuildTarget(ap=MIN_AP + 1, mp=MIN_MP, range=MIN_RANGE),
            DEFAULT_AP_STRATEGIES,
        )

        self.assertEqual(strategies, DEFAULT_AP_STRATEGIES)

    def test_target_semantics_are_minimum_with_hard_caps(self):
        semantics = target_semantics_response()
        self.assertEqual(semantics["type"], "minimum_with_hard_caps")
        self.assertEqual(semantics["targets"], {"AP": "minimum", "MP": "minimum", "Range": "minimum"})
        self.assertEqual(semantics["caps"], {"AP": MAX_AP, "MP": MAX_MP, "Range": MAX_RANGE})
        self.assertEqual(semantics["surplusScoring"], "light_reward_with_cap")

    def test_no_build_result_warns_for_max_no_exo_constraints(self):
        warnings = result_warnings(
            BuildDiscoveryQuery(
                budget_tier=1,
                exo_policy="none",
                ap_target=MAX_AP,
                mp_target=MAX_MP,
                range_target=MAX_RANGE,
            ),
            [],
        )

        self.assertTrue(any("No builds found for max AP/MP/Range" in warning for warning in warnings))

    def test_rejects_action_stat_targets_outside_level_200_bounds(self):
        invalid_queries = (
            BuildDiscoveryQuery(ap_target=MIN_AP - 1),
            BuildDiscoveryQuery(mp_target=MIN_MP - 1),
            BuildDiscoveryQuery(range_target=MIN_RANGE - 1),
            BuildDiscoveryQuery(ap_target=MAX_AP + 1),
            BuildDiscoveryQuery(mp_target=MAX_MP + 1),
            BuildDiscoveryQuery(range_target=MAX_RANGE + 1),
        )

        for query in invalid_queries:
            with self.subTest(query=query):
                with self.assertRaises(ValueError):
                    query.validate()

    def test_milestone_one_scope_rejects_non_iop_non_200_and_multi_element(self):
        invalid_queries = (
            BuildDiscoveryQuery(class_name="Cra"),
            BuildDiscoveryQuery(level=199),
            BuildDiscoveryQuery(elements=("strength", "chance")),
        )

        for query in invalid_queries:
            with self.subTest(query=query):
                with self.assertRaises(ValueError):
                    query.validate()


if __name__ == "__main__":
    unittest.main()
