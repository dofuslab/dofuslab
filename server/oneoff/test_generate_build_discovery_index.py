import unittest
from unittest.mock import patch

from oneoff.build_discovery_prototype import (
    BUILD_DISCOVERY_INDEX_SCHEMA_VERSION,
    ELEMENT_PROFILES,
    SUPPORTED_CLASS_NAMES,
)
from oneoff.build_discovery_spell_profiles import PROFILE_LEVELS
from oneoff.generate_build_discovery_index import (
    BuildDiscoveryIndexValidationError,
    build_spell_profiles,
    validate_build_discovery_index,
)


class BuildDiscoveryIndexSpellProfileTests(unittest.TestCase):
    def complete_index(self):
        return {
            "schemaVersion": BUILD_DISCOVERY_INDEX_SCHEMA_VERSION,
            "items": [],
            "sets": {},
            "indexes": {},
            "spellProfiles": {
                "profiles": [
                    {"className": class_name, "element": element, "level": level}
                    for class_name in SUPPORTED_CLASS_NAMES
                    for element in ELEMENT_PROFILES
                    for level in PROFILE_LEVELS
                ]
            },
        }

    def test_db_index_embeds_generated_spell_profiles(self):
        expected = {
            "profileVersion": "test",
            "levels": [99],
            "profiles": [{"level": 99}],
        }
        with patch(
            "oneoff.generate_build_discovery_index.derive_all_spell_profiles",
            return_value=expected,
        ) as derive:
            self.assertIs(build_spell_profiles("db"), expected)
        derive.assert_called_once_with()

    def test_json_index_retains_legacy_unavailable_profile_shape(self):
        profiles = build_spell_profiles("json")
        self.assertEqual(profiles["levels"], [])
        self.assertEqual(profiles["profiles"], [])
        self.assertEqual(profiles["source"], "unavailable_for_json_index_source")

    @patch(
        "oneoff.generate_build_discovery_index.hydrate_indexed_spell_candidates",
        return_value=(object(),),
    )
    def test_complete_index_passes_coverage_validation(self, _hydrate):
        validate_build_discovery_index(self.complete_index())

    @patch(
        "oneoff.generate_build_discovery_index.hydrate_indexed_spell_candidates",
        return_value=(object(),),
    )
    def test_incomplete_index_reports_missing_profile(self, _hydrate):
        index = self.complete_index()
        index["spellProfiles"]["profiles"].pop()
        with self.assertRaisesRegex(
            BuildDiscoveryIndexValidationError,
            r"missing spell profile Xelor/agility/level-200.*generate_build_discovery_index",
        ):
            validate_build_discovery_index(index)

    @patch(
        "oneoff.generate_build_discovery_index.hydrate_indexed_spell_candidates",
        return_value=None,
    )
    def test_malformed_profile_reports_hydration_failure(self, _hydrate):
        with self.assertRaisesRegex(
            BuildDiscoveryIndexValidationError,
            r"Cra/strength/level-99 is not hydratable",
        ):
            validate_build_discovery_index(self.complete_index())


if __name__ == "__main__":
    unittest.main()
