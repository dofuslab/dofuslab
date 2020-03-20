import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class ModelItemCustomStat(Base):
    __tablename__ = "item_custom_stat"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_stat_translation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("item_stat_translation.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    custom_stat = Column("custom_stat", String)
