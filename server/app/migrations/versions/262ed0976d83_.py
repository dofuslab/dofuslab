"""empty message

Revision ID: 262ed0976d83
Revises: b8b9be3a0bb4
Create Date: 2020-02-16 12:56:13.370520

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "262ed0976d83"
down_revision = "b8b9be3a0bb4"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("custom_set_stats", "baseAgility", new_column_name="base_agility")
    op.alter_column("custom_set_stats", "baseChance", new_column_name="base_chance")
    op.alter_column(
        "custom_set_stats", "baseIntelligence", new_column_name="base_intelligence"
    )
    op.alter_column("custom_set_stats", "baseStrength", new_column_name="base_strength")
    op.alter_column("custom_set_stats", "baseVitality", new_column_name="base_vitality")
    op.alter_column("custom_set_stats", "baseWisdom", new_column_name="base_wisdom")
    op.alter_column(
        "custom_set_stats", "scrolledAgility", new_column_name="scrolled_agility"
    )
    op.alter_column(
        "custom_set_stats", "scrolledChance", new_column_name="scrolled_chance"
    )
    op.alter_column(
        "custom_set_stats",
        "scrolledIntelligence",
        new_column_name="scrolled_intelligence",
    )
    op.alter_column(
        "custom_set_stats", "scrolledStrength", new_column_name="scrolled_strength"
    )
    op.alter_column(
        "custom_set_stats", "scrolledVitality", new_column_name="scrolled_vitality"
    )
    op.alter_column(
        "custom_set_stats", "scrolledWisdom", new_column_name="scrolled_wisdom"
    )
    op.alter_column("item", "imageUrl", new_column_name="image_url")
    op.alter_column("item", "itemType", new_column_name="item_type")
    op.alter_column(
        "item_conditions", "conditionType", new_column_name="condition_type"
    )
    op.alter_column("item_stats", "maxValue", new_column_name="max_value")
    op.alter_column("item_stats", "minValue", new_column_name="min_value")


def downgrade():
    op.alter_column("custom_set_stats", "base_agility", new_column_name="baseAgility")
    op.alter_column("custom_set_stats", "base_chance", new_column_name="baseChance")
    op.alter_column(
        "custom_set_stats", "base_intelligence", new_column_name="baseIntelligence"
    )
    op.alter_column("custom_set_stats", "base_strength", new_column_name="baseStrength")
    op.alter_column("custom_set_stats", "base_vitality", new_column_name="baseVitality")
    op.alter_column("custom_set_stats", "base_wisdom", new_column_name="baseWisdom")
    op.alter_column(
        "custom_set_stats", "scrolled_agility", new_column_name="scrolledAgility"
    )
    op.alter_column(
        "custom_set_stats", "scrolled_chance", new_column_name="scrolledChance"
    )
    op.alter_column(
        "custom_set_stats",
        "scrolled_intelligence",
        new_column_name="scrolledIntelligence",
    )
    op.alter_column(
        "custom_set_stats", "scrolled_strength", new_column_name="scrolledStrength"
    )
    op.alter_column(
        "custom_set_stats", "scrolled_vitality", new_column_name="scrolledVitality"
    )
    op.alter_column(
        "custom_set_stats", "scrolled_wisdom", new_column_name="scrolledWisdom"
    )
    op.alter_column("item", "image_url", new_column_name="imageUrl")
    op.alter_column("item", "item_type", new_column_name="itemType")
    op.alter_column(
        "item_conditions", "condition_type", new_column_name="conditionType"
    )
    op.alter_column("item_stats", "max_value", new_column_name="maxValue")
    op.alter_column("item_stats", "min_value", new_column_name="minValue")
