from app import app, session_scope
from app.database.model_user import ModelUserAccount
from app.verify_email_utils import decode_token
from flask import flash, redirect, Blueprint
import os

REDIRECT_URL = os.getenv("HOME_PAGE")
REDIRECT_URL_FORMAT = "{}?verify_email={}"

verify_email_blueprint = Blueprint("verify_email", __name__,)


@verify_email_blueprint.route("/api/verify_email/<token>")
def verify_email(token):
    with session_scope() as db_session:
        email = decode_token(token)
        if not email:
            return redirect(REDIRECT_URL_FORMAT.format(REDIRECT_URL, "invalid"))
        user = db_session.query(ModelUserAccount).filter_by(email=email).one()
        if user.verified:
            return redirect(
                REDIRECT_URL_FORMAT.format(REDIRECT_URL, "already_verified")
            )
        user.verified = True
        db_session.add(user)
        return redirect(REDIRECT_URL_FORMAT.format(REDIRECT_URL, "success"))
