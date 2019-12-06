import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

class ModelItemConditions(Base):
    __tablename__ = 'item_conditions'

    uuid = Column(UUID(as_uuid=True),
            server_default=sqlalchemy.text("uuid_generate_v4()"), primary_key=True)
    item_id = Column(UUID, ForeignKey('item.uuid'))
    stat_type = Column('stat_type', String)
    condition_type = Column('conditionType', String)
    limit = Column('limit', Integer)
