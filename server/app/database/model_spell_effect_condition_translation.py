import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID


class ModelSpellEffectConditionTranslation(Base):
    __tablename__ = "spell_effect_condition_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    spell_effect_id = Column(
        UUID(as_uuid=True),
        ForeignKey("spell_effect.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    locale = Column("locale", String, nullable=False, index=True)

    condition = Column("name", String, nullable=False)

    __table_args__ = (Index("spell_effect_id", "locale"),)
