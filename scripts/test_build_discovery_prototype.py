import unittest
from pathlib import Path
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

import oneoff.build_discovery_prototype as build_discovery_prototype
from oneoff.build_discovery_prototype import (
    BuildState,
    BuildTarget,
    ACTION_STAT_SOURCE_LIMIT,
    ACTION_STAT_SOURCE_MIN_LEVEL,
    DOFUS_AP_SOURCE_LIMIT,
    DOFUS_ACTION_STAT_SOURCE_LIMIT,
    DOFUS_ZERO_SCORE_FILLER_LIMIT,
    RELEVANT_SET_ITEM_MIN_LEVEL,
    ApStrategy,
    DEFAULT_AP_STRATEGIES,
    add_item_to_state,
    ap_strategy_matches,
    approach_item_ids,
    apply_missing_exos,
    candidate_pool_for_slot,
    diversify_builds,
    dominates_item,
    db_item_dofus_id,
    exo_search_target,
    exo_natural_cap_target,
    final_score_state,
    find_diverse_builds,
    has_negative_action_stat,
    has_ap_set_bonus,
    has_ap_weapon,
    prune_dominated_items,
    score_stats,
    score_state,
    secondary_ap_source_count,
    state_weapon_damage,
)


class BuildDiscoveryPrototypeTest(unittest.TestCase):
    def test_exo_search_target_uses_one_lower_action_stat_targets(self):
        target = exo_search_target(BuildTarget(ap=11, mp=6, range=4))

        self.assertEqual(target.ap, 10)
        self.assertEqual(target.mp, 5)
        self.assertEqual(target.range, 3)

    def test_db_item_dofus_id_uses_mount_id_for_mounts(self):
        class Item:
            dofus_db_id = None
            dofus_db_mount_id = "33008"

        self.assertEqual(db_item_dofus_id(Item()), "33008")

    def test_exo_natural_cap_target_reserves_ap_exo(self):
        target = exo_natural_cap_target(BuildTarget(ap=11, mp=6, range=4))

        self.assertEqual(target.ap, 10)
        self.assertEqual(target.mp, 6)
        self.assertEqual(target.range, 4)

    def test_score_state_treats_mp_and_range_as_small_feasibility_hints(self):
        target = BuildTarget(ap=7, mp=6, range=4)
        baseline = BuildState()
        with_mp_range = BuildState()
        with_mp_range.stats["MP"] = 6
        with_mp_range.stats["Range"] = 4

        self.assertEqual(score_state(with_mp_range, {}, target) - score_state(baseline, {}, target), 325)

    def test_final_score_adds_generic_damage_to_weighted_stats(self):
        state = BuildState()
        state.stats["Strength"] = 500
        state.stats["Power"] = 100
        state.stats["Critical Damage"] = 20

        self.assertGreater(final_score_state(state), score_stats(state.stats))

    def test_percent_resistances_are_equal_and_above_strength(self):
        resistance_weights = [
            build_discovery_prototype.STAT_WEIGHTS["% Earth Resistance"],
            build_discovery_prototype.STAT_WEIGHTS["% Neutral Resistance"],
            build_discovery_prototype.STAT_WEIGHTS["% Fire Resistance"],
            build_discovery_prototype.STAT_WEIGHTS["% Water Resistance"],
            build_discovery_prototype.STAT_WEIGHTS["% Air Resistance"],
        ]

        self.assertEqual(len(set(resistance_weights)), 1)
        self.assertGreater(resistance_weights[0], build_discovery_prototype.STAT_WEIGHTS["Strength"])

    def test_weapon_damage_is_optional_so_stat_sticks_are_not_penalized(self):
        stat_stick = BuildState()
        damaging_weapon = BuildState()
        damaging_weapon.slots["weapon"] = {
            "dofusID": "weapon",
            "_stats": {},
            "weaponStats": {
                "baseCritChance": 0,
                "critBonusDamage": 0,
                "weaponEffects": [
                    {
                        "effectType": "EARTH_DAMAGE",
                        "minDamage": 30,
                        "maxDamage": 30,
                    }
                ],
            },
        }

        self.assertEqual(state_weapon_damage(stat_stick), 0)
        self.assertGreater(state_weapon_damage(damaging_weapon), 0)
        self.assertEqual(
            final_score_state(damaging_weapon, weapon_damage_weight=0),
            final_score_state(stat_stick, weapon_damage_weight=0),
        )

    def test_ap_strategy_counts_expected_payment_sources(self):
        state = BuildState()
        state.slots = {
            "amulet": {
                "dofusID": "amulet",
                "itemType": "Amulet",
                "_stats": {"AP": 1},
            },
            "hat": {
                "dofusID": "hat",
                "itemType": "Hat",
                "_stats": {"AP": 1},
            },
            "cloak": {
                "dofusID": "cloak",
                "itemType": "Cloak",
                "_stats": {},
            },
            "dofus_1": {
                "dofusID": "7754",
                "itemType": "Dofus",
                "_stats": {"AP": 1},
            },
        }
        state.used_item_ids = {"amulet", "hat", "cloak", "7754"}
        state.exos = {"AP": "cloak"}
        state.stats["AP"] = 11

        self.assertEqual(secondary_ap_source_count(state), 2)
        self.assertTrue(ap_strategy_matches(state, ApStrategy(name="test", require_ochre=True)))

    def test_ap_strategy_requires_ap_exo(self):
        state = BuildState()
        state.slots = {
            "amulet": {
                "dofusID": "amulet",
                "itemType": "Amulet",
                "_stats": {"AP": 1},
            },
            "hat": {
                "dofusID": "hat",
                "itemType": "Hat",
                "_stats": {"AP": 1},
            },
            "ring": {
                "dofusID": "ring",
                "itemType": "Ring",
                "_stats": {"AP": 1},
            },
        }
        state.used_item_ids = {"amulet", "hat", "ring"}
        state.stats["AP"] = 10

        self.assertFalse(ap_strategy_matches(state, ApStrategy(name="test")))

    def test_no_ochre_strategy_accepts_one_secondary_ap_source(self):
        no_ochre = next(strategy for strategy in DEFAULT_AP_STRATEGIES if strategy.name == "no_ochre")
        state = BuildState()
        state.slots = {
            "amulet": {
                "dofusID": "amulet",
                "itemType": "Amulet",
                "_stats": {"AP": 1},
            },
            "cloak": {
                "dofusID": "cloak",
                "itemType": "Cloak",
                "_stats": {},
            },
            "belt": {
                "dofusID": "belt",
                "itemType": "Belt",
                "_stats": {"AP": 1},
            },
        }
        state.used_item_ids = {"amulet", "cloak", "belt"}
        state.exos = {"AP": "cloak"}
        state.stats["AP"] = 10

        self.assertTrue(ap_strategy_matches(state, no_ochre))

    def test_set_bonus_ap_strategy_requires_set_bonus_and_rejects_ap_weapon(self):
        strategy = next(strategy for strategy in DEFAULT_AP_STRATEGIES if strategy.name == "set_bonus_ap")
        state = BuildState()
        state.slots = {
            "amulet": {
                "dofusID": "amulet",
                "itemType": "Amulet",
                "_stats": {"AP": 1},
            },
            "cloak": {
                "dofusID": "cloak",
                "itemType": "Cloak",
                "_stats": {},
            },
            "weapon": {
                "dofusID": "weapon",
                "itemType": "Shovel",
                "_stats": {"AP": 1},
            },
            "hat": {
                "dofusID": "hat",
                "itemType": "Hat",
                "_stats": {},
            },
        }
        state.used_item_ids = {"amulet", "cloak", "weapon", "hat"}
        state.exos = {"AP": "cloak"}
        state.stats["AP"] = 11

        self.assertTrue(has_ap_set_bonus(state))
        self.assertTrue(has_ap_weapon(state))
        self.assertFalse(ap_strategy_matches(state, strategy))

        state.slots["weapon"]["_stats"] = {"Strength": 80}

        self.assertFalse(has_ap_weapon(state))
        self.assertTrue(ap_strategy_matches(state, strategy))

    def test_no_set_bonus_ap_strategy_rejects_ap_set_bonus(self):
        strategy = next(strategy for strategy in DEFAULT_AP_STRATEGIES if strategy.name == "no_set_bonus_ap")
        state = BuildState()
        state.slots = {
            "amulet": {
                "dofusID": "amulet",
                "itemType": "Amulet",
                "_stats": {"AP": 1},
            },
            "cloak": {
                "dofusID": "cloak",
                "itemType": "Cloak",
                "_stats": {},
            },
            "hat": {
                "dofusID": "hat",
                "itemType": "Hat",
                "_stats": {"AP": 1},
            },
        }
        state.used_item_ids = {"amulet", "cloak", "hat"}
        state.exos = {"AP": "cloak"}
        state.stats["AP"] = 11

        self.assertFalse(ap_strategy_matches(state, strategy))

    def test_prune_dominated_items_removes_strictly_inferior_boots(self):
        weak_boots = {
            "dofusID": "weak",
            "itemType": "Boots",
            "level": 44,
            "_stats": {"MP": 1},
            "_score": 0,
        }
        strong_boots = {
            "dofusID": "strong",
            "itemType": "Boots",
            "level": 200,
            "_stats": {"MP": 1, "Strength": 80, "Vitality": 300},
            "_score": 170,
        }

        self.assertTrue(dominates_item(strong_boots, weak_boots))
        self.assertEqual(prune_dominated_items([weak_boots, strong_boots]), [strong_boots])

    def test_dominance_does_not_cross_item_types(self):
        boots = {
            "dofusID": "boots",
            "itemType": "Boots",
            "level": 200,
            "_stats": {"MP": 1, "Strength": 80},
            "_score": 80,
        }
        amulet = {
            "dofusID": "amulet",
            "itemType": "Amulet",
            "level": 200,
            "_stats": {"AP": 1, "Strength": 80},
            "_score": 80,
        }

        self.assertFalse(dominates_item(boots, amulet))

    def test_score_based_dominance_removes_bad_negative_range_boots(self):
        weak_boots = {
            "dofusID": "weak",
            "itemType": "Boots",
            "level": 41,
            "_stats": {"Strength": 40, "Range": -3},
            "_score": 52,
        }
        strong_boots = {
            "dofusID": "strong",
            "itemType": "Boots",
            "level": 200,
            "_stats": {"Strength": 90, "Vitality": 350, "MP": 1, "Range": 1},
            "_score": 347,
        }

        self.assertTrue(dominates_item(strong_boots, weak_boots))
        self.assertEqual(prune_dominated_items([weak_boots, strong_boots]), [strong_boots])

    def test_candidate_pool_keeps_relevant_set_item_that_is_individually_dominated(self):
        weak_set_ring = {
            "dofusID": "weak_set",
            "itemType": "Ring",
            "setID": "important_set",
            "level": 200,
            "_stats": {"Strength": 20},
            "_score": 20,
        }
        strong_ring = {
            "dofusID": "strong",
            "itemType": "Ring",
            "setID": None,
            "level": 200,
            "_stats": {"Strength": 80},
            "_score": 80,
        }

        self.assertTrue(dominates_item(strong_ring, weak_set_ring))
        pool = candidate_pool_for_slot(
            ("Ring",),
            [weak_set_ring, strong_ring],
            relevant_sets={"important_set"},
            top_k=1,
        )

        self.assertIn(weak_set_ring, pool)
        self.assertIn(strong_ring, pool)

    def test_candidate_pool_does_not_protect_low_level_relevant_set_item(self):
        weak_set_weapon = {
            "dofusID": "weak_set",
            "itemType": "Sword",
            "setID": "important_set",
            "level": RELEVANT_SET_ITEM_MIN_LEVEL - 1,
            "_stats": {"Strength": 20},
            "_score": 20,
        }
        strong_weapon = {
            "dofusID": "strong",
            "itemType": "Sword",
            "setID": None,
            "level": 200,
            "_stats": {"Strength": 80},
            "_score": 80,
        }

        pool = candidate_pool_for_slot(
            ("Sword",),
            [weak_set_weapon, strong_weapon],
            relevant_sets={"important_set"},
            top_k=1,
        )

        self.assertNotIn(weak_set_weapon, pool)
        self.assertIn(strong_weapon, pool)

    def test_candidate_pool_does_not_force_low_level_action_stat_gear(self):
        weak_ap_weapon = {
            "dofusID": "weak_ap",
            "itemType": "Sword",
            "setID": None,
            "level": ACTION_STAT_SOURCE_MIN_LEVEL - 1,
            "_stats": {"AP": 1},
            "_score": 0,
        }
        strong_weapon = {
            "dofusID": "strong",
            "itemType": "Sword",
            "setID": None,
            "level": 200,
            "_stats": {"Strength": 100},
            "_score": 100,
        }

        pool = candidate_pool_for_slot(
            ("Sword",),
            [weak_ap_weapon, strong_weapon],
            relevant_sets=set(),
            top_k=1,
        )

        self.assertNotIn(weak_ap_weapon, pool)
        self.assertIn(strong_weapon, pool)

    def test_candidate_pool_caps_gear_action_stat_sources(self):
        action_items = [
            {
                "dofusID": f"mp_{idx}",
                "itemType": "Boots",
                "setID": None,
                "level": ACTION_STAT_SOURCE_MIN_LEVEL + ACTION_STAT_SOURCE_LIMIT + 3 - idx,
                "_stats": {"MP": 1},
                "_score": idx,
            }
            for idx in range(ACTION_STAT_SOURCE_LIMIT + 3)
        ]
        stat_item = {
            "dofusID": "stat_item",
            "itemType": "Boots",
            "setID": None,
            "level": 150,
            "_stats": {"Strength": 100},
            "_score": 100,
        }

        pool = candidate_pool_for_slot(
            ("Boots",),
            [*action_items, stat_item],
            relevant_sets=set(),
            top_k=1,
        )

        action_count = sum(1 for item in pool if item["_stats"].get("MP", 0) > 0)
        self.assertEqual(action_count, ACTION_STAT_SOURCE_LIMIT)
        self.assertIn(stat_item, pool)

    def test_candidate_pool_caps_dofus_action_stat_sources_more_tightly(self):
        action_items = [
            {
                "dofusID": f"mp_{idx}",
                "itemType": "Trophy",
                "setID": None,
                "level": DOFUS_ACTION_STAT_SOURCE_LIMIT + 3 - idx,
                "_stats": {"MP": 1},
                "_score": idx,
            }
            for idx in range(DOFUS_ACTION_STAT_SOURCE_LIMIT + 3)
        ]
        stat_item = {
            "dofusID": "stat_item",
            "itemType": "Dofus",
            "setID": None,
            "level": 150,
            "_stats": {"Strength": 100},
            "_score": 100,
        }

        pool = candidate_pool_for_slot(
            ("Dofus", "Trophy", "Prysmaradite"),
            [*action_items, stat_item],
            relevant_sets=set(),
            top_k=1,
        )

        action_count = sum(1 for item in pool if item["_stats"].get("MP", 0) > 0)
        self.assertEqual(action_count, DOFUS_ACTION_STAT_SOURCE_LIMIT)
        self.assertIn(stat_item, pool)

    def test_candidate_pool_keeps_ochre_and_shaker_for_ap_strategies(self):
        action_items = [
            {
                "dofusID": f"ap_{idx}",
                "itemType": "Trophy",
                "setID": None,
                "level": DOFUS_AP_SOURCE_LIMIT + 3 - idx,
                "_stats": {"AP": 1},
                "_score": idx,
            }
            for idx in range(DOFUS_AP_SOURCE_LIMIT + 3)
        ]

        pool = candidate_pool_for_slot(
            ("Dofus", "Trophy", "Prysmaradite"),
            action_items,
            relevant_sets=set(),
            top_k=0,
        )

        action_count = sum(1 for item in pool if item["_stats"].get("AP", 0) > 0)
        self.assertEqual(action_count, DOFUS_AP_SOURCE_LIMIT)

    def test_candidate_pool_allows_limited_zero_score_dofus_fillers(self):
        zero_score_items = [{
            "dofusID": f"zero_{idx}",
            "itemType": "Dofus",
            "setID": None,
            "level": idx,
            "_stats": {},
            "_score": 0,
        } for idx in range(DOFUS_ZERO_SCORE_FILLER_LIMIT + 2)]
        zero_score_action_item = {
            "dofusID": "zero",
            "itemType": "Dofus",
            "setID": None,
            "level": 180,
            "_stats": {"MP": 1},
            "_score": 0,
        }
        stat_item = {
            "dofusID": "stat_item",
            "itemType": "Dofus",
            "setID": None,
            "level": 150,
            "_stats": {"Strength": 100},
            "_score": 100,
        }

        pool = candidate_pool_for_slot(
            ("Dofus", "Trophy", "Prysmaradite"),
            [*zero_score_items, zero_score_action_item, stat_item],
            relevant_sets=set(),
            top_k=2,
        )

        zero_score_filler_count = sum(
            1 for item in pool if item["_score"] == 0 and not item["_stats"]
        )
        self.assertEqual(zero_score_filler_count, DOFUS_ZERO_SCORE_FILLER_LIMIT)
        self.assertIn(stat_item, pool)

    def test_ap_set_bonus_applies_when_threshold_is_reached(self):
        sets = {
            "toy": {
                "bonuses": {
                    "2": [{"stat": "AP", "value": 1}],
                }
            }
        }
        first = {
            "dofusID": "1",
            "setID": "toy",
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }
        second = {
            "dofusID": "2",
            "setID": "toy",
            "stats": [{"stat": "Vitality", "maxStat": 100}],
        }

        state = add_item_to_state(BuildState(), "ring_1", first, sets)
        self.assertIsNotNone(state)
        self.assertEqual(state.stats["AP"], 7)

        state = add_item_to_state(state, "ring_2", second, sets)
        self.assertIsNotNone(state)
        self.assertEqual(state.stats["AP"], 8)

    def test_set_bonus_uses_exact_item_count_not_cumulative_thresholds(self):
        sets = {
            "toy": {
                "bonuses": {
                    "2": [{"stat": "AP", "value": 1}],
                    "3": [{"stat": "AP", "value": 2}],
                }
            }
        }
        items = [
            {"dofusID": "1", "setID": "toy", "stats": []},
            {"dofusID": "2", "setID": "toy", "stats": []},
            {"dofusID": "3", "setID": "toy", "stats": []},
        ]

        state = BuildState()
        for idx, item in enumerate(items):
            state = add_item_to_state(state, f"slot_{idx}", item, sets)

        self.assertEqual(state.stats["AP"], 9)

    def test_duplicate_items_are_rejected(self):
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "ring_1", item, {})
        self.assertIsNotNone(state)
        duplicate = add_item_to_state(state, "ring_2", item, {})
        self.assertIsNone(duplicate)

    def test_over_target_mp_is_rejected(self):
        state = BuildState()
        state.stats["MP"] = 6
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "MP", "maxStat": 1}],
        }

        self.assertIsNone(add_item_to_state(state, "boots", item, {}))

    def test_over_target_ap_is_rejected(self):
        state = BuildState()
        state.stats["AP"] = 11
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "AP", "maxStat": 1}],
        }

        self.assertIsNone(add_item_to_state(state, "amulet", item, {}))

    def test_search_target_can_score_lower_than_final_cap(self):
        search_target = BuildTarget(ap=10, mp=5)
        natural_cap_target = BuildTarget(ap=11, mp=6)
        state = BuildState()
        state.stats["AP"] = 10
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "AP", "maxStat": 1}],
        }

        next_state = add_item_to_state(
            state,
            "amulet",
            item,
            {},
            search_target,
            cap_target=natural_cap_target,
        )

        self.assertIsNotNone(next_state)
        self.assertEqual(next_state.stats["AP"], 11)

    def test_reserved_exo_cap_rejects_native_mp_at_final_target(self):
        search_target = BuildTarget(ap=10, mp=5)
        natural_cap_target = BuildTarget(ap=10, mp=5)
        state = BuildState()
        state.stats["MP"] = 5
        item = {
            "dofusID": "1",
            "setID": None,
            "stats": [{"stat": "MP", "maxStat": 1}],
        }

        self.assertIsNone(
            add_item_to_state(
                state,
                "ring_1",
                item,
                {},
                search_target,
                cap_target=natural_cap_target,
            )
        )

    def test_ap_exo_can_fill_missing_ap_on_completed_build(self):
        target = BuildTarget(ap=8, mp=3)
        item = {
            "dofusID": "1",
            "itemType": "Hat",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "hat", item, {}, target)
        state = apply_missing_exos(state, target)

        self.assertIsNotNone(state)
        self.assertEqual(state.stats["AP"], 8)
        self.assertEqual(state.exos, {"AP": "1"})

    def test_missing_exos_are_not_stacked_on_one_item(self):
        target = BuildTarget(ap=8, mp=4)
        item = {
            "dofusID": "1",
            "itemType": "Hat",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "hat", item, {}, target)

        self.assertIsNone(apply_missing_exos(state, target))

    def test_two_missing_ap_cannot_be_filled_by_exos(self):
        target = BuildTarget(ap=9, mp=3)
        first = {
            "dofusID": "1",
            "itemType": "Hat",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }
        second = {
            "dofusID": "2",
            "itemType": "Cloak",
            "setID": None,
            "stats": [{"stat": "Vitality", "maxStat": 100}],
        }

        state = add_item_to_state(BuildState(), "hat", first, {}, target)
        self.assertIsNotNone(state)

        state = add_item_to_state(state, "cloak", second, {}, target)
        self.assertIsNotNone(state)
        self.assertIsNone(apply_missing_exos(state, target))

    def test_exo_is_not_added_to_ineligible_item_type(self):
        target = BuildTarget(ap=8, mp=3)
        item = {
            "dofusID": "1",
            "itemType": "Dofus",
            "setID": None,
            "stats": [{"stat": "Strength", "maxStat": 50}],
        }

        state = add_item_to_state(BuildState(), "dofus_1", item, {}, target)
        state = apply_missing_exos(state, target)

        self.assertIsNone(state)

    def test_exo_is_not_added_when_item_already_gives_stat(self):
        target = BuildTarget(ap=9, mp=3)
        item = {
            "dofusID": "1",
            "itemType": "Amulet",
            "setID": None,
            "stats": [{"stat": "AP", "maxStat": 1}],
        }

        state = add_item_to_state(BuildState(), "amulet", item, {}, target)
        state = apply_missing_exos(state, target)

        self.assertIsNone(state)

    def test_negative_ap_mp_items_are_identified(self):
        self.assertTrue(
            has_negative_action_stat(
                {
                    "stats": [
                        {"stat": "Summons", "maxStat": 2},
                        {"stat": "MP", "maxStat": -1},
                    ]
                }
            )
        )
        self.assertTrue(
            has_negative_action_stat(
                {
                    "stats": [
                        {"stat": "Strength", "maxStat": 40},
                        {"stat": "Range", "maxStat": -3},
                    ]
                }
            )
        )

        self.assertFalse(has_negative_action_stat({"stats": [{"stat": "Strength", "maxStat": 80}]}))

    def test_diversify_builds_rejects_near_duplicates(self):
        first = BuildState(used_item_ids={str(i) for i in range(16)}, score=100)
        near_duplicate = BuildState(used_item_ids={str(i) for i in range(10)} | {"a", "b", "c", "d", "e", "f"}, score=90)
        different = BuildState(used_item_ids={str(i) for i in range(6)} | {"g", "h", "i", "j", "k", "l", "m", "n", "o", "p"}, score=80)

        self.assertEqual(
            diversify_builds([first, near_duplicate, different], max_shared_items=9),
            [first, different],
        )

    def test_approach_item_ids_include_completed_set_items(self):
        state = BuildState()
        state.slots = {
            "hat": {"dofusID": "hat", "setID": "set_a"},
            "cloak": {"dofusID": "cloak", "setID": "set_a"},
            "ring_1": {"dofusID": "ring", "setID": "set_a"},
            "pet": {"dofusID": "pet", "setID": None},
        }
        state.set_counts = {"set_a": 3}

        self.assertEqual(approach_item_ids(state), {"hat", "cloak", "ring"})

    def test_find_diverse_builds_selects_from_one_ranked_search_pass(self):
        def state_with_items(prefix: str, score: int, shared: set[str] | None = None) -> BuildState:
            shared_ids = shared or set()
            item_ids = set(shared_ids) | {
                f"{prefix}_{idx}" for idx in range(16 - len(shared_ids))
            }
            state = BuildState(used_item_ids=item_ids, score=score, ap_strategy=prefix)
            state.slots = {
                "amulet": {"dofusID": f"{prefix}_amulet", "setID": None, "_stats": {}},
                "belt": {"dofusID": f"{prefix}_belt", "setID": None, "_stats": {}},
                "weapon": {"dofusID": f"{prefix}_weapon", "setID": None, "_stats": {}},
                "shield": {"dofusID": f"{prefix}_shield", "setID": None, "_stats": {}},
                "hat": {"dofusID": f"{prefix}_hat", "setID": None, "_stats": {}},
                "cloak": {"dofusID": f"{prefix}_cloak", "setID": None, "_stats": {}},
            }
            return state

        first = state_with_items("first", 100)
        too_similar = state_with_items("similar", 90, shared=set(first.used_item_ids) - {"first_15"})
        different = state_with_items("different", 80)

        with patch.object(
            build_discovery_prototype,
            "find_builds",
            return_value=[first, too_similar, different],
        ) as find_builds:
            builds = find_diverse_builds(
                limit=2,
                top_k=1,
                beam_width=1,
                per_signature_cap=1,
                relevant_set_limit=1,
                max_shared_items=9,
            )

        find_builds.assert_called_once()
        self.assertEqual(builds, [first, different])


if __name__ == "__main__":
    unittest.main()
