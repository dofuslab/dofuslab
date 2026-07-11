import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prototype import DamageLine, SpellDamageCandidate
from oneoff.build_discovery_spell_profiles import (
    PROFILE_VERSION,
    derive_all_spell_profiles,
    derive_spell_profile,
    range_profile_from_spells,
)


def spell(
    name,
    *,
    variant="variant",
    ap=3,
    min_range=1,
    max_range=6,
    modifiable=True,
    base=30,
    element="earth",
):
    return SpellDamageCandidate(
        name=name,
        variant_pair_id=variant,
        ap_cost=ap,
        cooldown=None,
        casts_per_turn=2,
        casts_per_target=None,
        base_crit_chance=15,
        damage_lines=(DamageLine(element, base, base),),
        min_range=min_range,
        max_range=max_range,
        has_modifiable_range=modifiable,
    )


class BuildDiscoverySpellProfilesTest(unittest.TestCase):
    def test_derive_spell_profile_selects_best_spell_per_variant_pair(self):
        profile = derive_spell_profile(
            class_name="Cra",
            element="strength",
            level=200,
            candidates=[
                spell("Weak Arrow", variant="pair-1", base=15),
                spell("Strong Arrow", variant="pair-1", base=45),
                spell("Other Arrow", variant="pair-2", base=30),
            ],
        )

        selected_names = [
            selected["name"]
            for selected in profile["spellProfile"]["selectedSpells"]
        ]

        self.assertEqual(profile["profileVersion"], PROFILE_VERSION)
        self.assertEqual(profile["spellProfile"]["candidateCount"], 3)
        self.assertEqual(profile["spellProfile"]["selectedVariantCount"], 2)
        self.assertEqual(selected_names, ["Strong Arrow", "Other Arrow"])

    def test_range_profile_marks_long_modifiable_spells_as_vital(self):
        range_profile = range_profile_from_spells(
            [
                spell("Long Arrow", max_range=8, modifiable=True, base=40),
                spell("Longer Arrow", max_range=10, modifiable=True, base=35),
            ]
        )

        self.assertEqual(range_profile["rangeImportance"], "vital")
        self.assertEqual(range_profile["rangeSoftWeight"], 40.0)
        self.assertEqual(range_profile["evidence"]["highModifiableShare"], 1.0)

    def test_range_profile_marks_short_locked_spells_as_low(self):
        range_profile = range_profile_from_spells(
            [
                spell("Punch", min_range=1, max_range=1, modifiable=False, base=40),
                spell("Kick", min_range=1, max_range=2, modifiable=False, base=35),
            ]
        )

        self.assertEqual(range_profile["rangeImportance"], "low")
        self.assertEqual(range_profile["rangeSoftWeight"], 0.5)
        self.assertEqual(range_profile["evidence"]["shortLockedShare"], 1.0)

    def test_derive_all_spell_profiles_is_deterministic_over_axes(self):
        with patch(
            "oneoff.build_discovery_spell_profiles.spell_candidates_for_profile",
            return_value=(spell("Arrow"),),
        ):
            profiles = derive_all_spell_profiles(
                class_names=("Cra", "Iop"),
                elements=("strength",),
                levels=(100, 200),
            )

        self.assertEqual(profiles["profileVersion"], PROFILE_VERSION)
        self.assertEqual(profiles["levels"], [100, 200])
        self.assertEqual(len(profiles["profiles"]), 4)
        self.assertEqual(
            [
                (profile["className"], profile["element"], profile["level"])
                for profile in profiles["profiles"]
            ],
            [
                ("Cra", "strength", 100),
                ("Cra", "strength", 200),
                ("Iop", "strength", 100),
                ("Iop", "strength", 200),
            ],
        )


if __name__ == "__main__":
    unittest.main()
