import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from oneoff.generate_build_discovery_index import BuildDiscoveryIndexValidationError
from scripts.ensure_build_discovery_index import ensure_index, validate_path


class EnsureBuildDiscoveryIndexTests(unittest.TestCase):
    def test_complete_index_is_not_regenerated(self):
        with tempfile.TemporaryDirectory() as directory:
            path = str(Path(directory) / "index.json")
            generate_calls = []
            with patch(
                "scripts.ensure_build_discovery_index.validate_path"
            ) as validate:
                regenerated = ensure_index(path, generate=lambda *args, **kwargs: generate_calls.append(args))

            self.assertFalse(regenerated)
            self.assertEqual(generate_calls, [])
            validate.assert_called_once_with(path)

    def test_incomplete_index_is_regenerated_once_and_revalidated(self):
        with tempfile.TemporaryDirectory() as directory:
            path = str(Path(directory) / "index.json")
            generate_calls = []
            with patch(
                "scripts.ensure_build_discovery_index.validate_path",
                side_effect=[
                    BuildDiscoveryIndexValidationError("incomplete"),
                    BuildDiscoveryIndexValidationError("incomplete"),
                    None,
                ],
            ) as validate:
                regenerated = ensure_index(
                    path,
                    generate=lambda *args, **kwargs: generate_calls.append((args, kwargs)),
                )

            self.assertTrue(regenerated)
            self.assertEqual(generate_calls, [((path,), {"source": "db"})])
            self.assertEqual(validate.call_count, 3)

    def test_malformed_json_has_actionable_validation_error(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "index.json"
            path.write_text("{not-json", encoding="utf-8")
            with self.assertRaisesRegex(BuildDiscoveryIndexValidationError, "unreadable"):
                validate_path(str(path))

    def test_startup_fails_when_regenerated_index_remains_incomplete(self):
        with tempfile.TemporaryDirectory() as directory:
            path = str(Path(directory) / "index.json")
            with patch(
                "scripts.ensure_build_discovery_index.validate_path",
                side_effect=BuildDiscoveryIndexValidationError("still incomplete"),
            ):
                with self.assertRaisesRegex(
                    BuildDiscoveryIndexValidationError, "still incomplete"
                ):
                    ensure_index(path, generate=lambda *args, **kwargs: None)

    def test_startup_commands_validate_before_web_and_worker(self):
        server_root = Path(__file__).resolve().parents[1]
        procfile = (server_root / "Procfile").read_text(encoding="utf-8")
        compose = (server_root.parent / "docker-compose.yml").read_text(encoding="utf-8")
        validator = "python -m scripts.ensure_build_discovery_index &&"

        self.assertIn(f"web: {validator}", procfile)
        self.assertIn(f"worker: {validator}", procfile)
        self.assertEqual(compose.count(validator), 2)


if __name__ == "__main__":
    unittest.main()
