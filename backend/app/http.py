"""Small request/response helpers shared by blueprints."""

from __future__ import annotations

from typing import TypeVar

from flask import request
from pydantic import BaseModel

from app.errors import ApiError

M = TypeVar("M", bound=BaseModel)


def parse_body(model: type[M]) -> M:
    """Validate the JSON request body against a Pydantic model.

    Raises ApiError(400) for malformed JSON; ValidationError (handled globally)
    for schema violations.
    """
    data = request.get_json(silent=True)
    if data is None:
        raise ApiError(400, "bad_request", "Request body must be valid JSON")
    if not isinstance(data, dict):
        raise ApiError(400, "bad_request", "Request body must be a JSON object")
    return model.model_validate(data)
