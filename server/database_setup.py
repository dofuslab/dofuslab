from database.model_item import ModelItem
from database.model_set import ModelSet
from database.model_custom_set import ModelCustomSet
from database.model_user import ModelUser
from database import base
from sqlalchemy.schema import MetaData
import sqlalchemy
import json
import sys

if __name__ == '__main__':
    base.Base.metadata.drop_all(base.engine)
    base.Base.metadata.create_all(base.engine)

    print("Adding sets to database")
    with open('database/data/sets.json', 'r') as file:
        data = json.load(file)
        for record in data:
            set = ModelSet(name=record['name'], bonuses=record['bonuses'])
            base.db_session.add(set)
        base.db_session.commit()

    print("Adding items to database")
    with open('database/data/items.json', 'r') as file:
        data = json.load(file)
        for record in data:
            item = ModelItem(
                name=record['name'],
                item_type=record['item_type'],
                level=record['level'],
                stats=record['stats'],
                conditions=record['conditions'],
                image_url=record['image_url'],
            )

            base.db_session.add(item)

            # If this item belongs in a set, query the set and add the relationship to the record
            if record['set']:
                set = record['set']
                set_record = (
                    base.db_session.query(ModelSet)
                    .filter(ModelSet.name == set)
                    .first()
                )
                set_record.items.append(item)
                base.db_session.merge(set_record)

        base.db_session.commit()

    # print('Inserting user data in database')
    # with open('database/data/users.json', 'r') as file:
    #     data = literal_eval(file.read())
    #     for record in data:
    #         user = ModelUser(**record)
    #         base.db_session.add(user)
    #     base.db_session.commit()
