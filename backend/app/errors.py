"""Standard JSON error envelope + Flask error handlers (API_CONTRACT §1.3)."""

from __future__ import annotations

import logging
from typing import Any

from flask import Flask, jsonify
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

logger = logging.getLogger("lovenote")


class ApiError(Exception):
    """Raised anywhere in a handler to short-circuit into the error envelope."""

    def __init__(
        self,
        status: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}


def _envelope(code: str, message: str, details: dict[str, Any] | None = None):
    return {"error": {"code": code, "message": message, "details": details or {}}}


def _pydantic_details(exc: ValidationError) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for err in exc.errors():
        loc = ".".join(str(p) for p in err.get("loc", ()) if p != "body") or "_root"
        out.setdefault(loc, []).append(err.get("msg", "invalid"))
    return out


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def _handle_api_error(exc: ApiError):
        resp = jsonify(_envelope(exc.code, exc.message, exc.details))
        return resp, exc.status

    @app.errorhandler(ValidationError)
    def _handle_validation(exc: ValidationError):
        resp = jsonify(
            _envelope("validation_error", "Validation failed", _pydantic_details(exc))
        )
        return resp, 400

    @app.errorhandler(429)
    def _handle_rate_limit(exc):
        message = getattr(exc, "description", "Too many requests")
        resp = jsonify(_envelope("rate_limited", str(message)))
        # Flask-Limiter sets Retry-After on the exception's headers.
        retry_after = getattr(exc, "retry_after", None)
        if retry_after is not None:
            resp.headers["Retry-After"] = str(retry_after)
        return resp, 429

    @app.errorhandler(HTTPException)
    def _handle_http(exc: HTTPException):
        code_map = {
            400: "bad_request",
            401: "unauthorized",
            403: "forbidden",
            404: "not_found",
            405: "method_not_allowed",
            409: "conflict",
            410: "invitation_expired",
            413: "payload_too_large",
            415: "unsupported_media_type",
            422: "unprocessable",
        }
        code = code_map.get(exc.code or 500, "error")
        message = exc.description or exc.name
        resp = jsonify(_envelope(code, str(message)))
        return resp, exc.code or 500

    @app.errorhandler(Exception)
    def _handle_unexpected(exc: Exception):
        logger.exception("Unhandled error: %s", exc)
        resp = jsonify(_envelope("internal_error", "Internal server error"))
        return resp, 500
