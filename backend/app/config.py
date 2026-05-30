"""Environment-driven configuration.

Three concrete classes (Development / Testing / Production) selected by the
``FLASK_CONFIG`` env var. Secrets are never hardcoded — production refuses to
boot without a real ``SECRET_KEY`` / ``JWT_SECRET`` / ``HASH_SALT``.
"""

from __future__ import annotations

import os
from datetime import timedelta


def _bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _origins(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]


class BaseConfig:
    # --- Core secrets (overridden / validated per environment) ---
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    JWT_SECRET = os.environ.get("JWT_SECRET", "") or SECRET_KEY
    HASH_SALT = os.environ.get("HASH_SALT", "")

    # --- Database ---
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql+psycopg2://localhost/lovenote"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    # --- Sessions / cookies ---
    SESSION_COOKIE_NAME = "lovenote_session"
    CSRF_COOKIE_NAME = "lovenote_csrf"
    SESSION_LIFETIME = timedelta(days=7)
    COOKIE_SECURE = _bool("COOKIE_SECURE", False)
    COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "Lax")
    COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN") or None

    # --- CORS ---
    CORS_ORIGINS = _origins(os.environ.get("CORS_ORIGINS", "http://localhost:3000"))

    # --- Rate limiting ---
    RATELIMIT_STORAGE_URI = os.environ.get("REDIS_URL", "memory://")
    RATELIMIT_HEADERS_ENABLED = True
    RATELIMIT_DEFAULT = "120 per minute"

    # --- Misc ---
    APP_PUBLIC_URL = os.environ.get(
        "APP_PUBLIC_URL", "http://localhost:3000"
    ).rstrip("/")
    # Trust X-Forwarded-* from this many proxy hops (nginx). 0 = trust none.
    PROXY_FIX_HOPS = int(os.environ.get("PROXY_FIX_HOPS", "0"))
    MAX_CONTENT_LENGTH = 256 * 1024  # 256 KB request body cap

    DEBUG = False
    TESTING = False

    @classmethod
    def validate(cls) -> None:
        """Hook for per-environment secret validation. Base is permissive."""


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SECRET_KEY = os.environ.get(
        "SECRET_KEY", "dev-insecure-secret-change-me-0123456789abcdef"
    )
    JWT_SECRET = os.environ.get("JWT_SECRET", "") or SECRET_KEY
    HASH_SALT = os.environ.get("HASH_SALT", "dev-insecure-salt-change-me")


class TestingConfig(BaseConfig):
    TESTING = True
    SECRET_KEY = "testing-secret"
    JWT_SECRET = "testing-secret"
    HASH_SALT = "testing-salt"
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL", "postgresql+psycopg2://localhost/lovenote_test"
    )
    RATELIMIT_ENABLED = False


class ProductionConfig(BaseConfig):
    COOKIE_SECURE = _bool("COOKIE_SECURE", True)

    @classmethod
    def validate(cls) -> None:
        missing = [
            name
            for name in ("SECRET_KEY", "JWT_SECRET", "HASH_SALT")
            if not (os.environ.get(name) or "").strip()
        ]
        if missing:
            raise RuntimeError(
                "Refusing to start: missing required secrets in production: "
                + ", ".join(missing)
            )
        if cls.RATELIMIT_STORAGE_URI.startswith("memory://"):
            raise RuntimeError(
                "Refusing to start: set REDIS_URL for rate-limit storage in production."
            )


_CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str | None = None) -> type[BaseConfig]:
    key = (name or os.environ.get("FLASK_CONFIG", "development")).strip().lower()
    return _CONFIGS.get(key, DevelopmentConfig)
