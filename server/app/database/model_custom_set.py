import sqlalchemy
from app import db, session_scope
from app.database.enums import Stat
from .enums import BuildGenderEnum
from .base import Base
from .model_item import ModelItem
from .model_equipped_item import ModelEquippedItem
from .model_equipped_item_exo import ModelEquippedItemExo
from .model_item_slot import ModelItemSlot
from .model_custom_set_stat import ModelCustomSetStat
from .model_custom_set_tag_association import ModelCustomSetTagAssociation
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, text, func
from sqlalchemy.orm import aliased, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import exists
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
    default_class_id = Column(UUID(as_uuid=True), ForeignKey("class.uuid"), index=True)
    build_gender = Column(
        "build_gender",
        BuildGenderEnum,
        nullable=False,
    )
    creation_date = Column("creation_date", DateTime, default=datetime.utcnow)
    last_modified = Column(
        "last_modified",
        DateTime,
        default=datetime.utcnow,
        index=True,
        server_onupdate=func.now(),
    )
    private = Column("private", sqlalchemy.Boolean, default=False, nullable=False)
    level = Column("level", Integer, server_default=text("200"), nullable=False)
    equipped_items = relationship(
        "ModelEquippedItem",
        backref="custom_set",
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
    default_class = relationship("ModelClass")

    tags = relationship(
        "ModelCustomSetTag",
        back_populates="custom_sets",
        secondary="custom_set_tag_association",
        order_by="ModelCustomSetTagAssociation.association_date",
    )

    def empty_item_slots(self):
        slot_alias = aliased(ModelItemSlot)
        subquery = (
            ~db.session.query(slot_alias)
            .join(slot_alias.equipped_items)
            .filter(
                ModelEquippedItem.custom_set_id == self.uuid,
                ModelEquippedItem.item_slot_id == ModelItemSlot.uuid,
            )
            .exists()
        )
        empty_slots = db.session.query(ModelItemSlot).filter(subquery).all()
        return empty_slots

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

    # returns a list of eligible item slots with empty slots first
    def prioritize_item_slots(self, item_type):
        eligible_item_slots = item_type.eligible_item_slots
        empty_item_slots = []
        filled_item_slots = []
        for item_slot in eligible_item_slots:
            equipped_item = (
                db.session.query(ModelEquippedItem)
                .filter_by(custom_set_id=self.uuid, item_slot_id=item_slot.uuid)
                .one_or_none()
            )
            if equipped_item:
                filled_item_slots.append(item_slot)
            else:
                empty_item_slots.append(item_slot)
        return empty_item_slots + filled_item_slots

    def equip_set(self, set_obj, db_session):
        self.equip_items(set_obj.items, db_session)

    def equip_items(self, items, db_session):
        ordered_slots_map = {}
        for item_obj in items:
            item = item_obj.get("item", None)
            if not item:
                continue
            first_slot_id = item.item_type.eligible_item_slots[0].uuid
            if not ordered_slots_map.get(first_slot_id, None):
                ordered_slots_map[first_slot_id] = self.prioritize_item_slots(
                    item.item_type
                )
        counts = {}
        for item_obj in items:
            item = item_obj.get("item", None)
            if not item:
                continue
            first_slot_id = item.item_type.eligible_item_slots[0].uuid
            slot_idx = counts.get(first_slot_id, 0)
            counts[first_slot_id] = slot_idx + 1
            item_slot = ordered_slots_map[first_slot_id][slot_idx]
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
                db_session.flush()
                if item_obj.get("ap_exo", False):
                    ap_exo_obj = ModelEquippedItemExo(
                        stat=Stat.AP, value=1, equipped_item_id=equipped_item.uuid
                    )
                    db_session.add(ap_exo_obj)
                if item_obj.get("mp_exo", False):
                    mp_exo_obj = ModelEquippedItemExo(
                        stat=Stat.MP, value=1, equipped_item_id=equipped_item.uuid
                    )
                    db_session.add(mp_exo_obj)
                if item_obj.get("range_exo", False):
                    range_exo_obj = ModelEquippedItemExo(
                        stat=Stat.RANGE, value=1, equipped_item_id=equipped_item.uuid
                    )
                    db_session.add(range_exo_obj)

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
                item_slot_id=item_slot.uuid,
                custom_set_id=self.uuid,
                item_id=item_id,
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
