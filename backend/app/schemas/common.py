from __future__ import annotations

from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, field_validator
from pydantic import HttpUrl


class StrictModel(BaseModel):
    """Base for request payloads: reject unknown fields, strip whitespace."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class OptionItem(StrictModel):
    emoji: str = Field(default="", max_length=8)
    label: str = Field(min_length=1, max_length=40)


def _validate_avatar_url(value: str | None) -> str | None:
    if value is None or value == "":
        return None
    # Pydantic HttpUrl already enforces http/https scheme + structure; we only
    # need the length cap and to reject dangerous schemes explicitly.
    HttpUrl(value)  # raises if not a valid http(s) URL
    if len(value) > 2048:
        raise ValueError("avatar_url too long")
    lowered = value.strip().lower()
    if lowered.startswith(("javascript:", "data:", "file:", "vbscript:")):
        raise ValueError("avatar_url scheme not allowed")
    if not lowered.startswith(("http://", "https://")):
        raise ValueError("avatar_url must be http(s)")
    return value


AvatarUrl = Annotated[str | None, AfterValidator(_validate_avatar_url)]
OptionList = Annotated[list[OptionItem], Field(max_length=12)]


class PageQuery(BaseModel):
    model_config = ConfigDict(extra="ignore")

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=50)

    @field_validator("page", "per_page", mode="before")
    @classmethod
    def _coerce_int(cls, v):
        if v in (None, ""):
            raise ValueError("must be an integer")
        return v
