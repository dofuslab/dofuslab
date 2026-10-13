"""Atomic publication helpers for item suggestions."""

import json
import logging
import uuid


LOGGER = logging.getLogger(__name__)
VERSION_KEY = "suggestion_lookup_table_version"
TABLE_KEY_PREFIX = "suggestion_lookup_table:"
STAGING_KEY_PREFIX = "suggestion_lookup_table:staging:"


def _version_number(value):
    if value is None:
        return None
    if isinstance(value, bytes):
        value = value.decode("ascii")
    return int(value)


def publish_lookup_table(cache, lookup_table, run_id=None):
    """Publish a complete lookup table without exposing a partial refresh.

    The new hash is populated under an unreferenced staging key. A Redis
    transaction then renames it to its final versioned key and switches the
    reader's version pointer in one atomic operation. The previously published
    hash is not removed until after that transaction succeeds.
    """
    if not lookup_table:
        raise ValueError(
            "refusing to replace published suggestions with an empty table"
        )

    old_version = _version_number(cache.get(VERSION_KEY))
    new_version = 1 if old_version is None else old_version + 1
    run_id = run_id or uuid.uuid4().hex
    staging_key = "{}{}".format(STAGING_KEY_PREFIX, run_id)
    new_key = "{}{}".format(TABLE_KEY_PREFIX, new_version)

    try:
        cache.delete(staging_key)
        for item_id, suggestions in lookup_table.items():
            cache.hset(staging_key, str(item_id), json.dumps(suggestions))

        transaction = cache.pipeline(transaction=True)
        transaction.rename(staging_key, new_key)
        transaction.set(VERSION_KEY, new_version)
        transaction.execute()
    except Exception:
        # This key is never read by the suggester. Cleanup is best-effort so
        # the original publication exception is not hidden by a Redis outage.
        try:
            cache.delete(staging_key)
        except Exception:
            LOGGER.warning("Could not remove failed suggestion staging data")
        raise

    if old_version is not None:
        try:
            cache.delete("{}{}".format(TABLE_KEY_PREFIX, old_version))
        except Exception:
            # Publication is already complete. Retaining one old hash is safe
            # and preferable to reporting a successful refresh as failed.
            LOGGER.warning(
                "Published suggestions, but could not remove the prior version"
            )

    return new_version
