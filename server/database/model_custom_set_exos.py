import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

class ModelCustomSetExos(Base):
    __tablename__ = 'custom_set_exos'

    uuid = Column(
            UUID(as_uuid=True),
            server_default=sqlalchemy.text("uuid_generate_v4()"),
            primary_key=True,
            nullable=False,
    )

    stat = Column('stat', String)
    value = Column('value', Integer)

    custom_set_id = Column(UUID, ForeignKey('custom_set.uuid'))
