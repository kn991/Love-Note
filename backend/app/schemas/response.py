from __future__ import annotations

from pydantic import Field, model_validator

from app.schemas.common import StrictModel


class AvailabilityIn(StrictModel):
    slots: list[str] = Field(default_factory=list, max_length=10)
    text: str = Field(default="", max_length=300)

    @model_validator(mode="after")
    def _at_least_one(self):
        self.slots = [s.strip() for s in self.slots if s and s.strip()][:10]
        for s in self.slots:
            if len(s) > 120:
                raise ValueError("availability slot too long")
        self.text = self.text.strip()
        if not self.slots and not self.text:
            raise ValueError("availability requires at least a slot or text")
        return self


class ResponseCreate(StrictModel):
    availability: AvailabilityIn
    food_preference: list[str] = Field(min_length=1, max_length=8)
    place_preference: str = Field(default="", max_length=120)
    place_is_custom: bool = False
    activity_preference: str = Field(default="", max_length=120)
    vibe: str = Field(default="", max_length=60)
    comment: str = Field(default="", max_length=1000)

    @model_validator(mode="after")
    def _normalize(self):
        cleaned = [f.strip() for f in self.food_preference if f and f.strip()]
        if not cleaned:
            raise ValueError("food_preference must have at least one item")
        for f in cleaned:
            if len(f) > 40:
                raise ValueError("food preference item too long")
        self.food_preference = cleaned[:8]
        self.place_preference = self.place_preference.strip()
        self.activity_preference = self.activity_preference.strip()
        self.vibe = self.vibe.strip()
        self.comment = self.comment.strip()
        return self
