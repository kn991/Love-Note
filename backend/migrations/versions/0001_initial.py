"""initial schema: citext extension, user, invitation, response, view

Consolidates the logical migration plan in DATABASE_SCHEMA.md §6 into one
greenfield revision (no data backfill needed).

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-29
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import CITEXT, JSONB

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    ]


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")

    # --- user ---
    op.create_table(
        "user",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("email", CITEXT(), nullable=False),
        sa.Column("username", sa.String(length=32), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        *_timestamps(),
    )
    op.create_index("ux_user_email", "user", ["email"], unique=True)
    op.create_index("ux_user_username", "user", ["username"], unique=True)

    # --- invitation ---
    op.create_table(
        "invitation",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "owner_id",
            sa.BigInteger(),
            sa.ForeignKey("user.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column("girl_name", sa.String(length=80), nullable=False),
        sa.Column("title", sa.String(length=140), nullable=True),
        sa.Column("greeting_message", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.String(length=2048), nullable=True),
        sa.Column(
            "food_options", JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")
        ),
        sa.Column(
            "place_options", JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")
        ),
        sa.Column(
            "activity_options",
            JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("final_message", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column(
            "allow_multiple_responses",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamps(),
    )
    op.create_index("ux_invitation_token", "invitation", ["token"], unique=True)
    op.create_index("ix_invitation_owner_id", "invitation", ["owner_id"])
    op.create_index(
        "ix_invitation_owner_created", "invitation", ["owner_id", "created_at"]
    )

    # --- invitation_response ---
    op.create_table(
        "invitation_response",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "invitation_id",
            sa.BigInteger(),
            sa.ForeignKey("invitation.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "availability", JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")
        ),
        sa.Column(
            "food_preference",
            JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("place_preference", sa.String(length=120), nullable=True),
        sa.Column(
            "place_is_custom",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("activity_preference", sa.String(length=120), nullable=True),
        sa.Column("vibe", sa.String(length=60), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("ip_hash", sa.CHAR(length=64), nullable=True),
        sa.Column("user_agent_hash", sa.CHAR(length=64), nullable=True),
        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "ix_response_invitation_id", "invitation_response", ["invitation_id"]
    )
    op.create_index(
        "ix_response_invitation_submitted",
        "invitation_response",
        ["invitation_id", "submitted_at"],
    )

    # --- invitation_view ---
    op.create_table(
        "invitation_view",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "invitation_id",
            sa.BigInteger(),
            sa.ForeignKey("invitation.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ip_hash", sa.CHAR(length=64), nullable=True),
        sa.Column("user_agent_hash", sa.CHAR(length=64), nullable=True),
        sa.Column(
            "viewed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_view_invitation_id", "invitation_view", ["invitation_id"])


def downgrade() -> None:
    op.drop_index("ix_view_invitation_id", table_name="invitation_view")
    op.drop_table("invitation_view")

    op.drop_index(
        "ix_response_invitation_submitted", table_name="invitation_response"
    )
    op.drop_index("ix_response_invitation_id", table_name="invitation_response")
    op.drop_table("invitation_response")

    op.drop_index("ix_invitation_owner_created", table_name="invitation")
    op.drop_index("ix_invitation_owner_id", table_name="invitation")
    op.drop_index("ux_invitation_token", table_name="invitation")
    op.drop_table("invitation")

    op.drop_index("ux_user_username", table_name="user")
    op.drop_index("ux_user_email", table_name="user")
    op.drop_table("user")
    # citext left installed; harmless and may be shared.
