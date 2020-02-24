from dotenv import load_dotenv
from flask import Flask, escape, request, render_template
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_graphql import GraphQLView
from flask_migrate import Migrate
import os
from database.base import Base


load_dotenv()

db_uri = os.getenv("DB_URI")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

bcrypt = Bcrypt(app)

migrate = Migrate(app, Base)

from app.schema import schema


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/create")
def create():
    return render_template("set_creation.html", title="Set")


app.add_url_rule(
    "/graphql", view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True),
)


if __name__ == "__main__":
    app.run(debug=True)
