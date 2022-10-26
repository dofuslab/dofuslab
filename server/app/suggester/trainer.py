from collections import defaultdict
from app import cache, db
from app.database.model_custom_set import ModelCustomSet
from app.database.model_custom_set import ModelEquippedItem
import json
from sqlalchemy import func
from mlxtend.frequent_patterns import fpgrowth
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd
import datetime

import argparse

parser = argparse.ArgumentParser()

parser.add_argument(
    "-d",
    "--days",
    help="Number of days ago of builds to use (default 180)",
    type=int,
    default=180,
)


def get_relative_date(days):
    return (datetime.datetime.now() - datetime.timedelta(days=days)).strftime(
        "%Y-%m-%d"
    )


DATE_180_DAYS_AGO = get_relative_date(180)


def train_suggestion_model(date):
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

    old_version = cache.get("suggestion_lookup_table_version")
    if old_version:
        print("Found old version {}, bumping".format(old_version))
        old_version = int(old_version)
        new_version = old_version + 1
    else:
        print("Starting new version at 1")
        new_version = 1
    print(
        "Setting hash in cache with key 'suggestion_lookup_table:{}'...".format(
            new_version
        )
    )
    for k, v in lookup_table.items():
        cache.hset(
            "suggestion_lookup_table:{}".format(new_version), k, json.dumps(v),
        )
    cache.set("suggestion_lookup_table_version", new_version)
    cache.delete("suggestion_lookup_table:{}".format(old_version))

    print("Done")


if __name__ == "__main__":
    args = parser.parse_args()
    train_suggestion_model(get_relative_date(args.days))
