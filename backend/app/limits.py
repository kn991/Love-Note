"""Rate-limit key functions (per-user and per-identifier on top of the
default per-IP key)."""

from __future__ import annotations

from flask import request
from flask_limiter.util import get_remote_address


def user_or_ip_key() -> str:
    """Key on the authenticated user id when present, else client IP."""
    from app.security import current_user

    user = current_user()
    if user is not None:
        return f"user:{user.id}"
    return get_remote_address()


def login_identifier_key() -> str:
    """Per-account backoff: key on the submitted identifier (lowercased)."""
    data = request.get_json(silent=True) or {}
    identifier = (data.get("identifier") or "").strip().lower()
    return f"login:{identifier}" if identifier else get_remote_address()
