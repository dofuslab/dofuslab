import sqlalchemy
from .base import Base
from .enums import StatEnum
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID


class ModelItemCondition(Base):
    __tablename__ = "item_condition"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
    )
    item_id = Column(UUID(as_uuid=True), ForeignKey("item.uuid"), index=True)

    # Following 3 columns are used together to describe normal stat conditions
    # e.g. AP < 12 (stat=AP, is_greater_than=False, limit=12)
    # or Strength > 350 (stat=Strength, is_greater_than=True, limit=350)
    # null if different condition type, like set bonus or custom
    stat = Column("stat", StatEnum)
    is_greater_than = Column("stat_greater_than", Boolean)
    limit = Column("limit", Integer)

    # True if condition is "Set bonus < 2"
    is_set_bonus_condition = Column(
        "is_set_bonus", Boolean, nullable=False, default=False
    )

    # Custom condition e.g. "Kamas < 800000" that doesn't need to be parsed
    # on the frontend
    custom_condition = Column("custom_condition", String)
