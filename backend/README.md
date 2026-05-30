# lovenote — Backend

Flask API for the lovenote date-invitation app. Application-factory pattern,
PostgreSQL + SQLAlchemy 2.0 (typed models), Alembic migrations (via
Flask-Migrate), Pydantic v2 validation, argon2id password hashing, JWT
httpOnly session cookies with CSRF double-submit, Flask-Limiter rate limiting,
and an env-allowlisted CORS policy.

See the repo-root docs for the contracts this implements:
`API_CONTRACT.md`, `DATABASE_SCHEMA.md`, `SECURITY_CHECKLIST.md`.

## Layout

```
backend/
  app/
    __init__.py          # create_app() factory
    config.py            # Development / Testing / Production config classes
    extensions.py        # db, migrate, limiter singletons
    security.py          # hashing, JWT session, CSRF, auth decorators
    errors.py            # JSON error envelope + handlers
    http.py              # request-body validation helper
    limits.py            # rate-limit key functions (per-user / per-identifier)
    constants.py         # default seed options
    models/              # SQLAlchemy 2.0 models
    schemas/             # Pydantic request models
    services/            # invitation domain logic + leak-guarded serializers
    blueprints/          # health, auth, invitations, public
  migrations/            # Alembic environment + versions
  wsgi.py                # WSGI entrypoint (gunicorn / flask CLI)
  requirements.txt
  .env.example
```

## Setup

```bash
cd backend
python3.12 -m venv ../.venv        # or use the repo's existing .venv
../.venv/bin/pip install -r requirements.txt
cp .env.example .env               # then fill in secrets + DATABASE_URL
```

Generate strong secrets:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"   # SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(48))"   # JWT_SECRET
python -c "import secrets; print(secrets.token_urlsafe(32))"   # HASH_SALT
```

Create the database (the migration enables the `citext` extension, which
requires a role allowed to `CREATE EXTENSION`):

```bash
createdb lovenote
```

## Migrations (Alembic via Flask-Migrate)

All commands need `FLASK_APP=wsgi:app` and a reachable `DATABASE_URL` (read
from `.env`).

```bash
export FLASK_APP=wsgi:app

flask db upgrade            # apply migrations (creates citext ext + all tables)
flask db downgrade -1       # roll back one revision
flask db current            # show current revision
flask db history            # list revisions
```

Creating a new migration after changing a model:

```bash
flask db migrate -m "describe change"   # autogenerate a revision
# review the generated file in migrations/versions/ before applying
flask db upgrade
```

> The initial revision (`0001_initial`) is hand-written so it can create the
> `citext` extension before the `user.email` column that depends on it.

## Run (development)

```bash
export FLASK_APP=wsgi:app FLASK_CONFIG=development
flask run --port 5000
# or:  python wsgi.py
```

The API is served under `/api` (e.g. `GET http://localhost:5000/api/health`).

Point the frontend at it by setting `NEXT_PUBLIC_API_BASE` to the API origin
(without `/api`), e.g. `http://localhost:5000`.

## Run (production)

```bash
export FLASK_CONFIG=production
# SECRET_KEY, JWT_SECRET, HASH_SALT, REDIS_URL must be set or the app refuses to boot.
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

Production expects to sit behind nginx (TLS termination, `client_max_body_size`,
`X-Forwarded-*`). Set `PROXY_FIX_HOPS=1` and `COOKIE_SECURE=true` in that setup.

## Endpoints

| Group | Path prefix | Auth |
|---|---|---|
| Health | `/api/health` | none |
| Auth | `/api/auth/*` | session cookie (CSRF on mutations) |
| Invitations | `/api/invitations/*` | session cookie, owner-scoped |
| Public | `/api/public/invite/<token>*` | none, token-scoped, rate-limited |

Full request/response shapes: `API_CONTRACT.md`.

## Security notes

- Passwords: argon2id (`argon2-cffi`), never stored or logged in plaintext.
- Sessions: signed JWT in an httpOnly cookie; CSRF via a readable double-submit
  cookie + `X-CSRF-Token` header on authenticated mutations.
- Tokens: `secrets.token_urlsafe(32)`, unique, validated against
  `^[A-Za-z0-9_-]{20,64}$` before any DB lookup.
- Public endpoints serialize through a dedicated leak-guarded serializer — no
  owner id, email, internal ids, or other users' responses.
- IP / User-Agent are stored only as salted SHA-256 hashes.
- Rate limits per `API_CONTRACT.md §8`; use Redis (`REDIS_URL`) in production.
- Production config refuses to start without real secrets.
