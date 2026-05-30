from __future__ import annotations

import logging
import re

from flask import Blueprint, jsonify, make_response
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db, limiter
from app.http import parse_body
from app.models import Invitation, InvitationResponse, InvitationView
from app.schemas.response import ResponseCreate
from app.security import client_ip_hash, user_agent_hash
from app.services.invitations import is_expired, serialize_public

logger = logging.getLogger("lovenote")

bp = Blueprint("public", __name__, url_prefix="/public")

_TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{20,64}$")


def _valid_token_or_404(token: str) -> None:
    if not _TOKEN_RE.match(token):
        raise ApiError(404, "not_found", "Invitation not found")


def _load_invitation(token: str) -> Invitation:
    _valid_token_or_404(token)
    inv = db.session.scalar(select(Invitation).where(Invitation.token == token))
    if inv is None:
        raise ApiError(404, "not_found", "Invitation not found")
    return inv


def _has_response(invitation_id: int) -> bool:
    return (
        db.session.scalar(
            select(InvitationResponse.id)
            .where(InvitationResponse.invitation_id == invitation_id)
            .limit(1)
        )
        is not None
    )


@bp.get("/invite/<token>")
@limiter.limit("60 per minute")
def get_invite(token: str):
    inv = _load_invitation(token)
    already = _has_response(inv.id)
    return jsonify(serialize_public(inv, already)), 200


@bp.post("/invite/<token>/view")
@limiter.limit("30 per minute")
def record_view(token: str):
    # Best-effort: never error the client, even on bad token or DB failure.
    try:
        if _TOKEN_RE.match(token):
            inv_id = db.session.scalar(
                select(Invitation.id).where(Invitation.token == token)
            )
            if inv_id is not None:
                db.session.add(
                    InvitationView(
                        invitation_id=inv_id,
                        ip_hash=client_ip_hash(),
                        user_agent_hash=user_agent_hash(),
                    )
                )
                db.session.commit()
    except Exception:
        db.session.rollback()
        logger.warning("view beacon failed for token tail …%s", token[-4:])
    return make_response("", 204)


@bp.post("/invite/<token>/respond")
@limiter.limit("10 per minute")
def respond(token: str):
    inv = _load_invitation(token)

    # Enforcement order per API_CONTRACT §5 (state before payload validation).
    if inv.archived_at is not None or not inv.is_active:
        raise ApiError(403, "forbidden", "Invitation is not active")
    if is_expired(inv):
        raise ApiError(410, "invitation_expired", "Invitation has expired")
    if not inv.allow_multiple_responses and _has_response(inv.id):
        raise ApiError(409, "already_responded", "A response was already submitted")

    data = parse_body(ResponseCreate)

    db.session.add(
        InvitationResponse(
            invitation_id=inv.id,
            availability={"slots": data.availability.slots, "text": data.availability.text},
            food_preference=data.food_preference,
            place_preference=data.place_preference or None,
            place_is_custom=data.place_is_custom,
            activity_preference=data.activity_preference or None,
            vibe=data.vibe or None,
            comment=data.comment or None,
            ip_hash=client_ip_hash(),
            user_agent_hash=user_agent_hash(),
        )
    )
    db.session.commit()
    # Only final_message leaks back — nothing else.
    return jsonify({"ok": True, "final_message": inv.final_message}), 201
