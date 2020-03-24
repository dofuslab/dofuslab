import sqlalchemy
from .base import Base
from .enums import StatEnum
from sqlalchemy import Column, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID


class ModelEquippedItemExo(Base):
    __tablename__ = "equipped_item_exo"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )

    stat = Column("stat", StatEnum, nullable=False)
    value = Column("value", Integer, nullable=False)

    equipped_item_id = Column(
        UUID(as_uuid=True), ForeignKey("equipped_item.uuid"), index=True
    )

    __table_args__ = (UniqueConstraint("equipped_item_id", "stat"),)
