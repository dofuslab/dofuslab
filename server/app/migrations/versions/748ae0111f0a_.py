"""empty message

Revision ID: 748ae0111f0a
Revises: 8b23da1cb2e1
Create Date: 2020-12-31 18:22:19.454619

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "748ae0111f0a"
down_revision = "8b23da1cb2e1"
branch_labels = None
depends_on = None


def try_add_value_to_enum(enum_name, value):
    try:
        op.execute("ALTER TYPE {} ADD VALUE '{}'".format(enum_name, value))
    except:
        print(
            "An error occurred adding {} to enum {} - most likely it already exists".format(
                value, enum_name
            )
        )


def upgrade():
    op.execute("COMMIT")
    try_add_value_to_enum("stat", "HP")
    try_add_value_to_enum("stat", "PHYSICAL_REDUCTION")
    try_add_value_to_enum("stat", "MAGICAL_REDUCTION")
    try_add_value_to_enum("stat", "NEUTRAL_RES_PVP")
    try_add_value_to_enum("stat", "EARTH_RES_PVP")
    try_add_value_to_enum("stat", "FIRE_RES_PVP")
    try_add_value_to_enum("stat", "WATER_RES_PVP")
    try_add_value_to_enum("stat", "AIR_RES_PVP")
    try_add_value_to_enum("stat", "PCT_NEUTRAL_RES_PVP")
    try_add_value_to_enum("stat", "PCT_EARTH_RES_PVP")
    try_add_value_to_enum("stat", "PCT_FIRE_RES_PVP")
    try_add_value_to_enum("stat", "PCT_WATER_RES_PVP")
    try_add_value_to_enum("stat", "PCT_AIR_RES_PVP")
    try_add_value_to_enum("spell_effect_type", "KAMAS")
    try_add_value_to_enum("weapon_effect_type", "KAMAS")


def downgrade():
    pass
