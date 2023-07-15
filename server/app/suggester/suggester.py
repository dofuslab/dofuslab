from collections import defaultdict
from app import cache
import json


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
