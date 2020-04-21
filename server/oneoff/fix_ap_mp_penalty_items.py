from app import session_scope
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_translation import ModelItemTranslation
from app.database.enums import Stat


items_to_fix = [
    {
        "stat": Stat.AP,
        "items": [
            {"name": "Augilol's Tippet", "penalty_stat_order": 5, "max_value": -1},
            {
                "name": "Hogmeiser's Worn Boots",
                "penalty_stat_order": 1,
                "max_value": -1,
            },
            {"name": "Royal Tofu Crown", "penalty_stat_order": 2, "max_value": -1},
        ],
    },
    {
        "stat": Stat.MP,
        "items": [
            {"name": "Nekochief", "penalty_stat_order": 4, "max_value": -1},
            {"name": "Jackanapes", "penalty_stat_order": 1, "max_value": -1},
            {
                "name": "Hogmeiser's Worn Boots",
                "penalty_stat_order": 0,
                "max_value": -1,
            },
        ],
    },
]


def fix_penalty_items(db_session, stat_penalty_items):
    for item_obj in stat_penalty_items["items"]:
        item_en_name = item_obj["name"]
        item = (
            db_session.query(ModelItemTranslation)
            .filter(
                ModelItemTranslation.locale == "en",
                ModelItemTranslation.name == item_en_name,
            )
            .one()
        ).item
        print("Found item {}".format(item_en_name))
        should_reorder = False
        stat_exists = False
        sorted_stats = item.stats.copy()
        sorted_stats.sort(key=lambda x: x.order)
        for stat in sorted_stats:
            if stat.stat == stat_penalty_items["stat"]:
                stat_exists = True
                break
            if stat.order == item_obj["penalty_stat_order"]:
                should_reorder = True
            if stat.order >= item_obj["penalty_stat_order"]:
                if should_reorder:
                    stat.order = stat.order + 1
                else:
                    print("Stats look already ordered, skipping reordering...")
                    break
        if not stat_exists:
            new_stat = ModelItemStat(
                item_id=item.uuid,
                stat=stat_penalty_items["stat"],
                max_value=item_obj["max_value"],
                order=item_obj["penalty_stat_order"],
            )
            db_session.add(new_stat)
        else:
            print(
                "Stat {} already exists for {}, skipping...".format(
                    stat_penalty_items["stat"], item_en_name,
                )
            )


if __name__ == "__main__":
    with session_scope() as db_session:
        for stat_penalty_items in items_to_fix:
            fix_penalty_items(db_session, stat_penalty_items)
