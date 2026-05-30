"""Application factory for the lovenote backend."""

from __future__ import annotations

import logging

from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from app.config import BaseConfig, get_config
from app.errors import register_error_handlers
from app.extensions import db, limiter, migrate


def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__)
    config = get_config(config_name)
    config.validate()
    app.config.from_object(config)

    logging.basicConfig(level=logging.INFO)

    # Trust X-Forwarded-* only for the configured number of proxy hops (nginx).
    hops = app.config.get("PROXY_FIX_HOPS", 0)
    if hops:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=hops, x_proto=hops, x_host=hops)

    _init_extensions(app)
    _register_blueprints(app)
    register_error_handlers(app)
    _register_security_headers(app)

    return app


def _init_extensions(app: Flask) -> None:
    db.init_app(app)
    # Import models so Alembic/metadata see every table.
    from app import models  # noqa: F401

    migrate.init_app(app, db)
    limiter.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRF-Token"],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    )


def _register_blueprints(app: Flask) -> None:
    from app.blueprints.auth import bp as auth_bp
    from app.blueprints.health import bp as health_bp
    from app.blueprints.invitations import bp as invitations_bp
    from app.blueprints.public import bp as public_bp

    # Full prefixes here override each blueprint's own (Flask register semantics).
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(invitations_bp, url_prefix="/api/invitations")
    app.register_blueprint(public_bp, url_prefix="/api/public")


def _register_security_headers(app: Flask) -> None:
    @app.after_request
    def _headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault(
            "Referrer-Policy", "strict-origin-when-cross-origin"
        )
        # API serves JSON only; lock scripting down hard.
        response.headers.setdefault(
            "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
        )
        if app.config.get("COOKIE_SECURE"):
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        response.headers.pop("Server", None)
        return response
