import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship
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
        UUID(as_uuid=True), ForeignKey("item_stat.uuid"), nullable=False, index=True
    )
    locale = Column("locale", String, nullable=False, index=True)

    custom_stats = relationship(
        "ModelItemCustomStat", backref="item", cascade="all, delete-orphan"
    )
