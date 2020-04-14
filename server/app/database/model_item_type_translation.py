import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID


class ModelItemTypeTranslation(Base):
    __tablename__ = "item_type_translation"

    id = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )
    item_type_id = Column(
        UUID(as_uuid=True), ForeignKey("item_type.uuid"), nullable=False
    )
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)
