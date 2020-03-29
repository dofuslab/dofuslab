import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .enums import SpellEffectEnum


class ModelSpellEffect(Base):
    __tablename__ = "spell_effect"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )

    spell_stat_id = Column(
        UUID(as_uuid=True), ForeignKey("spell_stats.uuid"), nullable=False
    )
    effect_type = Column("effect_type", SpellEffectEnum, nullable=False)
    min_damage = Column("min_damage", Integer)
    max_damage = Column("max_damage", Integer, nullable=False)
    crit_min_damage = Column("crit_min_damage", Integer)
    crit_max_damage = Column("crit_max_damage", Integer)
