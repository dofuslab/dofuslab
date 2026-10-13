"""Atomic publication helpers for item suggestions."""

import json
import logging
import uuid


LOGGER = logging.getLogger(__name__)
VERSION_KEY = "suggestion_lookup_table_version"
TABLE_KEY_PREFIX = "suggestion_lookup_table:"
STAGING_KEY_PREFIX = "suggestion_lookup_table:staging:"
DEFAULT_STAGING_TTL_SECONDS = 6 * 60 * 60
DEFAULT_PREVIOUS_VERSION_TTL_SECONDS = 60 * 60
STAGING_MARKER_FIELD = "__dofuslab_staging__"
REFRESH_LOCK_KEY = "suggestion_lookup_table_refresh_lock"

# KEYS: staging hash, final hash, version pointer, refresh lock, previous hash
# ARGV: expected lock token, new version, expected field count, previous TTL
PUBLISH_SCRIPT = """
local lock_token = redis.call('get', KEYS[4])
if not lock_token or lock_token ~= ARGV[1] then
    return redis.error_reply('SUGGESTION_REFRESH_LOCK_NOT_OWNED')
end

local staging_type = redis.call('type', KEYS[1])
if staging_type['ok'] ~= 'hash' then
    return redis.error_reply('SUGGESTION_STAGING_MISSING_OR_WRONG_TYPE')
end
if redis.call('hlen', KEYS[1]) ~= tonumber(ARGV[3]) then
    return redis.error_reply('SUGGESTION_STAGING_INCOMPLETE')
end

redis.call('rename', KEYS[1], KEYS[2])
redis.call('persist', KEYS[2])
redis.call('set', KEYS[3], ARGV[2])
if KEYS[5] ~= '' and redis.call('exists', KEYS[5]) == 1 then
    redis.call('expire', KEYS[5], tonumber(ARGV[4]))
end
return 1
"""


def _version_number(value):
    if value is None:
        return None
    if isinstance(value, bytes):
        value = value.decode("ascii")
    return int(value)


def publish_lookup_table(
    cache,
    lookup_table,
    lock_name,
    lock_token,
    run_id=None,
    staging_ttl_seconds=DEFAULT_STAGING_TTL_SECONDS,
    previous_version_ttl_seconds=DEFAULT_PREVIOUS_VERSION_TTL_SECONDS,
):
    """Publish a complete lookup table without exposing a partial refresh.

    The new hash is populated under an expiring, unreferenced staging key. A
    guarded Redis script validates the hash and lock owner, then renames it and
    switches the reader's version pointer atomically. The prior hash receives a
    bounded grace expiry for readers that fetched the old pointer.
    """
    if not lookup_table:
        raise ValueError(
            "refusing to replace published suggestions with an empty table"
        )
    if staging_ttl_seconds <= 0:
        raise ValueError("staging_ttl_seconds must be greater than zero")
    if previous_version_ttl_seconds <= 0:
        raise ValueError("previous_version_ttl_seconds must be greater than zero")
    if not lock_name or not lock_token:
        raise ValueError("an owned refresh lock is required for publication")

    old_version = _version_number(cache.get(VERSION_KEY))
    new_version = 1 if old_version is None else old_version + 1
    run_id = run_id or uuid.uuid4().hex
    staging_key = "{}{}".format(STAGING_KEY_PREFIX, run_id)
    new_key = "{}{}".format(TABLE_KEY_PREFIX, new_version)
    old_key = (
        "{}{}".format(TABLE_KEY_PREFIX, old_version) if old_version is not None else ""
    )

    try:
        cache.delete(staging_key)

        # Redis cannot expire a key before it exists. Create a marker and set
        # its TTL in one transaction so a killed process cannot strand an
        # unbounded staging hash between those operations.
        staging_setup = cache.pipeline(transaction=True)
        staging_setup.hset(staging_key, STAGING_MARKER_FIELD, "1")
        staging_setup.expire(staging_key, staging_ttl_seconds)
        staging_setup.execute()

        for item_id, suggestions in lookup_table.items():
            cache.hset(staging_key, str(item_id), json.dumps(suggestions))
        cache.hdel(staging_key, STAGING_MARKER_FIELD)

        # Lua performs validation and cutover as one atomic server-side
        # operation. Unlike MULTI/EXEC, a failed validation cannot still run a
        # later SET and point readers at a missing hash.
        cache.eval(
            PUBLISH_SCRIPT,
            5,
            staging_key,
            new_key,
            VERSION_KEY,
            lock_name,
            old_key,
            lock_token,
            new_version,
            len(lookup_table),
            previous_version_ttl_seconds,
        )
    except Exception:
        # This key is never read by the suggester. Cleanup is best-effort so
        # the original publication exception is not hidden by a Redis outage.
        try:
            cache.delete(staging_key)
        except Exception:
            LOGGER.warning("Could not remove failed suggestion staging data")
        raise

    return new_version
