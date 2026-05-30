# 💌 lovenote

> Милые интерактивные приглашения на свидание. Создатель собирает приватное
> приглашение; получательница открывает уникальную ссылку и проходит приятную
> пошаговую мини-игру (а не скучную форму), отвечая *когда*, *что* и *где*.
> Каждый ответ попадает в уютный дашборд создателя.

**Язык интерфейса:** русский · **Вайб:** нежное розовое любовное письмо, премиально, но игриво.

---

## ✨ Что умеет

- **Создатель** регистрируется, входит и собирает приглашение (имя девушки,
  своё приветствие, аватар, варианты еды/места/вайба, финальное сообщение,
  срок действия, переключатель нескольких ответов).
- Система генерирует **уникальную неугадываемую приватную ссылку** (`/invite/<token>`).
- **Получательница** открывает ссылку → романтичная интерактивная мини-игра:
  *да/нет* → подтверждение → когда свободна → еда → место → вайб → комментарий → проверка → успех.
- **Создатель** видит в дашборде все приглашения, их статусы, счётчики
  просмотров/ответов и каждый милый ответ.

---

## 🧱 Стек технологий

| Слой | Технологии |
|---|---|
| Фронтенд | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, lucide-react |
| Бэкенд | Flask 3 (app factory), SQLAlchemy 2.0 (типизированная), Flask-Migrate/Alembic, Pydantic v2, хеширование argon2id, Flask-Limiter, Flask-CORS, gunicorn |
| Авторизация | httpOnly cookie-сессия (JWT) + CSRF double-submit |
| База данных | PostgreSQL 16 |
| Кеш / лимиты | Redis 7 (в проде) |
| Инфраструктура | Docker Compose |

---

## 📚 Карта документации

| Документ | Что внутри |
|---|---|
| [PRODUCT_SPEC.md](PRODUCT_SPEC.md) | Обзор продукта, роли, пользовательские сценарии, страницы, роадмап |
| [DESIGN_RULES.md](DESIGN_RULES.md) | Дизайн-система: палитра, типографика, отступы, компоненты, анимации, банк русских формулировок, чек-лист из 8 пунктов |
| [API_CONTRACT.md](API_CONTRACT.md) | Все эндпоинты, схемы запросов/ответов, ошибки, лимиты, CORS |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Таблицы, колонки, индексы, вычисляемый статус, миграции, дефолтные данные |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Авторизация, изоляция, токены, валидация, приватность, инфраструктура |
| [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) | План разработки, структура проекта, инструменты, риски |

> ⚠️ **Закон дизайна:** lovenote **не должен** выглядеть как типичное AI-SaaS-приложение.
> Публичная страница приглашения должна ощущаться как милая романтичная мини-игра.
> См. `DESIGN_RULES.md` §0 (запреты) и чек-лист из 8 пунктов.

---

## 🚀 Быстрый старт (Docker — рекомендуется)

Нужен Docker с плагином Compose.

```bash
# 1. Скопировать шаблон env для compose и вписать секреты
cp .env.example .env

# 2. Сгенерировать три надёжных секрета и вставить их в .env
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(48))"
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(48))"
python3 -c "import secrets; print('HASH_SALT='  + secrets.token_urlsafe(48))"

# 3. Поднять всё (postgres + redis + backend + frontend)
docker compose up --build

# 4. Открыть приложение
#    Фронтенд:        http://localhost:3000
#    Проверка API:    http://localhost:5000/api/health
```

Миграции базы применяются **автоматически** при старте бэкенда
(`flask --app wsgi db upgrade`, через `backend/docker-entrypoint.sh`).

> Один корневой `.env` питает все сервисы. `NEXT_PUBLIC_API_BASE_URL` вшивается
> в бандл фронтенда **на этапе сборки**, поэтому это должен быть URL, по которому
> обращается браузер (по умолчанию `http://localhost:5000/api`). Менять его нужно
> до `--build`, а не после.

---

## 🛠 Локальная разработка (без Docker)

Понадобятся **Python 3.13+**, **Node 20+**, запущенный **PostgreSQL 16** и
(опционально) **Redis 7**.

### Бэкенд

```bash
cd backend
python3.13 -m venv .venv && source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env     # задать DATABASE_URL, SECRET_KEY, JWT_SECRET, HASH_SALT…

flask --app wsgi db upgrade     # применить миграции
flask --app wsgi run --debug    # http://localhost:5000
```

В режиме разработки (`FLASK_CONFIG=development`) лимитер может использовать
`REDIS_URL=memory://`. **В продакшене приложение не запустится** без реальных
секретов или с in-memory лимитером.

### Фронтенд

```bash
cd frontend
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
npm run dev                     # http://localhost:3000
```

> Если `NEXT_PUBLIC_API_BASE_URL` не задан, публичная страница приглашения
> работает на mock-данных — можно посмотреть мини-игру без бэкенда. Дашборду
> всегда нужен реальный API.

---

## 🔑 Переменные окружения

| Переменная | Сервис | Примечания |
|---|---|---|
| `FLASK_CONFIG` | бэкенд | `development` \| `testing` \| `production` |
| `SECRET_KEY` | бэкенд | обязательна в продакшене |
| `JWT_SECRET` | бэкенд | обязательна в продакшене; подписывает cookie-сессию |
| `HASH_SALT` | бэкенд | соль для SHA-256 хеширования ip/user-agent |
| `DATABASE_URL` | бэкенд | URL для SQLAlchemy, драйвер psycopg2 |
| `CORS_ORIGINS` | бэкенд | список разрешённых origin через запятую, никогда не `*` с credentials |
| `REDIS_URL` | бэкенд | `redis://…` в продакшене; `memory://` только в dev |
| `COOKIE_SECURE` / `COOKIE_SAMESITE` | бэкенд | ставить `true` при работе по HTTPS |
| `PROXY_FIX_HOPS` | бэкенд | число доверенных прокси-хопов (0 = ни одного) |
| `APP_PUBLIC_URL` | бэкенд | базовый URL фронтенда, используется для сборки ссылок-приглашений |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | db | только для compose |
| `NEXT_PUBLIC_API_BASE_URL` | фронтенд | **на этапе сборки**, обращённый к браузеру базовый URL API **включая** `/api` |

Полные списки — в `.env.example` (корень, `backend/`, `frontend/`).
**Никогда не коммить `.env`.**

---

## 🧪 Проверки качества

```bash
# Фронтенд
cd frontend && npm run typecheck && npm run lint && npm run build

# Бэкенд
cd backend && python -m compileall app wsgi.py
```

Ноль ошибок TypeScript, ноль случайных hex-цветов (только дизайн-токены), и
каждый экран интерфейса должен проходить чек-лист из 8 пунктов в `DESIGN_RULES.md`.

---

## 🗺 Структура проекта

```
backend/    Flask API
  app/        фабрика, blueprints, сервисы, модели, схемы, security, конфиг
  migrations/ миграции Alembic (Flask-Migrate)
  Dockerfile, docker-entrypoint.sh, wsgi.py, requirements.txt
frontend/   приложение Next.js
  src/app/        страницы App Router (лендинг, авторизация, дашборд, приглашение)
  src/components/ библиотека милых компонентов (ui, invite, dashboard, decorations)
  src/lib/        API-клиент, контекст авторизации, хелперы приглашения
  Dockerfile, next.config.mjs, tailwind.config.ts
docker-compose.yml   postgres + redis + backend + frontend
.env.example         шаблон окружения для compose
*.md                 карта документации выше
```

---

## 💕 Тон голоса

Русский, тёплый, игривый, чуть дерзкий — никогда не кринж и не корпоративщина.
Пример строки успеха: *«Ответ отправлен 💕»*
