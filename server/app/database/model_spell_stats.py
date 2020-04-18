import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelSpellStats(Base):
    __tablename__ = "spell_stats"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    spell_id = Column(
        UUID(as_uuid=True), ForeignKey("spell.uuid", ondelete="CASCADE"), nullable=False
    )

    spell_stat_translation = relationship(
        "ModelSpellStatTranslation",
        backref="spell_stats",
        cascade="all, delete-orphan",
    )
    level = Column("level", Integer, nullable=False)
    ap_cost = Column("ap_cost", Integer, nullable=False)
    cooldown = Column("cooldown", Integer)
    base_crit_chance = Column("base_crit_chance", Integer)
    casts_per_turn = Column("casts_per_turn", Integer)
    casts_per_target = Column("casts_per_target", Integer)
    needs_los = Column("needs_los", Boolean, nullable=False)
    has_modifiable_range = Column("has_modifiable_range", Boolean, nullable=False)
    is_linear = Column("is_linear", Boolean, nullable=False)
    needs_free_cell = Column("needs_free_cell", Boolean, nullable=False)
    min_range = Column("min_range", Integer)
    max_range = Column("max_range", Integer)

    spell_effects = relationship(
        "ModelSpellEffect", backref="spell_stats", cascade="all, delete-orphan"
    )
