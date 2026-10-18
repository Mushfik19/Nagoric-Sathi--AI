"""update_duplicate_scores

Revision ID: b7c123d45678
Revises: 8ae243c8c059
Create Date: 2026-10-07 23:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7c123d45678'
down_revision = '8ae243c8c059'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('duplicate_candidates', sa.Column('distance_score', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('duplicate_candidates', sa.Column('category_score', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('duplicate_candidates', sa.Column('time_score', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('duplicate_candidates', sa.Column('text_similarity_score', sa.Float(), nullable=True))

def downgrade():
    op.drop_column('duplicate_candidates', 'text_similarity_score')
    op.drop_column('duplicate_candidates', 'time_score')
    op.drop_column('duplicate_candidates', 'category_score')
    op.drop_column('duplicate_candidates', 'distance_score')
