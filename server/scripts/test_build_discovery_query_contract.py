import sys
import unittest
from argparse import Namespace
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
    active_profile_item_score,
    active_stat_weights,
    base_stats_for_primary_allocation,
    build_query_from_cli_args,
    build_discovery_response,
    base_ap_for_level,
    candidate_pool_for_slot,
    configure_damage_profile,
    find_diverse_builds,
    effective_ap_strategies_for_target,
    effective_exo_policy,
    indexed_candidate_item_ids,
    normalize_range_target,
    normal_gear_bucket_names_for_target,
    load_items,
    optional_empty_slot,
    optional_slot_choice,
    parse_optional_range_target,
    query_cache_identity,
    result_warnings,
    target_level_context,
    target_semantics_response,
    wisdom_weight_for_level,
)


class BuildDiscoveryQueryContractTest(unittest.TestCase):
    def test_milestone_one_base_ap_uses_level_100_plus_baseline(self):
        self.assertEqual(BASE_AP, 7)
        self.assertEqual(MIN_AP, BASE_AP)
        self.assertEqual(base_ap_for_level(1), 6)
        self.assertEqual(base_ap_for_level(99), 6)
        self.assertEqual(base_ap_for_level(100), 7)
        self.assertEqual(base_ap_for_level(200), 7)

    def test_base_allocation_can_use_explicit_target_level(self):
        with target_level_context(200):
            stats = base_stats_for_primary_allocation(100, "Strength", target_level=50)

        self.assertEqual(stats["Strength"], 200)
        self.assertEqual(stats["Vitality"], 245)
        with target_level_context(200):
            with self.assertRaisesRegex(ValueError, "exceeds available points"):
                base_stats_for_primary_allocation(300, "Strength", target_level=50)

    def test_wisdom_weight_is_flat_before_level_200(self):
        self.assertEqual(wisdom_weight_for_level(1), wisdom_weight_for_level(100))
        self.assertEqual(wisdom_weight_for_level(100), wisdom_weight_for_level(199))
        self.assertGreater(wisdom_weight_for_level(199), wisdom_weight_for_level(200))
        self.assertEqual(wisdom_weight_for_level(200), 0.0)

    def test_active_stat_weights_use_target_level_wisdom_value(self):
        with target_level_context(50):
            low_level_weight = active_stat_weights()["Wisdom"]
        with target_level_context(200):
            level_200_weight = active_stat_weights()["Wisdom"]

        self.assertGreater(low_level_weight, level_200_weight)
        self.assertEqual(level_200_weight, 0.0)

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
        self.assertFalse(query.target.range_required)
        self.assertIsNone(query_cache_identity(query)["rangeTarget"])

    def test_cli_query_args_include_level_and_optional_range(self):
        args = Namespace(
            level=80,
            element="agility",
            target_ap=10,
            target_mp=5,
            target_range=None,
            budget_tier=2,
            exo_policy="none",
            locked_item_id=["locked"],
            avoided_item_id=["avoided"],
            limit=1,
            top_k=25,
            beam_width=100,
            per_signature_cap=10,
            relevant_set_limit=40,
            max_shared_items=12,
            damage_survivability_preset=3,
            generic_damage_weight=0.4,
            weapon_damage_weight=0.1,
        )

        query = build_query_from_cli_args(args)

        query.validate()
        self.assertEqual(query.level, 80)
        self.assertEqual(query.elements, ("agility",))
        self.assertEqual(query.ap_target, 10)
        self.assertEqual(query.mp_target, 5)
        self.assertIsNone(query.range_target)
        self.assertEqual(query.locked_item_ids, ("locked",))
        self.assertEqual(query.avoided_item_ids, ("avoided",))

    def test_cli_range_parser_accepts_any_or_numeric(self):
        self.assertIsNone(parse_optional_range_target("none"))
        self.assertIsNone(parse_optional_range_target("any"))
        self.assertEqual(parse_optional_range_target("3"), 3)

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

    def test_load_items_scores_by_default_but_can_skip_prototype_scoring(self):
        candidate = {
            "dofusID": "candidate",
            "level": 50,
            "itemType": "Hat",
            "_stats": {"Strength": 10},
            "conditions": {"conditions": {}, "customConditions": {}},
        }
        target = BuildDiscoveryQuery(level=50, ap_target=6, mp_target=3).target

        with patch("oneoff.build_discovery_prototype.load_all_item_records", return_value=(candidate,)), patch(
            "oneoff.build_discovery_prototype.indexed_candidate_item_ids", return_value=None
        ), patch("oneoff.build_discovery_prototype.active_profile_item_score", return_value=123) as score_mock:
            load_items(target, budget_tier=1)
            self.assertEqual(candidate["_score"], 123)
            score_mock.reset_mock()
            candidate["_score"] = -456
            load_items(target, budget_tier=1, score_items=False)

        score_mock.assert_not_called()
        self.assertEqual(candidate["_score"], -456)

    def test_active_profile_item_score_caches_per_damage_profile(self):
        item = {
            "dofusID": "elemental",
            "stats": [{"stat": "Strength", "maxStat": 100}],
            "buffs": [],
        }

        configure_damage_profile("strength")
        strength_score = active_profile_item_score(item)
        configure_damage_profile("intelligence")
        intelligence_score = active_profile_item_score(item)
        configure_damage_profile("strength")

        self.assertNotEqual(strength_score, intelligence_score)
        self.assertEqual(item["_score_by_profile"]["strength"], strength_score)
        self.assertEqual(item["_score_by_profile"]["intelligence"], intelligence_score)
        self.assertEqual(active_profile_item_score(item), strength_score)

    def test_indexed_candidates_include_previous_normal_gear_bucket(self):
        index = {
            "levelBuckets": [
                {"name": "1-99", "minLevel": 1, "maxLevel": 99},
                {"name": "100-149", "minLevel": 100, "maxLevel": 149},
                {"name": "150-179", "minLevel": 150, "maxLevel": 179},
                {"name": "180-200", "minLevel": 180, "maxLevel": 200},
            ],
            "indexes": {
                "evergreenItemIds": ["gelano"],
                "petMountIds": ["mount"],
                "normalGearByLevelBucket": {
                    "150-179": ["previous-bucket-gear"],
                    "180-200": ["target-bucket-gear"],
                },
                "dofusTrophyPrysmaraditeByLevelBucket": {
                    "100-149": ["shaker"],
                    "180-200": ["sylvan"],
                },
            },
        }

        with patch("oneoff.build_discovery_prototype.load_build_discovery_index", return_value=index):
            self.assertEqual(
                normal_gear_bucket_names_for_target(180),
                ("180-200", "150-179"),
            )
            item_ids = indexed_candidate_item_ids(180)

        self.assertIn("previous-bucket-gear", item_ids)
        self.assertIn("target-bucket-gear", item_ids)
        self.assertIn("gelano", item_ids)
        self.assertIn("mount", item_ids)
        self.assertIn("shaker", item_ids)
        self.assertIn("sylvan", item_ids)

    def test_pet_slot_is_optional_only_when_no_candidates_exist(self):
        self.assertTrue(optional_empty_slot("pet", {"pet": []}))
        self.assertTrue(optional_empty_slot("dofus_1", {"dofus_1": []}, target_level=20))
        self.assertFalse(optional_empty_slot("pet", {"pet": [{"dofusID": "mount"}]}))
        self.assertFalse(optional_empty_slot("dofus_1", {"dofus_1": [{"dofusID": "trophy"}]}, target_level=20))
        self.assertFalse(optional_empty_slot("hat", {"hat": []}))
        self.assertTrue(optional_empty_slot("hat", {"hat": []}, target_level=1))
        self.assertTrue(optional_empty_slot("ring_1", {"ring_1": []}, target_level=19))
        self.assertFalse(optional_empty_slot("hat", {"hat": []}, target_level=20))
        self.assertTrue(optional_slot_choice("ring_2", target_level=1))
        self.assertFalse(optional_slot_choice("ring_2", target_level=20))

    def test_low_level_relevant_set_items_are_kept_in_candidate_pool(self):
        set_ring = {
            "dofusID": "set-ring",
            "level": 100,
            "itemType": "Ring",
            "setID": "set-1",
            "_stats": {"Strength": 35, "Vitality": 60},
            "_score": 75,
        }
        ap_ring = {
            "dofusID": "ap-ring",
            "level": 60,
            "itemType": "Ring",
            "setID": None,
            "_stats": {"AP": 1},
            "_score": 12,
        }

        pool = candidate_pool_for_slot(
            ("Ring",),
            [set_ring, ap_ring],
            {"set-1"},
            top_k=5,
            target_level=100,
        )

        self.assertEqual({item["dofusID"] for item in pool}, {"set-ring", "ap-ring"})

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

    def test_sub_endgame_ap_target_allows_flexible_ap_sources(self):
        target = BuildDiscoveryQuery(level=50, ap_target=7, mp_target=3).target

        strategies = effective_ap_strategies_for_target(target, DEFAULT_AP_STRATEGIES)

        self.assertEqual(strategies[0].name, "level_diversity_flexible_ap")
        self.assertFalse(strategies[0].require_amulet_ap)
        self.assertFalse(strategies[0].require_ap_exo)

    def test_level_180_transition_target_allows_flexible_ap_sources(self):
        target = BuildDiscoveryQuery(level=180, ap_target=12, mp_target=5, range_target=3).target

        strategies = effective_ap_strategies_for_target(target, DEFAULT_AP_STRATEGIES)

        self.assertEqual(strategies[0].name, "level_diversity_flexible_ap")
        self.assertFalse(strategies[0].require_amulet_ap)
        self.assertFalse(strategies[0].require_ap_exo)

    def test_target_semantics_are_minimum_with_hard_caps(self):
        semantics = target_semantics_response()
        self.assertEqual(semantics["type"], "minimum_with_hard_caps")
        self.assertEqual(
            semantics["targets"],
            {"AP": "minimum", "MP": "minimum", "Range": "minimum_when_requested"},
        )
        self.assertEqual(semantics["minimums"]["AP"], {"1-99": 6, "100-200": 7})
        self.assertEqual(semantics["minimums"]["RangeNone"], "unconstrained_lower_bound")
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
