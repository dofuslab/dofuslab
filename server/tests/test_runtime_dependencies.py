from contextlib import contextmanager
from types import SimpleNamespace


def test_french_graphql_validation_uses_compiled_catalog():
    from app import app

    response = app.test_client().post(
        "/api/graphql",
        json={
            "query": (
                'mutation { registerUser(username: "abc", email: "invalid", '
                'password: "Password1", gender: MALE) { ok } }'
            )
        },
        headers={"Accept-Language": "fr"},
    )

    assert response.status_code == 200
    assert "L'adresse mail est invalide." in str(response.get_json())


def test_send_email_uses_runtime_ses_configuration_without_external_send(monkeypatch):
    from app import tasks

    user = SimpleNamespace(email_sent=False)
    sent = {}

    class FakeSession:
        def query(self, _model):
            return self

        def filter_by(self, **_kwargs):
            return self

        def one(self):
            return user

    class FakeSES:
        def send_email(self, **kwargs):
            sent["message"] = kwargs

    @contextmanager
    def fake_session_scope():
        yield FakeSession()

    def fake_client(service, **kwargs):
        sent["client"] = (service, kwargs)
        return FakeSES()

    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test-access-key")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test-secret-key")
    monkeypatch.setenv("SES_REGION", "test-region-1")
    monkeypatch.setenv("SES_EMAIL_SOURCE", "no-reply@example.invalid")
    monkeypatch.setattr(tasks, "session_scope", fake_session_scope)
    monkeypatch.setattr(tasks.boto3, "client", fake_client)

    assert tasks.send_email("user@example.invalid", "Subject", "<p>Body</p>")
    assert sent["client"] == (
        "ses",
        {
            "region_name": "test-region-1",
            "aws_access_key_id": "test-access-key",
            "aws_secret_access_key": "test-secret-key",
        },
    )
    assert sent["message"] == {
        "Source": "no-reply@example.invalid",
        "Destination": {"ToAddresses": ["user@example.invalid"]},
        "Message": {
            "Subject": {"Data": "Subject"},
            "Body": {"Html": {"Data": "<p>Body</p>"}},
        },
    }
    assert user.email_sent is True
