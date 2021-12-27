from collections import defaultdict
from app import cache, db
from app.database.model_custom_set import ModelCustomSet
from app.database.model_custom_set import ModelEquippedItem
import json
from sqlalchemy import func
import datetime
from mlxtend.frequent_patterns import fpgrowth
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd

DATE_30_DAYS_AGO = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime(
    "%Y-%m-%d"
)


def train_suggestion_model():
    item_lists = [
        [str(uuid) for uuid in result_tuple[0]]
        for result_tuple in db.session.query(
            func.array_agg(ModelEquippedItem.item_id),
        )
        .filter(
            ModelEquippedItem.custom_set.has(
                ModelCustomSet.last_modified > DATE_30_DAYS_AGO
            )
        )
        .group_by(ModelEquippedItem.custom_set_id)
        .all()
    ]

    te = TransactionEncoder()
    te_ary = te.fit(item_lists).transform(item_lists)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    association_results = fpgrowth(
        df=df, min_support=0.0005, max_len=2, use_colnames=True
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
        old_version = int(old_version)
        new_version = old_version + 1
    else:
        new_version = 1
    for k, v in lookup_table.items():
        cache.hset(
            "suggestion_lookup_table:{}".format(new_version),
            k,
            json.dumps(v),
        )
    cache.set("suggestion_lookup_table_version", new_version)
    cache.delete("suggestion_lookup_table:{}".format(old_version))


def merge_dicts_sum(dicts):
    result = defaultdict(int)
    for d in dicts:
        for item in d.items():
            result[item[0]] += item[1]
    return result


def get_ordered_suggestions(item_ids):
    version = cache.get("suggestion_lookup_table_version")

    if not version:
        return []
    else:
        version = int(version)

    suggestion_dicts = []
    for item_id in item_ids:
        suggestion_dict = cache.hget(
            "suggestion_lookup_table:{}".format(str(version)), str(item_id)
        )
        if suggestion_dict:
            suggestion_dicts.append(json.loads(suggestion_dict))

    merged_dict = merge_dicts_sum(suggestion_dicts)

    # remove already equipped items from suggestions
    for item_id in item_ids:
        merged_dict.pop(item_id, False)

    return sorted(merged_dict.keys(), key=lambda x: merged_dict[x], reverse=True)


if __name__ == "__main__":
    train_suggestion_model()
