from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import AvatarUrl, OptionList, StrictModel


class InvitationCreate(StrictModel):
    girl_name: str = Field(min_length=1, max_length=80)
    title: str | None = Field(default=None, max_length=140)
    greeting_message: str | None = Field(default=None, max_length=1000)
    avatar_url: AvatarUrl = None
    food_options: OptionList = Field(default_factory=list)
    place_options: OptionList = Field(default_factory=list)
    activity_options: OptionList = Field(default_factory=list)
    final_message: str | None = Field(default=None, max_length=1000)
    expires_at: datetime | None = None
    is_active: bool = True
    allow_multiple_responses: bool = False


class InvitationUpdate(StrictModel):
    """All fields optional; only fields present in the payload are applied.

    ``token`` is intentionally absent — it is immutable and never accepted.
    """

    girl_name: str | None = Field(default=None, min_length=1, max_length=80)
    title: str | None = Field(default=None, max_length=140)
    greeting_message: str | None = Field(default=None, max_length=1000)
    avatar_url: AvatarUrl = None
    food_options: OptionList | None = None
    place_options: OptionList | None = None
    activity_options: OptionList | None = None
    final_message: str | None = Field(default=None, max_length=1000)
    expires_at: datetime | None = None
    is_active: bool | None = None
    allow_multiple_responses: bool | None = None
