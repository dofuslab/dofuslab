import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID


class ModelSpellTranslation(Base):
    __tablename__ = "spell_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    spell_id = Column(
        UUID(as_uuid=True),
        ForeignKey("spell.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    locale = Column("locale", String, nullable=False)

    name = Column("name", String, nullable=False)
    description = Column("description", String, nullable=False)

    __table_args__ = (Index("spell_id", "locale"),)
