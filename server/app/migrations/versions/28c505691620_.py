"""empty message

Revision ID: 28c505691620
Revises: 7d9c8a499465
Create Date: 2022-01-04 09:14:32.576095

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "28c505691620"
down_revision = "7d9c8a499465"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    build_gender_enum = sa.Enum("MALE", "FEMALE", name="buildgender")
    build_gender_pg_enum = postgresql.ENUM("MALE", "FEMALE", name="buildgender")
    build_gender_pg_enum.create(conn)
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "user_setting",
        sa.Column("build_class_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "user_setting",
        sa.Column(
            "build_gender",
            build_gender_enum,
            nullable=True,
        ),
    )
    res = conn.execute("SELECT user_setting.uuid FROM user_setting;")
    setting_ids = res.fetchall()
    for setting_id in setting_ids:
        conn.execute(
            "UPDATE user_setting SET build_gender='MALE' WHERE uuid='{}'".format(
                setting_id[0]
            )
        )
    op.alter_column("user_setting", "build_gender", nullable=False)

    op.create_index(
        op.f("ix_user_setting_build_class_id"),
        "user_setting",
        ["build_class_id"],
        unique=False,
    )
    op.create_foreign_key(
        op.f("fk_user_setting_build_class_id_class"),
        "user_setting",
        "class",
        ["build_class_id"],
        ["uuid"],
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        op.f("fk_user_setting_build_class_id_class"), "user_setting", type_="foreignkey"
    )
    op.drop_index(op.f("ix_user_setting_build_class_id"), table_name="user_setting")
    op.drop_column("user_setting", "build_gender")
    op.drop_column("user_setting", "build_class_id")
    build_gender_pg_enum = postgresql.ENUM("MALE", "FEMALE", name="buildgender")
    build_gender_pg_enum.drop(op.get_bind())
    # ### end Alembic commands ###
