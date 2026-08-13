"""drop_contacts

Revision ID: f5c9b2d03e41
Revises: e4b8a1c92d30
Create Date: 2026-07-31 17:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f5c9b2d03e41"
down_revision: Union[str, Sequence[str], None] = "e4b8a1c92d30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "contacts" in inspector.get_table_names():
        op.drop_table("contacts")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "contacts" not in inspector.get_table_names():
        op.create_table(
            "contacts",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("description", sa.String(), nullable=False),
            sa.Column("dateTime", sa.DateTime(), nullable=True),
        )
