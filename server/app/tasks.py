import time
import boto3
import os

from app import session_scope
from app.database.model_user import ModelUserAccount
from flask_babel import _


def send_email(email, subject, content):
    with session_scope() as db_session:
        ses = boto3.client(
            "ses",
            region_name=os.getenv("SES_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        ses.send_email(
            Source=os.getenv("SES_EMAIL_SOURCE"),
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Html": {"Data": content}},
            },
        )
        user = db_session.query(ModelUserAccount).filter_by(email=email).one()
        user.email_sent = True
        return True
