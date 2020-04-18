"""App configuration."""
from os import environ
import redis
from worker import redis_connection, queues


REDIS_HOST = environ.get("REDIS_HOST")
REDIS_PORT = environ.get("REDIS_PORT")


class Config:
    """Set Flask configuration vars from .env file."""

    # General Config
    SECRET_KEY = environ.get("SECRET_KEY")
    FLASK_APP = environ.get("FLASK_APP")
    FLASK_ENV = environ.get("FLASK_ENV")
    SQLALCHEMY_DATABASE_URI = environ.get("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_DOMAIN = environ.get("SESSION_COOKIE_DOMAIN")
    SESSION_COOKIE_SECURE = environ.get("SESSION_COOKIE_SECURE")
    REMEMBER_COOKIE_DOMAIN = environ.get("REMEMBER_COOKIE_DOMAIN")
    REMEMBER_COOKIE_PATH = "/"

    # Flask-Session
    SESSION_TYPE = "redis"
    SESSION_REDIS = redis_connection

    QUEUES = queues

    RATELIMIT_STORAGE_URL = "redis://{}:{}".format(REDIS_HOST, REDIS_PORT)
