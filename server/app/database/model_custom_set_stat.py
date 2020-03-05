import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, text
from sqlalchemy.dialects.postgresql import UUID


class ModelCustomSetStat(Base):
    __tablename__ = "custom_set_stat"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    scrolled_vitality = Column(
        "scrolled_vitality", Integer, server_default=text("0"), nullable=False
    )
    scrolled_wisdom = Column(
        "scrolled_wisdom", Integer, server_default=text("0"), nullable=False
    )
    scrolled_strength = Column(
        "scrolled_strength", Integer, server_default=text("0"), nullable=False
    )
    scrolled_intelligence = Column(
        "scrolled_intelligence", Integer, server_default=text("0"), nullable=False
    )
    scrolled_chance = Column(
        "scrolled_chance", Integer, server_default=text("0"), nullable=False
    )
    scrolled_agility = Column(
        "scrolled_agility", Integer, server_default=text("0"), nullable=False
    )

    base_vitality = Column(
        "base_vitality", Integer, server_default=text("0"), nullable=False
    )
    base_wisdom = Column(
        "base_wisdom", Integer, server_default=text("0"), nullable=False
    )
    base_strength = Column(
        "base_strength", Integer, server_default=text("0"), nullable=False
    )
    base_intelligence = Column(
        "base_intelligence", Integer, server_default=text("0"), nullable=False
    )
    base_chance = Column(
        "base_chance", Integer, server_default=text("0"), nullable=False
    )
    base_agility = Column(
        "base_agility", Integer, server_default=text("0"), nullable=False
    )

    custom_set_id = Column(
        UUID(as_uuid=True), ForeignKey("custom_set.uuid"), nullable=False, index=True
    )
