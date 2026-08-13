"""add_duration_to_webinars

Revision ID: a3f8c2d91b04
Revises: 1e9d5823e697
Create Date: 2026-07-30 16:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a3f8c2d91b04"
down_revision: Union[str, Sequence[str], None] = "1e9d5823e697"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("webinars", sa.Column("duration", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("webinars", "duration")
