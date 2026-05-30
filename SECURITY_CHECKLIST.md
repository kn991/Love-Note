# lovenote — Security Checklist (`SECURITY_CHECKLIST.md`)

> Security is a first-class requirement, not a final polish step. Each item lists the
> rule, where it applies, and how to verify it. Items marked **[BLOCKER]** must be done
> before any deploy.

---

## 1. Authentication & Sessions
- [ ] **[BLOCKER]** Passwords hashed with **argon2id** (argon2-cffi) — never plaintext,
  never reversible. Use sane params (time_cost≥2, memory_cost≥64MB). Verify: inspect
  `password_hash` column starts with `$argon2id$`.
- [ ] **[BLOCKER]** Login returns a **generic** error (`invalid_credentials`) — never
  reveal whether email/username exists or which field was wrong.
- [ ] **[BLOCKER]** Session token stored in **httpOnly** cookie (`lovenote_session`):
  `HttpOnly`, `Secure` (prod), `SameSite=Lax`, `Path=/`, signed. JS cannot read it.
- [ ] CSRF: double-submit cookie. `lovenote_csrf` (non-httpOnly) compared against
  `X-CSRF-Token` header on all authenticated POST/PATCH/DELETE. Reject mismatch with
  `401 csrf_failed`.
- [ ] Session expiry: 7-day sliding; logout clears both cookies server-side.
- [ ] Rotate session id on login and on password change (prevent fixation).
- [ ] Constant-time password compare (library handles it) — no early returns leaking timing.
- [ ] Per-account login throttle/backoff in addition to IP rate limit.

## 2. Authorization & Data Isolation
- [ ] **[BLOCKER]** Every `/api/invitations*` query is scoped by
  `owner_id == current_user.id`. Cross-owner access → `404 not_found` (no existence leak).
- [ ] **[BLOCKER]** Public endpoints (`/api/public/*`) never return `owner_id`, owner
  email/username, internal invitation `id`, or other users' responses. Use a dedicated
  `PublicInvite` serializer — never serialize the ORM object directly.
- [ ] Responses list never includes `ip_hash` / `user_agent_hash`.
- [ ] IDs in URLs for owner routes are fine (scoped); public uses only opaque `token`.

## 3. Invitation Tokens
- [ ] **[BLOCKER]** Token = `secrets.token_urlsafe(32)` (~256 bits) — URL-safe, random,
  unguessable. Unique constraint + retry-on-collision.
- [ ] Token never derived from sequential id, timestamp, or user data.
- [ ] Token validated against `^[A-Za-z0-9_-]{20,64}$` before any DB lookup.

## 4. Input Validation & Output Encoding
- [ ] **[BLOCKER]** All request bodies validated by Pydantic v2 before use; reject
  unknown/oversized fields. Mirror limits from API_CONTRACT §1.4.
- [ ] `avatar_url` validated: must be `http`/`https`, length-capped, no `javascript:`,
  `data:`, or `file:` schemes. Render with safe `<img>` only (no HTML injection).
- [ ] Free-text fields (`comment`, `greeting_message`, `final_message`, names) are
  treated as plain text. React escapes by default — **never** `dangerouslySetInnerHTML`.
- [ ] Length caps enforced server-side (not just client) to prevent storage abuse.
- [ ] JSON option arrays size-capped (≤12) and element-validated.

## 5. SQL / ORM
- [ ] **[BLOCKER]** Only SQLAlchemy parameterized queries / ORM — no string-built SQL.
- [ ] No `SELECT *` into public serializers; select explicit columns for public paths.
- [ ] Aggregate counts via subquery/`func.count` to avoid N+1 and accidental over-fetch.

## 6. CORS & Headers
- [ ] **[BLOCKER]** CORS allowlist from env (`CORS_ORIGINS`); `supports_credentials=true`;
  never `Access-Control-Allow-Origin: *` with credentials.
- [ ] Security headers (via nginx and/or Flask `after_request`):
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Content-Security-Policy` (script-src self; img-src self https: data-blocked except
  allowed; no inline except hashed). Tune CSP for Next.js.
  `Strict-Transport-Security` (prod, HTTPS only).
- [ ] Disable `Server`/framework version banners where possible.

## 7. Rate Limiting (Flask-Limiter)
- [ ] **[BLOCKER]** Limits applied per API_CONTRACT §8 (auth, public respond/view).
- [ ] Redis storage in prod (in-memory only acceptable for single-process dev).
- [ ] `429` returns `Retry-After`; never crashes.
- [ ] Limiter keys on real client IP (configure `X-Forwarded-For` trust ONLY from nginx).

## 8. Secrets & Config
- [ ] **[BLOCKER]** No secrets in code or git. All via env: `SECRET_KEY`, `JWT_SECRET`,
  `DATABASE_URL`, `HASH_SALT` (for ip/ua), `CORS_ORIGINS`, `REDIS_URL`.
- [ ] `.env` is gitignored; `.env.example` committed with placeholder values only.
- [ ] `SECRET_KEY` / `JWT_SECRET` are long random values; app refuses to boot with
  default/empty secret in production config.
- [ ] Distinct config classes: `Development`, `Testing`, `Production` (env-selected).

## 9. PII & Privacy
- [ ] **[BLOCKER]** Raw IP and User-Agent are **never stored**. Store salted SHA-256:
  `sha256(HASH_SALT + value)` → `ip_hash` / `user_agent_hash` (CHAR(64)).
- [ ] Email is the only PII stored; never exposed via public endpoints.
- [ ] Account deletion cascades and hard-deletes all related rows.
- [ ] Logs never contain passwords, full tokens, raw IPs, or full request bodies of
  auth endpoints.

## 10. Error Handling & Disclosure
- [ ] **[BLOCKER]** Production never returns stack traces; `500` → generic
  `internal_error`. Debug mode OFF in production.
- [ ] Consistent error envelope (API_CONTRACT §1.3); messages dev-facing EN, UI maps to RU.
- [ ] 404 used to mask existence for unauthorized owner resources.

## 11. Transport & Infra
- [ ] HTTPS in production (nginx TLS); HTTP→HTTPS redirect; `Secure` cookies enforced.
- [ ] nginx is the only public ingress; backend/db not directly exposed.
- [ ] DB not reachable from public network (Docker internal network only).
- [ ] Postgres uses a non-superuser app role with least privilege.
- [ ] Container images pinned; run as non-root user where feasible.

## 12. Dependencies & Build
- [ ] Lockfiles committed (`requirements.txt`/`poetry.lock`, `package-lock.json`).
- [ ] No known-vuln deps at release (run `pip-audit` / `npm audit` — document residuals).
- [ ] Frontend env vars exposed to client are prefixed `NEXT_PUBLIC_` and contain no
  secrets.

## 13. Abuse / Bots (public surface)
- [ ] Rate limits on `respond`/`view` (already §7).
- [ ] Optional: simple honeypot field or timing check on respond (no annoying CAPTCHA).
- [ ] Reject oversized payloads at nginx (`client_max_body_size`) and Flask
  (`MAX_CONTENT_LENGTH`).

## 14. Verification (how to test before deploy)
- [ ] Try fetching another user's invitation by id → expect 404.
- [ ] Inspect public GET response → confirm zero owner/internal fields.
- [ ] Confirm cookies are `HttpOnly`+`Secure`+`SameSite=Lax` in browser devtools.
- [ ] Attempt mutation without `X-CSRF-Token` → expect rejection.
- [ ] Hammer `respond` past limit → expect `429` + `Retry-After`.
- [ ] Submit `<script>` in `comment` → confirm stored as text and rendered escaped.
- [ ] Submit `avatar_url: javascript:alert(1)` → rejected by validation.
- [ ] Boot prod config without `SECRET_KEY` → app refuses to start.
- [ ] Confirm DB has no raw IPs (only 64-char hashes).
