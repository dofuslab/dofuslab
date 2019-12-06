import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID

class ModelCustomSetStats(Base):
    __tablename__ = 'custom_set_stats'

    uuid = Column(
            UUID(as_uuid=True),
            server_default=sqlalchemy.text("uuid_generate_v4()"),
            primary_key=True,
            nullable=False,
    )
    scrolled_vitality = Column('scrolledVitality', Integer)
    scrolled_wisdom = Column('scrolledWisdom', Integer)
    scrolled_strength = Column('scrolledStrength', Integer)
    scrolled_intelligence = Column('scrolledIntelligence', Integer)
    scrolled_chance = Column('scrolledChance', Integer)
    scrolled_agility = Column('scrolledAgility', Integer)

    base_vitality = Column('baseVitality', Integer)
    base_wisdom = Column('baseWisdom', Integer)
    base_strength = Column('baseStrength', Integer)
    base_intelligence = Column('baseIntelligence', Integer)
    base_chance = Column('baseChance', Integer)
    base_agility = Column('baseAgility', Integer)

    custom_set_id = Column(UUID, ForeignKey('custom_set.uuid'))
