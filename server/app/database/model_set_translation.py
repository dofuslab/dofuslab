import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class ModelSetTranslation(Base):
    __tablename__ = "set_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    set_id = Column(
        UUID(as_uuid=True), ForeignKey("set.uuid"), nullable=False, index=True
    )
    locale = Column("locale", String, nullable=False, index=True)

    name = Column("name", String, nullable=False, index=True)
