import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class ModelSetCustomBonus(Base):
    __tablename__ = "set_custom_bonus"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    set_bonus_translation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("set_bonus_translation.uuid", ondelete="CASCADE"),
        nullable=False,
    )
    custom_stat = Column("custom_stat", String)
