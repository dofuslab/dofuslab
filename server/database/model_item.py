import sqlalchemy
from .base import Base
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
    dofus_db_id = Column("dofus_db_id", String, nullable=False)
    item_translations = relantionship(
        "ModelItemTranslations", backref="item", cascade="all, delete-orphan"
    )
    item_type = Column("item_type", String, nullable=False)
    set_id = Column(UUID(as_uuid=True), ForeignKey("set.uuid"))
    level = Column("level", Integer, nullable=False)
    stats = relationship("ModelItemStat", backref="item", cascade="all, delete-orphan")
    conditions = relationship(
        "ModelItemCondition", backref="item", cascade="all, delete-orphan"
    )
    image_url = Column("image_url", String)

    custom_set_id = Column(UUID(as_uuid=True), ForeignKey("custom_set.uuid"))
