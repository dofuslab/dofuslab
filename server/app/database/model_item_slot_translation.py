import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID


class ModelItemSlotTranslation(Base):
    __tablename__ = "item_slot_translation"

    id = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )
    item_slot_id = Column(
        UUID(as_uuid=True), ForeignKey("item_slot.uuid"), nullable=False
    )
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)

    __table_args__ = (UniqueConstraint("item_slot_id", "locale"),)
