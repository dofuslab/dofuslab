from app import session_scope
import sqlalchemy
from .base import Base
from sqlalchemy import Column, ForeignKey, Table, PrimaryKeyConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime


class ModelCustomSetTagAssociation(Base):
    __tablename__ = "custom_set_tag_association"
    __table_args__ = (PrimaryKeyConstraint("custom_set_id", "custom_set_tag_id"),)

    custom_set_tag_id = Column(
        UUID(as_uuid=True),
        ForeignKey("custom_set_tag.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    custom_set_id = Column(
        UUID(as_uuid=True),
        ForeignKey("custom_set.uuid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    association_date = Column(DateTime, default=datetime.utcnow)
    custom_set = relationship("ModelCustomSet")
    custom_set_tag = relationship("ModelCustomSetTag")
