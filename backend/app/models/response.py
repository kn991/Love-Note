from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    Boolean,
    CHAR,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.invitation import Invitation


class InvitationResponse(Base):
    __tablename__ = "invitation_response"
    __table_args__ = (
        Index(
            "ix_response_invitation_submitted",
            "invitation_id",
            "submitted_at",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    invitation_id: Mapped[int] = mapped_column(
        ForeignKey("invitation.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    availability: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, default=dict, server_default="{}"
    )
    food_preference: Mapped[list[str]] = mapped_column(
        JSONB, nullable=False, default=list, server_default="[]"
    )
    place_preference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    place_is_custom: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false", default=False
    )
    activity_preference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    vibe: Mapped[str | None] = mapped_column(String(60), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(CHAR(64), nullable=True)
    user_agent_hash: Mapped[str | None] = mapped_column(CHAR(64), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    invitation: Mapped["Invitation"] = relationship(back_populates="responses")
