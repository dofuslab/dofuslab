"""Add build discovery job persistence

Revision ID: 395c1a10243a
Revises: 395c1a102439
Create Date: 2026-07-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "395c1a10243a"
down_revision = "395c1a102439"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "build_discovery_job",
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("progress", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("request_payload", sa.JSON(), nullable=True),
        sa.Column("result_payload", sa.JSON(), nullable=True),
        sa.Column("error_payload", sa.JSON(), nullable=True),
        sa.Column("dataset_version", sa.String(length=120), nullable=True),
        sa.Column("solver_version", sa.String(length=120), nullable=True),
        sa.Column("elapsed_ms", sa.Float(), nullable=True),
        sa.Column("generation_request_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("creation_date", sa.DateTime(), nullable=True),
        sa.Column("last_modified", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["generation_request_id"],
            ["generation_request.uuid"],
            name=op.f("fk_build_discovery_job_generation_request_id_generation_request"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("uuid", name=op.f("pk_build_discovery_job")),
    )
    op.create_index(
        op.f("ix_build_discovery_job_creation_date"),
        "build_discovery_job",
        ["creation_date"],
        unique=False,
    )
    op.create_index(
        op.f("ix_build_discovery_job_generation_request_id"),
        "build_discovery_job",
        ["generation_request_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_build_discovery_job_last_modified"),
        "build_discovery_job",
        ["last_modified"],
        unique=False,
    )
    op.create_index(
        op.f("ix_build_discovery_job_status"),
        "build_discovery_job",
        ["status"],
        unique=False,
    )


def downgrade():
    op.drop_index(op.f("ix_build_discovery_job_status"), table_name="build_discovery_job")
    op.drop_index(
        op.f("ix_build_discovery_job_last_modified"),
        table_name="build_discovery_job",
    )
    op.drop_index(
        op.f("ix_build_discovery_job_generation_request_id"),
        table_name="build_discovery_job",
    )
    op.drop_index(
        op.f("ix_build_discovery_job_creation_date"),
        table_name="build_discovery_job",
    )
    op.drop_table("build_discovery_job")
