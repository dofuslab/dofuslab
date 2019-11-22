from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType
from sqlalchemy.dialects.postgresql import UUID


class ModelItem(Base):
    __tablename__ = 'item'

    id = Column(
        'id', UUID(as_uuid=True), unique=True, nullable=False, primary_key=True,
    )
    name = Column('name', String, nullable=False)
    item_type = Column('item_type', String, nullable=False)
    set_id = Column(String, ForeignKey('set.name'))
    level = Column('level', Integer, nullable=False)
    stats = Column('stats', PickleType)
    conditions = Column('conditions', PickleType)
    image_url = Column('image_url', String)

    custom_set_id = Column(Integer, ForeignKey('custom_set.id'))
