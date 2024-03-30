"""empty message

Revision ID: e754dc048376
Revises: b9b68fd74d2a
Create Date: 2024-03-29 17:57:52.185751

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e754dc048376"
down_revision = "b9b68fd74d2a"
branch_labels = None
depends_on = None

new_enums = {
    "weapon_effect_type": [
        "AIR_HEALING",
        "EARTH_HEALING",
        "FIRE_HEALING",
        "WATER_HEALING",
        "NEUTRAL_HEALING",
    ],
    "spell_effect_type": [
        "AIR_HEALING",
        "EARTH_HEALING",
        "FIRE_HEALING",
        "WATER_HEALING",
        "NEUTRAL_HEALING",
        "BEST_ELEMENT_HEALING",
    ],
}


def upgrade():
    for enum_type in new_enums:
        for enum_value in new_enums[enum_type]:
            op.execute("ALTER TYPE {} ADD VALUE '{}'".format(enum_type, enum_value))


def downgrade():
    for enum_type in new_enums:
        for enum_value in new_enums[enum_type]:
            op.execute(
                "DELETE FROM pg_enum WHERE enumlabel = '{}' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = '{}')".format(
                    enum_value, enum_type
                )
            )
