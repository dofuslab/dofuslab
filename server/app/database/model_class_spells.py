import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import UUID


class ModelClassSpells(Base):
    __tablename__ = "class_spells"

    id = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )
