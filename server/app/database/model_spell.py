import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelSpell(Base):
    __tablename__ = "spell"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )
    spell_variant_pair_id = Column(
        UUID(as_uuid=True),
        ForeignKey("spell_variant_pair.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    spell_translation = relationship(
        "ModelSpellTranslation", backref="spell", cascade="all, delete-orphan"
    )
    image_url = Column("image_url", String, nullable=False)
    spell_stats = relationship(
        "ModelSpellStats", backref="spell", cascade="all, delete-orphan"
    )
