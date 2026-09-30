"""make legacy assessment json fields nullable

Revision ID: 6ae72607e1ef
Revises: 8d8c6a7b952d
Create Date: 2026-09-30 11:51:35.203579

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "6ae72607e1ef"
down_revision: Union[str, Sequence[str], None] = "8d8c6a7b952d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "assessment_records",
        "benchmark_results",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )

    op.alter_column(
        "assessment_records",
        "violations",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )

    op.alter_column(
        "assessment_records",
        "visual_observations",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "assessment_records",
        "benchmark_results",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        nullable=False,
    )

    op.alter_column(
        "assessment_records",
        "violations",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        nullable=False,
    )

    op.alter_column(
        "assessment_records",
        "visual_observations",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        nullable=False,
    )