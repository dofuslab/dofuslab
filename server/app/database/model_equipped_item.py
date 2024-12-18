from app import session_scope
import sqlalchemy
from .base import Base
from .enums import WeaponElementMageEnum
from .model_equipped_item_exo import ModelEquippedItemExo
from sqlalchemy import Column, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ModelEquippedItem(Base):
    __tablename__ = "equipped_item"
    # Don't allow a set to have two entries with the same item slot
    __table_args__ = (UniqueConstraint("item_slot_id", "custom_set_id"),)
    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    item_slot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("item_slot.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    custom_set_id = Column(
        UUID(as_uuid=True),
        ForeignKey("custom_set.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_id = Column(UUID(as_uuid=True), ForeignKey("item.uuid", ondelete="CASCADE"))
    item = relationship("ModelItem")
    slot = relationship("ModelItemSlot", backref="equipped_items")
    exos = relationship("ModelEquippedItemExo", cascade="all, delete-orphan")
    weapon_element_mage = Column("weapon_element_mage", WeaponElementMageEnum)

    def change_item(self, item_id):
        with session_scope() as db_session:
            self.item_id = item_id
            db_session.query(ModelEquippedItemExo).filter_by(
                equipped_item_id=self.uuid
            ).delete()
