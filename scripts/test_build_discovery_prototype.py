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
    survivability_score,
    candidate_pool_for_slot,
    diversify_builds,
    dominates_item,
    db_item_dofus_id,
    effective_scoring_stats,
    exo_search_target,
    exo_natural_cap_target,
    final_score_state,
    final_utility_score,
    find_diverse_builds,
    has_negative_action_stat,
    has_ap_set_bonus,
    has_ap_weapon,
    generate_set_core_packages,
    package_seed_states,
    packages_compatible,
    prune_dominated_items,
    score_stats,
    score_state,
    secondary_ap_source_count,
    strength_spell_damage,
    strength_spell_damage_profile,
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

    def test_final_score_uses_generic_damage_profile(self):
        low_damage = BuildState()
        high_damage = BuildState()
        high_damage.stats["Strength"] = 500
        high_damage.stats["Power"] = 100
        high_damage.stats["Critical Damage"] = 20

        self.assertGreater(final_score_state(high_damage), final_score_state(low_damage))

    def test_strength_spell_damage_profile_falls_back_to_generic_profile(self):
        strength_spell_damage_profile.cache_clear()
        with patch("builtins.__import__", side_effect=ImportError):
            profile = strength_spell_damage_profile()
        strength_spell_damage_profile.cache_clear()

        self.assertEqual(tuple(build_discovery_prototype.GENERIC_STRENGTH_DAMAGE_PROFILE), profile)
        self.assertGreater(strength_spell_damage({"Strength": 400, "Earth Damage": 20}), 0)

    def test_final_score_uses_item_damage_buffs_as_expected_stats(self):
        baseline = BuildState()
        crimson = BuildState()
        crimson.slots["dofus_1"] = {
            "dofusID": "694",
            "buffs": [{"stat": "% Final Damage", "incrementBy": 1, "maxStacks": 10}],
        }

        self.assertGreater(final_score_state(crimson), final_score_state(baseline))
        self.assertEqual(effective_scoring_stats(crimson)["% Final Damage"], 4)

    def test_special_effects_adjust_scoring_stats_without_changing_real_stats(self):
        ochre = BuildState()
        ochre.slots["dofus_1"] = {"dofusID": "7754"}

        self.assertEqual(ochre.stats.get("Dodge", 0), 0)
        self.assertEqual(ochre.stats.get("AP"), build_discovery_prototype.BASE_AP)
        self.assertEqual(effective_scoring_stats(ochre)["Dodge"], 10)
        self.assertEqual(effective_scoring_stats(ochre)["Temporary AP"], 1)

    def test_jahash_effect_improves_survivability_scoring(self):
        baseline = BuildState()
        jahash = BuildState()
        jahash.slots["cloak"] = {"dofusID": "20362"}

        self.assertGreater(
            survivability_score(effective_scoring_stats(jahash)),
            survivability_score(effective_scoring_stats(baseline)),
        )

    def test_strength_iop_profile_weights_damage_above_survivability(self):
        self.assertGreater(
            build_discovery_prototype.GENERIC_DAMAGE_WEIGHT,
            build_discovery_prototype.SURVIVABILITY_SCORE_WEIGHT,
        )
        self.assertEqual(build_discovery_prototype.GENERIC_DAMAGE_WEIGHT, 0.45)
        self.assertEqual(build_discovery_prototype.WEAPON_DAMAGE_WEIGHT, 0.20)
        self.assertEqual(build_discovery_prototype.SURVIVABILITY_SCORE_WEIGHT, 0.03)

    def test_pet_slot_allows_pets_petsmounts_and_mounts(self):
        pet_slot_types = dict(build_discovery_prototype.SLOTS)["pet"]

        self.assertEqual(pet_slot_types, ("Pet", "Petsmount", "Mount"))

    def test_final_utility_score_excludes_damage_stats(self):
        utility_only = {"Wisdom": 100, "Dodge": 10}
        with_damage = {
            **utility_only,
            "Strength": 500,
            "Power": 100,
            "Earth Damage": 80,
            "Critical": 40,
            "Critical Damage": 100,
            "% Final Damage": 10,
        }

        self.assertEqual(final_utility_score(with_damage), final_utility_score(utility_only))
        self.assertGreater(score_stats(with_damage), score_stats(utility_only))

    def test_final_utility_score_excludes_survivability_stats(self):
        survivability_stats = {
            "Vitality": 1000,
            "% Earth Resistance": 50,
            "Earth Resistance": 40,
            "Critical Resistance": 40,
            "Pushback Resistance": 40,
            "% Ranged Resistance": 5,
            "% Melee Resistance": 5,
        }

        self.assertEqual(final_utility_score(survivability_stats), 0)

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

    def test_missing_combat_utility_stats_have_nonzero_weights(self):
        expected_weighted_stats = [
            "% Final Damage",
            "% Spell Damage",
            "% Weapon Damage",
            "% Melee Damage",
            "% Ranged Damage",
            "Initiative",
            "Prospecting",
            "AP Parry",
            "MP Parry",
            "Lock",
            "Dodge",
            "Neutral Resistance",
            "Earth Resistance",
            "Fire Resistance",
            "Water Resistance",
            "Air Resistance",
            "Critical Resistance",
            "Pushback Resistance",
            "% Ranged Resistance",
            "% Melee Resistance",
        ]

        for stat in expected_weighted_stats:
            self.assertGreater(build_discovery_prototype.STAT_WEIGHTS[stat], 0, stat)

    def test_percent_final_damage_is_valued_above_strength(self):
        self.assertGreater(
            build_discovery_prototype.STAT_WEIGHTS["% Final Damage"],
            build_discovery_prototype.STAT_WEIGHTS["Strength"],
        )
        self.assertLess(build_discovery_prototype.STAT_WEIGHTS["% Final Damage"], 10)

    def test_prospecting_is_tiny_but_nonzero(self):
        self.assertGreater(build_discovery_prototype.STAT_WEIGHTS["Prospecting"], 0)
        self.assertLess(build_discovery_prototype.STAT_WEIGHTS["Prospecting"], 0.05)

    def test_dodge_is_valued_above_lock_for_generic_pvm(self):
        self.assertGreater(
            build_discovery_prototype.STAT_WEIGHTS["Dodge"],
            build_discovery_prototype.STAT_WEIGHTS["Lock"],
        )

    def test_generic_pvm_pushback_exposure_is_low(self):
        self.assertLess(build_discovery_prototype.GENERIC_INCOMING_PUSHBACK_RATE, 0.05)

    def test_generic_pvm_survivability_weights_weaker_elements_more(self):
        self.assertEqual(
            build_discovery_prototype.SORTED_ELEMENT_EHP_WEIGHTS,
            (0.4, 0.25, 0.15, 0.1, 0.1),
        )
        self.assertAlmostEqual(sum(build_discovery_prototype.SORTED_ELEMENT_EHP_WEIGHTS), 1.0)

    def test_strength_profile_does_not_directly_value_off_element_damage(self):
        self.assertGreater(build_discovery_prototype.STAT_WEIGHTS["Earth Damage"], 0)
        self.assertGreater(build_discovery_prototype.STAT_WEIGHTS["Neutral Damage"], 0)
        self.assertEqual(build_discovery_prototype.STAT_WEIGHTS["Fire Damage"], 0)
        self.assertEqual(build_discovery_prototype.STAT_WEIGHTS["Water Damage"], 0)
        self.assertEqual(build_discovery_prototype.STAT_WEIGHTS["Air Damage"], 0)

    def test_score_stats_caps_hard_capped_stats(self):
        capped = score_stats({"% Earth Resistance": 50, "AP": 12, "MP": 6, "Range": 6})
        over_cap = score_stats({"% Earth Resistance": 80, "AP": 13, "MP": 7, "Range": 8})

        self.assertEqual(over_cap, capped)

    def test_score_stats_does_not_cap_uncapped_stats(self):
        self.assertGreater(score_stats({"Strength": 80}), score_stats({"Strength": 50}))

    def test_survivability_score_weights_sorted_element_ehp(self):
        stats = {
            "Vitality": 4000,
            "% Neutral Resistance": 0,
            "% Earth Resistance": 40,
            "% Fire Resistance": 40,
            "% Water Resistance": 40,
            "% Air Resistance": 40,
        }
        sorted_effective_hp_values = sorted(build_discovery_prototype.elemental_effective_hp(stats))
        expected_score = sum(
            ehp * weight
            for ehp, weight in zip(
                sorted_effective_hp_values,
                build_discovery_prototype.SORTED_ELEMENT_EHP_WEIGHTS,
            )
        ) * build_discovery_prototype.SURVIVABILITY_SCORE_WEIGHT

        self.assertAlmostEqual(survivability_score(stats), expected_score)

    def test_survivability_score_caps_each_element(self):
        capped = {
            "Vitality": 4000,
            "% Neutral Resistance": 50,
            "% Earth Resistance": 50,
            "% Fire Resistance": 50,
            "% Water Resistance": 50,
            "% Air Resistance": 50,
        }
        over_cap = {
            "Vitality": 4000,
            "% Neutral Resistance": 80,
            "% Earth Resistance": 80,
            "% Fire Resistance": 80,
            "% Water Resistance": 80,
            "% Air Resistance": 80,
        }

        self.assertEqual(survivability_score(over_cap), survivability_score(capped))

    def test_survivability_score_has_increasing_resistance_marginal_value(self):
        baseline = {
            "Vitality": 4000,
            "% Neutral Resistance": 0,
            "% Earth Resistance": 0,
            "% Fire Resistance": 0,
            "% Water Resistance": 0,
            "% Air Resistance": 0,
        }
        ten_res = {stat: (10 if stat.startswith("%") else value) for stat, value in baseline.items()}
        forty_res = {stat: (40 if stat.startswith("%") else value) for stat, value in baseline.items()}
        fifty_res = {stat: (50 if stat.startswith("%") else value) for stat, value in baseline.items()}

        low_gain = survivability_score(ten_res) - survivability_score(baseline)
        high_gain = survivability_score(fifty_res) - survivability_score(forty_res)

        self.assertGreater(high_gain, low_gain)

    def test_survivability_score_includes_generic_defensive_resistances(self):
        baseline = {"Vitality": 4000}
        defended = {
            "Vitality": 4000,
            "Neutral Resistance": 30,
            "Earth Resistance": 30,
            "Fire Resistance": 30,
            "Water Resistance": 30,
            "Air Resistance": 30,
            "Critical Resistance": 50,
            "Pushback Resistance": 50,
            "% Ranged Resistance": 5,
            "% Melee Resistance": 5,
        }

        self.assertGreater(survivability_score(defended), survivability_score(baseline))

    def test_weapon_damage_is_optional_so_stat_sticks_are_not_penalized(self):
        stat_stick = BuildState()
        damaging_weapon = BuildState()
        damaging_weapon.slots["weapon"] = {
            "dofusID": "weapon",
            "_stats": {},
            "weaponStats": {
                "apCost": 4,
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

    def test_weapon_damage_is_normalized_by_ap_cost(self):
        cheap_weapon = BuildState()
        expensive_weapon = BuildState()
        cheap_weapon.slots["weapon"] = {
            "dofusID": "cheap_weapon",
            "_stats": {},
            "weaponStats": {
                "apCost": 3,
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
        expensive_weapon.slots["weapon"] = {
            "dofusID": "expensive_weapon",
            "_stats": {},
            "weaponStats": {
                "apCost": 6,
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

        self.assertEqual(
            state_weapon_damage(cheap_weapon),
            state_weapon_damage(expensive_weapon) * 2,
        )

    def test_weapon_damage_uses_critical_weighted_average(self):
        noncrit_weapon = BuildState()
        crit_weapon = BuildState()
        for state in (noncrit_weapon, crit_weapon):
            state.stats["Critical Damage"] = 50
            state.slots["weapon"] = {
                "dofusID": "weapon",
                "_stats": {},
                "weaponStats": {
                    "apCost": 4,
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
        crit_weapon.stats["Critical"] = 100

        self.assertGreater(state_weapon_damage(crit_weapon), state_weapon_damage(noncrit_weapon))

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

    def test_candidate_pool_keeps_pet_damage_alternatives(self):
        crit_pet = {
            "dofusID": "crit_pet",
            "itemType": "Pet",
            "setID": None,
            "level": 20,
            "_stats": {"Strength": 120, "Critical Damage": 40},
            "_score": 280,
        }
        earth_damage_pet = {
            "dofusID": "earth_damage_pet",
            "itemType": "Pet",
            "setID": None,
            "level": 20,
            "_stats": {"Strength": 120, "Earth Damage": 20},
            "_score": 200,
        }

        pool = candidate_pool_for_slot(
            ("Pet", "Petsmount", "Mount"),
            [crit_pet, earth_damage_pet],
            relevant_sets=set(),
            top_k=10,
        )

        self.assertIn(crit_pet, pool)
        self.assertIn(earth_damage_pet, pool)

    def test_candidate_pool_always_keeps_ochre(self):
        high_score_dofus = {
            "dofusID": "high_score",
            "itemType": "Dofus",
            "setID": None,
            "level": 200,
            "_stats": {"Earth Damage": 25},
            "_score": 125,
        }
        ochre = {
            "dofusID": build_discovery_prototype.OCHRE_DOFUS_ID,
            "itemType": "Dofus",
            "setID": None,
            "level": 160,
            "_stats": {"AP": 1},
            "_score": 0,
        }

        pool = candidate_pool_for_slot(
            ("Dofus", "Trophy", "Prysmaradite"),
            [high_score_dofus, ochre],
            relevant_sets=set(),
            top_k=1,
        )

        self.assertIn(high_score_dofus, pool)
        self.assertIn(ochre, pool)

    def test_generate_set_core_packages_applies_set_bonus(self):
        target = BuildTarget(ap=7, mp=3, range=0)
        set_id = "damage_set"
        ring = {
            "dofusID": "ring",
            "itemType": "Ring",
            "setID": set_id,
            "level": 200,
            "stats": [{"stat": "Strength", "value": 50}],
            "_stats": {"Strength": 50},
            "_score": 50,
        }
        belt = {
            "dofusID": "belt",
            "itemType": "Belt",
            "setID": set_id,
            "level": 200,
            "stats": [{"stat": "Strength", "value": 60}],
            "_stats": {"Strength": 60},
            "_score": 60,
        }
        pools = {"ring_1": [ring], "belt": [belt]}
        sets = {
            set_id: {
                "bonuses": {"2": [{"stat": "Strength", "value": 40}]},
                "_name": "Damage Set",
            }
        }

        packages = generate_set_core_packages(
            pools,
            sets,
            target,
            build_discovery_prototype.exo_search_target(target),
            build_discovery_prototype.exo_natural_cap_target(target),
        )

        self.assertEqual(len(packages), 1)
        self.assertEqual(packages[0].item_ids, frozenset({"ring", "belt"}))
        self.assertEqual(packages[0].score, score_stats({"Strength": 150}))

    def test_package_seed_states_combines_compatible_packages(self):
        target = BuildTarget(ap=7, mp=3, range=0)
        left_set = "left_set"
        right_set = "right_set"
        amulet = {
            "dofusID": "amulet",
            "itemType": "Amulet",
            "setID": left_set,
            "level": 200,
            "stats": [{"stat": "Strength", "value": 90}],
            "_stats": {"Strength": 90},
            "_score": 90,
        }
        belt = {
            "dofusID": "belt",
            "itemType": "Belt",
            "setID": left_set,
            "level": 200,
            "stats": [{"stat": "Strength", "value": 100}],
            "_stats": {"Strength": 100},
            "_score": 100,
        }
        hat = {
            "dofusID": "hat",
            "itemType": "Hat",
            "setID": right_set,
            "level": 200,
            "stats": [{"stat": "Strength", "value": 80}],
            "_stats": {"Strength": 80},
            "_score": 80,
        }
        cloak = {
            "dofusID": "cloak",
            "itemType": "Cloak",
            "setID": right_set,
            "level": 200,
            "stats": [{"stat": "Strength", "value": 70}],
            "_stats": {"Strength": 70},
            "_score": 70,
        }
        pools = {
            "amulet": [amulet],
            "belt": [belt],
            "hat": [hat],
            "cloak": [cloak],
        }
        sets = {
            left_set: {"bonuses": {"2": [{"stat": "Strength", "value": 20}]}, "_name": "Left"},
            right_set: {"bonuses": {"2": [{"stat": "Strength", "value": 30}]}, "_name": "Right"},
        }

        seeds = package_seed_states(
            pools,
            sets,
            target,
            build_discovery_prototype.exo_search_target(target),
            build_discovery_prototype.exo_natural_cap_target(target),
        )

        self.assertTrue(
            any({"amulet", "belt", "hat", "cloak"} <= seed.used_item_ids for seed in seeds)
        )

    def test_packages_compatible_rejects_slot_conflicts(self):
        first = build_discovery_prototype.PackageCandidate(
            entries=(("ring_1", {"dofusID": "a"}),),
            score=1,
        )
        second = build_discovery_prototype.PackageCandidate(
            entries=(("ring_1", {"dofusID": "b"}),),
            score=1,
        )

        self.assertFalse(packages_compatible((first, second)))

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
