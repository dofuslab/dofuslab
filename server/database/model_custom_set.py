import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID


class ModelCustomSet(Base):
    __tablename__ = "custom_set"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    name = Column("name", String)
    description = Column("description", String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.uuid"), index=True)
    created_at = Column("creation_date", DateTime)
    level = Column("level", Integer)
    equipped_items = relationship("ModelItemSlot", secondary="equipped_item")
    stats = relationship("ModelCustomSetStat", cascade="all, delete-orphan")
