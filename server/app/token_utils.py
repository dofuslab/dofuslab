import os
from typing import Literal

from flask import current_app
from itsdangerous import BadData, URLSafeTimedSerializer


def encode_token(email: str, salt: str) -> str:
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt=salt)


def decode_token(token: str, salt: str, expiration: int = 3600) -> str | Literal[False]:
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email = serializer.loads(token, salt=salt, max_age=expiration)
    except (BadData, UnicodeError):
        return False

    return email if isinstance(email, str) else False


def generate_verify_email_url(token: str) -> str:
    """
    Generate an external URL for the verify email endpoint.
    Uses base_url from environment instead of url_for to avoid issues
    when called from background jobs without request context.
    """
    base_url = os.getenv("HOME_PAGE", "https://dofuslab.io/")
    # Remove trailing slash from base_url if present
    base_url = base_url.rstrip("/")
    # Construct the URL manually
    return f"{base_url}/api/verify-email/{token}"
