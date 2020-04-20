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


MAX_NAME_LENGTH = 50


class ModelCustomSet(Base):
    __tablename__ = "custom_set"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    name = Column("name", String(MAX_NAME_LENGTH), index=True)
    description = Column("description", String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user_account.uuid"), index=True)
    creation_date = Column("creation_date", DateTime, default=datetime.utcnow)
    last_modified = Column(
        "last_modified",
        DateTime,
        default=datetime.utcnow,
        index=True,
        server_onupdate=func.now(),
    )
    level = Column("level", Integer, server_default=text("200"), nullable=False)
    equipped_items = relationship(
        "ModelEquippedItem",
        backref="custom_set",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    stats = relationship(
        "ModelCustomSetStat",
        uselist=False,
        cascade="all, delete-orphan",
        backref="custom_set",
    )
    parent_custom_set_id = Column(
        UUID(as_uuid=True), ForeignKey("custom_set.uuid"), index=True
    )
    parent_custom_set = relationship(
        "ModelCustomSet", back_populates="children_custom_sets"
    )
    children_custom_sets = relationship("ModelCustomSet")

    def empty_or_first_item_slot(self, item_type):
        eligible_item_slots = item_type.eligible_item_slots
        for item_slot in eligible_item_slots:
            equipped_item = (
                db.session.query(ModelEquippedItem)
                .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot.uuid)
                .one_or_none()
            )
            if not equipped_item:
                return item_slot
        return eligible_item_slots[0]

    def equip_set(self, set_obj, db_session):
        self.equip_items(set_obj.items, db_session)

    def equip_items(self, items, db_session):
        counts = {}
        for item in items:
            slot_idx = counts.get(item.item_type.uuid, 0)
            counts[item.item_type.uuid] = slot_idx + 1
            item_slot = item.item_type.eligible_item_slots[slot_idx]
            equipped_item = (
                db_session.query(ModelEquippedItem)
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
                db_session.add(equipped_item)

    def equip_item(self, item_id, item_slot_id, db_session):
        item = db_session.query(ModelItem).get(item_id)
        item_slot = db_session.query(ModelItemSlot).get(item_slot_id)

        if item and item.item_type not in item_slot.item_types:
            raise ValueError("The item and item slot are incompatible.")
        equipped_item = (
            db_session.query(ModelEquippedItem)
            .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot.uuid)
            .one_or_none()
        )
        if equipped_item and item_id:
            equipped_item.item_id = item_id
            equipped_item.weapon_element_mage = None
            db_session.query(ModelEquippedItemExo).filter_by(
                equipped_item_id=equipped_item.uuid
            ).delete()
        elif equipped_item:
            # if item_id is None, delete equipped item entry
            db_session.delete(equipped_item)
        elif item_id:
            equipped_item = ModelEquippedItem(
                item_slot_id=item_slot.uuid, custom_set_id=self.uuid, item_id=item_id,
            )
            db_session.add(equipped_item)
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
