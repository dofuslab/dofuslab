from app import db, session_scope, cache_region, limiter
from app.database.model_custom_set import ModelCustomSet, MAX_NAME_LENGTH
from app.database.model_custom_set_stat import ModelCustomSetStat
from app.database.enums import GameVersion
from datetime import datetime
from flask import session
from flask_babel import _
from graphql import GraphQLError
from flask_login import current_user
from sqlalchemy import update

base_stat_list = [
    "base_vitality",
    "base_wisdom",
    "base_strength",
    "base_intelligence",
    "base_chance",
    "base_agility",
]
scrolled_stat_list = [
    "scrolled_vitality",
    "scrolled_wisdom",
    "scrolled_strength",
    "scrolled_intelligence",
    "scrolled_chance",
    "scrolled_agility",
]


@limiter.limit("3/second", error_message=_("Please wait a moment before trying again."))
def get_or_create_custom_set(custom_set_id, db_session, game_version):
    owned_custom_sets = session.get("owned_custom_sets") or []
    if custom_set_id:
        custom_set = db_session.query(ModelCustomSet).get(custom_set_id)
        if custom_set.owner_id and custom_set.owner_id != current_user.get_id():
            raise GraphQLError(_("You don't have permission to edit that build."))
        elif not custom_set.owner_id and custom_set.uuid not in owned_custom_sets:
            raise GraphQLError(_("You don't have permission to edit that build."))
        custom_set.last_modified = datetime.utcnow()
    else:
        custom_set = ModelCustomSet(
            owner_id=current_user.get_id(), game_version=game_version
        )
        db_session.add(custom_set)
        db_session.flush()
        custom_set_stat = ModelCustomSetStat(custom_set_id=custom_set.uuid)
        if current_user.is_anonymous:
            owned_custom_sets.append(custom_set.uuid)
            session["owned_custom_sets"] = owned_custom_sets
        db_session.add(custom_set_stat)
    return custom_set


def save_custom_sets(db_session):
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


def verified(func):
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            raise GraphQLError(_("You are not logged in."))
        if (
            current_user.is_authenticated
            and not current_user._get_current_object().verified
        ):
            raise GraphQLError(
                _("Please verify your account to continue using DofusLab.")
            )
        return func(*args, **kwargs)

    return wrapper


def check_owner(custom_set):
    if not custom_set:
        raise GraphQLError(_("That build does not exist."))
    owned_custom_sets = session.get("owned_custom_sets") or []
    if custom_set.owner_id and custom_set.owner_id != current_user.get_id():
        raise GraphQLError(_("You don't have permission to edit that build."))
    elif not custom_set.owner_id and custom_set.uuid not in owned_custom_sets:
        raise GraphQLError(_("You don't have permission to edit that build."))


def edit_custom_set_stats(custom_set, stats):
    for base_stat in base_stat_list:
        if stats[base_stat] < 0 or stats[base_stat] > 999:
            raise GraphQLError(_("Invalid stat value."))
    for scrolled_stat in scrolled_stat_list:
        if stats[scrolled_stat] < 0 or stats[scrolled_stat] > 100:
            raise GraphQLError(_("Invalid stat value."))
    for stat in base_stat_list + scrolled_stat_list:
        setattr(custom_set.stats, stat, stats[stat])


def edit_custom_set_metadata(custom_set, name, level):
    if len(name) > MAX_NAME_LENGTH:
        raise GraphQLError(_("The set name is too long."))
    if level < 1 or level > 200:
        raise GraphQLError(_("Invalid set level (must be 1-200)."))
    custom_set.name = name
    custom_set.level = level


def get_game_version(request):
    host = request.headers.get("Origin") or request.headers.get("Host")
    print(host)
    if "retro." in host:
        return GameVersion.DOFUS_RETRO
    elif "touch." in host:
        return GameVersion.DOFUS_TOUCH
    return GameVersion.DOFUS_2
