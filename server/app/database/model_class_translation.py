import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String
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
        UUID(as_uuid=True), ForeignKey("class.uuid"), nullable=False, index=True
    )
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)
