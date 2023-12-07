import sqlalchemy
from .base import Base
from .model_set_bonus import ModelSetBonus
from sqlalchemy import Column, ForeignKey, Integer, String
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
    dofus_db_id = Column("dofus_db_id", String, nullable=False)
    set_translation = relationship("ModelSetTranslation", cascade="all, delete-orphan")
    items = relationship("ModelItem", cascade="all, delete-orphan")
    bonuses = relationship("ModelSetBonus", passive_deletes=True)
