import sqlalchemy
from .base import Base
from .item_type_slot_compat_table import item_type_slot_compat_table
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelItemSlot(Base):
    __tablename__ = "item_slot"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_types = relationship(
        "ModelItemType",
        secondary=item_type_slot_compat_table,
        back_populates="eligible_item_slots",
    )
    order = Column("order", Integer, nullable=False)
    image_url = Column("image_url", String, nullable=False)

    item_slot_translation = relationship(
        "ModelItemSlotTranslation", backref="item_slot", cascade="all, delete-orphan"
    )
