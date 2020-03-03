import sqlalchemy
from .base import Base, db_session
from .model_item import ModelItem
from .model_equipped_item import ModelEquippedItem
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

    def find_empty_item_slot(self, item_type):
        eligible_item_slots = item_type.eligible_item_slots
        for item_slot in eligible_item_slots:
            equipped_item = ModelEquippedItem.query.filter_by(
                custom_set_id=self.uuid, item_slot_id=item_slot.uuid
            ).one_or_none()
            if not equipped_item:
                return item_slot
        return None

    def equip_item(self, item_id, item_slot_id):
        item = ModelItem.query.get(item_id)
        if item_slot_id:
            equipped_item = (
                ModelEquippedItem.query.filter_by(custom_set_id=self.uuid)
                .filter_by(item_slot_id=item_slot_id)
                .one_or_none()
            )
            if equipped_item:
                equipped_item.item_id = item_id
            else:
                equipped_item = ModelEquippedItem(
                    item_slot_id=item_slot_id, custom_set_id=self.uuid, item_id=item_id,
                )
                db_session.add(equipped_item)
        else:
            empty_item_slot = self.find_empty_item_slot(item.item_type)
            if empty_item_slot:
                equipped_item = ModelEquippedItem(
                    item_slot_id=empty_item_slot.uuid,
                    custom_set_id=self.uuid,
                    item_id=item_id,
                )
                db_session.add(equipped_item)
            else:
                item_slot = item.item_type.eligible_item_slots[0]
                equipped_item = ModelEquippedItem.query.filter_by(
                    item_slot_id=item_slot.uuid,
                    custom_set_id=self.uuid,
                    item_id=item_id,
                ).update({"item_id": item_id})

        db_session.commit()
