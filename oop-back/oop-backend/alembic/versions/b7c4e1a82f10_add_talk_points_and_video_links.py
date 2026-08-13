"""add_talk_points_and_video_links

Revision ID: b7c4e1a82f10
Revises: a3f8c2d91b04
Create Date: 2026-07-30 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7c4e1a82f10"
down_revision: Union[str, Sequence[str], None] = "a3f8c2d91b04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("webinars", sa.Column("talk_points", sa.Text(), nullable=True))
    op.add_column("webinars", sa.Column("video_links", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("webinars", "video_links")
    op.drop_column("webinars", "talk_points")
