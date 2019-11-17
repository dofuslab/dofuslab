from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType


class ModelClass(Base):
    __tablename__ = 'class'

    name = Column('name', String, primary_key=True)
    spells = Column('spells', PickleType)
