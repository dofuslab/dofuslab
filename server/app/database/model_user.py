import sqlalchemy
from .base import Base, db_session
from app import bcrypt, login_manager
from sqlalchemy import Column, ForeignKey, Integer, String, LargeBinary, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from flask_login import UserMixin


class ModelUser(UserMixin, Base):
    __tablename__ = "user"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
    )
    username = Column("username", String(120), unique=True, nullable=False)
    email = Column("email", String(320), unique=True, nullable=False)
    password = Column("password", LargeBinary(120), nullable=False)
    custom_sets = relationship("ModelCustomSet", backref="user")

    def save_to_db(self):
        db_session.add(self)
        db_session.commit()

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
        return cls.query.filter_by(uuid=user_id).first()

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter(func.upper(cls.email) == func.upper(email)).first()

    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter(
            func.upper(cls.username) == func.upper(username)
        ).first()


@login_manager.user_loader
def user_loader(user_id):
    return ModelUser.find_by_id(user_id)


@login_manager.request_loader
def load_user_from_request(request):
    print(request)
    return None
