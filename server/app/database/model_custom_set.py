import sqlalchemy
from app import db, session_scope
from .base import Base
from .model_item import ModelItem
from .model_equipped_item import ModelEquippedItem
from .model_equipped_item_exo import ModelEquippedItemExo
from .model_item_slot import ModelItemSlot
from .model_custom_set_stat import ModelCustomSetStat
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, text, func
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
    name = Column("name", String, index=True)
    description = Column("description", String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user_account.uuid"), index=True)
    creation_date = Column("creation_date", DateTime, default=datetime.now)
    last_modified = Column(
        "last_modified",
        DateTime,
        default=datetime.now,
        index=True,
        server_onupdate=func.now(),
    )
    level = Column("level", Integer, server_default=text("200"), nullable=False)
    equipped_items = relationship(
        "ModelEquippedItem", backref="custom_set", lazy="dynamic"
    )
    stats = relationship(
        "ModelCustomSetStat",
        uselist=False,
        cascade="all, delete-orphan",
        backref="custom_set",
    )

    def empty_or_first_item_slot(self, item_type):
        with session_scope() as session:
            eligible_item_slots = item_type.eligible_item_slots
            for item_slot in eligible_item_slots:
                equipped_item = (
                    session.query(ModelEquippedItem)
                    .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot.uuid)
                    .one_or_none()
                )
                if not equipped_item:
                    return item_slot
            return eligible_item_slots[0]

    def equip_set(self, set_obj):
        self.equip_items(set_obj.items)

    def equip_items(self, items):
        with session_scope() as session:
            counts = {}
            for item in items:
                slot_idx = counts.get(item.item_type.uuid, 0)
                counts[item.item_type.uuid] = slot_idx + 1
                item_slot = item.item_type.eligible_item_slots[slot_idx]
                equipped_item = (
                    session.query(ModelEquippedItem)
                    .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot.uuid)
                    .one_or_none()
                )
                if equipped_item:
                    equipped_item.change_item(item.uuid)
                else:
                    equipped_item = ModelEquippedItem(
                        item_slot_id=item_slot.uuid,
                        custom_set_id=self.uuid,
                        item_id=item.uuid,
                    )
                    session.add(equipped_item)

    def equip_item(self, item_id, item_slot_id):
        with session_scope() as session:
            item = session.query(ModelItem).get(item_id)
            item_slot = session.query(ModelItemSlot).get(item_slot_id)

            if item and item.item_type not in item_slot.item_types:
                raise ValueError("The item and item slot are incompatible.")
            equipped_item = (
                session.query(ModelEquippedItem)
                .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot.uuid)
                .one_or_none()
            )
            if equipped_item and item_id:
                equipped_item.item_id = item_id
                equipped_item.weapon_element_mage = None
                session.query(ModelEquippedItemExo).filter_by(
                    equipped_item_id=equipped_item.uuid
                ).delete()
            elif equipped_item:
                # if item_id is None, delete equipped item entry
                session.delete(equipped_item)
            elif item_id:
                equipped_item = ModelEquippedItem(
                    item_slot_id=item_slot.uuid,
                    custom_set_id=self.uuid,
                    item_id=item_id,
                )
                session.add(equipped_item)
            else:
                raise ValueError("The object you are trying to delete does not exist.")

    def unequip_item(self, item_slot_id):
        with session_scope() as session:
            equipped_item = (
                session.query(ModelEquippedItem)
                .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot_id)
                .one_or_none()
            )
            if equipped_item:
                session.delete(equipped_item)
