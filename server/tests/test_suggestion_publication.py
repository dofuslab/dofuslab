"""Isolated tests for atomic suggestion publication (no production Redis)."""

import importlib.util
import json
from pathlib import Path
import unittest


MODULE_PATH = Path(__file__).parents[1] / "app" / "suggester" / "publication.py"
SPEC = importlib.util.spec_from_file_location(
    "suggestion_publication", str(MODULE_PATH)
)
publication = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(publication)


class FakePipeline:
    """Imitate Redis EXEC: later commands still run after runtime errors."""

    def __init__(self, redis):
        self.redis = redis
        self.commands = []

    def hset(self, key, field, value):
        self.commands.append(("hset", key, field, value))
        return self

    def expire(self, key, seconds):
        self.commands.append(("expire", key, seconds))
        return self

    def execute(self):
        errors = []
        for command in self.commands:
            try:
                if command[0] == "hset":
                    _, key, field, value = command
                    self.redis.hashes.setdefault(key, {})[field] = value
                elif command[0] == "expire":
                    _, key, seconds = command
                    if key in self.redis.hashes:
                        self.redis.expirations[key] = seconds
            except Exception as error:
                errors.append(error)
        if errors:
            raise errors[0]
        return [True for _ in self.commands]


class FakeRedis:
    def __init__(self, fail_hset=False, drop_staging=False, lose_lock=False):
        self.values = {
            publication.VERSION_KEY: "4",
            publication.REFRESH_LOCK_KEY: "owned-token",
        }
        self.hashes = {"{}4".format(publication.TABLE_KEY_PREFIX): {"old": "data"}}
        self.expirations = {}
        self.fail_hset = fail_hset
        self.drop_staging = drop_staging
        self.lose_lock = lose_lock
        self.payload_was_ttl_protected = False

    def get(self, key):
        return self.values.get(key)

    def delete(self, key):
        self.values.pop(key, None)
        self.hashes.pop(key, None)
        self.expirations.pop(key, None)

    def hset(self, key, field, value):
        self.payload_was_ttl_protected = key in self.expirations
        if self.fail_hset:
            raise RuntimeError("simulated staging write failure")
        self.hashes.setdefault(key, {})[field] = value

    def hdel(self, key, field):
        self.hashes.get(key, {}).pop(field, None)

    def pipeline(self, transaction=True):
        self.transaction_requested = transaction
        return FakePipeline(self)

    def eval(self, script, number_of_keys, *keys_and_arguments):
        self.script = script
        self.number_of_keys = number_of_keys
        keys = keys_and_arguments[:number_of_keys]
        arguments = keys_and_arguments[number_of_keys:]
        staging_key, new_key, version_key, lock_key, old_key = keys
        lock_token, new_version, expected_fields, previous_ttl = arguments

        if self.drop_staging:
            self.delete(staging_key)
        if self.lose_lock:
            self.values[lock_key] = "another-worker-token"

        # These checks happen before any write, like the production Lua script.
        if self.values.get(lock_key) != lock_token:
            raise RuntimeError("SUGGESTION_REFRESH_LOCK_NOT_OWNED")
        if staging_key not in self.hashes:
            raise RuntimeError("SUGGESTION_STAGING_MISSING_OR_WRONG_TYPE")
        if len(self.hashes[staging_key]) != expected_fields:
            raise RuntimeError("SUGGESTION_STAGING_INCOMPLETE")

        self.hashes[new_key] = self.hashes.pop(staging_key)
        self.expirations.pop(staging_key, None)
        self.values[version_key] = str(new_version)
        if old_key in self.hashes:
            self.expirations[old_key] = previous_ttl
        return 1


class PublicationTests(unittest.TestCase):
    def publish(self, cache, **kwargs):
        return publication.publish_lookup_table(
            cache,
            {"item-a": {"item-b": 0.75}},
            publication.REFRESH_LOCK_KEY,
            "owned-token",
            run_id="test",
            **kwargs
        )

    def assert_old_publication_is_unchanged(self, cache):
        self.assertEqual(cache.values[publication.VERSION_KEY], "4")
        self.assertEqual(
            cache.hashes["{}4".format(publication.TABLE_KEY_PREFIX)], {"old": "data"},
        )

    def test_success_switches_pointer_after_guarded_validation(self):
        cache = FakeRedis()

        version = self.publish(cache, previous_version_ttl_seconds=900)

        self.assertEqual(version, 5)
        self.assertEqual(cache.values[publication.VERSION_KEY], "5")
        new_key = "{}5".format(publication.TABLE_KEY_PREFIX)
        old_key = "{}4".format(publication.TABLE_KEY_PREFIX)
        self.assertEqual(json.loads(cache.hashes[new_key]["item-a"]), {"item-b": 0.75})
        self.assertNotIn(publication.STAGING_MARKER_FIELD, cache.hashes[new_key])
        self.assertNotIn(new_key, cache.expirations)
        self.assertEqual(cache.expirations[old_key], 900)
        self.assertTrue(cache.payload_was_ttl_protected)
        self.assertEqual(cache.number_of_keys, 5)

    def test_staging_write_failure_preserves_old_publication(self):
        cache = FakeRedis(fail_hset=True)

        with self.assertRaisesRegex(RuntimeError, "staging write"):
            self.publish(cache)

        self.assert_old_publication_is_unchanged(cache)
        self.assertNotIn("{}test".format(publication.STAGING_KEY_PREFIX), cache.hashes)

    def test_missing_staging_at_cutover_preserves_old_pointer(self):
        cache = FakeRedis(drop_staging=True)

        with self.assertRaisesRegex(RuntimeError, "STAGING_MISSING"):
            self.publish(cache)

        self.assert_old_publication_is_unchanged(cache)
        self.assertNotIn("{}5".format(publication.TABLE_KEY_PREFIX), cache.hashes)

    def test_lost_lock_at_cutover_preserves_old_pointer(self):
        cache = FakeRedis(lose_lock=True)

        with self.assertRaisesRegex(RuntimeError, "LOCK_NOT_OWNED"):
            self.publish(cache)

        self.assert_old_publication_is_unchanged(cache)
        self.assertNotIn("{}5".format(publication.TABLE_KEY_PREFIX), cache.hashes)

    def test_empty_result_is_rejected(self):
        cache = FakeRedis()

        with self.assertRaisesRegex(ValueError, "empty table"):
            publication.publish_lookup_table(
                cache, {}, publication.REFRESH_LOCK_KEY, "owned-token", run_id="test",
            )

        self.assert_old_publication_is_unchanged(cache)


if __name__ == "__main__":
    unittest.main()
