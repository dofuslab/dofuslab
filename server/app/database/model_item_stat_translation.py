import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String, Index
from sqlalchemy.dialects.postgresql import UUID


class ModelItemStatTranslation(Base):
    __tablename__ = "item_stat_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_stat_id = Column(
        UUID(as_uuid=True),
        ForeignKey("item_stat.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    locale = Column("locale", String, nullable=False)

    custom_stat = Column("custom_stat", String, nullable=False)

    __table_args__ = (Index("item_stat_id", "locale"),)
