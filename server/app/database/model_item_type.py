import sqlalchemy
from .base import Base
from .model_item_slot import ModelItemSlot
from .item_type_slot_compat_table import item_type_slot_compat_table
from .enums import GameVersionEnum
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelItemType(Base):
    __tablename__ = "item_type"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    eligible_item_slots = relationship(
        "ModelItemSlot",
        secondary=item_type_slot_compat_table,
        order_by="asc(ModelItemSlot.order)",
    )
    items = relationship("ModelItem", back_populates="item_type")
    item_type_translation = relationship(
        "ModelItemTypeTranslation", backref="item_type", cascade="all, delete-orphan"
    )
    game_version = Column("game_version", GameVersionEnum, nullable=False, index=True)

    @classmethod
    def get_slots_by_name(cls, name):
        type = ModelItemType.query.filter_by(name=name).one_or_none()
        if not type:
            raise ValueError("Could not find type %s" % (name))
        return type.eligible_item_slots
