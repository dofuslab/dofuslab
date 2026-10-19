from collections import defaultdict
from app import cache, db
from app.database.model_custom_set import ModelCustomSet
from app.database.model_custom_set import ModelEquippedItem
from sqlalchemy import func
from mlxtend.frequent_patterns import fpgrowth
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd
import datetime
import os
import sys
import uuid

import argparse

from app.suggester.publication import (
    DEFAULT_PREVIOUS_VERSION_TTL_SECONDS,
    DEFAULT_STAGING_TTL_SECONDS,
    REFRESH_LOCK_KEY,
    publish_lookup_table,
)
from app.suggester.refresh_lock import RefreshLockHeartbeat
from app.suggester.database_limits import (
    DEFAULT_STATEMENT_TIMEOUT_MS,
    apply_statement_timeout,
)

parser = argparse.ArgumentParser()

parser.add_argument(
    "-d",
    "--days",
    help="Number of days ago of builds to use (default 180)",
    type=int,
    default=180,
)
parser.add_argument(
    "--previous-version-ttl-seconds",
    help=(
        "Grace period for readers of the prior version "
        "(default: RECOMMENDATION_PREVIOUS_VERSION_TTL_SECONDS or 3600)"
    ),
    type=int,
    default=int(
        os.environ.get(
            "RECOMMENDATION_PREVIOUS_VERSION_TTL_SECONDS",
            str(DEFAULT_PREVIOUS_VERSION_TTL_SECONDS),
        )
    ),
)
parser.add_argument(
    "--statement-timeout-ms",
    help=(
        "PostgreSQL statement timeout for the training query "
        "(default: RECOMMENDATION_DB_TIMEOUT_MS or 12600000)"
    ),
    type=int,
    default=int(
        os.environ.get(
            "RECOMMENDATION_DB_TIMEOUT_MS", str(DEFAULT_STATEMENT_TIMEOUT_MS)
        )
    ),
)
parser.add_argument(
    "--lock-seconds",
    help="Redis refresh lock lifetime (default: RECOMMENDATION_LOCK_SECONDS or 18000)",
    type=int,
    default=int(os.environ.get("RECOMMENDATION_LOCK_SECONDS", "18000")),
)


def get_relative_date(days):
    return (datetime.datetime.now() - datetime.timedelta(days=days)).strftime(
        "%Y-%m-%d"
    )


DATE_180_DAYS_AGO = get_relative_date(180)


def build_suggestion_lookup(date, statement_timeout_ms):
    apply_statement_timeout(db.session, statement_timeout_ms)
    item_lists = [
        [str(uuid) for uuid in result_tuple[0]]
        for result_tuple in db.session.query(func.array_agg(ModelEquippedItem.item_id),)
        .filter(ModelEquippedItem.custom_set.has(ModelCustomSet.last_modified > date))
        .group_by(ModelEquippedItem.custom_set_id)
        .all()
    ]

    print("Found {} builds, processing...".format(len(item_lists)))

    te = TransactionEncoder()
    te_ary = te.fit(item_lists).transform(item_lists)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    association_results = fpgrowth(
        df=df, min_support=0.0005, max_len=2, use_colnames=True
    )

    print(
        "Found {} rules, calculating confidence and creating lookup table...".format(
            len(association_results.index)
        )
    )

    support_table = {}
    lookup_table = defaultdict(dict)

    for _, row in association_results.iterrows():
        items = list(row["itemsets"])
        if len(items) == 1:
            support_table[items[0]] = row["support"]
        if len(items) == 2:
            lookup_table[items[0]][items[1]] = row["support"] / support_table[items[0]]
            lookup_table[items[1]][items[0]] = row["support"] / support_table[items[1]]

    return lookup_table


def train_suggestion_model(
    date,
    lock_token,
    statement_timeout_ms,
    staging_ttl_seconds=DEFAULT_STAGING_TTL_SECONDS,
    previous_version_ttl_seconds=DEFAULT_PREVIOUS_VERSION_TTL_SECONDS,
):
    lookup_table = build_suggestion_lookup(date, statement_timeout_ms)
    new_version = publish_lookup_table(
        cache,
        lookup_table,
        REFRESH_LOCK_KEY,
        lock_token,
        staging_ttl_seconds=staging_ttl_seconds,
        previous_version_ttl_seconds=previous_version_ttl_seconds,
    )
    print("Published suggestion lookup table version {}".format(new_version))

    print("Done")


def run_with_lock(
    date, lock_seconds, statement_timeout_ms, previous_version_ttl_seconds,
):
    if lock_seconds < 60:
        raise ValueError("lock-seconds must be at least 60")
    if statement_timeout_ms <= 0:
        raise ValueError("statement-timeout-ms must be greater than zero")
    if previous_version_ttl_seconds <= 0:
        raise ValueError("previous-version-ttl-seconds must be greater than zero")

    lock_token = uuid.uuid4().hex
    refresh_lock = cache.lock(
        REFRESH_LOCK_KEY, timeout=lock_seconds, thread_local=False
    )
    if not refresh_lock.acquire(blocking=False, token=lock_token):
        print("Suggestion refresh skipped: another refresh holds the Redis lock")
        return False

    heartbeat = RefreshLockHeartbeat(
        refresh_lock, interval_seconds=min(60, lock_seconds // 3)
    )
    heartbeat.start()
    try:
        # Keep abandoned staging data only one hour longer than the overlap
        # lock, while retaining a conservative six-hour minimum for direct use.
        staging_ttl_seconds = max(DEFAULT_STAGING_TTL_SECONDS, lock_seconds + (60 * 60))
        train_suggestion_model(
            date,
            lock_token,
            statement_timeout_ms,
            staging_ttl_seconds=staging_ttl_seconds,
            previous_version_ttl_seconds=previous_version_ttl_seconds,
        )
    finally:
        heartbeat.stop()
        if heartbeat.error is not None:
            print(
                "WARNING: suggestion refresh lock renewal failed", file=sys.stderr,
            )
        try:
            refresh_lock.release()
        except Exception:
            # The process timeout is deliberately shorter than the lock TTL.
            # If ownership was still lost, expiry safely clears the lock.
            print(
                "WARNING: suggestion refresh lock could not be released",
                file=sys.stderr,
            )
    return True


if __name__ == "__main__":
    args = parser.parse_args()
    if not run_with_lock(
        get_relative_date(args.days),
        args.lock_seconds,
        args.statement_timeout_ms,
        args.previous_version_ttl_seconds,
    ):
        # EX_TEMPFAIL lets the wrapper distinguish a safe overlap skip from a
        # completed refresh without starting a retry.
        sys.exit(75)
