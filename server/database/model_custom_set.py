from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType, DateTime
from sqlalchemy.orm import relationship

class ModelCustomSet(Base):
    __tablename__ = 'custom_set'

    id = Column('id', Integer, primary_key=True)
    name = Column('name', String)
    description = Column('description', String)
    owner_id = Column(Integer, ForeignKey('user.id'))
    created_at = Column('creation_date', DateTime)
    level = Column('level', Integer)
    items = relationship('ModelItem')
    stat_distribution = Column('stat_distribution', PickleType)
    exos = Column('exos', PickleType)
