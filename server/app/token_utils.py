from itsdangerous import URLSafeTimedSerializer
from flask import current_app
import os


def encode_token(email, salt):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt=salt)


def decode_token(token, salt, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email = serializer.loads(token, salt=salt, max_age=expiration)
        return email
    except Exception as e:
        return False


def generate_verify_email_url(token):
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
