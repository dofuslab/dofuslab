import sys

sys.path.append("../")

from app import session_scope
from app.database.model_spell_translation import ModelSpellTranslation
from app.database.model_spell_stats import ModelSpellStats
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_buff import ModelBuff
from database_setup import to_stat_enum
import os
import json

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(root_dir, "app/database/data/buffs.json"), "r") as file:
    data = json.load(file)

    all_classes = data["spells"]
    all_items = data["items"]

    with session_scope() as db_session:
        for d_class in all_classes:
            for spell in all_classes[d_class]:
                spell_id = (
                    db_session.query(ModelSpellTranslation)
                    .filter_by(name=spell["name"], locale="en")
                    .one()
                    .spell_id
                )

                for level in spell["levels"]:
                    spell_stat_id = (
                        db_session.query(ModelSpellStats)
                        .filter_by(spell_id=spell_id, level=level["level"])
                        .one()
                        .uuid
                    )

                    for buff in level["buffs"]:
                        buff_object = ModelBuff(
                            spell_stat_id=spell_stat_id,
                            stat=to_stat_enum[buff["stat"]],
                            increment_by=buff["incrementBy"],
                            crit_increment_by=buff["critIncrementBy"],
                            max_stacks=buff["maxStacks"],
                        )
                        session.add(buff_object)

        for item in all_items:
            item_id = (
                db_session.query(ModelItemTranslation)
                .filter_by(name=item["name"], locale="en")
                .one()
                .item_id
            )

            for buff in item["buffs"]:
                buff_object = ModelBuff(
                    item_id=item_id,
                    stat=to_stat_enum[buff["stat"]],
                    min_value=buff["minValue"],
                    increment_by=buff["incrementBy"],
                    max_stacks=buff["maxStacks"],
                )
                session.add(buff_object)
