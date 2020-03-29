import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .enums import WeaponEffectEnum


class ModelWeaponEffect(Base):
    __tablename__ = "weapon_effect"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )

    weapon_stat_id = Column(
        UUID(as_uuid=True), ForeignKey("weapon_stat.uuid"), nullable=False
    )
    effect_type = Column("effect_type", WeaponEffectEnum, nullable=False)
    min_damage = Column("min_damage", Integer)
    max_damage = Column("max_damage", Integer, nullable=False)
