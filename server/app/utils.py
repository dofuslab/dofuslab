from app import db
from app.database.model_custom_set import ModelCustomSet
from app.database.model_custom_set_stat import ModelCustomSetStat
from flask import session
from graphql import GraphQLError
from flask_login import current_user


def get_or_create_custom_set(custom_set_id):
    owned_custom_sets = session.get("owned_custom_sets") or []
    if custom_set_id:
        custom_set = db.session.query(ModelCustomSet).get(custom_set_id)
        if custom_set.owner_id and custom_set.owner_id != current_user.get_id():
            raise GraphQLError("You don't have permission to edit that set.")
        elif not custom_set.owner_id and custom_set.uuid not in owned_custom_sets:
            raise GraphQLError("You don't have permission to edit that set.")
    else:
        custom_set = ModelCustomSet(owner_id=current_user.get_id())
        db.session.add(custom_set)
        db.session.flush()
        custom_set_stat = ModelCustomSetStat(custom_set_id=custom_set.uuid)
        if current_user.is_anonymous:
            owned_custom_sets.append(custom_set.uuid)
            session["owned_custom_sets"] = owned_custom_sets
        db.session.add(custom_set_stat)
    return custom_set


def save_custom_sets():
    owned_custom_sets = session.get("owned_custom_sets") or []
    mappings = []
    for custom_set_id in owned_custom_sets:
        info = {
            "uuid": custom_set_id,
            "owner_id": current_user.get_id(),
        }
        mappings.append(info)
    db.session.bulk_update_mappings(ModelCustomSet, mappings)
    db.session.flush()
    db.session.commit()
