import re
from app import app, db
from app.database import base
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_item import ModelItem
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


def add_prymaradite_image_urls():
    dirname = os.path.dirname(os.path.abspath(__file__))
    base_url = "https://dofus-lab.s3.us-east-2.amazonaws.com/item/"

    data = None
    with open(
        os.path.join(dirname, "app/database/data/prysmaradites.json"), "r"
    ) as file:
        data = json.load(file)
        for record in data:
            record["imageUrl"] = base_url + record["dofusID"]

    with open(
        os.path.join(dirname, "app/database/data/prysmaradites.json"), "w"
    ) as file:
        json.dump(data, file)


if __name__ == "__main__":
    add_prymaradite_image_urls()
