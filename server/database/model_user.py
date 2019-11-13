from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

class ModelUser(Base):
    __tablename__ = 'user'

    id = Column('id', Integer, primary_key=True)
    username = Column('username', String)
    email = Column('email', String)
    custom_sets = relationship('ModelCustomSet', backref='user')
