import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelEquippedItem(Base):
    __tablename__ = "equipped_item"
    # Don't allow a set to have two entries with the same item slot
    __table_args__ = (UniqueConstraint("item_slot_id", "custom_set_id"),)
    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_slot_id = Column(
        UUID(as_uuid=True), ForeignKey("item_slot.uuid"), nullable=False, index=True,
    )
    custom_set_id = Column(
        UUID(as_uuid=True), ForeignKey("custom_set.uuid"), nullable=False, index=True,
    )
    item_id = Column(UUID(as_uuid=True), ForeignKey("item.uuid"))
    item = relationship("ModelItem")
    slot = relationship("ModelItemSlot")
    exos = relationship("ModelEquippedItemExo")

