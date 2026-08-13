"""site_content_replace_settings

Revision ID: e4b8a1c92d30
Revises: d1e5a9c83f20
Create Date: 2026-07-31 16:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e4b8a1c92d30"
down_revision: Union[str, Sequence[str], None] = "d1e5a9c83f20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "settings" in tables:
        op.drop_table("settings")

    if "site_content" not in tables:
        op.create_table(
            "site_content",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("data", sa.JSON(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "site_content" in tables:
        op.drop_table("site_content")

    if "settings" not in tables:
        op.create_table(
            "settings",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("key", sa.String(), nullable=False, unique=True),
            sa.Column("value", sa.String(), nullable=True),
        )
