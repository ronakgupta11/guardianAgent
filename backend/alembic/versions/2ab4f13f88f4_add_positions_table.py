"""add_positions_table

Revision ID: 2ab4f13f88f4
Revises: 001
Create Date: 2025-10-23 17:40:30.258116

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '2ab4f13f88f4'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('positions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('chain_id', sa.String(length=10), nullable=False),
    sa.Column('chain_name', sa.String(length=50), nullable=False),
    sa.Column('supplied_assets', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('borrowed_assets', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('health_factor', sa.Float(), nullable=False),
    sa.Column('risk_level', sa.String(length=20), nullable=False),
    sa.Column('total_collateral_usd', sa.Float(), nullable=True),
    sa.Column('total_borrowed_usd', sa.Float(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_positions_id'), 'positions', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_positions_id'), table_name='positions')
    op.drop_table('positions')
