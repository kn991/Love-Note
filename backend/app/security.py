"""Auth & crypto primitives: argon2id hashing, salted hashes, JWT session
cookies, and CSRF double-submit. Kept framework-light so handlers stay thin.
"""

from __future__ import annotations

import functools
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from flask import Response, current_app, g, request

from app.errors import ApiError

# argon2id with sane cost params (time_cost>=2, memory_cost>=64MB).
_hasher = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=2)

_MUTATING = {"POST", "PATCH", "PUT", "DELETE"}


# --- Password hashing -------------------------------------------------------
def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError, Exception):
        return False


def needs_rehash(password_hash: str) -> bool:
    try:
        return _hasher.check_needs_rehash(password_hash)
    except Exception:
        return False


# --- Pseudonymous hashing for IP / user-agent -------------------------------
def hash_value(value: str | None) -> str | None:
    if not value:
        return None
    salt = current_app.config["HASH_SALT"]
    return hashlib.sha256(f"{salt}:{value}".encode("utf-8")).hexdigest()


def client_ip_hash() -> str | None:
    return hash_value(request.remote_addr)


def user_agent_hash() -> str | None:
    return hash_value(request.headers.get("User-Agent"))


# --- Session JWT ------------------------------------------------------------
def make_session_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + current_app.config["SESSION_LIFETIME"],
        "jti": secrets.token_urlsafe(8),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def decode_session_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token, current_app.config["JWT_SECRET"], algorithms=["HS256"]
        )
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError, TypeError):
        return None


# --- Cookies ----------------------------------------------------------------
def set_auth_cookies(response: Response, user_id: int) -> None:
    """Issue a fresh session JWT + CSRF token (rotates the session)."""
    cfg = current_app.config
    max_age = int(cfg["SESSION_LIFETIME"].total_seconds())
    token = make_session_token(user_id)
    csrf = secrets.token_urlsafe(32)
    common = dict(
        max_age=max_age,
        secure=cfg["COOKIE_SECURE"],
        samesite=cfg["COOKIE_SAMESITE"],
        domain=cfg["COOKIE_DOMAIN"],
        path="/",
    )
    response.set_cookie(cfg["SESSION_COOKIE_NAME"], token, httponly=True, **common)
    # CSRF cookie is intentionally readable by JS (double-submit pattern).
    response.set_cookie(cfg["CSRF_COOKIE_NAME"], csrf, httponly=False, **common)


def clear_auth_cookies(response: Response) -> None:
    cfg = current_app.config
    for name in (cfg["SESSION_COOKIE_NAME"], cfg["CSRF_COOKIE_NAME"]):
        response.delete_cookie(
            name, path="/", domain=cfg["COOKIE_DOMAIN"], samesite=cfg["COOKIE_SAMESITE"]
        )


# --- Current user -----------------------------------------------------------
def current_user():
    """Return the authenticated, active User or None. Cached per request."""
    if "current_user" in g:
        return g.current_user

    from app.extensions import db
    from app.models import User

    user = None
    token = request.cookies.get(current_app.config["SESSION_COOKIE_NAME"])
    if token:
        user_id = decode_session_token(token)
        if user_id is not None:
            candidate = db.session.get(User, user_id)
            if candidate is not None and candidate.is_active:
                user = candidate
    g.current_user = user
    return user


def require_user():
    user = current_user()
    if user is None:
        raise ApiError(401, "unauthorized", "Authentication required")
    return user


def verify_csrf() -> None:
    cfg = current_app.config
    cookie = request.cookies.get(cfg["CSRF_COOKIE_NAME"])
    header = request.headers.get("X-CSRF-Token")
    if not cookie or not header or not secrets.compare_digest(cookie, header):
        raise ApiError(401, "csrf_failed", "CSRF validation failed")


def auth_required(func):
    """Require a valid session; enforce CSRF on mutating methods."""

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        require_user()
        if request.method in _MUTATING:
            verify_csrf()
        return func(*args, **kwargs)

    return wrapper
