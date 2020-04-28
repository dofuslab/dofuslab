import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String, Index
from sqlalchemy.dialects.postgresql import UUID


class ModelClassTranslation(Base):
    __tablename__ = "class_translation"

    id = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )
    class_id = Column(
        UUID(as_uuid=True),
        ForeignKey("class.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)

    __table_args__ = (Index("class_id", "locale"),)
