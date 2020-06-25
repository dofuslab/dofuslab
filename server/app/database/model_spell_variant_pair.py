import sqlalchemy
from .base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelSpellVariantPair(Base):
    __tablename__ = "spell_variant_pair"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )
    class_id = Column(
        UUID(as_uuid=True), ForeignKey("class.uuid", ondelete="CASCADE"), nullable=False
    )
    spells = relationship(
        "ModelSpell", backref="variant_pair", cascade="all, delete-orphan"
    )
