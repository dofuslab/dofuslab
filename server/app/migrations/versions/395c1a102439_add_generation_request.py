"""Add generation request provenance

Revision ID: 395c1a102439
Revises: 1cb498f44c5b
Create Date: 2026-07-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "395c1a102439"
down_revision = "1cb498f44c5b"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "generation_request",
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column("custom_set_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source", sa.String(length=80), nullable=False),
        sa.Column("dataset_version", sa.String(length=120), nullable=True),
        sa.Column("solver_version", sa.String(length=120), nullable=True),
        sa.Column("request_payload", sa.JSON(), nullable=True),
        sa.Column("creation_date", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["custom_set_id"],
            ["custom_set.uuid"],
            name=op.f("fk_generation_request_custom_set_id_custom_set"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("uuid", name=op.f("pk_generation_request")),
        sa.UniqueConstraint(
            "custom_set_id",
            name=op.f("uq_generation_request_custom_set_id"),
        ),
    )
    op.create_index(
        op.f("ix_generation_request_source"),
        "generation_request",
        ["source"],
        unique=False,
    )


def downgrade():
    op.drop_index(op.f("ix_generation_request_source"), table_name="generation_request")
    op.drop_table("generation_request")
