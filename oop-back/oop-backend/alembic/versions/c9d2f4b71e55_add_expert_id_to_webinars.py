"""add_expert_id_to_webinars

Revision ID: c9d2f4b71e55
Revises: b7c4e1a82f10
Create Date: 2026-07-30 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c9d2f4b71e55"
down_revision: Union[str, Sequence[str], None] = "b7c4e1a82f10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("webinars", sa.Column("expert_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_webinars_expert_id",
        "webinars",
        "experts",
        ["expert_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_webinars_expert_id", "webinars", type_="foreignkey")
    op.drop_column("webinars", "expert_id")
