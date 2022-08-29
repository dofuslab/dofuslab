#!/usr/bin/env python3

import json
import os
import re
from app import app, db
from app.database import base
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_item import ModelItem
from app.database.model_spell import ModelSpell
from app.database.model_item_slot import ModelItemSlot

app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def update_item_urls_in_db():
    url_base = "item/"

    mappings = []

    for item in db.session.query(ModelItem):
        info = {
            "uuid": item.uuid,
            "image_url": url_base + re.search("\d+\.png", item.image_url)[0],
        }
        mappings.append(info)

    db.session.bulk_update_mappings(ModelItem, mappings)
    db.session.flush()
    db.session.commit()


def update_spell_urls_in_db():
    url_base = "spell/"

    mappings = []

    for spell in db.session.query(ModelSpell):
        info = {
            "uuid": spell.uuid,
            "image_url": url_base + re.search("\d+\.png", spell.image_url)[0],
        }
        mappings.append(info)

    db.session.bulk_update_mappings(ModelSpell, mappings)
    db.session.flush()
    db.session.commit()


def update_item_slot_urls_in_db():
    url_base = "icon/"

    mappings = []

    for slot in db.session.query(ModelItemSlot):
        info = {
            "uuid": slot.uuid,
            "image_url": url_base + re.search("\w+\.svg", slot.image_url)[0],
        }
        mappings.append(info)

    db.session.bulk_update_mappings(ModelItemSlot, mappings)
    db.session.flush()
    db.session.commit()


def add_prysmaradite_image_urls():
    base_url = "item/"

    data = None
    with open(os.path.join(app_root, "app/database/data/items.json"), "r") as file:
        data = json.load(file)
        for record in data:
            if record["itemType"] == "Prysmaradite":
                record["imageUrl"] = base_url + record["dofusID"] + ".png"

    with open(os.path.join(app_root, "app/database/data/items.json"), "w") as file:
        json.dump(data, file)


def add_rhineetle_image_urls():
    base_url = "item/"

    data = None
    with open(os.path.join(app_root, "app/database/data/rhineetles.json"), "r") as file:
        data = json.load(file)
        for record in data:
            record["imageUrl"] = base_url + record["dofusID"] + ".png"

    with open(os.path.join(app_root, "app/database/data/rhineetles.json"), "w") as file:
        json.dump(data, file)


def add_mount_image_urls():
    base_url = "item/"

    data = None
    with open(os.path.join(app_root, "app/database/data/mounts.json"), "r") as file:
        data = json.load(file)
        for record in data:
            record["imageUrl"] = base_url + record["dofusID"] + ".png"

    with open(os.path.join(app_root, "app/database/data/mounts.json"), "w") as file:
        json.dump(data, file)


if __name__ == "__main__":
    # add_prysmaradite_image_urls()
    # add_rhineetle_image_urls()
    # add_mount_image_urls()
    update_item_urls_in_db()
    update_spell_urls_in_db()
    update_item_slot_urls_in_db()
