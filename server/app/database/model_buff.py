import sqlalchemy
from .base import Base
from .enums import StatEnum
from sqlalchemy import Column, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelBuff(Base):
    __tablename__ = "buff"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )

    item_id = Column(UUID(as_uuid=True), ForeignKey("item.uuid"), nullable=True)
    spell_stat_id = Column(
        UUID(as_uuid=True), ForeignKey("spell_stats.uuid"), nullable=True
    )

    stat = Column("stat", StatEnum, nullable=False)
    increment_by = Column("increment_by", Integer)
    max_stacks = Column("max_stacks", Integer)
    crit_increment_by = Column("crit_increment_by", Integer)
