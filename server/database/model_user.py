import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class ModelUser(Base):
    __tablename__ = 'user'

    uuid = Column(UUID(as_uuid=True),
                  server_default=sqlalchemy.text("uuid_generate_v4()"), primary_key=True)
    username = Column('username', String, nullable=False)
    email = Column('email', String, nullable=False)
    custom_sets = relationship('ModelCustomSet', backref='user')
