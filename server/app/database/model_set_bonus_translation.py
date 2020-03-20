import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID


class ModelSetBonusTranslation(Base):
    __tablename__ = "set_bonus_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    set_translation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("set_bonus.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    locale = Column("locale", String, nullable=False)
    custom_bonus = relationship(
        "ModelSetCustomBonus", backref="item", cascade="all, delete-orphan"
    )
