import sqlalchemy
from .base import Base
from .enums import StatEnum
from sqlalchemy import Column, String, Integer, ForeignKey, text, Enum
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class ModelSetBonus(Base):
    __tablename__ = "set_bonus"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
    )
    set_id = Column(
        UUID(as_uuid=True), ForeignKey("set.uuid"), nullable=False, index=True
    )
    num_items = Column("num_items", Integer, nullable=False)
    stat = Column("stat", StatEnum, nullable=False)
    value = Column("max_value", Integer, nullable=False)
