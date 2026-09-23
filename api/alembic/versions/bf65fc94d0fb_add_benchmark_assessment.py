"""add benchmark assessment

Revision ID: bf65fc94d0fb
Revises: de79461b447f
Create Date: 2026-09-23 11:23:43.098952

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "bf65fc94d0fb"
down_revision: Union[str, Sequence[str], None] = "de79461b447f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "assessment_records",
        sa.Column(
            "benchmark",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("assessment_records", "benchmark")