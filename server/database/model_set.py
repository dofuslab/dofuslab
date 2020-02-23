import sqlalchemy
from .base import Base
from .model_set_bonus import ModelSetBonus
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4


class ModelSet(Base):
    __tablename__ = "set"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
    )
    name = Column("name", String, nullable=False)
    items = relationship("ModelItem", cascade="all, delete-orphan")
    bonuses = relationship("ModelSetBonus", passive_deletes=True)
