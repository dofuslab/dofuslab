import sqlalchemy
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class ModelGenerationRequest(Base):
    __tablename__ = "generation_request"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    custom_set_id = Column(
        UUID(as_uuid=True),
        ForeignKey("custom_set.uuid", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    source = Column("source", String(80), nullable=False, index=True)
    dataset_version = Column("dataset_version", String(120))
    solver_version = Column("solver_version", String(120))
    request_payload = Column("request_payload", JSON)
    creation_date = Column("creation_date", DateTime, default=datetime.utcnow)

    custom_set = relationship("ModelCustomSet", back_populates="generation_request")
