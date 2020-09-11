import sqlalchemy
from .base import Base
from .model_custom_set_tag_translation import ModelCustomSetTagTranslation
from sqlalchemy import Column, String, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


custom_set_tag_association_table = Table(
    "custom_set_tag_association",
    Base.metadata,
    Column(
        "custom_set_tag_id",
        UUID(as_uuid=True),
        ForeignKey("custom_set_tag.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    Column(
        "custom_set_id",
        UUID(as_uuid=True),
        ForeignKey("custom_set.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    UniqueConstraint("custom_set_tag_id", "custom_set_id"),
)


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
        "ModelCustomSet",
        secondary=custom_set_tag_association_table,
        back_populates="tags",
    )
