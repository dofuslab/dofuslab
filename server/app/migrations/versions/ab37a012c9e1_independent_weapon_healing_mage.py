"""Add independent healing conversion and apply retroactive 3.7 mage rates."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "ab37a012c9e1"
down_revision = "1cb498f44c5b"
branch_labels = None
depends_on = None

elements = ("EARTH", "FIRE", "WATER", "AIR")


def upgrade():
    # PostgreSQL requires new enum values to be committed before using them.
    with op.get_context().autocommit_block():
        for element in elements:
            for percentage in (100, 10):
                op.execute(
                    "ALTER TYPE weaponelementmage ADD VALUE IF NOT EXISTS '{}_{}'".format(
                        element, percentage
                    )
                )
    op.add_column(
        "equipped_item",
        sa.Column(
            "weapon_healing_mage",
            postgresql.ENUM(name="weaponelementmage", create_type=False),
            nullable=True,
        ),
    )
    for element in elements:
        for old, new in ((85, 100), (50, 10)):
            op.execute(
                "UPDATE equipped_item SET weapon_element_mage = '{element}_{new}' "
                "WHERE weapon_element_mage = '{element}_{old}'".format(
                    element=element, old=old, new=new
                )
            )


def downgrade():
    op.drop_column("equipped_item", "weapon_healing_mage")
    for element in elements:
        for old, new in ((85, 100), (50, 10)):
            op.execute(
                "UPDATE equipped_item SET weapon_element_mage = '{element}_{old}' "
                "WHERE weapon_element_mage = '{element}_{new}'".format(
                    element=element, old=old, new=new
                )
            )
    # Keep unused enum labels so existing rows need no enum-type rebuild.
