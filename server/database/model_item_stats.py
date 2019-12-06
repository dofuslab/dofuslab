import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, Integer, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4

class ModelItemStats(Base):
    __tablename__ = 'item_stats'

    uuid = Column(UUID(as_uuid=True),
            server_default=sqlalchemy.text("uuid_generate_v4()"), primary_key=True)
    item_id = Column(UUID, ForeignKey('item.uuid'))
    stat = Column('stat', String)
    min_value = Column('minValue', Integer)
    max_value = Column('maxValue', Integer)
