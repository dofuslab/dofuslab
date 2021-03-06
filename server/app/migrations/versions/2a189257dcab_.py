"""empty message

Revision ID: 2a189257dcab
Revises: f7d96d4b3895
Create Date: 2020-04-18 02:18:36.026408

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "2a189257dcab"
down_revision = "f7d96d4b3895"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "custom_set",
        sa.Column("parent_custom_set_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.alter_column(
        "custom_set",
        "name",
        existing_type=sa.VARCHAR(),
        type_=sa.String(length=50),
        existing_nullable=True,
    )
    op.create_index(
        op.f("ix_custom_set_parent_custom_set_id"),
        "custom_set",
        ["parent_custom_set_id"],
        unique=False,
    )
    op.create_foreign_key(
        op.f("fk_custom_set_parent_custom_set_id_custom_set"),
        "custom_set",
        "custom_set",
        ["parent_custom_set_id"],
        ["uuid"],
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        op.f("fk_custom_set_parent_custom_set_id_custom_set"),
        "custom_set",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_custom_set_parent_custom_set_id"), table_name="custom_set")
    op.alter_column(
        "custom_set",
        "name",
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(),
        existing_nullable=True,
    )
    op.drop_column("custom_set", "parent_custom_set_id")
    # ### end Alembic commands ###
