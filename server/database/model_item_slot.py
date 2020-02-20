import sqlalchemy
from .base import Base
from .enums import ItemType
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy_enum_list import EnumSetType


class ModelItemSlot(Base):
    __tablename__ = "item_slot"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    name = Column("name", String, nullable=False)
    item_types = Column("item_types", EnumSetType(ItemType, int), nullable=False)

