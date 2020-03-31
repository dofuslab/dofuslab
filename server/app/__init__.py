from dotenv import load_dotenv
from flask import Flask, escape, request, session
from flask_session import Session
from flask_babel import Babel
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_graphql import GraphQLView
from flask_migrate import Migrate
import os
from app.database.base import Base
import flask_login
from flask_cors import CORS
import redis

load_dotenv()


db_uri = os.getenv("DATABASE_URL")
secret_key = os.getenv("SECRET_KEY")
session_cookie_domain = os.getenv("SESSION_COOKIE_DOMAIN")
remember_cookie_domain = os.getenv("REMEMBER_COOKIE_DOMAIN")
session_cookie_secure = bool(os.getenv("SESSION_COOKIE_SECURE"))
redis_host = os.getenv("REDIS_HOST")
redis_port = os.getenv("REDIS_PORT")
session_redis = os.getenv("SESSION_REDIS")

r = redis.Redis(host=redis_host, port=int(redis_port), db=0)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = secret_key
app.config["SESSION_COOKIE_DOMAIN"] = session_cookie_domain
app.config["SESSION_COOKIE_SECURE"] = session_cookie_secure
app.config["REMEMBER_COOKIE_DOMAIN"] = remember_cookie_domain
app.config["REMEMBER_COOKIE_PATH"] = "/"
app.config["SESSION_TYPE"] = "redis"
app.config["SESSION_REDIS"] = r


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

babel = Babel(app)

bcrypt = Bcrypt(app)

login_manager = flask_login.LoginManager()
login_manager.init_app(app)

dirname = os.path.dirname(os.path.abspath(__file__))
migration_dir = os.path.join(dirname, "migrations")

migrate = Migrate(app, Base, directory=migration_dir)

from app.schema import schema

app.add_url_rule(
    "/api/graphql",
    view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True),
)

from app.verify_email import verify_email_blueprint

app.register_blueprint(verify_email_blueprint)


if __name__ == "__main__":
    app.run(debug=True, host=".dev.localhost")
