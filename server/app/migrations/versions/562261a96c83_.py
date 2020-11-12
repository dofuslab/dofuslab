"""empty message

Revision ID: 2e417a5b9059
Revises: 7d9c8a499465
Create Date: 2020-11-10 19:54:47.745212

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from app.database.enums import GameVersion


# revision identifiers, used by Alembic.
revision = "2e417a5b9059"
down_revision = "7d9c8a499465"
branch_labels = None
depends_on = None

game_version_enum = sa.Enum("DOFUS_2", "DOFUS_RETRO", "DOFUS_TOUCH", name="gameversion")
game_version_pg_enum = postgresql.ENUM(
    "DOFUS_2", "DOFUS_RETRO", "DOFUS_TOUCH", name="gameversion",
)


def upgrade():
    game_version_pg_enum.create(op.get_bind())
    op.add_column(
        "item_slot", sa.Column("game_version", game_version_enum, nullable=True),
    )
    op.execute("UPDATE item_slot SET game_version = 'DOFUS_2'")
    op.alter_column("item_slot", "game_version", nullable=False)


def downgrade():
    op.drop_column("item_slot", "game_version")
    game_version_pg_enum.drop(op.get_bind())
