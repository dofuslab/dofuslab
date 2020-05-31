import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, Enum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
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
        UUID(as_uuid=True),
        ForeignKey("spell_stats.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    effect_type = Column("effect_type", SpellEffectEnum, nullable=False)
    min_damage = Column("min_damage", Integer)
    max_damage = Column("max_damage", Integer, nullable=False)
    crit_min_damage = Column("crit_min_damage", Integer)
    crit_max_damage = Column("crit_max_damage", Integer)
    has_condition = Column("has_condition", Boolean, index=True, nullable=False)
    order = Column("order", Integer)

    condition = relationship(
        "ModelSpellEffectConditionTranslation",
        backref="spell_effect",
        cascade="all, delete-orphan",
    )
