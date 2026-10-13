import os

from app import app
from app.database.base import engine
from sqlalchemy.engine import make_url


def test_flask_and_runtime_engines_share_the_normalized_database_url():
    raw_url = os.environ["DATABASE_URL"]
    configured_url = app.config["SQLALCHEMY_DATABASE_URI"]

    assert configured_url.startswith("postgresql+psycopg2://")
    if raw_url.startswith("postgres+psycopg2://"):
        assert configured_url.removeprefix(
            "postgresql+psycopg2://"
        ) == raw_url.removeprefix("postgres+psycopg2://")
    else:
        assert configured_url == raw_url

    assert engine.url == make_url(configured_url)


def test_flask_migrate_consumes_the_normalized_database_url():
    result = app.test_cli_runner().invoke(args=["db", "upgrade"])

    assert result.exit_code == 0, result.output
