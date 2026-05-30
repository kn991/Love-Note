# lovenote — API Contract (`API_CONTRACT.md`)

> Flask + Pydantic v2 (request/response models) · cookie-session auth ·
> JSON everywhere · all paths prefixed `/api`. Frontend Zod schemas must mirror these.

---

## 1. Conventions

### 1.1 Base
- Base URL (dev): `http://localhost:5000/api` (proxied by Next.js / nginx as `/api`).
- Content type: `application/json` (request & response). UTF-8.
- All timestamps: ISO-8601 UTC with `Z` (e.g. `2026-05-29T18:30:00Z`).

### 1.2 Auth model (httpOnly cookie session)
- On `login`/`register`, server sets two cookies:
  - `lovenote_session` — httpOnly, Secure (prod), SameSite=Lax, signed JWT or session id.
  - `lovenote_csrf` — readable by JS (NOT httpOnly), random token.
- For mutating requests (POST/PATCH/DELETE) on **authenticated** routes, client sends
  header `X-CSRF-Token: <value of lovenote_csrf>`; server verifies double-submit.
- Public routes (`/api/public/*`) are **unauthenticated** and CSRF-exempt (token-scoped,
  rate-limited instead).
- Session lifetime: 7 days sliding (refresh on activity). Logout clears cookies.

### 1.3 Standard error envelope
All errors return:
```json
{ "error": { "code": "string_code", "message": "human readable (EN)", "details": { } } }
```
| HTTP | code examples |
|---|---|
| 400 | `validation_error` (details = field→messages), `bad_request` |
| 401 | `unauthorized`, `invalid_credentials`, `csrf_failed` |
| 403 | `forbidden` |
| 404 | `not_found` |
| 409 | `email_taken`, `username_taken`, `already_responded` |
| 410 | `invitation_expired` |
| 422 | `unprocessable` |
| 429 | `rate_limited` (header `Retry-After`) |
| 500 | `internal_error` (never leak stack traces) |

> `message` is English/dev-facing; the **frontend** renders Russian copy per code.

### 1.4 Validation rules (shared)
| Field | Rule |
|---|---|
| email | valid email, ≤ 254 chars |
| username | `^[a-zA-Z0-9_]{3,32}$` |
| password | 8–128 chars, at least 1 letter + 1 digit (no max-strength gatekeeping) |
| girl_name | 1–80 chars, trimmed |
| title | ≤ 140 chars |
| greeting_message / final_message | ≤ 1000 chars |
| avatar_url | valid http(s) URL, ≤ 2048 chars |
| options arrays | ≤ 12 items; label 1–40; emoji ≤ 8 |
| comment | ≤ 1000 chars |
| token (path) | `^[A-Za-z0-9_-]{20,64}$` |

---

## 2. Health

### `GET /api/health`
Auth: none. Returns liveness + db check.
```json
200 { "status": "ok", "db": "ok", "time": "2026-05-29T18:30:00Z" }
503 { "status": "degraded", "db": "down", "time": "..." }
```

---

## 3. Auth — `/api/auth`

### `POST /api/auth/register`
Auth: none. Rate limit: 5/min/IP.
Request:
```json
{ "email": "a@b.com", "username": "roma", "password": "secret123" }
```
Responses:
- `201` → sets cookies, returns `UserPublic` (see §6.1).
- `409 email_taken` / `409 username_taken`
- `400 validation_error`

### `POST /api/auth/login`
Auth: none. Rate limit: 10/min/IP + per-account throttle.
Request (login by email OR username):
```json
{ "identifier": "a@b.com", "password": "secret123" }
```
Responses:
- `200` → sets cookies, returns `UserPublic`.
- `401 invalid_credentials` (generic — never reveal which field was wrong).

### `POST /api/auth/logout`
Auth: session. CSRF required.
- `204` → clears cookies.

### `GET /api/auth/me`
Auth: session.
- `200` → `UserPublic`.
- `401 unauthorized`.

### `PATCH /api/auth/me`
Auth: session. CSRF required.
Request (any subset):
```json
{ "username": "newname", "email": "new@b.com" }
```
- `200` → updated `UserPublic`.
- `409 email_taken` / `409 username_taken`, `400 validation_error`.

### `POST /api/auth/change-password`
Auth: session. CSRF required. Rate limit: 5/min/user.
Request:
```json
{ "current_password": "secret123", "new_password": "secret456" }
```
- `204`. On wrong current → `401 invalid_credentials`.
- On success, optionally rotate session (recommended).

### `DELETE /api/auth/me`  (account deletion)
Auth: session. CSRF required.
Request:
```json
{ "password": "secret123" }
```
- `204` → cascade-deletes user data, clears cookies.
- `401 invalid_credentials` if password wrong.

---

## 4. Invitations — `/api/invitations` (auth: session; owner-scoped; CSRF on mutations)

> Every handler filters by `owner_id == current_user.id`. Accessing another user's
> invitation returns `404 not_found` (not 403 — avoid existence disclosure).

### `GET /api/invitations`
Query: `?status=active|draft|answered|expired|archived` (optional), `?page`, `?per_page`
(default 20, max 50), `?include_archived=false`.
- `200`:
```json
{
  "items": [ /* InvitationListItem (§6.3) */ ],
  "page": 1, "per_page": 20, "total": 3
}
```

### `POST /api/invitations`
CSRF required. Rate limit: 30/min/user.
Request (`InvitationCreate`, §6.5):
```json
{
  "girl_name": "Аня",
  "title": "пойдёшь со мной на свидание?",
  "greeting_message": "у меня к тебе важный вопрос…",
  "avatar_url": "https://…/cat.png",
  "food_options": [{"emoji":"🍕","label":"Пицца"}],
  "place_options": [{"emoji":"🎬","label":"Кино"}],
  "activity_options": [{"emoji":"🌹","label":"романтично"}],
  "final_message": "не могу дождаться 💕",
  "expires_at": "2026-06-30T20:00:00Z",
  "is_active": true,
  "allow_multiple_responses": false
}
```
Behavior: server generates unique `token` (`secrets.token_urlsafe(32)`, retry on
collision). Empty option arrays are replaced with defaults (DATABASE_SCHEMA §5).
- `201` → `InvitationDetail` (§6.4) including `token` and `public_url`.

### `GET /api/invitations/:id`
- `200` → `InvitationDetail` (includes `response_count`, `view_count`, `status`).
- `404 not_found`.

### `PATCH /api/invitations/:id`
CSRF required. Partial update; any subset of `InvitationCreate` fields.
- `200` → `InvitationDetail`. `404` if not owner.
> `token` is immutable and never accepted in the body.

### `DELETE /api/invitations/:id`
CSRF required.
- `204` → hard delete (cascade responses/views). `404` if not owner.

### `POST /api/invitations/:id/archive`
CSRF required. Sets `archived_at = now()`.
- `200` → `InvitationDetail` (status `archived`).

### `POST /api/invitations/:id/activate`
CSRF required. Sets `is_active = true` (and clears `archived_at`).
- `200` → `InvitationDetail`.

### `POST /api/invitations/:id/deactivate`
CSRF required. Sets `is_active = false`.
- `200` → `InvitationDetail`.

### `GET /api/invitations/:id/responses`
Query: `?page`, `?per_page` (default 20, max 50).
- `200`:
```json
{ "items": [ /* ResponsePublic (§6.6) */ ], "page":1, "per_page":20, "total":2 }
```
- `404` if not owner.

---

## 5. Public — `/api/public/invite/:token` (NO auth, token-scoped, CSRF-exempt, rate-limited)

> CRITICAL leak guard: these responses contain ONLY fields needed to render the game.
> Never include `owner_id`, owner email/username, internal `id`, timestamps beyond
> what's needed, or response data from other people.

### `GET /api/public/invite/:token`
Rate limit: 60/min/IP.
- `200` → `PublicInvite` (§6.7):
```json
{
  "girl_name": "Аня",
  "title": "пойдёшь со мной на свидание?",
  "greeting_message": "у меня к тебе важный вопрос…",
  "avatar_url": "https://…/cat.png",
  "food_options": [{"emoji":"🍕","label":"Пицца"}],
  "place_options": [{"emoji":"🎬","label":"Кино"}],
  "activity_options": [{"emoji":"🌹","label":"романтично"}],
  "final_message": "не могу дождаться 💕",
  "allow_multiple_responses": false,
  "already_responded": false,
  "state": "open"
}
```
`state` ∈ `open | expired | inactive | answered`. The frontend uses `state` to choose
which screen to show. Server still enforces rules on respond.
- `404 not_found` for unknown token (also use for inactive if you prefer to hide
  existence — but here we expose `state:"inactive"` so the creator can preview; decide
  in implementation, default: return 200 with `state:"inactive"`).

### `POST /api/public/invite/:token/view`
Rate limit: 30/min/IP. Fire-and-forget; body empty.
- `204` always (even on duplicate). Best-effort insert into `invitation_view`.
- Never errors the client; failures logged server-side only.

### `POST /api/public/invite/:token/respond`
Rate limit: 10/min/IP. CSRF-exempt.
Request (`ResponseCreate`, §6.8):
```json
{
  "availability": { "slots": ["2026-06-01T18:00","weekend"], "text": "после 19" },
  "food_preference": ["Суши","Десерты"],
  "place_preference": "Кино",
  "place_is_custom": false,
  "activity_preference": "романтично",
  "vibe": "романтично",
  "comment": "очень жду 💕"
}
```
Server enforcement (in order):
1. token valid → else `404 not_found`.
2. invitation active & not archived → else `403 forbidden` (`state inactive`).
3. not expired → else `410 invitation_expired`.
4. if `allow_multiple_responses=false` and a response exists → `409 already_responded`.
5. validate payload (Pydantic) → else `400 validation_error`.
6. server computes `ip_hash` / `user_agent_hash`, inserts response.
- `201`:
```json
{ "ok": true, "final_message": "не могу дождаться 💕" }
```
> Response returns only `final_message` (for the success screen) — nothing else leaked.

---

## 6. Schemas (Pydantic ⇄ Zod parity)

### 6.1 `UserPublic`
```json
{ "id": 1, "email": "a@b.com", "username": "roma",
  "created_at": "…Z", "is_active": true }
```

### 6.2 `OptionItem`
```json
{ "emoji": "🍕", "label": "Пицца" }
```

### 6.3 `InvitationListItem` (dashboard list — lightweight)
```json
{
  "id": 12, "token": "abc…", "public_url": "https://app/invite/abc…",
  "girl_name": "Аня", "title": "…",
  "status": "active", "is_active": true, "archived_at": null,
  "expires_at": "…Z", "response_count": 2, "view_count": 9,
  "created_at": "…Z"
}
```

### 6.4 `InvitationDetail` (full, owner-only)
All `InvitationCreate` fields + `id, token, public_url, status, response_count,
view_count, created_at, updated_at, archived_at`.

### 6.5 `InvitationCreate` / `InvitationUpdate`
Fields per API §4 POST body. `InvitationUpdate` = all optional.

### 6.6 `ResponsePublic` (owner viewing responses)
```json
{
  "id": 5,
  "availability": { "slots": [...], "text": "…" },
  "food_preference": ["Суши","Десерты"],
  "place_preference": "Кино", "place_is_custom": false,
  "activity_preference": "романтично", "vibe": "романтично",
  "comment": "…",
  "submitted_at": "…Z"
}
```
> Note: `ip_hash`/`user_agent_hash` are NEVER returned to the client.

### 6.7 `PublicInvite`
Per API §5 GET body. Excludes all owner/internal fields.

### 6.8 `ResponseCreate`
Per API §5 respond body. Validation:
- `availability`: object; at least one of `slots` (≤10 items) / `text` (≤300) present.
- `food_preference`: array of strings, 1–8 items, each ≤40 chars; must match offered
  labels OR be allowed free choice (decide: strict match recommended).
- `place_preference`: ≤120 chars; if `place_is_custom=false` must match an offered label.
- `activity_preference` / `vibe`: ≤120/≤60 chars; should match offered labels.
- `comment`: ≤1000 chars, optional.

---

## 7. CORS
- Allowlist exactly the frontend origin(s) from env (`CORS_ORIGINS`), e.g.
  `http://localhost:3000` (dev), prod domain.
- `supports_credentials = true` (cookies). Never `*` with credentials.
- Allowed methods: GET, POST, PATCH, DELETE, OPTIONS. Allowed headers:
  `Content-Type, X-CSRF-Token`.

---

## 8. Rate limiting summary (Flask-Limiter, key = IP, plus per-user where noted)
| Endpoint | Limit |
|---|---|
| register | 5/min/IP |
| login | 10/min/IP (+ per-account backoff) |
| change-password | 5/min/user |
| create invitation | 30/min/user |
| public GET invite | 60/min/IP |
| public view | 30/min/IP |
| public respond | 10/min/IP |
| default (all others) | 120/min/IP |
Storage backend: Redis in prod (configurable), in-memory acceptable for dev.

---

## 9. Idempotency & edge behavior
- `view` is best-effort and may double-count; that's acceptable.
- `respond` with `allow_multiple_responses=false` is single-shot per invitation
  (enforced by count check; optional unique-ish guard by `ip_hash` if desired —
  default: count-based).
- All list endpoints are stable-sorted by `created_at DESC` then `id DESC`.
