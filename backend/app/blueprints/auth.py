from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify, make_response
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError

from app.errors import ApiError
from app.extensions import db, limiter
from app.http import parse_body
from app.limits import login_identifier_key, user_or_ip_key
from app.models import User
from app.schemas.auth import (
    ChangePasswordRequest,
    DeleteMeRequest,
    LoginRequest,
    RegisterRequest,
    UpdateMeRequest,
)
from app.security import (
    auth_required,
    clear_auth_cookies,
    current_user,
    hash_password,
    needs_rehash,
    require_user,
    set_auth_cookies,
    verify_password,
)

bp = Blueprint("auth", __name__, url_prefix="/auth")

# A precomputed argon2 hash so login timing is equal whether or not the user
# exists (mitigates user-enumeration via response time).
_DUMMY_HASH = hash_password("dummy-password-for-timing-equalization-1")


def _iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def user_public(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "created_at": _iso(user.created_at),
        "is_active": user.is_active,
    }


def _find_existing(email: str, username: str) -> tuple[bool, bool]:
    rows = db.session.execute(
        select(User.email, User.username).where(
            or_(
                func.lower(User.email) == email.lower(),
                func.lower(User.username) == username.lower(),
            )
        )
    ).all()
    email_taken = any(r.email.lower() == email.lower() for r in rows)
    username_taken = any(r.username.lower() == username.lower() for r in rows)
    return email_taken, username_taken


@bp.post("/register")
@limiter.limit("5 per minute")
def register():
    data = parse_body(RegisterRequest)
    email_taken, username_taken = _find_existing(data.email, data.username)
    if email_taken:
        raise ApiError(409, "email_taken", "Email already registered")
    if username_taken:
        raise ApiError(409, "username_taken", "Username already taken")

    user = User(
        email=str(data.email),
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError(409, "email_taken", "Email or username already taken")

    resp = make_response(jsonify(user_public(user)), 201)
    set_auth_cookies(resp, user.id)
    return resp


@bp.post("/login")
@limiter.limit("10 per minute")
@limiter.limit("10 per minute", key_func=login_identifier_key)
def login():
    data = parse_body(LoginRequest)
    user = db.session.scalar(
        select(User).where(
            or_(
                func.lower(User.email) == data.identifier.lower(),
                func.lower(User.username) == data.identifier.lower(),
            )
        )
    )
    # Always run a verify to keep timing constant; generic error on any failure.
    stored = user.password_hash if user else _DUMMY_HASH
    ok = verify_password(stored, data.password)
    if not user or not user.is_active or not ok:
        raise ApiError(401, "invalid_credentials", "Invalid email/username or password")

    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(data.password)
        db.session.commit()

    resp = make_response(jsonify(user_public(user)), 200)
    set_auth_cookies(resp, user.id)  # rotates session on login
    return resp


@bp.post("/logout")
@auth_required
def logout():
    resp = make_response("", 204)
    clear_auth_cookies(resp)
    return resp


@bp.get("/me")
def get_me():
    user = require_user()
    return jsonify(user_public(user)), 200


@bp.patch("/me")
@auth_required
def update_me():
    user = current_user()
    data = parse_body(UpdateMeRequest)
    fields = data.model_dump(exclude_unset=True)

    if "email" in fields and fields["email"] is not None:
        new_email = str(fields["email"])
        taken, _ = _find_existing(new_email, "")
        if taken and new_email.lower() != user.email.lower():
            raise ApiError(409, "email_taken", "Email already registered")
        user.email = new_email
    if "username" in fields and fields["username"] is not None:
        new_username = fields["username"]
        _, taken = _find_existing("", new_username)
        if taken and new_username.lower() != user.username.lower():
            raise ApiError(409, "username_taken", "Username already taken")
        user.username = new_username

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError(409, "email_taken", "Email or username already taken")
    return jsonify(user_public(user)), 200


@bp.post("/change-password")
@auth_required
@limiter.limit("5 per minute", key_func=user_or_ip_key)
def change_password():
    user = current_user()
    data = parse_body(ChangePasswordRequest)
    if not verify_password(user.password_hash, data.current_password):
        raise ApiError(401, "invalid_credentials", "Current password is incorrect")
    user.password_hash = hash_password(data.new_password)
    db.session.commit()
    # Rotate session after a password change (fixation defense).
    resp = make_response("", 204)
    set_auth_cookies(resp, user.id)
    return resp


@bp.delete("/me")
@auth_required
def delete_me():
    user = current_user()
    data = parse_body(DeleteMeRequest)
    if not verify_password(user.password_hash, data.password):
        raise ApiError(401, "invalid_credentials", "Password is incorrect")
    db.session.delete(user)  # cascades invitations/responses/views
    db.session.commit()
    resp = make_response("", 204)
    clear_auth_cookies(resp)
    return resp
