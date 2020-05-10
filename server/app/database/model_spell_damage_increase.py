import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class ModelSpellDamageIncrease(Base):
    __tablename__ = "spell_damage_increase"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )

    spell_stat_id = Column(
        UUID(as_uuid=True),
        ForeignKey("spell_stats.uuid", ondelete="CASCADE"),
        nullable=False,
    )

    base_increase = Column("base_increase", Integer, nullable=False)
    crit_base_increase = Column("crit_base_increase", Integer)
    max_stacks = Column("max_stacks", Integer)
