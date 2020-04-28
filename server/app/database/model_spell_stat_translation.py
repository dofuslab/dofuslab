import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID


class ModelSpellStatTranslation(Base):
    __tablename__ = "spell_stat_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    spell_stat_id = Column(
        UUID(as_uuid=True),
        ForeignKey("spell_stats.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    locale = Column("locale", String, nullable=False)

    aoe_type = Column("aoe_type", String)

    __table_args__ = (UniqueConstraint("spell_stat_id", "locale"),)
