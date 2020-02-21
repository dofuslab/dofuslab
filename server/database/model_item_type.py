import sqlalchemy
from .base import Base
from .item_type_slot_compat_table import item_type_slot_compat_table
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelItemType(Base):
    __tablename__ = "item_type"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    name = Column("name", String, nullable=False)
    eligible_item_slots = relationship(
        "ModelItemSlot", secondary=item_type_slot_compat_table
    )
    items = relationship("ModelItem", back_populates="item_type")

