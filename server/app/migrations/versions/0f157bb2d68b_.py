"""empty message

Revision ID: 0f157bb2d68b
Revises: f175244278d9
Create Date: 2025-08-29 19:23:34.351988

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0f157bb2d68b"
down_revision = "f175244278d9"
branch_labels = None
depends_on = None

new_enums = ["BEST_ELEMENT_DAMAGE", "PUSHBACK_DAMAGE", "ATTRACT_CELLS", "STEALS_MP"]


def upgrade():
    for enum_value in new_enums:
        op.execute("ALTER TYPE weapon_effect_type ADD VALUE '{}'".format(enum_value))


def downgrade():
    for enum_value in new_enums:
        op.execute(
            "DELETE FROM pg_enum WHERE enumlabel = '{}' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'weapon_effect_type')".format(
                enum_value
            )
        )
