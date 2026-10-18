"""officer_availability_and_waiting_queue

Revision ID: c1d2e3f4a5b6
Revises: 1148d189b279, b7c123d45678
Create Date: 2026-10-14 14:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c1d2e3f4a5b6'
down_revision = ('1148d189b279', 'b7c123d45678')
branch_labels = None
depends_on = None


def upgrade():
    # 1. Update officers table
    op.add_column('officers', sa.Column('availability_status', sa.String(50), nullable=False, server_default='available'))
    op.add_column('officers', sa.Column('max_concurrent_tasks', sa.Integer(), nullable=False, server_default='4'))
    op.add_column('officers', sa.Column('current_active_tasks', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('officers', sa.Column('skills', sa.JSON(), nullable=True))
    op.add_column('officers', sa.Column('shift_schedule', sa.JSON(), nullable=True))

    # 2. Update case_tasks table
    op.add_column('case_tasks', sa.Column('acceptance_status', sa.String(50), nullable=False, server_default='accepted'))
    op.add_column('case_tasks', sa.Column('rejection_reason_bn', sa.Text(), nullable=True))
    op.add_column('case_tasks', sa.Column('assigned_at', sa.DateTime(), nullable=True))
    op.add_column('case_tasks', sa.Column('assigned_by_user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))

    # 3. Create task_assignment_history table
    op.create_table(
        'task_assignment_history',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('task_id', sa.String(36), sa.ForeignKey('case_tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('previous_officer_id', sa.String(36), sa.ForeignKey('officers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('new_officer_id', sa.String(36), sa.ForeignKey('officers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('assigned_by_user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('assignment_type', sa.String(50), nullable=False, server_default='manual'),
        sa.Column('reason_bn', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )

    # 4. Create task_waiting_queue table
    op.create_table(
        'task_waiting_queue',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('task_id', sa.String(36), sa.ForeignKey('case_tasks.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('case_id', sa.String(36), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('department_id', sa.String(36), sa.ForeignKey('departments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('priority', sa.String(50), nullable=False, server_default='medium'),
        sa.Column('sla_deadline', sa.DateTime(), nullable=True),
        sa.Column('queue_entry_time', sa.DateTime(), nullable=False),
        sa.Column('prerequisite_status', sa.String(50), nullable=False, server_default='ready'),
        sa.Column('eligibility_state', sa.String(50), nullable=False, server_default='eligible'),
        sa.Column('waiting_reason_bn', sa.Text(), nullable=True),
        sa.Column('assignment_attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(50), nullable=False, server_default='queued'),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )


def downgrade():
    op.drop_table('task_waiting_queue')
    op.drop_table('task_assignment_history')
    op.drop_column('case_tasks', 'assigned_by_user_id')
    op.drop_column('case_tasks', 'assigned_at')
    op.drop_column('case_tasks', 'rejection_reason_bn')
    op.drop_column('case_tasks', 'acceptance_status')
    op.drop_column('officers', 'shift_schedule')
    op.drop_column('officers', 'skills')
    op.drop_column('officers', 'current_active_tasks')
    op.drop_column('officers', 'max_concurrent_tasks')
    op.drop_column('officers', 'availability_status')
