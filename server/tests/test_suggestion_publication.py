"""Isolated tests for atomic suggestion publication (no database or Redis needed)."""

import importlib.util
import json
from pathlib import Path
import unittest


MODULE_PATH = Path(__file__).parents[1] / "app" / "suggester" / "publication.py"
SPEC = importlib.util.spec_from_file_location("suggestion_publication", str(MODULE_PATH))
publication = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(publication)


class FakePipeline:
    def __init__(self, redis, fail=False):
        self.redis = redis
        self.fail = fail
        self.commands = []

    def rename(self, source, destination):
        self.commands.append(("rename", source, destination))
        return self

    def set(self, key, value):
        self.commands.append(("set", key, value))
        return self

    def execute(self):
        if self.fail:
            raise RuntimeError("simulated transaction failure")
        hashes = {key: dict(value) for key, value in self.redis.hashes.items()}
        values = dict(self.redis.values)
        for command in self.commands:
            if command[0] == "rename":
                _, source, destination = command
                hashes[destination] = hashes.pop(source)
            elif command[0] == "set":
                _, key, value = command
                values[key] = str(value)
        self.redis.hashes = hashes
        self.redis.values = values
        return [True for _ in self.commands]


class FakeRedis:
    def __init__(self, fail_hset=False, fail_transaction=False):
        self.values = {publication.VERSION_KEY: "4"}
        self.hashes = {
            "{}4".format(publication.TABLE_KEY_PREFIX): {"old": "data"}
        }
        self.fail_hset = fail_hset
        self.fail_transaction = fail_transaction

    def get(self, key):
        return self.values.get(key)

    def delete(self, key):
        self.values.pop(key, None)
        self.hashes.pop(key, None)

    def hset(self, key, field, value):
        if self.fail_hset:
            raise RuntimeError("simulated staging write failure")
        self.hashes.setdefault(key, {})[field] = value

    def pipeline(self, transaction=True):
        self.transaction_requested = transaction
        return FakePipeline(self, fail=self.fail_transaction)


class PublicationTests(unittest.TestCase):
    def assert_old_publication_is_unchanged(self, cache):
        self.assertEqual(cache.values[publication.VERSION_KEY], "4")
        self.assertEqual(
            cache.hashes["{}4".format(publication.TABLE_KEY_PREFIX)],
            {"old": "data"},
        )

    def test_success_switches_pointer_only_after_complete_staging(self):
        cache = FakeRedis()

        version = publication.publish_lookup_table(
            cache, {"item-a": {"item-b": 0.75}}, run_id="test"
        )

        self.assertEqual(version, 5)
        self.assertEqual(cache.values[publication.VERSION_KEY], "5")
        self.assertEqual(
            json.loads(
                cache.hashes["{}5".format(publication.TABLE_KEY_PREFIX)]["item-a"]
            ),
            {"item-b": 0.75},
        )
        self.assertNotIn("{}4".format(publication.TABLE_KEY_PREFIX), cache.hashes)
        self.assertTrue(cache.transaction_requested)

    def test_staging_failure_preserves_old_publication(self):
        cache = FakeRedis(fail_hset=True)

        with self.assertRaisesRegex(RuntimeError, "staging write"):
            publication.publish_lookup_table(
                cache, {"item-a": {"item-b": 0.75}}, run_id="test"
            )

        self.assert_old_publication_is_unchanged(cache)
        self.assertNotIn("{}test".format(publication.STAGING_KEY_PREFIX), cache.hashes)

    def test_transaction_failure_preserves_old_publication(self):
        cache = FakeRedis(fail_transaction=True)

        with self.assertRaisesRegex(RuntimeError, "transaction failure"):
            publication.publish_lookup_table(
                cache, {"item-a": {"item-b": 0.75}}, run_id="test"
            )

        self.assert_old_publication_is_unchanged(cache)
        self.assertNotIn("{}test".format(publication.STAGING_KEY_PREFIX), cache.hashes)

    def test_empty_result_is_rejected(self):
        cache = FakeRedis()

        with self.assertRaisesRegex(ValueError, "empty table"):
            publication.publish_lookup_table(cache, {}, run_id="test")

        self.assert_old_publication_is_unchanged(cache)


if __name__ == "__main__":
    unittest.main()
