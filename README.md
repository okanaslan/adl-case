# Real-Time Incident Management Dashboard

Minimal incident management system with a NestJS + PostgreSQL backend and a React (Vite) frontend, with real-time updates via Socket.IO.

## Tech
- Backend: NestJS, TypeORM, PostgreSQL, Socket.IO
- Frontend: React + Vite, TailwindCSS, Socket.IO client
- Dev: Docker Compose (recommended)

## Architecture (high level)
- `backend/`: REST API + Socket.IO gateway
  - `incidents` module: CRUD + list (pagination/filters) backed by PostgreSQL
  - `events` module: broadcasts `incident.created|updated|deleted`
- `frontend/`: dashboard UI
  - fetches via REST (`GET /incidents`, etc.)
  - subscribes to Socket.IO events and keeps the list in sync

## Run with Docker (recommended)
From repo root:

```bash
docker compose up --build
```

Then open:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Notes:
- Backend runs `npm run migration:run` on container start before starting the dev server.
- Postgres data is persisted in a Docker volume.
- Dependency changes: if you edit `backend/package.json` or `frontend/package.json`, rebuild images (`docker compose build`) so containers pick up the new dependencies.

## Local dev (without Docker)

### 1) Start Postgres
You need a local Postgres instance. Example connection string:
`postgresql://postgres:postgres@localhost:5432/incidents`

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

### 3) Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Env vars

Backend (`backend/.env.example`):
- `DATABASE_URL` (required)
- `PORT` (default `3000`)
- `CORS_ORIGIN` (optional, comma-separated; e.g. `http://localhost:5173`)

Frontend (`frontend/.env.local.example`):
- `VITE_API_URL` (default `http://localhost:3000`)

## Migrations
From `backend/`:
```bash
npm run migration:run
npm run migration:revert
```

## Tests
Backend tests use an isolated test DB and generate schema from entities (no migrations).

```bash
cd backend
# start test DB (optional helper service)
docker compose --profile test up -d postgres_test
npm test
```

## Assumptions
- No auth / multi-tenant / workflows (explicitly out of scope).
- `service` filter is an exact match (backend query uses equality).
- Real-time list sync prioritizes “good enough” UI responsiveness + periodic refetch on reconnect for correctness.

## If I had more time
- Add API docs (Swagger) at `/docs`.
- Add frontend detail page (`/incidents/:id`) and deep linking.
- Improve real-time list consistency for non-first pages (smarter page-aware inserts/removals).
- Add seed command for demo data.
