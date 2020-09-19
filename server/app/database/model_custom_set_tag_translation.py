import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID


class ModelCustomSetTagTranslation(Base):
    __tablename__ = "custom_set_tag_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    custom_set_tag_id = Column(
        UUID(as_uuid=True),
        ForeignKey("custom_set_tag.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)

    __table_args__ = (Index("custom_set_tag_id", "locale"),)
