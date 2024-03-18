import sqlalchemy
from .base import Base
from .model_item_type import ModelItemType
from .model_item_stat import ModelItemStat
from sqlalchemy import Column, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship, backref
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import CheckConstraint


class ModelItem(Base):
    __tablename__ = "item"
    __table_args__ = (
        CheckConstraint(
            "(dofus_db_id IS NULL) <> (dofus_db_mount_id IS NULL)",
            name="dofus_id_xor",
        ),
    )

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    dofus_db_id = Column("dofus_db_id", String, nullable=True)
    dofus_db_mount_id = Column("dofus_db_mount_id", String, nullable=True)
    item_translations = relationship(
        "ModelItemTranslation",
        backref="item",
        cascade="all, delete-orphan",
    )
    item_type_id = Column(
        UUID(as_uuid=True),
        ForeignKey("item_type.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_type = relationship(ModelItemType, back_populates="items")
    set_id = Column(
        UUID(as_uuid=True), ForeignKey("set.uuid", ondelete="CASCADE"), index=True
    )
    set = relationship("ModelSet")
    level = Column("level", Integer, nullable=False, index=True)
    stats = relationship("ModelItemStat", backref="item", cascade="all, delete-orphan")
    weapon_stats = relationship(
        "ModelWeaponStat",
        uselist=False,
        back_populates="item",
        cascade="all, delete-orphan",
    )
    conditions = Column("conditions", JSON)
    image_url = Column("image_url", String, nullable=False, index=True)

    buffs = relationship("ModelBuff", backref="item", cascade="all, delete-orphan")
