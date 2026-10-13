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

import argparse

from app.suggester.publication import publish_lookup_table

parser = argparse.ArgumentParser()

parser.add_argument(
    "-d",
    "--days",
    help="Number of days ago of builds to use (default 180)",
    type=int,
    default=180,
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


def build_suggestion_lookup(date):
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


def train_suggestion_model(date):
    lookup_table = build_suggestion_lookup(date)
    new_version = publish_lookup_table(cache, lookup_table)
    print("Published suggestion lookup table version {}".format(new_version))

    print("Done")


def run_with_lock(date, lock_seconds):
    if lock_seconds <= 0:
        raise ValueError("lock-seconds must be greater than zero")

    refresh_lock = cache.lock(
        "suggestion_lookup_table_refresh_lock", timeout=lock_seconds
    )
    if not refresh_lock.acquire(blocking=False):
        print("Suggestion refresh skipped: another refresh holds the Redis lock")
        return False

    try:
        train_suggestion_model(date)
    finally:
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
    if not run_with_lock(get_relative_date(args.days), args.lock_seconds):
        # EX_TEMPFAIL lets the wrapper distinguish a safe overlap skip from a
        # completed refresh without starting a retry.
        sys.exit(75)
