import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID


class ModelCustomSetStat(Base):
    __tablename__ = "custom_set_stat"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    scrolled_vitality = Column("scrolled_vitality", Integer)
    scrolled_wisdom = Column("scrolled_wisdom", Integer)
    scrolled_strength = Column("scrolled_strength", Integer)
    scrolled_intelligence = Column("scrolled_intelligence", Integer)
    scrolled_chance = Column("scrolled_chance", Integer)
    scrolled_agility = Column("scrolled_agility", Integer)

    base_vitality = Column("base_vitality", Integer)
    base_wisdom = Column("base_wisdom", Integer)
    base_strength = Column("base_strength", Integer)
    base_intelligence = Column("base_intelligence", Integer)
    base_chance = Column("base_chance", Integer)
    base_agility = Column("base_agility", Integer)

    custom_set_id = Column(
        UUID, ForeignKey("custom_set.uuid"), nullable=False, index=True
    )
