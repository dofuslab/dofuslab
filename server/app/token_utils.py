from itsdangerous import URLSafeTimedSerializer
from flask import current_app, url_for


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


def generate_url(endpoint, token):
    return url_for(endpoint, token=token, _external=True)
