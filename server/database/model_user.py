from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID


class ModelUser(Base):
    __tablename__ = 'user'

    id = Column(
        'id', UUID(as_uuid=True), unique=True, nullable=False, primary_key=True,
    )
    username = Column('username', String, nullable=False)
    email = Column('email', String, nullable=False)
    custom_sets = relationship('ModelCustomSet', backref='user')
