import sqlalchemy
from .base import Base
from .model_custom_set_tag_translation import ModelCustomSetTagTranslation
from .model_custom_set_tag_association import ModelCustomSetTagAssociation
from sqlalchemy import Column, String, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelCustomSetTag(Base):
    __tablename__ = "custom_set_tag"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    custom_set_tag_translations = relationship(
        "ModelCustomSetTagTranslation",
        backref="custom_set_tag",
        cascade="all, delete-orphan",
    )
    image_url = Column("image_url", String, nullable=False)
    custom_sets = relationship(
        "ModelCustomSet", back_populates="tags", secondary="custom_set_tag_association",
    )
