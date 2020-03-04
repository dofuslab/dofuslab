import sqlalchemy
from .base import Base, db_session
from .model_item import ModelItem
from .model_equipped_item import ModelEquippedItem
from .model_item_slot import ModelItemSlot
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime


class ModelCustomSet(Base):
    __tablename__ = "custom_set"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    name = Column("name", String)
    description = Column("description", String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.uuid"), index=True)
    created_at = Column("creation_date", DateTime, default=datetime.now)
    last_modified = Column("last_modified", DateTime, default=datetime.now, index=True)
    level = Column("level", Integer)
    equipped_items = relationship(
        "ModelEquippedItem", backref="custom_set", lazy="dynamic"
    )
    stats = relationship("ModelCustomSetStat", cascade="all, delete-orphan")

    def equip_item(self, item_id, item_slot_id):
        item = ModelItem.query.get(item_id)
        item_slot = ModelItemSlot.query.get(item_slot_id)
        if item and item.item_type not in item_slot.item_types:
            raise ValueError("The item and item slot are incompatible.")
        equipped_item = ModelEquippedItem.query.filter_by(
            custom_set_id=self.uuid, item_slot_id=item_slot_id
        ).one_or_none()
        if equipped_item and item_id:
            equipped_item.item_id = item_id
        elif equipped_item:
            # if item_id is None, delete equipped item entry
            db_session.delete(equipped_item)
        elif item_id:
            equipped_item = ModelEquippedItem(
                item_slot_id=item_slot_id, custom_set_id=self.uuid, item_id=item_id,
            )
            db_session.add(equipped_item)
        else:
            raise ValueError("The object you are trying to delete does not exist.")
        db_session.commit()
