"""Add the Dofus spell ID used by the spell and buff sync scripts.

Revision ID: 2d6cb4f07a31
Revises: 1cb498f44c5b
Create Date: 2026-10-11 13:22:36.434113
"""

from alembic import op
import sqlalchemy as sa


revision = "2d6cb4f07a31"
down_revision = "1cb498f44c5b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("spell", sa.Column("dofus_db_id", sa.String(), nullable=True))
    op.create_index("ix_spell_dofus_db_id", "spell", ["dofus_db_id"], unique=True)


def downgrade():
    op.drop_index("ix_spell_dofus_db_id", table_name="spell")
    op.drop_column("spell", "dofus_db_id")
