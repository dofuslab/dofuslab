import json
import os
from app import session_scope
from app.database.model_item_type import ModelItemType
from app.database.model_item_type_translation import ModelItemTypeTranslation
from app.database.model_item_slot import ModelItemSlot
from app.database.model_item_slot_translation import ModelItemSlotTranslation

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def add_item_type_to_slot():
    print("Loading and processing file...")
    with open(
        os.path.join(app_root, "app/database/data/item_slots.json"), "r",
    ) as file:
        data = json.load(file)

        with session_scope() as db_session:
            for record in data:
                slots = (
                    db_session.query(ModelItemSlot)
                    .join(ModelItemSlotTranslation)
                    .filter(
                        ModelItemSlotTranslation.locale == "en",
                        ModelItemSlotTranslation.name == record["name"]["en"],
                    )
                    .all()
                )
                for slot in slots:
                    for type_en_name in record["types"]:
                        item_type = (
                            db_session.query(ModelItemType)
                            .join(ModelItemTypeTranslation)
                            .filter(
                                ModelItemTypeTranslation.locale == "en",
                                ModelItemTypeTranslation.name == type_en_name,
                            )
                            .one()
                        )
                        relationship_exists = (
                            db_session.query(ModelItemSlot)
                            .join(ModelItemType, ModelItemSlot.item_types)
                            .filter(
                                ModelItemSlot.uuid == slot.uuid,
                                ModelItemType.uuid == item_type.uuid,
                            )
                            .first()
                        )
                        if not relationship_exists:
                            slot.item_types.append(item_type)
                            print(
                                "{} type added to {} slot".format(
                                    type_en_name, record["name"]["en"]
                                )
                            )


if __name__ == "__main__":
    add_item_type_to_slot()
