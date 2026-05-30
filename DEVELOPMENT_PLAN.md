# lovenote — Development Plan (`DEVELOPMENT_PLAN.md`)

> The execution roadmap. Each step lists scope, key files, acceptance criteria, and the
> review gate. We build in this order; we do not skip the per-step review.

---

## 0. Principles
- Work like a technical lead: design → implement → self-review, step by step.
- After each step: list files changed · explain what was built · run/explain checks ·
  re-verify against `DESIGN_RULES.md` · run the 8-point self-review on any UI.
- Backend before the feature it serves; design system before the screens that use it.
- The **public invite flow** is the highest-quality bar in the app.

---

## 1. Target project structure
```
lovenote/
├─ README.md
├─ PRODUCT_SPEC.md
├─ DESIGN_RULES.md
├─ API_CONTRACT.md
├─ DATABASE_SCHEMA.md
├─ SECURITY_CHECKLIST.md
├─ DEVELOPMENT_PLAN.md
├─ docker-compose.yml
├─ docker-compose.prod.yml
├─ .env.example
├─ .gitignore
│
├─ backend/
│  ├─ pyproject.toml / requirements.txt
│  ├─ .env.example
│  ├─ Dockerfile
│  ├─ alembic.ini
│  ├─ migrations/                  # Alembic
│  │  └─ versions/
│  ├─ app/
│  │  ├─ __init__.py               # create_app() app factory
│  │  ├─ config.py                 # Development/Testing/Production
│  │  ├─ extensions.py             # db, migrate, limiter, cors, jwt
│  │  ├─ db.py                     # SQLAlchemy 2.0 Base / session
│  │  ├─ security/
│  │  │  ├─ passwords.py           # argon2 hash/verify
│  │  │  ├─ tokens.py              # invitation token gen
│  │  │  ├─ hashing.py             # ip/ua salted hashing
│  │  │  └─ csrf.py                # double-submit helpers
│  │  ├─ errors.py                 # error envelope + handlers
│  │  ├─ models/
│  │  │  ├─ user.py
│  │  │  ├─ invitation.py
│  │  │  ├─ response.py
│  │  │  └─ view.py
│  │  ├─ schemas/                  # Pydantic v2
│  │  │  ├─ auth.py
│  │  │  ├─ invitation.py
│  │  │  ├─ response.py
│  │  │  └─ common.py
│  │  ├─ services/                 # business logic (no Flask in here)
│  │  │  ├─ auth_service.py
│  │  │  ├─ invitation_service.py
│  │  │  └─ response_service.py
│  │  ├─ blueprints/
│  │  │  ├─ health.py
│  │  │  ├─ auth.py
│  │  │  ├─ invitations.py
│  │  │  └─ public.py
│  │  └─ utils/
│  └─ tests/
│     ├─ conftest.py
│     ├─ test_auth.py
│     ├─ test_invitations.py
│     ├─ test_public.py
│     └─ test_security.py
│
├─ frontend/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ next.config.ts
│  ├─ tailwind.config.ts
│  ├─ postcss.config.js
│  ├─ .env.example
│  ├─ Dockerfile
│  ├─ public/                      # SVG decorations, fonts (or next/font)
│  └─ src/
│     ├─ app/
│     │  ├─ layout.tsx             # fonts, providers
│     │  ├─ globals.css            # CSS vars from DESIGN_RULES
│     │  ├─ page.tsx               # landing /
│     │  ├─ login/page.tsx
│     │  ├─ register/page.tsx
│     │  ├─ invite/[token]/page.tsx
│     │  └─ dashboard/
│     │     ├─ layout.tsx          # DashboardShell + auth guard
│     │     ├─ page.tsx
│     │     ├─ invitations/page.tsx
│     │     ├─ invitations/new/page.tsx
│     │     ├─ invitations/[id]/page.tsx
│     │     └─ settings/page.tsx
│     ├─ components/
│     │  ├─ ui/                    # CuteButton, ChoiceCard, FormField, states…
│     │  ├─ decorations/           # FloatingDecorations + SVGs
│     │  ├─ invite/                # InviteFlow + Step* components
│     │  └─ dashboard/             # DashboardShell, InvitationCard, ResponseCard…
│     ├─ lib/
│     │  ├─ api.ts                 # fetch wrapper (credentials, CSRF, errors)
│     │  ├─ schemas.ts             # Zod (mirror API_CONTRACT)
│     │  ├─ copy.ts                # Russian copy bank (DESIGN_RULES §7)
│     │  └─ hooks/                 # useAuth, useInvitations, etc.
│     └─ styles/ (if needed)
│
└─ nginx/
   ├─ nginx.conf
   └─ conf.d/lovenote.conf
```

---

## 2. Steps

### Step 1 — Product spec ✅
Output: `PRODUCT_SPEC.md`. Done.

### Step 2 — Design system ✅
Output: `DESIGN_RULES.md`. Done (palette, type, spacing, components, copy bank, a11y).

### Step 3 — Architecture & docs ✅ (this batch)
Outputs: `API_CONTRACT.md`, `DATABASE_SCHEMA.md`, `SECURITY_CHECKLIST.md`,
`DEVELOPMENT_PLAN.md`, `README.md`. Front/back separation defined; cookie-session auth
decided; folder layout (§1) fixed.

### Step 4 — DB schema + API contract ✅
Captured in `DATABASE_SCHEMA.md` + `API_CONTRACT.md`. (Implementation in Steps 6–7.)

### Step 5 — Project scaffolding
Scope: create the directory tree (§1), config files, lockfiles, `.gitignore`,
`.env.example` (root + backend + frontend), empty module stubs, Docker placeholder.
Accept: tree matches §1; `git status` clean of secrets; no app logic yet.
Review gate: structure review only.

### Step 6 — Backend foundation
Scope: `create_app()` factory, `config.py` (Dev/Test/Prod, refuse boot without secret),
`extensions.py`, `db.py`, Alembic init + `0001..0005` migrations, models (User,
Invitation, Response, View), `security/*` (argon2, token gen, ip/ua hashing, csrf),
`errors.py` (envelope + handlers), `health.py` blueprint, auth blueprint + auth_service
(register/login/logout/me/change-password/delete), cookie + CSRF wiring, CORS, limiter.
Accept: `GET /api/health` 200; register/login set cookies; `pytest` auth tests green;
SECURITY_CHECKLIST §1,2,8,9,10 items for auth satisfied.
Review gate: security review of auth + isolation.

### Step 7 — Backend invitation logic
Scope: invitation_service (CRUD, archive/activate/deactivate, owner scoping, token
gen, default option seeding, status/count computation), response_service (respond rules,
ip/ua hashing), invitations blueprint, public blueprint (GET/view/respond with leak
guard + state machine), rate limits per API_CONTRACT §8.
Accept: full API_CONTRACT §4–5 behavior; tests for owner isolation, public leak guard,
expiry/inactive/already-responded; `pytest` green.
Review gate: SECURITY_CHECKLIST §2,3,4,5,7,13 verification (run §14 checks).

### Step 8 — Frontend design system
Scope: `tailwind.config.ts` (tokens from DESIGN_RULES §9), `globals.css` (CSS vars,
fonts via `next/font` with cyrillic), base `ui/` components (CuteButton, ChoiceCard,
FormField, EmptyState, LoadingState, ErrorState, Badge, Modal), `FloatingDecorations`
+ SVGs, `copy.ts`, `api.ts`, `schemas.ts`.
Accept: a components preview renders; tokens only (no stray hex); reduced-motion honored.
Review gate: DESIGN_RULES §10 DoD on the component set.

### Step 9 — Public invite flow (CROWN JEWEL)
Scope: `invite/[token]/page.tsx`, `InviteFlow`, `InviteStepLayout`, `Step*` (Intro,
Confirm, Availability, Food[multi], Place[+Другое], Vibe, Comment, Review, Success),
playful bounded "нет" button, progress indicator, edge-state screens (unknown/expired/
inactive/answered), view beacon, submit + error recovery.
Accept: full flow works against backend; mobile-first at 375/414px; transitions per
DESIGN_RULES §3.4; a11y (focus, aria-live, reduced-motion).
Review gate: **must score 8/8** on the self-review; this is the polish bar.

### Step 10 — Auth pages
Scope: `/login`, `/register` on-brand (RHF + Zod), error/loading states, redirect to
dashboard, link between pages, useAuth hook + guard.
Accept: register/login/logout round-trip; validation messages in RU; on-brand styling.
Review gate: DESIGN_RULES §10 DoD.

### Step 11 — Dashboard
Scope: `DashboardShell` (warm, non-corporate), `/dashboard` overview, invitations list
(`InvitationCard`, status pills, counts, actions), create form (`/new`), detail +
responses (`ResponseCard`), settings (username/email/password/delete). Empty/loading/
error states everywhere.
Accept: full creator journey; copy link works; archive/activate/deactivate/delete work;
responses render as cute summaries (not tables).
Review gate: DESIGN_RULES §10 DoD + 8-point self-review.

### Step 12 — Integration
Scope: wire all pages to API via `api.ts` (credentials, CSRF header, error→RU mapping),
auth guard on dashboard, optimistic/refetch where sensible, env-based API base URL.
Accept: end-to-end flows pass manually; no TS errors; no console errors.
Review gate: cross-cutting QA pass.

### Step 13 — Docker Compose
Scope: `backend/Dockerfile`, `frontend/Dockerfile`, `nginx/` config, `docker-compose.yml`
(db, backend, frontend, nginx; internal network; healthchecks; migration on start),
`docker-compose.prod.yml` (TLS-ready, non-root, prod env). `.env.example` complete.
Accept: `docker compose up` brings the whole app up; health green; can complete a full
flow through nginx.
Review gate: SECURITY_CHECKLIST §6,11,12.

### Step 14 — Final polish
Scope: audit loading/empty/error states, responsive sweep, a11y sweep
(keyboard/focus/aria/reduced-motion/contrast), full SECURITY_CHECKLIST §14 run,
performance pass, README finalization, `.env.example` accuracy.
Accept: every checklist item ticked or consciously deferred with a note.
Review gate: final 8-point self-review on every UI screen.

---

## 3. Tooling & quality bars
- Backend: `ruff` (lint) + `mypy` (types) + `pytest` (tests). Format with `ruff format`.
- Frontend: `tsc --noEmit` (zero errors), `eslint`, `prettier`. No unused/messy code.
- Commits: small, per-step; never commit secrets; lockfiles committed.
- Definition of done per step = acceptance criteria met AND review gate passed.

---

## 4. Environment variables (summary; full in `.env.example`)
Backend: `FLASK_ENV`, `SECRET_KEY`, `JWT_SECRET`, `DATABASE_URL`, `HASH_SALT`,
`CORS_ORIGINS`, `REDIS_URL`, `COOKIE_SECURE`, `COOKIE_DOMAIN`, `SESSION_LIFETIME_DAYS`.
Frontend: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_URL`.
DB: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

---

## 5. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Public page leaks owner data | Dedicated `PublicInvite` serializer; tests assert field allowlist |
| "нет" button feels broken/annoying | Bounded dodge, always recoverable, ≤3 dodges then shrink |
| App looks AI-generated | DESIGN_RULES bans + 8-point self-review gate every UI step |
| CSRF with cookie auth | Double-submit token; public routes token-scoped + rate-limited |
| N+1 on dashboard counts | Aggregate subqueries for response/view counts |
| Reduced-motion users | Decorations + slides disabled; fades only |
```
