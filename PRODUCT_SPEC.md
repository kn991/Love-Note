# lovenote — Product Specification

> A web product for creating cute, interactive romantic date invitations.
> The recipient experiences a playful step-by-step mini-game instead of a form;
> the creator manages everything from a soft, warm dashboard.

**Status:** Step 1 of 14 — Product Specification (no code yet)
**Repo/package name:** `lovenote` · **UI language:** Russian

---

## Locked decisions (from kickoff)

| Decision | Choice |
|---|---|
| Creator auth | **httpOnly cookie session** (JWT/session in secure httpOnly cookie) |
| Recipient food answer | **Multi-select** (JSON array of choices) |
| Product / repo name | **`lovenote`** (code) · Russian UI copy |
| Docs | Saved as `.md` files in the repo (`PRODUCT_SPEC.md`, `DESIGN_RULES.md`, ...) |

---

## 1. Product Overview

### 1.1 One-liner
A creator builds a private, personalized date invitation. The recipient opens a unique
link and walks through a delightful step-by-step romantic mini-game to answer
when/where/what they want. The creator sees every response in a cozy dashboard.

### 1.2 Who it's for
- **Creator (он):** wants to ask someone out in a memorable, non-cringe, personal way.
  Logs in, builds invitations, reads responses.
- **Recipient (она):** receives a link, no account needed. Experiences the mini-game on
  her phone. Submits answers.

### 1.3 Core value
The *experience* of opening the link. This is not a forms tool — it is a feeling. The
product lives or dies on whether the public invite page feels like a handmade love
letter that happens to be interactive.

### 1.4 Success criteria — the 8-point self-review
Every UI build must pass:
1. Does this look like a generic AI-generated website? (must be **no**)
2. Does it feel romantic, cute, personal, and polished?
3. Is the public invite page a mini-game instead of a form?
4. Is it mobile-first?
5. Are animations subtle and delightful?
6. Are there ugly default components? (must be **no**)
7. Is the Russian copy natural?
8. Would a real person enjoy opening this link?

If #1 is yes → redesign before continuing.

---

## 2. User Roles & Permissions

| Role | Auth | Can do |
|---|---|---|
| **Guest** | none | View landing page, register, login |
| **Creator** | authenticated | Full CRUD on own invitations, view own responses, manage account |
| **Recipient** | none (token-based) | View one public invite by token, submit one (or N) response(s) |

**Hard isolation rule:** A creator can only ever see *their own* invitations and
responses. Public token endpoints must never leak owner identity, email, internal IDs,
or any field not needed to render the game.

---

## 3. User Flows

### 3.1 Creator: Registration & Auth
```
Landing (/)
  → Register (/register) → auto-login → Dashboard
  → Login (/login) → Dashboard
  → Logout → Landing
Session persists across reloads via secure httpOnly cookie.
```

### 3.2 Creator: Create an invitation
```
Dashboard → "Создать приглашение 💌"
  → /dashboard/invitations/new
  → Fill form (girl name, title, greeting, avatar URL, food/place/activity options,
    final message, expiration, allow-multiple, active toggle)
  → Save → invitation created with unique unguessable token
  → Redirect to invitation detail with "Скопировать ссылку" CTA
```

### 3.3 Creator: Manage invitations
```
/dashboard/invitations → list of InvitationCards
  Each card shows: girl name, status badge, response count, created date
  Actions: copy link · open detail · activate/deactivate · archive · delete
Statuses (derived): draft · active · answered · expired
```

### 3.4 Creator: Read responses
```
/dashboard/invitations/[id] → invitation settings + responses list
  Each ResponseCard = cute summary: availability, food, place, activity, vibe,
  comment, submitted_at
```

### 3.5 Recipient: The mini-game (THE product)
```
/invite/[token]
  Step 0  Load → fire "view" beacon (POST .../view)
  Step 1  Intro:        "[name], пойдёшь со мной на свидание? 💌"  [да 💕] [нет 😭→dodge]
  Step 2  Confirm:      "Подожди... ты правда сказала да? 😳"      [да, конечно]
  Step 3  Availability: "Когда ты свободна? 🗓️"  (multi-slot picker + free text)
  Step 4  Food:         "Что будем есть? 🍓"      (choice cards, MULTI-select)
  Step 5  Place:        "Куда пойдём? 🌸"         (cards from settings + "Другое")
  Step 6  Vibe:         "Какой вайб свидания? ✨"  (choice cards)
  Step 7  Comment:      "Хочешь что-то добавить? 💭" (textarea, optional)
  Step 8  Review:       cute summary card          [Отправить ответ 💌]
  Step 9  Success:      "Ответ отправлен. Теперь он точно улыбается как дурак 😌💕"
```

**Step 1 "нет" button behavior:** playful — gently dodges / shrinks / shows a funny
line on hover/click. Bounded movement only; never broken, never rage-inducing, always
recoverable to "да".

**Default food options (Step 4):**
🍕 Пицца · 🍣 Суши · 🍝 Паста · ☕ Кофе · 🍰 Десерты · 🍔 Бургеры · 🍜 Рамен · 🎲 Сюрприз

**Default vibe options (Step 6):**
уютно и спокойно · романтично · прогулка и разговоры · вкусно поесть ·
что-то необычное · сюрприз

**Place options (Step 5):** sourced from the invitation's `place_options`, plus a
"Другое" free-text escape hatch.

**Public page edge states:**
| State | Screen |
|---|---|
| Unknown token | soft 404 — "Кажется, такого приглашения нет 🥺" |
| Expired | "Это приглашение уже отдохнуло 🌙" |
| Inactive | "Приглашение пока не активно" |
| Already answered (multiple off) | "Ты уже ответила 💕" — no further data leaked |
| Submit error | retry-able error state; never loses her answers |

### 3.6 Creator: Account / Settings
```
/dashboard/settings
  - change username
  - change email
  - change password (requires current password)
  - delete account (confirm modal — destructive)
  - view account info (created date, email)
```

---

## 4. Page List

### Public (no auth)
| Route | Purpose |
|---|---|
| `/` | Romantic landing — explain product, CTA to register/login. Not a generic SaaS landing. |
| `/invite/[token]` | The interactive mini-game. The crown jewel. |

### Auth
| Route | Purpose |
|---|---|
| `/login` | Login form (cute, on-brand) |
| `/register` | Register form |

### App (auth required)
| Route | Purpose |
|---|---|
| `/dashboard` | Overview: greeting, stats, recent invitations, create CTA |
| `/dashboard/invitations` | All invitations list |
| `/dashboard/invitations/new` | Create invitation |
| `/dashboard/invitations/[id]` | Invitation detail + responses |
| `/dashboard/settings` | Account management |

---

## 5. Design Direction (full system in Step 2 → DESIGN_RULES.md)

### 5.1 Mood
A soft pink love letter × romantic diary × cute sticker sheet. Premium but playful.
Cute but not childish. Handmade, warm, personal.

### 5.2 Palette direction (final hex in DESIGN_RULES.md)
| Token | Direction | Draft hex |
|---|---|---|
| `bg-cream` | warm white/cream background | `#FFF8F5` |
| `pink-soft` | soft pink | `#FFD6E0` |
| `blush` | blush accents | `#FFB6C7` |
| `strawberry` | primary action pink | `#FF7A9A` |
| `cherry` | dark cherry/burgundy text | `#7A2233` |
| `lavender` | secondary accent | `#D9C7FF` |
| `card-white` | warm white cards | `#FFFDFB` |

**Banned:** blue/purple SaaS gradients, default shadcn look, corporate grays, harsh
shadows, emoji spam, generic templates.

### 5.3 Signature elements
- `FloatingDecorations`: sparse, slow, parallax pink hearts / petals / sparkles.
- One question per screen, generous whitespace.
- Card-based choices with a single tasteful emoji each.
- Soft spring transitions between steps (Framer Motion).
- Cute avatar/image at the top of the flow.
- Rounded pink (primary) / lavender (secondary) buttons with a soft pressable feel.
- Playful, bounded "нет" button.

### 5.4 Tone of voice
Russian, warm, playful, a little cheeky. Never cringe, never corporate.
(Full copy bank in DESIGN_RULES.md.)

---

## 6. Database Draft (finalized in Step 4)

### 6.1 Tables
**User** — `id, email (unique), username (unique), password_hash, created_at,
updated_at, is_active`

**Invitation** — `id, owner_id (FK→User), token (unique, indexed), girl_name, title,
greeting_message, avatar_url, food_options (JSON), place_options (JSON),
activity_options (JSON), final_message, expires_at, is_active,
allow_multiple_responses, created_at, updated_at, archived_at`

**InvitationResponse** — `id, invitation_id (FK→Invitation), availability,
food_preference (JSON array — multi-select), place_preference, activity_preference,
vibe, comment, submitted_at, ip_hash, user_agent_hash`

**InvitationView** (recommended) — `id, invitation_id (FK), viewed_at, ip_hash,
user_agent_hash`

### 6.2 Notes
- `food_options/place_options/activity_options` = JSON arrays of `{emoji, label}`.
- `food_preference` = JSON array of chosen labels (multi-select decision).
- `place_preference` / `activity_preference` / `vibe` = chosen label string
  (+ optional free text for "Другое").
- `ip_hash` / `user_agent_hash`: salted SHA-256; never store raw PII. Salt from env.
- Token: `secrets.token_urlsafe(32)`, unique constraint, retry on collision.

### 6.3 Derived status (computed, not stored)
```
expired  = expires_at is set AND now > expires_at
answered = response_count > 0
active   = is_active AND not expired AND archived_at is null
draft    = not is_active AND no responses AND not archived
```

---

## 7. API Draft (contract finalized in Step 4)

### Auth — `/api/auth`
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/register` | email, username, password | user + set-cookie |
| POST | `/login` | email/username, password | user + set-cookie |
| POST | `/logout` | — | 204, clear cookie |
| GET | `/me` | — | current user |
| PATCH | `/me` | username?, email? | updated user |
| POST | `/change-password` | current, new | 204 |

### Invitations — `/api/invitations` (auth, owner-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | list own invitations (+ status, response_count) |
| POST | `/` | create |
| GET | `/:id` | detail |
| PATCH | `/:id` | update |
| DELETE | `/:id` | delete |
| POST | `/:id/archive` | archive |
| POST | `/:id/activate` | set active |
| POST | `/:id/deactivate` | set inactive |
| GET | `/:id/responses` | list responses |

### Public — `/api/public/invite/:token` (no auth, token only)
| Method | Path | Purpose | Leak guard |
|---|---|---|---|
| GET | `/:token` | fetch game render data | ONLY game fields; never owner/email/internal id |
| POST | `/:token/view` | record a view (fire-and-forget) | rate-limited |
| POST | `/:token/respond` | submit answers | rate-limited; enforces active/expiry/multiple rules |

### Health
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness/readiness |

**Cross-cutting:** structured JSON errors `{error: {code, message, details?}}`;
rate limiting on auth + public respond/view; safe CORS (allowlist frontend origin);
Zod (frontend) ⇄ Pydantic (backend) validation parity; CSRF protection for
cookie-based auth.

---

## 8. Technical Architecture (detailed in Step 3)

```
┌─────────────┐     HTTPS      ┌──────────────┐     ┌──────────────┐
│  Next.js     │ ──── /api ───▶ │  nginx        │ ──▶ │  Flask API    │
│  (frontend)  │ ◀──────────── │  (reverse     │     │  (app factory)│
│  TS, Tailwind│                │   proxy)      │     │  blueprints   │
│  Framer, RHF │                └──────────────┘     │  services     │
└─────────────┘                                       └──────┬───────┘
                                                              │ SQLAlchemy 2.0
                                                       ┌──────▼───────┐
                                                       │  PostgreSQL   │
                                                       └──────────────┘
Docker Compose: db · backend · frontend · nginx
```

- **Frontend:** Next.js (App Router) + TS + Tailwind + Framer Motion + React Hook Form
  + Zod + lucide-react. shadcn only if heavily restyled. Mobile-first.
- **Backend:** Flask app-factory, blueprints (`auth`, `invitations`, `public`,
  `health`), service layer, SQLAlchemy 2.0, Alembic, Pydantic schemas, cookie-session
  auth, argon2/bcrypt, Flask-CORS, Flask-Limiter, env-based config.
- **Infra:** Docker Compose, nginx reverse proxy, `.env.example` files, README.

---

## 9. Implementation Plan

| Step | Deliverable | Output |
|---|---|---|
| **1** ✅ | Product spec | `PRODUCT_SPEC.md` (this doc) |
| 2 | Design system | `DESIGN_RULES.md` |
| 3 | Technical architecture | front/back separation, auth strategy, folder layout |
| 4 | DB schema + API contract | exact models, migrations plan, request/response shapes |
| 5 | Project scaffolding | repo structure, configs, empty modules |
| 6 | Backend foundation | factory, config, db, migrations, models, auth, errors, `/health` |
| 7 | Backend invitation logic | invitation + public + response services & endpoints |
| 8 | Frontend design system | Tailwind config, CSS vars, cute reusable components |
| 9 | **Public invite flow** | the mini-game — most polished page |
| 10 | Auth pages | login/register on-brand |
| 11 | Dashboard | list, create, detail, settings |
| 12 | Integration | wire frontend ↔ backend |
| 13 | Docker Compose | full local + prod-ish orchestration |
| 14 | Final polish | states, responsive, a11y, security review, README |

**Process discipline (every step):** list files changed → explain what was built →
run/explain checks → re-check against `DESIGN_RULES.md` → run the 8-point self-review
on any UI.

---

## 10. Required Components (reference)

`CuteButton` · `ChoiceCard` · `FloatingDecorations` · `InviteFlow` ·
`InviteStepLayout` · `StepIntro` · `StepConfirm` · `StepAvailability` · `StepFood` ·
`StepPlace` · `StepVibe` · `StepComment` · `StepReview` · `StepSuccess` ·
`DashboardShell` · `InvitationCard` · `ResponseCard` · `CopyLinkButton` ·
`EmptyState` · `LoadingState` · `ErrorState` · `FormField`
