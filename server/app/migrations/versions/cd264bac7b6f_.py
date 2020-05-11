"""empty message

Revision ID: cd264bac7b6f
Revises: ec161262d550
Create Date: 2020-05-10 21:27:47.670763

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "cd264bac7b6f"
down_revision = "ec161262d550"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("spell", sa.Column("is_trap", sa.Boolean(), nullable=True))
    op.execute("UPDATE spell SET is_trap = false")
    op.alter_column("spell", "is_trap", nullable=False)


def downgrade():
    op.drop_column("spell", "is_trap")
