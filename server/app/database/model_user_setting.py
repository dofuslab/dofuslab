import sqlalchemy
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import null
from .base import Base
from .enums import BuildGender, BuildGenderEnum
from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    Boolean,
    Integer,
    CheckConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID

MAX_LEVEL = 200


class ModelUserSetting(Base):
    __tablename__ = "user_setting"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user_account.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    locale = Column("locale", String, nullable=False)
    classic = Column("classic", Boolean, nullable=False)

    # build defaults
    build_gender = Column(
        "build_gender",
        BuildGenderEnum,
        nullable=False,
    )
    build_class_id = Column(
        UUID(as_uuid=True), ForeignKey("class.uuid"), nullable=True, index=True
    )

    build_class = relationship("ModelClass", uselist=False)
