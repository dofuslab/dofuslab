from flask import Flask
from itsdangerous import URLSafeTimedSerializer

from app.token_utils import decode_token, encode_token, generate_verify_email_url


def test_token_round_trip_and_invalid_token():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "test-secret"

    with app.app_context():
        token = encode_token("user@example.invalid", "email-test")
        assert decode_token(token, "email-test") == "user@example.invalid"
        assert decode_token(token, "wrong-salt") is False


def test_non_string_payload_is_rejected():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "test-secret"

    with app.app_context():
        serialized = URLSafeTimedSerializer(app.config["SECRET_KEY"]).dumps(
            {"email": "user@example.invalid"}, salt="email-test"
        )
        assert decode_token(serialized, "email-test") is False


def test_malformed_unicode_token_is_rejected():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "test-secret"

    with app.app_context():
        assert decode_token("\ud800", "email-test") is False


def test_verify_email_url_uses_home_page(monkeypatch):
    monkeypatch.setenv("HOME_PAGE", "https://example.invalid/base/")

    assert (
        generate_verify_email_url("abc")
        == "https://example.invalid/base/api/verify-email/abc"
    )
