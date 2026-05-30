from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify
from sqlalchemy import text

from app.extensions import db

bp = Blueprint("health", __name__)


@bp.get("/health")
def health():
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "ok", "db": "ok", "time": now}), 200
    except Exception:
        return jsonify({"status": "degraded", "db": "down", "time": now}), 503
