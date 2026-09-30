"""make legacy assessment fields nullable

Revision ID: 8d8c6a7b952d
Revises: bf65fc94d0fb
Create Date: 2026-09-30 11:38:21.436174

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8d8c6a7b952d"
down_revision: Union[str, Sequence[str], None] = "bf65fc94d0fb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "assessment_records",
        "risk_score",
        existing_type=sa.Float(),
        nullable=True,
    )

    op.alter_column(
        "assessment_records",
        "overall_rating",
        existing_type=sa.String(length=20),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "assessment_records",
        "risk_score",
        existing_type=sa.Float(),
        nullable=False,
    )

    op.alter_column(
        "assessment_records",
        "overall_rating",
        existing_type=sa.String(length=20),
        nullable=False,
    )