"""empty message

Revision ID: 08f4a37b0df6
Revises: 262ed0976d83
Create Date: 2020-02-16 13:54:44.884154

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "08f4a37b0df6"
down_revision = "262ed0976d83"
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table("custom_set_exos", "custom_set_exo")
    op.rename_table("custom_set_stats", "custom_set_stat")
    op.rename_table("item_conditions", "item_condition")
    op.rename_table("item_stats", "item_stat")


def downgrade():
    op.rename_table("custom_set_exo", "custom_set_exos")
    op.rename_table("custom_set_stat", "custom_set_stats")
    op.rename_table("item_condition", "item_conditions")
    op.rename_table("item_stat", "item_stats")
