from app import session_scope
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_translation import ModelItemTranslation

locales = ["en, fr"]


def add_prysmaradite_translations():
    print("Loading item types...")
    item_types = {}
    with open(
        os.path.join(app_root, "app/database/data/prysmaradites.json"), "r"
    ) as file:
        data = json.load(file)

        with session_scope() as db_session:
            for r in data:
                en_translation = db_session.query(ModelItemTranslation).filter_by(
                    locale="en", name=r["name"]["en"]
                )
                item = en_translation.one().item
                for locale in locales:
                    if (
                        not db_session.query(ModelItemTranslation)
                        .filter_by(locale, item_id=item.id)
                        .exists()
                    ):
                        new_translation = ModelItemTranslation(
                            item_id=item.id, locale=locale, name=r["name"][locale]
                        )
                        db_session.add(new_translation)
