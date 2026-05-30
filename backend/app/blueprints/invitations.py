from __future__ import annotations

from flask import Blueprint, jsonify, make_response, request
from sqlalchemy import func, select

from app.errors import ApiError
from app.extensions import db, limiter
from app.http import parse_body
from app.limits import user_or_ip_key
from app.models import Invitation, InvitationResponse, InvitationView
from app.schemas.common import PageQuery
from app.schemas.invitation import InvitationCreate, InvitationUpdate
from app.security import auth_required, current_user
from app.services.invitations import (
    apply_defaults_to_options,
    compute_status,
    generate_unique_token,
    serialize_detail,
    serialize_list_item,
    serialize_response,
)

bp = Blueprint("invitations", __name__, url_prefix="/invitations")


def _get_owned_or_404(invitation_id: int) -> Invitation:
    user = current_user()
    inv = db.session.scalar(
        select(Invitation).where(
            Invitation.id == invitation_id, Invitation.owner_id == user.id
        )
    )
    if inv is None:
        # 404 (not 403) to avoid leaking existence of other owners' rows.
        raise ApiError(404, "not_found", "Invitation not found")
    return inv


@bp.get("")
@auth_required
def list_invitations():
    user = current_user()
    page = PageQuery.model_validate(request.args.to_dict())
    status_filter = request.args.get("status")
    include_archived = request.args.get("include_archived", "false").lower() in {
        "1",
        "true",
        "yes",
    }

    rc = (
        select(func.count(InvitationResponse.id))
        .where(InvitationResponse.invitation_id == Invitation.id)
        .scalar_subquery()
    )
    vc = (
        select(func.count(InvitationView.id))
        .where(InvitationView.invitation_id == Invitation.id)
        .scalar_subquery()
    )

    base = select(Invitation, rc.label("rc"), vc.label("vc")).where(
        Invitation.owner_id == user.id
    )
    if not include_archived:
        base = base.where(Invitation.archived_at.is_(None))
    base = base.order_by(Invitation.created_at.desc(), Invitation.id.desc())

    rows = db.session.execute(base).all()

    items = []
    for inv, resp_count, view_count in rows:
        if status_filter and compute_status(inv, resp_count) != status_filter:
            continue
        items.append(serialize_list_item(inv, resp_count, view_count))

    total = len(items)
    start = (page.page - 1) * page.per_page
    paged = items[start : start + page.per_page]
    return (
        jsonify(
            {
                "items": paged,
                "page": page.page,
                "per_page": page.per_page,
                "total": total,
            }
        ),
        200,
    )


@bp.post("")
@auth_required
@limiter.limit("30 per minute", key_func=user_or_ip_key)
def create_invitation():
    user = current_user()
    data = parse_body(InvitationCreate)
    payload = data.model_dump(mode="json")
    apply_defaults_to_options(payload)

    inv = Invitation(
        owner_id=user.id,
        token=generate_unique_token(),
        girl_name=payload["girl_name"],
        title=payload["title"],
        greeting_message=payload["greeting_message"],
        avatar_url=payload["avatar_url"],
        food_options=payload["food_options"],
        place_options=payload["place_options"],
        activity_options=payload["activity_options"],
        final_message=payload["final_message"],
        expires_at=data.expires_at,
        is_active=payload["is_active"],
        allow_multiple_responses=payload["allow_multiple_responses"],
    )
    db.session.add(inv)
    db.session.commit()
    return jsonify(serialize_detail(inv)), 201


@bp.get("/<int:invitation_id>")
@auth_required
def get_invitation(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    return jsonify(serialize_detail(inv)), 200


@bp.patch("/<int:invitation_id>")
@auth_required
def update_invitation(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    data = parse_body(InvitationUpdate)
    fields = data.model_dump(mode="json", exclude_unset=True)
    for key, value in fields.items():
        setattr(inv, key, value)
    db.session.commit()
    return jsonify(serialize_detail(inv)), 200


@bp.delete("/<int:invitation_id>")
@auth_required
def delete_invitation(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    db.session.delete(inv)  # cascades responses + views
    db.session.commit()
    return make_response("", 204)


@bp.post("/<int:invitation_id>/archive")
@auth_required
def archive_invitation(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    inv.archived_at = func.now()
    db.session.commit()
    db.session.refresh(inv)
    return jsonify(serialize_detail(inv)), 200


@bp.post("/<int:invitation_id>/activate")
@auth_required
def activate_invitation(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    inv.is_active = True
    inv.archived_at = None
    db.session.commit()
    return jsonify(serialize_detail(inv)), 200


@bp.post("/<int:invitation_id>/deactivate")
@auth_required
def deactivate_invitation(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    inv.is_active = False
    db.session.commit()
    return jsonify(serialize_detail(inv)), 200


@bp.get("/<int:invitation_id>/responses")
@auth_required
def list_responses(invitation_id: int):
    inv = _get_owned_or_404(invitation_id)
    page = PageQuery.model_validate(request.args.to_dict())

    total = db.session.scalar(
        select(func.count(InvitationResponse.id)).where(
            InvitationResponse.invitation_id == inv.id
        )
    )
    rows = db.session.scalars(
        select(InvitationResponse)
        .where(InvitationResponse.invitation_id == inv.id)
        .order_by(
            InvitationResponse.submitted_at.desc(), InvitationResponse.id.desc()
        )
        .limit(page.per_page)
        .offset((page.page - 1) * page.per_page)
    ).all()

    return (
        jsonify(
            {
                "items": [serialize_response(r) for r in rows],
                "page": page.page,
                "per_page": page.per_page,
                "total": total or 0,
            }
        ),
        200,
    )
