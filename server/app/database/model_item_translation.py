import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID


class ModelItemTranslation(Base):
    __tablename__ = "item_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("item.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    locale = Column("locale", String, nullable=False, index=True)

    name = Column("name", String, nullable=False, index=True)
