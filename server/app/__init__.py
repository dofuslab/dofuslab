from dotenv import load_dotenv
from flask import Flask, escape, request, session
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
import flask_login
from flask_cors import CORS
import redis
from worker import redis_connection
from rq import Queue
from jinja2 import Environment, FileSystemLoader

# import logging

# logging.basicConfig()
# logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

load_dotenv()

app = Flask(__name__)
app.config.from_object("config.Config")
Session(app)

q = Queue(connection=redis_connection)

supported_languages = ["en", "fr", "pt", "it", "de", "es"]

db = SQLAlchemy(app)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://dev.localhost:3000",
                "https://dofus-lab.herokuapp.com",
                "https://dofuslab.io",
            ]
        }
    },
    supports_credentials=True,
)

from contextlib import contextmanager


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = db.session
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise


babel = Babel(app)

bcrypt = Bcrypt(app)

login_manager = flask_login.LoginManager()
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

from app.schema import schema

app.add_url_rule(
    "/api/graphql",
    view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True),
)

from app.verify_email import verify_email_blueprint

app.register_blueprint(verify_email_blueprint)

if __name__ == "__main__":
    app.run(debug=True, host=".dev.localhost")
