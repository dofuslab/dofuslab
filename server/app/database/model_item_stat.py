import sqlalchemy
from .base import Base
from .enums import StatEnum
from sqlalchemy import Column, String, Integer, ForeignKey, text, Enum
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class ModelItemStat(Base):
    __tablename__ = "item_stat"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_id = Column(
        UUID(as_uuid=True), ForeignKey("item.uuid"), nullable=False, index=True
    )
    stat = Column("stat", StatEnum)
    min_value = Column("min_value", Integer)
    max_value = Column("max_value", Integer)
    alt_stat = Column("alt_stat", String)
