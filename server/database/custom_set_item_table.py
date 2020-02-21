import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

custom_set_item_table = Table(
    "custom_set_item",
    Base.metadata,
    Column(
        "item_slot_id", UUID(as_uuid=True), ForeignKey("item_slot.uuid"), nullable=False
    ),
    Column(
        "custom_set_id",
        UUID(as_uuid=True),
        ForeignKey("custom_set.uuid"),
        nullable=False,
        index=True,
    ),
    Column("item_id", UUID(as_uuid=True), ForeignKey("item.uuid")),
    # Don't allow a set to have two entries with the same item slot
    UniqueConstraint("item_slot_id", "custom_set_id", name="custom_set_item_slot"),
)
