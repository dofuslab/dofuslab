from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType
from sqlalchemy.orm import relationship


class ModelSet(Base):
    __tablename__ = 'set'

    name = Column('name', String, primary_key=True)
    items = relationship('ModelItem', backref='set')
    bonuses = Column('bonuses', PickleType)
