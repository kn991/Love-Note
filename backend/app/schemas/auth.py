from __future__ import annotations

import re

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import StrictModel

USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,32}$")


def _check_password(value: str) -> str:
    if not (8 <= len(value) <= 128):
        raise ValueError("password must be 8–128 characters")
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError("password must contain at least one letter and one digit")
    return value


def _check_username(value: str) -> str:
    if not USERNAME_RE.match(value):
        raise ValueError("username must match ^[a-zA-Z0-9_]{3,32}$")
    return value


class RegisterRequest(StrictModel):
    email: EmailStr = Field(max_length=254)
    username: str
    password: str

    _v_user = field_validator("username")(_check_username)
    _v_pass = field_validator("password")(_check_password)


class LoginRequest(StrictModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class UpdateMeRequest(StrictModel):
    email: EmailStr | None = Field(default=None, max_length=254)
    username: str | None = None

    @field_validator("username")
    @classmethod
    def _v_username(cls, v):
        return _check_username(v) if v is not None else v


class ChangePasswordRequest(StrictModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str

    _v_new = field_validator("new_password")(_check_password)


class DeleteMeRequest(StrictModel):
    password: str = Field(min_length=1, max_length=128)
