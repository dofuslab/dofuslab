import sqlalchemy
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class ModelBuildDiscoveryJob(Base):
    __tablename__ = "build_discovery_job"

    uuid = Column(
        UUID(as_uuid=True),
        server_default=sqlalchemy.text("uuid_generate_v4()"),
        primary_key=True,
        nullable=False,
    )
    status = Column("status", String(40), nullable=False, index=True)
    progress = Column(
        "progress",
        Integer,
        nullable=False,
        default=0,
        server_default=sqlalchemy.text("0"),
    )
    request_payload = Column("request_payload", JSON)
    result_payload = Column("result_payload", JSON)
    error_payload = Column("error_payload", JSON)
    dataset_version = Column("dataset_version", String(120))
    solver_version = Column("solver_version", String(120))
    elapsed_ms = Column("elapsed_ms", Float)
    generation_request_id = Column(
        UUID(as_uuid=True),
        ForeignKey("generation_request.uuid", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    creation_date = Column("creation_date", DateTime, default=datetime.utcnow, index=True)
    last_modified = Column(
        "last_modified",
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        index=True,
    )

    generation_request = relationship("ModelGenerationRequest")
