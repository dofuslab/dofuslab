from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelSet(Base):
    __tablename__ = 'set'

    id = Column(
        'id', UUID(as_uuid=True), unique=True, nullable=False, primary_key=True,
    )
    name = Column('name', String, nullable=False)
    # items = relationship('ModelItem', backref='set')
    bonuses = Column('bonuses', PickleType)
