"""add admin user role

Revision ID: 2940c07de0ee
Revises: 6ae72607e1ef
Create Date: 2026-10-01 08:31:15.399075

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2940c07de0ee'
down_revision: Union[str, Sequence[str], None] = '6ae72607e1ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ADMIN'"
    )


def downgrade() -> None:
    # PostgreSQL does not support directly removing an enum value.
    # Keep the downgrade intentionally empty.
    pass