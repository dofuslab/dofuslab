import os
from typing import Literal, Protocol, TypedDict, cast

import boto3

from app import session_scope
from app.database.model_user import ModelUserAccount


class _EmailContent(TypedDict):
    Data: str


class _EmailBody(TypedDict):
    Html: _EmailContent


class _EmailDestination(TypedDict):
    ToAddresses: list[str]


class _EmailMessage(TypedDict):
    Subject: _EmailContent
    Body: _EmailBody


class _SESClient(Protocol):
    def send_email(
        self,
        *,
        Source: str,
        Destination: _EmailDestination,
        Message: _EmailMessage,
    ) -> object: ...


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} must be configured")
    return value


def _ses_client() -> _SESClient:
    return cast(
        _SESClient,
        boto3.client(
            "ses",
            region_name=os.getenv("SES_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        ),
    )


def send_email(email: str, subject: str, content: str) -> Literal[True]:
    source = _required_env("SES_EMAIL_SOURCE")
    with session_scope() as db_session:
        ses = _ses_client()
        ses.send_email(
            Source=source,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Html": {"Data": content}},
            },
        )
        user = db_session.query(ModelUserAccount).filter_by(email=email).one()
        user.email_sent = True
        return True
