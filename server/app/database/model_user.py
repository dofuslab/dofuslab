import sqlalchemy
from app import db
from .base import Base
from app import bcrypt, login_manager
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    LargeBinary,
    Boolean,
    func,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from flask_login import UserMixin
from datetime import datetime


class ModelUserAccount(UserMixin, Base):
    __tablename__ = "user_account"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
    )
    username = Column("username", String(120), unique=True, nullable=False, index=True)
    email = Column("email", String(320), unique=True, nullable=False, index=True)
    password = Column("password", LargeBinary, nullable=False)
    custom_sets = relationship("ModelCustomSet", backref="owner")
    creation_date = Column("creation_date", DateTime, default=datetime.now)
    verification_email_sent = Column(
        "verification_email_sent", Boolean, nullable=False, default=False
    )
    verified = Column("verified", Boolean, nullable=False, default=False, index=True)
    locale = Column("locale", String, nullable=False)

    def check_password(self, candidate):
        return bcrypt.check_password_hash(self.password, candidate)

    # needed to tell flask-login what the ID is
    def get_id(self):
        return self.uuid

    @staticmethod
    def generate_hash(password):
        return bcrypt.generate_password_hash(password)

    @classmethod
    def find_by_id(cls, user_id):
        return db.session.query(cls).filter_by(uuid=user_id).first()

    @classmethod
    def find_by_email(cls, email):
        return (
            db.session.query(cls)
            .filter(func.upper(cls.email) == func.upper(email))
            .first()
        )

    @classmethod
    def find_by_username(cls, username):
        return (
            db.session.query(cls)
            .filter(func.upper(cls.username) == func.upper(username))
            .first()
        )


@login_manager.user_loader
def user_loader(user_id):
    return ModelUserAccount.find_by_id(user_id)
