from app import app, db
from app.database.model_user import ModelUser
from app.verify_email_utils import decode_token
from flask import flash, redirect, Blueprint
import os

REDIRECT_URL = os.getenv("HOME_PAGE")
REDIRECT_URL_FORMAT = "{}?verify_email={}"

verify_email_blueprint = Blueprint("verify_email", __name__,)


@verify_email_blueprint.route("/api/verify_email/<token>")
def verify_email(token):
    email = decode_token(token)
    if not email:
        return redirect(REDIRECT_URL_FORMAT.format(REDIRECT_URL, "invalid"))
    user = db.session.query(ModelUser).filter_by(email=email).one()
    if user.verified:
        return redirect(REDIRECT_URL_FORMAT.format(REDIRECT_URL, "already_verified"))
    user.verified = True
    db.session.add(user)
    db.session.commit()
    return redirect(REDIRECT_URL_FORMAT.format(REDIRECT_URL, "success"))
