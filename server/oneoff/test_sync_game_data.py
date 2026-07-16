import unittest
from unittest.mock import MagicMock, patch

from oneoff import sync_game_data


class SyncGameDataTest(unittest.TestCase):
    @patch("oneoff.sync_game_data.write_index")
    @patch("oneoff.sync_game_data.preview_item_changes", return_value=([], [], []))
    @patch("oneoff.sync_game_data.preview_set_changes", return_value=([], [], []))
    @patch("oneoff.sync_game_data.load_all_items")
    @patch("oneoff.sync_game_data.load_all_sets")
    @patch("oneoff.sync_game_data.session_scope")
    def test_noop_sync_refreshes_build_discovery_index(
        self,
        session_scope,
        load_all_sets,
        load_all_items,
        _preview_set_changes,
        _preview_item_changes,
        write_index,
    ):
        session_scope.return_value.__enter__.return_value = MagicMock()
        load_all_sets.return_value = ({"set": object()}, {"set"})
        load_all_items.return_value = ({"equipment": [object()]}, {"item"})

        sync_game_data.main()

        write_index.assert_called_once_with(source="db")


if __name__ == "__main__":
    unittest.main()
