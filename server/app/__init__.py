from dotenv import load_dotenv
from flask import Flask, escape, request, render_template
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_graphql import GraphQLView
from flask_migrate import Migrate
import os
from app.database.base import Base
import flask_login
from flask_cors import CORS

load_dotenv()

db_uri = os.getenv("DATABASE_URL")
secret_key = os.getenv("SECRET_KEY")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = secret_key
app.config["SESSION_COOKIE_DOMAIN"] = ".dev.localhost"
app.config["REMEMBER_COOKIE_DOMAIN"] = ".dev.localhost"
app.config["REMEMBER_COOKIE_PATH"] = "/"

db = SQLAlchemy(app)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://dev.localhost:3000",
                "https://dofus-lab.herokuapp.com",
            ]
        }
    },
    supports_credentials=True,
)

bcrypt = Bcrypt(app)

login_manager = flask_login.LoginManager()
login_manager.init_app(app)

dirname = os.path.dirname(os.path.abspath(__file__))
migration_dir = os.path.join(dirname, "migrations")

migrate = Migrate(app, Base, directory=migration_dir)

from app.schema import schema

app.add_url_rule(
    "/graphql", view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True),
)


if __name__ == "__main__":
    app.run(debug=True, host=".dev.localhost")
