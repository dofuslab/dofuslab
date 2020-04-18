import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

item_type_slot_compat_table = Table(
    "item_type_slot",
    Base.metadata,
    Column(
        "item_slot_id",
        UUID(as_uuid=True),
        ForeignKey("item_slot.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    Column(
        "item_type_id",
        UUID(as_uuid=True),
        ForeignKey("item_type.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    UniqueConstraint("item_slot_id", "item_type_id"),
)
