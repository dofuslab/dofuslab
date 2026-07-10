import sys
import unittest
from pathlib import Path
from unittest.mock import patch

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
    BuildState,
    DEFAULT_AP_STRATEGIES,
    BuildTarget,
    build_discovery_response,
    base_ap_for_level,
    find_diverse_builds,
    effective_ap_strategies_for_target,
    effective_exo_policy,
    normalize_range_target,
    load_items,
    query_cache_identity,
    result_warnings,
    target_level_context,
    target_semantics_response,
)


class BuildDiscoveryQueryContractTest(unittest.TestCase):
    def test_milestone_one_base_ap_uses_level_100_plus_baseline(self):
        self.assertEqual(BASE_AP, 7)
        self.assertEqual(MIN_AP, BASE_AP)
        self.assertEqual(base_ap_for_level(1), 6)
        self.assertEqual(base_ap_for_level(99), 6)
        self.assertEqual(base_ap_for_level(100), 7)
        self.assertEqual(base_ap_for_level(200), 7)

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

    def test_query_contract_accepts_level_diversity_bounds_for_iop(self):
        examples = (
            (1, 6, 3, 0),
            (50, 6, 3, 0),
            (99, 6, 6, 6),
            (100, 7, 3, 0),
            (150, 12, 6, 6),
            (200, 12, 6, 6),
        )

        for level, ap, mp, range_target in examples:
            with self.subTest(level=level, ap=ap, mp=mp, range=range_target):
                query = BuildDiscoveryQuery(
                    level=level,
                    ap_target=ap,
                    mp_target=mp,
                    range_target=range_target,
                )
                query.validate()
                self.assertEqual(query.target.min_ap, base_ap_for_level(level))
                identity = query_cache_identity(query)
                self.assertEqual(identity["level"], level)
                self.assertEqual(identity["apTarget"], ap)

    def test_query_contract_accepts_none_range_as_no_explicit_range_floor(self):
        query = BuildDiscoveryQuery(level=50, ap_target=6, mp_target=3, range_target=None)

        query.validate()

        self.assertIsNone(query.range_target)
        self.assertEqual(normalize_range_target(query.range_target), MIN_RANGE)
        self.assertEqual(query.target.range, MIN_RANGE)
        self.assertIsNone(query_cache_identity(query)["rangeTarget"])

    def test_level_context_updates_build_state_base_ap(self):
        self.assertEqual(BuildState().stats["AP"], 7)
        with target_level_context(50):
            self.assertEqual(BuildState().stats["AP"], 6)
        self.assertEqual(BuildState().stats["AP"], 7)

    def test_non_200_response_calls_solver_with_level_aware_target(self):
        query = BuildDiscoveryQuery(level=50, ap_target=6, mp_target=3, range_target=None)
        query.validate()

        with patch("oneoff.build_discovery_prototype.find_diverse_builds", return_value=[]) as find_builds_mock:
            with patch("oneoff.build_discovery_prototype.load_sets", return_value={}):
                response = build_discovery_response(query, use_cache=False)

        called_target = find_builds_mock.call_args.kwargs["target"]
        self.assertEqual(called_target.level, 50)
        self.assertEqual(called_target.min_ap, 6)
        self.assertEqual(response["target"], {"level": 50, "AP": 6, "MP": 3, "Range": 0})

    def test_load_items_filters_candidates_by_target_level(self):
        low_level_item = {
            "dofusID": "low",
            "level": 50,
            "itemType": "Hat",
            "_stats": {},
            "_score": 1,
            "conditions": {"conditions": {}, "customConditions": {}},
        }
        high_level_item = {
            "dofusID": "high",
            "level": 200,
            "itemType": "Hat",
            "_stats": {},
            "_score": 1,
            "conditions": {"conditions": {}, "customConditions": {}},
        }
        target = BuildDiscoveryQuery(level=50, ap_target=6, mp_target=3).target

        with patch(
            "oneoff.build_discovery_prototype.load_all_item_records",
            return_value=(low_level_item, high_level_item),
        ):
            with patch("oneoff.build_discovery_prototype.indexed_candidate_item_ids", return_value=None) as index_mock:
                items = load_items(target, budget_tier=1)

        index_mock.assert_called_once_with(50)
        self.assertEqual([item["dofusID"] for item in items], ["low"])

    def test_query_contract_rejects_ap_below_level_baseline(self):
        invalid_queries = (
            BuildDiscoveryQuery(level=1, ap_target=5),
            BuildDiscoveryQuery(level=99, ap_target=5),
            BuildDiscoveryQuery(level=100, ap_target=6),
            BuildDiscoveryQuery(level=200, ap_target=6),
        )

        for query in invalid_queries:
            with self.subTest(level=query.level, ap=query.ap_target):
                with self.assertRaises(ValueError):
                    query.validate()

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

    def test_higher_budget_search_falls_back_to_lower_budget_on_empty_result(self):
        fallback_state = BuildState()
        fallback_state.used_item_ids.add("tier-one-witness")

        with patch(
            "oneoff.build_discovery_prototype.find_builds",
            side_effect=[[], [fallback_state]],
        ) as find_builds_mock:
            builds = find_diverse_builds(
                limit=1,
                top_k=1,
                beam_width=1,
                per_signature_cap=1,
                relevant_set_limit=1,
                budget_tier=2,
                exo_policy="none",
            )

        self.assertEqual(builds, [fallback_state])
        self.assertEqual(
            [call.kwargs["budget_tier"] for call in find_builds_mock.call_args_list],
            [2, 1],
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
        self.assertEqual(semantics["minimums"]["AP"], {"1-99": 6, "100-200": 7})
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

    def test_scope_rejects_non_iop_invalid_levels_and_multi_element(self):
        invalid_queries = (
            BuildDiscoveryQuery(class_name="Cra"),
            BuildDiscoveryQuery(level=0),
            BuildDiscoveryQuery(level=201),
            BuildDiscoveryQuery(elements=("strength", "chance")),
        )

        for query in invalid_queries:
            with self.subTest(query=query):
                with self.assertRaises(ValueError):
                    query.validate()


if __name__ == "__main__":
    unittest.main()
