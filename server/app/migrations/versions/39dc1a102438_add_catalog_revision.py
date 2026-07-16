"""Add catalog revision singleton

Revision ID: 39dc1a102438
Revises: 1cb498f44c5b
Create Date: 2026-07-14

"""
from alembic import op
import sqlalchemy as sa


revision = "39dc1a102438"
down_revision = "1cb498f44c5b"
branch_labels = None
depends_on = None


def upgrade():
    catalog_revision = op.create_table(
        "catalog_revision",
        sa.Column("id", sa.SmallInteger(), nullable=False),
        sa.Column("revision", sa.BigInteger(), nullable=False),
        sa.CheckConstraint("id = 1", name=op.f("ck_catalog_revision_catalog_revision_singleton")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_catalog_revision")),
    )
    op.bulk_insert(catalog_revision, [{"id": 1, "revision": 1}])


def downgrade():
    op.drop_table("catalog_revision")
