import sqlalchemy
from .base import Base
from .enums import StatEnum
from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID


class ModelCustomSetExo(Base):
    __tablename__ = "custom_set_exo"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )

    stat = Column("stat", StatEnum)
    value = Column("value", Integer)

    custom_set_id = Column(UUID(as_uuid=True), ForeignKey("custom_set.uuid"))
