from dotenv import load_dotenv
from flask import Flask, escape, request, session, g
from flask_session import Session
from flask_babel import Babel, _, ngettext
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_graphql import GraphQLView
from flask_migrate import Migrate
from flask_limiter_graphQL_support import Limiter
from flask_limiter_graphQL_support.util import get_remote_address
import os
from app.database.base import Base
from flask_login import LoginManager, current_user
from flask_cors import CORS
import redis
from worker import redis_connection
from rq import Queue
from jinja2 import Environment, FileSystemLoader
from dogpile.cache import make_region

import logging

# logging.basicConfig()
# logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
# logging.getLogger().setLevel(logging.INFO)


load_dotenv()

app = Flask(__name__)
app.config.from_object("config.Config")
Session(app)

q = Queue(connection=redis_connection)

base_url = os.getenv("HOME_PAGE")
flask_env = os.getenv("FLASK_ENV")
reset_password_salt = "reset-password-salt"

# supported_languages = ["en", "fr", "pt", "it", "de", "es"]
supported_languages = ["en", "fr", "it", "es", "pt"]

origins = []
if flask_env == "development":
    origins = [
        "http://localhost:3000",
        "http://dev.localhost:3000",
        "http://localhost:3001",
        "http://dev.localhost:3001",
        "chrome-extension://nnajljfdkjbhhgbfjbnnkmbkediobfjn",
    ]
elif flask_env == "production":
    origins = [
        "https://www.dofuslab.io",
        "https://dofuslab.io",
        "chrome-extension://gplnfnclffeoogcfibnjiiekmpohjibk",
        "chrome-extension://nnajljfdkjbhhgbfjbnnkmbkediobfjn",
    ]
    from ddtrace.runtime import RuntimeMetrics

    RuntimeMetrics.enable()

db = SQLAlchemy(app)
CORS(
    app,
    resources={r"/*": {"origins": origins}},
    supports_credentials=True,
)

from contextlib import contextmanager


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    db_session = db.session
    try:
        yield db_session
        db_session.commit()
    except:
        db_session.rollback()
        raise


babel = Babel(app)


@babel.localeselector
def get_locale():
    return request.accept_languages.best_match(supported_languages)


bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)

dirname = os.path.dirname(os.path.abspath(__file__))
migration_dir = os.path.join(dirname, "migrations")

migrate = Migrate(app, Base, directory=migration_dir)

template_env = Environment(
    loader=FileSystemLoader("%s/templates/" % os.path.dirname(__file__)),
    extensions=["jinja2.ext.i18n"],
)
template_env.install_gettext_callables(gettext=_, ngettext=ngettext)

limiter = Limiter(app, key_func=get_remote_address)

cache_region = make_region().configure(
    "dogpile.cache.redis",
    arguments={
        "host": os.environ.get("REDIS_HOST"),
        "port": os.environ.get("REDIS_PORT"),
        "redis_expiration_time": 60 * 60 * 2,  # 2 hours
        "distributed_lock": True,
        "thread_local_lock": False,
    },
)

cache = redis.Redis(
    host=os.environ.get("REDIS_HOST"),
    port=os.environ.get("REDIS_PORT"),
    decode_responses=True,
)


from app.schema import schema
from app.loaders import (
    ItemNameLoader,
    ItemStatsLoader,
    ItemStatTranslationLoader,
    SetLoader,
    SetBonusLoader,
    SetBonusTranslationLoader,
    SetTranslationLoader,
    WeaponEffectLoader,
    WeaponStatLoader,
    SpellBuffLoader,
    ItemBuffLoader,
    CustomSetTagAssociationLoader,
    CustomSetTagTranslationLoader,
    ItemSlotTranslationLoader,
    ItemTypeTranslationLoader,
    ClassTranslationLoader,
    ItemSlotToItemTypeLoader,
    EnClassTranslationLoader,
    EnItemSlotTranslationLoader,
    EnItemTypeTranslationLoader,
    ItemToItemTypeLoader,
    AllClassTranslationLoader,
    SetToItemLoader,
    ExoLoader,
    EquippedItemLoader,
    EquippedItemToItemLoader,
    EquippedItemToItemSlotLoader,
    SpellVariantPairLoader,
    SpellEffectLoader,
    SpellNameLoader,
    SpellLoader,
    SpellEffectConditionTranslationLoader,
    SpellDamageIncreaseLoader,
    EligibleItemSlotLoader,
    SpellDescriptionLoader,
)


@app.before_request
def construct_dataloaders():
    g.dataloaders = {
        "item_name_loader": ItemNameLoader(),
        "item_stats_loader": ItemStatsLoader(),
        "item_stat_translation_loader": ItemStatTranslationLoader(),
        "set_loader": SetLoader(),
        "set_bonus_loader": SetBonusLoader(),
        "set_bonus_translation_loader": SetBonusTranslationLoader(),
        "set_translation_loader": SetTranslationLoader(),
        "weapon_stat_loader": WeaponStatLoader(),
        "weapon_effect_loader": WeaponEffectLoader(),
        "spell_buff_loader": SpellBuffLoader(),
        "item_buff_loader": ItemBuffLoader(),
        "custom_set_tag_association_loader": CustomSetTagAssociationLoader(),
        "custom_set_tag_translation_loader": CustomSetTagTranslationLoader(),
        "item_slot_translation_loader": ItemSlotTranslationLoader(),
        "item_type_translation_loader": ItemTypeTranslationLoader(),
        "class_translation_loader": ClassTranslationLoader(),
        "item_slot_to_item_type_loader": ItemSlotToItemTypeLoader(),
        "en_class_translation_loader": EnClassTranslationLoader(),
        "en_item_slot_translation_loader": EnItemSlotTranslationLoader(),
        "en_item_type_translation_loader": EnItemTypeTranslationLoader(),
        "item_to_item_type_loader": ItemToItemTypeLoader(),
        "all_class_translation_loader": AllClassTranslationLoader(),
        "set_to_item_loader": SetToItemLoader(),
        "exo_loader": ExoLoader(),
        "equipped_item_loader": EquippedItemLoader(),
        "equipped_item_to_item_loader": EquippedItemToItemLoader(),
        "equipped_item_to_item_slot_loader": EquippedItemToItemSlotLoader(),
        "spell_variant_pair_loader": SpellVariantPairLoader(),
        "spell_effect_loader": SpellEffectLoader(),
        "spell_name_loader": SpellNameLoader(),
        "spell_loader": SpellLoader(),
        "spell_effect_condition_translation_loader": SpellEffectConditionTranslationLoader(),
        "spell_damage_increase_loader": SpellDamageIncreaseLoader(),
        "eligible_item_slot_loader": EligibleItemSlotLoader(),
        "spell_description_loader": SpellDescriptionLoader(),
    }


app.add_url_rule(
    "/api/graphql",
    view_func=GraphQLView.as_view(
        "graphql", schema=schema, graphiql=flask_env == "development"
    ),
)


@app.teardown_appcontext
def teardown_dataloaders(_):
    g.pop("dataloaders", None)


from app.verify_email import verify_email_blueprint

app.register_blueprint(verify_email_blueprint)

if __name__ == "__main__":
    app.run(debug=True, host=".dev.localhost")
