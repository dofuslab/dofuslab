from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String, PickleType
from sqlalchemy.dialects.postgresql import UUID


class ModelClass(Base):
    __tablename__ = 'class'

    id = Column(
        'id',
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )

    name = Column('name', String, nullable=False)
    spells = Column('spells', PickleType)
