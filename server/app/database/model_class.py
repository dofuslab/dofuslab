import sqlalchemy
from .base import Base
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelClass(Base):
    __tablename__ = "class"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
        primary_key=True,
    )

    name = relationship(
        "ModelClassTranslation", backref="class", cascade="all, delete-orphan"
    )
    # image_url = Column("imageUrl", String)
    spell_variant_pairs = relationship(
        "ModelSpellVariantPair", backref="class", cascade="all, delete-orphan"
    )
