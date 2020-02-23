import sqlalchemy
from .base import Base
from .model_item_type import ModelItemType
from .model_item_stat import ModelItemStat
from .model_item_condition import ModelItemCondition
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID


class ModelItem(Base):
    __tablename__ = "item"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    name = Column("name", String, nullable=False)
    item_type_id = Column(
        UUID(as_uuid=True), ForeignKey("item_type.uuid"), nullable=False, index=True
    )
    item_type = relationship(ModelItemType, back_populates="items")
    set_id = Column(UUID(as_uuid=True), ForeignKey("set.uuid"), index=True)
    level = Column("level", Integer, nullable=False)
    stats = relationship(ModelItemStat, backref="item", cascade="all, delete-orphan")
    conditions = relationship(
        ModelItemCondition, backref="item", cascade="all, delete-orphan"
    )
    image_url = Column("image_url", String, nullable=False)
