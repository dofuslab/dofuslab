import unittest
from unittest.mock import patch

from oneoff.build_discovery_core import (
    SpellDamageCandidate,
    hydrate_indexed_spell_candidates,
    indexed_spell_profile,
    spell_candidates_for_profile,
    spell_damage_per_cast,
)
from oneoff.build_discovery_spell_profiles import serializable_spell
from oneoff.damage_calculator import DamageLine


def rich_candidate():
    return SpellDamageCandidate(
        name="Indexed Spell",
        variant_pair_id="variant-1",
        ap_cost=4,
        cooldown=2,
        casts_per_turn=3,
        casts_per_target=1,
        base_crit_chance=23,
        damage_lines=(
            DamageLine(
                element="fire",
                base_min=31,
                base_max=37,
                crit_base_min=44,
                crit_base_max=52,
                crit_chance=23,
                crit_bonus_damage=7,
                is_weapon=True,
                is_trap=True,
                weight=1.75,
                distance="ranged",
            ),
        ),
        damage_increase=8,
        crit_damage_increase=11,
        max_damage_increase_stacks=3,
        is_weapon=True,
        min_range=2,
        max_range=7,
        has_modifiable_range=True,
    )


def indexed_profile(level=149):
    candidate = rich_candidate()
    return {
        "className": "Cra",
        "element": "intelligence",
        "level": level,
        "spellProfile": {
            "selectedSpells": [serializable_spell(candidate, reference_stats={})],
        },
    }


class SpellProfileSerializationTests(unittest.TestCase):
    def tearDown(self):
        spell_candidates_for_profile.cache_clear()

    def test_serialization_hydrates_every_candidate_and_damage_line_field(self):
        original = rich_candidate()
        hydrated = hydrate_indexed_spell_candidates(indexed_profile())

        self.assertEqual(hydrated, (original,))

    def test_damage_is_numerically_identical_after_serialization(self):
        original = rich_candidate()
        hydrated = hydrate_indexed_spell_candidates(indexed_profile())[0]
        stats = {
            "Intelligence": 675,
            "Power": 120,
            "Fire Damage": 42,
            "Damage": 18,
            "Critical": 14,
            "Critical Damage": 29,
            "Trap Power": 33,
            "Trap Damage": 12,
            "% Ranged Damage": 17,
            "% Weapon Damage": 9,
            "% Final Damage": 4,
        }

        self.assertEqual(
            spell_damage_per_cast(original, stats, stacks=2),
            spell_damage_per_cast(hydrated, stats, stacks=2),
        )

    def test_profile_lookup_selects_highest_supported_level_not_above_target(self):
        index = {
            "spellProfiles": {
                "profiles": [
                    indexed_profile(99),
                    indexed_profile(149),
                    indexed_profile(200),
                ]
            }
        }
        with patch(
            "oneoff.build_discovery_core.load_build_discovery_index",
            return_value=index,
        ):
            self.assertEqual(
                indexed_spell_profile("Cra", "intelligence", 179)["level"], 149
            )
            self.assertEqual(
                indexed_spell_profile("Cra", "intelligence", 50)["level"], 99
            )

    def test_complete_index_profile_avoids_db_access(self):
        index = {"spellProfiles": {"profiles": [indexed_profile()]}}
        with patch(
            "oneoff.build_discovery_core.load_build_discovery_index",
            return_value=index,
        ), patch(
            "oneoff.build_discovery_core.db_spell_candidates_for_profile",
            side_effect=AssertionError("database accessed"),
        ):
            result = spell_candidates_for_profile("Cra", "intelligence", 179)

        self.assertEqual(result, (rich_candidate(),))

    def test_legacy_and_malformed_profiles_fall_back_to_db(self):
        fallback = (rich_candidate(),)
        profiles = [
            {"spellProfiles": {"profiles": []}},
            {
                "spellProfiles": {
                    "profiles": [
                        {
                            "className": "Cra",
                            "element": "intelligence",
                            "level": 149,
                            "spellProfile": {"selectedSpells": [{"name": "legacy"}]},
                        }
                    ]
                }
            },
        ]
        for index in profiles:
            spell_candidates_for_profile.cache_clear()
            with self.subTest(index=index), patch(
                "oneoff.build_discovery_core.load_build_discovery_index",
                return_value=index,
            ), patch(
                "oneoff.build_discovery_core.db_spell_candidates_for_profile",
                return_value=fallback,
            ) as db_loader:
                self.assertEqual(
                    spell_candidates_for_profile("Cra", "intelligence", 179), fallback
                )
                db_loader.assert_called_once_with("Cra", "intelligence", 179)


if __name__ == "__main__":
    unittest.main()
