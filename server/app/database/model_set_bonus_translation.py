import sqlalchemy
from .base import Base
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID


class ModelSetBonusTranslation(Base):
    __tablename__ = "set_bonus_translation"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    set_bonus_id = Column(
        UUID(as_uuid=True),
        ForeignKey("set_bonus.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    locale = Column("locale", String, nullable=False, index=True)

    custom_stat = Column("custom_stat", String, nullable=False)

    __table_args__ = (UniqueConstraint("set_bonus_id", "locale"),)
