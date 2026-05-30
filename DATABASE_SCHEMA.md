# lovenote — Database Schema (`DATABASE_SCHEMA.md`)

> PostgreSQL 16 · SQLAlchemy 2.0 (typed `Mapped[...]` / `mapped_column`) · Alembic.
> All timestamps are `TIMESTAMP WITH TIME ZONE`, stored UTC. All PKs are `BIGINT`
> identity unless noted. JSON columns use `JSONB`.

---

## 1. Conventions
- Naming: snake_case tables (singular), snake_case columns.
- Every table has `created_at` (default `now()`); mutable tables also `updated_at`
  (default `now()`, auto-updated via SQLAlchemy `onupdate`).
- Foreign keys are indexed. Deletes cascade from parent where noted.
- No raw IP / user-agent ever stored — only salted SHA-256 hashes (see SECURITY_CHECKLIST).
- Money/PII: none beyond email. Passwords are argon2id hashes only.

---

## 2. Entity-Relationship overview
```
User 1───* Invitation 1───* InvitationResponse
                       └───* InvitationView
```
- One user owns many invitations.
- One invitation has many responses (0..1 if `allow_multiple_responses=false`, else 0..N).
- One invitation has many views.
- Deleting a user → cascade delete invitations → cascade responses & views.
- Deleting an invitation → cascade responses & views.

---

## 3. Tables

### 3.1 `user`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT | PK, identity | |
| email | CITEXT | NOT NULL, UNIQUE | case-insensitive; validate format |
| username | VARCHAR(32) | NOT NULL, UNIQUE | `^[a-zA-Z0-9_]{3,32}$` |
| password_hash | VARCHAR(255) | NOT NULL | argon2id |
| is_active | BOOLEAN | NOT NULL, default true | soft-disable / deletion flag |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now(), onupdate | |

Indexes: `ux_user_email (email)`, `ux_user_username (username)`.
> `CITEXT` requires `CREATE EXTENSION IF NOT EXISTS citext;` (first migration).

### 3.2 `invitation`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT | PK, identity | internal only; never exposed publicly |
| owner_id | BIGINT | FK→user.id ON DELETE CASCADE, NOT NULL, indexed | |
| token | VARCHAR(64) | NOT NULL, UNIQUE, indexed | `secrets.token_urlsafe(32)` (~43 chars) |
| girl_name | VARCHAR(80) | NOT NULL | |
| title | VARCHAR(140) | NULL | custom title; default generated if null |
| greeting_message | TEXT | NULL | shown near step 1 |
| avatar_url | VARCHAR(2048) | NULL | must pass URL + scheme allowlist (http/https) |
| food_options | JSONB | NOT NULL, default `[]` | `[{emoji,label}]`; defaults seeded if empty |
| place_options | JSONB | NOT NULL, default `[]` | `[{emoji,label}]` |
| activity_options | JSONB | NOT NULL, default `[]` | `[{emoji,label}]` |
| final_message | TEXT | NULL | shown on success step |
| expires_at | TIMESTAMPTZ | NULL | null = never expires |
| is_active | BOOLEAN | NOT NULL, default true | |
| allow_multiple_responses | BOOLEAN | NOT NULL, default false | |
| archived_at | TIMESTAMPTZ | NULL | non-null = archived |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now(), onupdate | |

Indexes: `ux_invitation_token (token)`, `ix_invitation_owner_id (owner_id)`,
`ix_invitation_owner_created (owner_id, created_at desc)` for dashboard listing.

JSONB option shape (validated by Pydantic):
```json
{ "emoji": "🍕", "label": "Пицца" }
```
Constraints (app-level): ≤ 12 options per list; `label` 1–40 chars; `emoji` 0–8 chars.

### 3.3 `invitation_response`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT | PK, identity | |
| invitation_id | BIGINT | FK→invitation.id ON DELETE CASCADE, NOT NULL, indexed | |
| availability | JSONB | NOT NULL, default `[]` | `{ "slots": [..], "text": "..." }` |
| food_preference | JSONB | NOT NULL, default `[]` | array of chosen labels (multi-select) |
| place_preference | VARCHAR(120) | NULL | chosen label or free text ("Другое") |
| place_is_custom | BOOLEAN | NOT NULL, default false | true if "Другое" free text |
| activity_preference | VARCHAR(120) | NULL | chosen label (from activity_options) |
| vibe | VARCHAR(60) | NULL | one of vibe options |
| comment | TEXT | NULL | optional free text, ≤ 1000 chars |
| ip_hash | CHAR(64) | NULL | salted SHA-256 hex |
| user_agent_hash | CHAR(64) | NULL | salted SHA-256 hex |
| submitted_at | TIMESTAMPTZ | NOT NULL, default now() | |

Indexes: `ix_response_invitation_id (invitation_id)`,
`ix_response_invitation_submitted (invitation_id, submitted_at desc)`.

`availability` JSONB shape:
```json
{ "slots": ["2026-06-01T18:00", "weekend"], "text": "после 19 в будни" }
```
(Both `slots` and `text` optional but at least one required by validation.)

### 3.4 `invitation_view` (recommended analytics)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT | PK, identity | |
| invitation_id | BIGINT | FK→invitation.id ON DELETE CASCADE, NOT NULL, indexed | |
| ip_hash | CHAR(64) | NULL | salted SHA-256 hex |
| user_agent_hash | CHAR(64) | NULL | salted SHA-256 hex |
| viewed_at | TIMESTAMPTZ | NOT NULL, default now() | |

Index: `ix_view_invitation_id (invitation_id)`.
> View writes are best-effort; failures must not break page render.

---

## 4. Derived / computed (not stored)
Computed in the service layer when listing or showing invitations:
```
response_count = COUNT(invitation_response WHERE invitation_id = :id)
view_count     = COUNT(invitation_view     WHERE invitation_id = :id)
is_expired     = expires_at IS NOT NULL AND now() > expires_at
status:
  if archived_at  is not null           -> "archived"
  elif is_expired                       -> "expired"
  elif response_count > 0               -> "answered"
  elif is_active                        -> "active"
  else                                  -> "draft"
```
> "archived" is a real state via `archived_at`; "draft/active/answered/expired" are derived.
Dashboard listing should fetch counts via aggregate subqueries (avoid N+1).

---

## 5. Default seed options (used when create payload omits them)
```json
food_options (default):
[
  {"emoji":"🍕","label":"Пицца"}, {"emoji":"🍣","label":"Суши"},
  {"emoji":"🍝","label":"Паста"}, {"emoji":"☕","label":"Кофе"},
  {"emoji":"🍰","label":"Десерты"}, {"emoji":"🍔","label":"Бургеры"},
  {"emoji":"🍜","label":"Рамен"}, {"emoji":"🎲","label":"Сюрприз"}
]
activity_options / vibe (default):
[
  {"emoji":"🛋️","label":"уютно и спокойно"}, {"emoji":"🌹","label":"романтично"},
  {"emoji":"🚶","label":"прогулка и разговоры"}, {"emoji":"🍽️","label":"вкусно поесть"},
  {"emoji":"✨","label":"что-то необычное"}, {"emoji":"🎁","label":"сюрприз"}
]
place_options (default — creator usually customizes):
[
  {"emoji":"🎬","label":"Кино"}, {"emoji":"🌳","label":"Парк"},
  {"emoji":"🖼️","label":"Выставка"}, {"emoji":"🍷","label":"Ресторан"}
]
```

---

## 6. Migration plan (Alembic)
1. `0001_init_extensions` — `CREATE EXTENSION citext;`
2. `0002_create_user`
3. `0003_create_invitation` (+ indexes, FK)
4. `0004_create_invitation_response` (+ indexes, FK)
5. `0005_create_invitation_view` (+ index, FK)

Rules:
- Migrations are reversible (`downgrade` implemented).
- No data backfill needed (greenfield).
- Run via `alembic upgrade head` in the backend container entrypoint (guarded).

---

## 7. Data lifecycle & privacy
- Account deletion (`DELETE /api/auth/me` flow or settings): cascade removes all
  invitations, responses, and views for that user. Hard delete (greenfield, no
  retention requirement) — confirm in SECURITY_CHECKLIST.
- Public endpoints select **only** the columns needed to render the game
  (see API_CONTRACT §Public). Never `SELECT *` into a public serializer.
- `ip_hash` / `user_agent_hash` are pseudonymous; salt rotation invalidates linkage
  (acceptable — analytics only).
