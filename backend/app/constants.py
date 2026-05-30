"""Default seed options used when an invitation create payload omits them.

Source of truth: DATABASE_SCHEMA.md §5.
"""

from __future__ import annotations

DEFAULT_FOOD_OPTIONS = [
    {"emoji": "🍕", "label": "Пицца"},
    {"emoji": "🍣", "label": "Суши"},
    {"emoji": "🍝", "label": "Паста"},
    {"emoji": "☕", "label": "Кофе"},
    {"emoji": "🍰", "label": "Десерты"},
    {"emoji": "🍔", "label": "Бургеры"},
    {"emoji": "🍜", "label": "Рамен"},
    {"emoji": "🎲", "label": "Сюрприз"},
]

DEFAULT_ACTIVITY_OPTIONS = [
    {"emoji": "🛋️", "label": "уютно и спокойно"},
    {"emoji": "🌹", "label": "романтично"},
    {"emoji": "🚶", "label": "прогулка и разговоры"},
    {"emoji": "🍽️", "label": "вкусно поесть"},
    {"emoji": "✨", "label": "что-то необычное"},
    {"emoji": "🎁", "label": "сюрприз"},
]

DEFAULT_PLACE_OPTIONS = [
    {"emoji": "🎬", "label": "Кино"},
    {"emoji": "🌳", "label": "Парк"},
    {"emoji": "🖼️", "label": "Выставка"},
    {"emoji": "🍷", "label": "Ресторан"},
]

DEFAULT_TITLE = "пойдёшь со мной на свидание?"
