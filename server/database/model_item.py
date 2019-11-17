from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType


class ModelItem(Base):
    __tablename__ = 'item'

    name = Column('name', String, primary_key=True)
    item_type = Column('item_type', String)
    set_id = Column(String, ForeignKey('set.name'))
    level = Column('level', Integer)
    stats = Column('stats', PickleType)
    conditions = Column('conditions', PickleType)
    image_url = Column('image_url', String)

    custom_set_id = Column(Integer, ForeignKey('custom_set.id'))
