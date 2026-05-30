from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CHAR, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.invitation import Invitation


class InvitationView(Base):
    __tablename__ = "invitation_view"

    id: Mapped[int] = mapped_column(primary_key=True)
    invitation_id: Mapped[int] = mapped_column(
        ForeignKey("invitation.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ip_hash: Mapped[str | None] = mapped_column(CHAR(64), nullable=True)
    user_agent_hash: Mapped[str | None] = mapped_column(CHAR(64), nullable=True)
    viewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    invitation: Mapped["Invitation"] = relationship(back_populates="views")
