"""Invitation domain logic: token generation, status/counts, and the strict
serializers that keep public responses leak-free.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Any

from flask import current_app
from sqlalchemy import func, select

from app.constants import (
    DEFAULT_ACTIVITY_OPTIONS,
    DEFAULT_FOOD_OPTIONS,
    DEFAULT_PLACE_OPTIONS,
    DEFAULT_TITLE,
)
from app.extensions import db
from app.models import Invitation, InvitationResponse, InvitationView


def generate_unique_token() -> str:
    """`secrets.token_urlsafe(32)` (~43 chars), retried on the rare collision."""
    for _ in range(5):
        token = secrets.token_urlsafe(32)
        exists = db.session.scalar(
            select(Invitation.id).where(Invitation.token == token)
        )
        if exists is None:
            return token
    raise RuntimeError("could not generate a unique invitation token")


def _iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def is_expired(inv: Invitation, now: datetime | None = None) -> bool:
    if inv.expires_at is None:
        return False
    now = now or datetime.now(timezone.utc)
    expires = inv.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    return now > expires


def response_count(invitation_id: int) -> int:
    return db.session.scalar(
        select(func.count(InvitationResponse.id)).where(
            InvitationResponse.invitation_id == invitation_id
        )
    ) or 0


def view_count(invitation_id: int) -> int:
    return db.session.scalar(
        select(func.count(InvitationView.id)).where(
            InvitationView.invitation_id == invitation_id
        )
    ) or 0


def compute_status(inv: Invitation, resp_count: int) -> str:
    if inv.archived_at is not None:
        return "archived"
    if is_expired(inv):
        return "expired"
    if resp_count > 0:
        return "answered"
    if inv.is_active:
        return "active"
    return "draft"


def public_state(inv: Invitation, already_responded: bool) -> str:
    """The state the public game uses: open | expired | inactive | answered."""
    if inv.archived_at is not None or not inv.is_active:
        return "inactive"
    if is_expired(inv):
        return "expired"
    if already_responded and not inv.allow_multiple_responses:
        return "answered"
    return "open"


def public_url(token: str) -> str:
    return f"{current_app.config['APP_PUBLIC_URL']}/invite/{token}"


# --- Apply create/update payloads -------------------------------------------
def apply_defaults_to_options(data: dict[str, Any]) -> None:
    """Replace empty option arrays with the seed defaults (in place)."""
    if not data.get("food_options"):
        data["food_options"] = [dict(o) for o in DEFAULT_FOOD_OPTIONS]
    if not data.get("activity_options"):
        data["activity_options"] = [dict(o) for o in DEFAULT_ACTIVITY_OPTIONS]
    if not data.get("place_options"):
        data["place_options"] = [dict(o) for o in DEFAULT_PLACE_OPTIONS]
    if not data.get("title"):
        data["title"] = DEFAULT_TITLE


# --- Serializers ------------------------------------------------------------
def serialize_options(options: list[dict[str, Any]]) -> list[dict[str, str]]:
    return [{"emoji": o.get("emoji", ""), "label": o["label"]} for o in options]


def serialize_detail(inv: Invitation) -> dict[str, Any]:
    """Full owner-only view (InvitationDetail §6.4)."""
    rc = response_count(inv.id)
    return {
        "id": inv.id,
        "token": inv.token,
        "public_url": public_url(inv.token),
        "girl_name": inv.girl_name,
        "title": inv.title,
        "greeting_message": inv.greeting_message,
        "avatar_url": inv.avatar_url,
        "food_options": serialize_options(inv.food_options),
        "place_options": serialize_options(inv.place_options),
        "activity_options": serialize_options(inv.activity_options),
        "final_message": inv.final_message,
        "expires_at": _iso(inv.expires_at),
        "is_active": inv.is_active,
        "allow_multiple_responses": inv.allow_multiple_responses,
        "archived_at": _iso(inv.archived_at),
        "status": compute_status(inv, rc),
        "response_count": rc,
        "view_count": view_count(inv.id),
        "created_at": _iso(inv.created_at),
        "updated_at": _iso(inv.updated_at),
    }


def serialize_list_item(inv: Invitation, resp_count: int, v_count: int) -> dict[str, Any]:
    return {
        "id": inv.id,
        "token": inv.token,
        "public_url": public_url(inv.token),
        "girl_name": inv.girl_name,
        "title": inv.title,
        "status": compute_status(inv, resp_count),
        "is_active": inv.is_active,
        "archived_at": _iso(inv.archived_at),
        "expires_at": _iso(inv.expires_at),
        "response_count": resp_count,
        "view_count": v_count,
        "created_at": _iso(inv.created_at),
    }


def serialize_public(inv: Invitation, already_responded: bool) -> dict[str, Any]:
    """LEAK GUARD: only fields the game needs. No owner_id, no internal id,
    no timestamps, no other users' data."""
    return {
        "girl_name": inv.girl_name,
        "title": inv.title or DEFAULT_TITLE,
        "greeting_message": inv.greeting_message,
        "avatar_url": inv.avatar_url,
        "food_options": serialize_options(inv.food_options),
        "place_options": serialize_options(inv.place_options),
        "activity_options": serialize_options(inv.activity_options),
        "final_message": inv.final_message,
        "allow_multiple_responses": inv.allow_multiple_responses,
        "already_responded": already_responded,
        "state": public_state(inv, already_responded),
    }


def serialize_response(resp: InvitationResponse) -> dict[str, Any]:
    """Owner viewing a response (ResponsePublic §6.6). Never exposes hashes."""
    return {
        "id": resp.id,
        "availability": resp.availability,
        "food_preference": resp.food_preference,
        "place_preference": resp.place_preference,
        "place_is_custom": resp.place_is_custom,
        "activity_preference": resp.activity_preference,
        "vibe": resp.vibe,
        "comment": resp.comment,
        "submitted_at": _iso(resp.submitted_at),
    }
