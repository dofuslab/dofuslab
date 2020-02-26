from .base import Base
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID


class ModelSetTranslations(Base):
    __tablename__ = "set_translations"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    set_id = Column(UUID(as_uuid=True), ForeignKey("set.id"), nullable=False)
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)
