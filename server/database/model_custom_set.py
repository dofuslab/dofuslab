from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelCustomSet(Base):
    __tablename__ = 'custom_set'

    id = Column(
        'id', UUID(as_uuid=True), unique=True, nullable=False, primary_key=True,
    )
    name = Column('name', String, nullable=False)
    description = Column('description', String)
    owner_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    level = Column('level', Integer, nullable=False)
    items = relationship('ModelItem')
    stat_distribution = Column('stat_distribution', PickleType)
    exos = Column('exos', PickleType)
