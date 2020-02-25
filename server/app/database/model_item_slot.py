import sqlalchemy
from .base import Base
from .item_type_slot_compat_table import item_type_slot_compat_table
from sqlalchemy import Column, String
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
    name = Column("name", String, nullable=False)
    item_types = relationship(
        "ModelItemType",
        secondary=item_type_slot_compat_table,
        back_populates="eligible_item_slots",
    )

