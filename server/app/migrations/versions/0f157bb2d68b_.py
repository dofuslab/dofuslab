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
    # Check if any ModelWeaponEffects have the effect types we're trying to remove
    connection = op.get_bind()
    
    for enum_value in new_enums:
        result = connection.execute(
            sa.text("SELECT COUNT(*) FROM weapon_effect WHERE effect_type = :effect_type"),
            {"effect_type": enum_value}
        )
        count = result.scalar()
        if count > 0:
            raise Exception(
                f"Cannot remove enum value '{enum_value}' from weapon_effect_type. "
                f"Found {count} weapon_effect records using this value. "
                f"Please remove or update these records first."
            )
    
    # If it's safe to proceed, rename the enum to weapon_effect_type_old
    op.execute("ALTER TYPE weapon_effect_type RENAME TO weapon_effect_type_old")
    
    # Create a new enum weapon_effect_type with the same values minus the 4 values we are removing
    # Get all current enum values except the ones we want to remove
    result = connection.execute(
        sa.text("""
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'weapon_effect_type_old')
            AND enumlabel NOT IN :values_to_remove
            ORDER BY enumsortorder
        """),
        {"values_to_remove": tuple(new_enums)}
    )
    remaining_values = [row[0] for row in result.fetchall()]
    
    # Create the new enum with remaining values
    enum_values_str = "', '".join(remaining_values)
    op.execute(f"CREATE TYPE weapon_effect_type AS ENUM ('{enum_values_str}')")
    
    # Alter the effect_type column to use the new weapon_effect_type enum
    op.execute(
        "ALTER TABLE weapon_effect ALTER COLUMN effect_type TYPE weapon_effect_type USING effect_type::text::weapon_effect_type"
    )
    
    # Drop the old enum
    op.execute("DROP TYPE weapon_effect_type_old")
