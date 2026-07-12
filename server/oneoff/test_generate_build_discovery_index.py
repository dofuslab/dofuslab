import unittest
from unittest.mock import patch

from oneoff.generate_build_discovery_index import build_spell_profiles


class BuildDiscoveryIndexSpellProfileTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
