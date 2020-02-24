import sqlalchemy
from .base import Base, db_session
from app import bcrypt
from sqlalchemy import Column, ForeignKey, Integer, String, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class ModelUser(Base):
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

    @staticmethod
    def generate_hash(password):
        return bcrypt.generate_password_hash(password)
