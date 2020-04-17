from app import db, session_scope
from app.database.model_custom_set import ModelCustomSet
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.model_item import ModelItem
from app.database.model_item_stat import ModelItemStat
from app.database.model_item_translation import ModelItemTranslation
from datetime import datetime
from flask import session
from flask_babel import _
from graphql import GraphQLError
from flask_login import current_user
from sqlalchemy import update


def get_or_create_custom_set(custom_set_id):
    with session_scope() as db_session:
        owned_custom_sets = session.get("owned_custom_sets") or []
        if custom_set_id:
            custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
            if custom_set.owner_id and custom_set.owner_id != current_user.get_id():
                raise GraphQLError(_("You don't have permission to edit that set."))
            elif not custom_set.owner_id and custom_set.uuid not in owned_custom_sets:
                raise GraphQLError(_("You don't have permission to edit that set."))
            custom_set.last_modified = datetime.now()
        else:
            custom_set = ModelCustomSet(owner_id=current_user.get_id())
            db_session.add(custom_set)
            db_session.flush()
            custom_set_stat = ModelCustomSetStat(custom_set_id=custom_set.uuid)
            if current_user.is_anonymous:
                owned_custom_sets.append(custom_set.uuid)
                session["owned_custom_sets"] = owned_custom_sets
            db_session.add(custom_set_stat)
        return custom_set


def save_custom_sets():
    with session_scope() as db_session:
        owned_custom_sets = session.get("owned_custom_sets")
        if owned_custom_sets:
            db_session.query(ModelCustomSet).filter(
                ModelCustomSet.uuid.in_(owned_custom_sets)
            ).update(
                {ModelCustomSet.owner_id: current_user.get_id()},
                synchronize_session="fetch",
            )
            session["owned_custom_sets"] = []


def anonymous_or_verified(func):
    def wrapper(*args, **kwargs):
        if (
            current_user.is_authenticated
            and not current_user._get_current_object().verified
        ):
            raise GraphQLError(
                _("Please verify your account to continue using DofusLab.")
            )
        return func(*args, **kwargs)

    return wrapper


def get_items(locale, filters):
    items_query = (
        db.session.query(ModelItem).join(ModelItemTranslation).filter_by(locale=locale)
    )

    if filters:
        search = filters.search.strip()
        if filters.stats:
            items_query = items_query.join(ModelItemStat)
            stat_names = set(map(lambda x: Stat(x).name, filters.stats))
            stat_sq = (
                db.session.query(
                    ModelItemStat.item_id,
                    func.count(ModelItemStat.uuid).label("num_stats_matched"),
                )
                .filter(
                    ModelItemStat.stat.in_(stat_names), ModelItemStat.max_value > 0,
                )
                .group_by(ModelItemStat.item_id)
                .subquery()
            )
            items_query = items_query.join(
                stat_sq, ModelItem.uuid == stat_sq.c.item_id
            ).filter(stat_sq.c.num_stats_matched == len(stat_names))
        if filters.max_level:
            items_query = items_query.filter(ModelItem.level <= filters.max_level)
        if filters.search:
            items_query = (
                items_query.join(ModelSet, isouter=True)
                .join(ModelSetTranslation, isouter=True)
                .filter(
                    func.upper(ModelItemTranslation.name).contains(
                        func.upper(filters.search.strip())
                    )
                    | func.upper(ModelSetTranslation.name).contains(
                        func.upper(filters.search.strip())
                    )
                )
            )
        if filters.item_type_ids:
            items_query = items_query.filter(
                ModelItem.item_type_id.in_(filters.item_type_ids)
            )
    return items_query.order_by(
        ModelItem.level.desc(), ModelItemTranslation.name.asc()
    ).all()
