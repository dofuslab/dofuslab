from itsdangerous import URLSafeTimedSerializer
from flask import current_app, url_for


SALT = "verify-email-salt"


def encode_token(email):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt=SALT)


def decode_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email = serializer.loads(token, salt=SALT, max_age=expiration)
        return email
    except Exception as e:
        return False


def generate_url(endpoint, token):
    return url_for(endpoint, token=token, _external=True)
