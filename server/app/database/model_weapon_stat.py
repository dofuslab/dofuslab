import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID


class ModelWeaponStat(Base):
    __tablename__ = "weapon_stat"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )

    item_id = Column(
        UUID(as_uuid=True), ForeignKey("item.uuid", ondelete="CASCADE"), nullable=False
    )
    item = relationship("ModelItem", back_populates="weapon_stats")
    weapon_effects = relationship(
        "ModelWeaponEffect", backref="weapon_stat", cascade="all, delete-orphan",
    )
    ap_cost = Column("ap_cost", Integer, nullable=False)
    uses_per_turn = Column("uses_per_turn", Integer, nullable=False)
    min_range = Column("min_range", Integer)
    max_range = Column("max_range", Integer, nullable=False)
    base_crit_chance = Column("base_crit_chance", Integer)
    crit_bonus_damage = Column("crit_bonus_damage", Integer)
