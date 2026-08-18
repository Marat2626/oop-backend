"""add_short_info_to_experts

Revision ID: d1e5a9c83f20
Revises: c9d2f4b71e55
Create Date: 2026-07-30 16:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d1e5a9c83f20"
down_revision: Union[str, Sequence[str], None] = "c9d2f4b71e55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("experts", sa.Column("short_info", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("experts", "short_info")
