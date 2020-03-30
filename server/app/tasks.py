import time

from app import db
from app.database.model_user import ModelUser


def send_email(email):
    time.sleep(10)  # simulate long-running process
    user = db.session.query(ModelUser).filter_by(email=email).one_or_none()
    user.email_sent = True
    db.session.commit()
    return True
