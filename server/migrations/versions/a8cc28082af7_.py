"""empty message

Revision ID: a8cc28082af7
Revises: 4e7f099d776b
Create Date: 2020-02-21 01:10:41.791603

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a8cc28082af7'
down_revision = '4e7f099d776b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('item_slot',
    sa.Column('uuid', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('uuid')
    )
    op.create_table('item_type',
    sa.Column('uuid', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('uuid')
    )
    op.create_table('item_type_slot',
    sa.Column('item_slot_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('item_type_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.ForeignKeyConstraint(['item_slot_id'], ['item_slot.uuid'], ),
    sa.ForeignKeyConstraint(['item_type_id'], ['item_type.uuid'], ),
    sa.UniqueConstraint('item_slot_id', 'item_type_id', name='item_type_slot_compatibility')
    )
    op.create_index(op.f('ix_item_type_slot_item_slot_id'), 'item_type_slot', ['item_slot_id'], unique=False)
    op.create_index(op.f('ix_item_type_slot_item_type_id'), 'item_type_slot', ['item_type_id'], unique=False)
    op.create_table('custom_set_item',
    sa.Column('item_slot_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('custom_set_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('item_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.ForeignKeyConstraint(['custom_set_id'], ['custom_set.uuid'], ),
    sa.ForeignKeyConstraint(['item_id'], ['item.uuid'], ),
    sa.ForeignKeyConstraint(['item_slot_id'], ['item_slot.uuid'], ),
    sa.UniqueConstraint('item_slot_id', 'custom_set_id', name='custom_set_item_slot')
    )
    op.create_index(op.f('ix_custom_set_item_custom_set_id'), 'custom_set_item', ['custom_set_id'], unique=False)
    op.add_column('item', sa.Column('item_type_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.drop_constraint('item_custom_set_id_fkey', 'item', type_='foreignkey')
    op.create_foreign_key(None, 'item', 'item_type', ['item_type_id'], ['uuid'])
    op.drop_column('item', 'custom_set_id')
    op.drop_column('item', 'item_type')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('item', sa.Column('item_type', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('item', sa.Column('custom_set_id', postgresql.UUID(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'item', type_='foreignkey')
    op.create_foreign_key('item_custom_set_id_fkey', 'item', 'custom_set', ['custom_set_id'], ['uuid'])
    op.drop_column('item', 'item_type_id')
    op.drop_index(op.f('ix_custom_set_item_custom_set_id'), table_name='custom_set_item')
    op.drop_table('custom_set_item')
    op.drop_index(op.f('ix_item_type_slot_item_type_id'), table_name='item_type_slot')
    op.drop_index(op.f('ix_item_type_slot_item_slot_id'), table_name='item_type_slot')
    op.drop_table('item_type_slot')
    op.drop_table('item_type')
    op.drop_table('item_slot')
    # ### end Alembic commands ###