from sqlalchemy import BigInteger, CheckConstraint, Column, SmallInteger

from .base import Base


class ModelCatalogRevision(Base):
    """Singleton revision for the client-visible item and set catalog."""

    __tablename__ = "catalog_revision"
    __table_args__ = (
        CheckConstraint("id = 1", name="catalog_revision_singleton"),
    )

    id = Column(SmallInteger, primary_key=True, nullable=False)
    revision = Column(BigInteger, nullable=False)
