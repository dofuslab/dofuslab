import re
from app import app, db
from app.database import base
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_item import ModelItem
from app.database.model_spell import ModelSpell
import json
import os


def update_item_urls_in_db():
    url_base = "https://dofus-lab.s3.us-east-2.amazonaws.com/item/"

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
    url_base = "https://dofus-lab.s3.us-east-2.amazonaws.com/spell/"

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


def add_prysmaradite_image_urls():
    dirname = os.path.dirname(os.path.abspath(__file__))
    base_url = "https://dofus-lab.s3.us-east-2.amazonaws.com/item/"

    data = None
    with open(os.path.join(dirname, "app/database/data/items.json"), "r") as file:
        data = json.load(file)
        for record in data:
            if record["itemType"] == "Prysmaradite":
                record["imageUrl"] = base_url + record["dofusID"] + ".png"

    with open(os.path.join(dirname, "app/database/data/items.json"), "w") as file:
        json.dump(data, file)


def add_rhineetle_image_urls():
    dirname = os.path.dirname(os.path.abspath(__file__))
    base_url = "https://dofus-lab.s3.us-east-2.amazonaws.com/item/"

    data = None
    with open(os.path.join(dirname, "app/database/data/rhineetles.json"), "r") as file:
        data = json.load(file)
        for record in data:
            record["imageUrl"] = base_url + record["dofusID"] + ".png"

    with open(os.path.join(dirname, "app/database/data/rhineetles.json"), "w") as file:
        json.dump(data, file)


if __name__ == "__main__":
    # add_prysmaradite_image_urls()
    update_item_urls_in_db()
    update_spell_urls_in_db()
