"""empty message

Revision ID: 1ada78e59e43
Revises: 28c505691620
Create Date: 2022-01-05 16:40:06.659045

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "1ada78e59e43"
down_revision = "28c505691620"
branch_labels = None
depends_on = None

female_face_url_base = "class/face/{}_F.png"


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "class", sa.Column("female_face_image_url", sa.String(), nullable=True)
    )
    conn = op.get_bind()
    res = conn.execute(
        "SELECT c.uuid, ct.name FROM class c JOIN class_translation ct ON c.uuid = ct.class_id WHERE locale='en';"
    )
    classes = res.fetchall()
    for dofus_class in classes:
        conn.execute(
            "UPDATE class SET female_face_image_url='{}' WHERE uuid='{}'".format(
                female_face_url_base.format(dofus_class[1]),
                dofus_class[0],
            )
        )
    op.alter_column("class", "face_image_url", new_column_name="male_face_image_url")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("class", "male_face_image_url", new_column_name="face_image_url")
    op.drop_column("class", "female_face_image_url")
    # ### end Alembic commands ###