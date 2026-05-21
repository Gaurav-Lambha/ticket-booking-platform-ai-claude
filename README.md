# TicketHub — Enterprise Ticket Booking Platform

A production-ready, scalable ticket booking platform built with a modern enterprise stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | TurboRepo + pnpm workspaces |
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| State | Zustand (auth) + React Query (server state) |
| Realtime | Socket.IO client |
| Backend | Node.js + Express + TypeScript + Clean Architecture |
| Auth | JWT (access + refresh) + bcrypt + RBAC |
| Database | MongoDB + Mongoose |
| Cache / Locking | Redis (ioredis) |
| Realtime | Socket.IO server |
| Logging | Pino + pino-http |
| Validation | Zod |
| Infra | Docker + Docker Compose + Nginx |
| CI/CD | GitHub Actions |
| Code Quality | ESLint + Prettier + Husky + commitlint |

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- Docker + Docker Compose (for infra services)

### 1. Clone and install

```bash
git clone <repo-url>
cd ticket-booking-platform-ai-claude
pnpm install
```

### 2. Start infrastructure (MongoDB + Redis)

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit apps/api/.env — set JWT secrets (min 32 chars)
```

### 4. Start development servers

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/health

---

## Production (Docker Compose)

```bash
export JWT_ACCESS_SECRET="your-32-char-minimum-secret-here"
export JWT_REFRESH_SECRET="your-32-char-minimum-refresh-secret"

docker compose up -d
```

Access at http://localhost

---

## Project Structure

```
apps/
  api/                   # Express backend (Clean Architecture)
    src/
      core/              # Config, errors, logger, utils
      infrastructure/    # MongoDB, Redis, Socket.IO
      modules/           # auth, events, bookings, health
      shared/            # Middleware (auth, validate, rate limit)
  web/                   # React + Vite frontend
    src/
      features/          # auth, events, booking (feature-based)
      layouts/           # MainLayout
      lib/               # API client, Socket.IO hooks

packages/
  types/                 # Shared TypeScript types
  ui/                    # Shared React components (Button, Input, Card...)
  config/                # Shared constants, error codes, Redis keys
  eslint-config/         # Shared ESLint rules
  tsconfig/              # Shared TypeScript configs (base, node, react)

infra/
  nginx/                 # Reverse proxy configs
docs/
  ARCHITECTURE.md        # System design + data flow diagrams
  API.md                 # REST API reference
```

---

## Key Features

### Authentication
- Register / Login with bcrypt password hashing (salt rounds: 12)
- JWT access token (15 min) + refresh token (7 days) rotation
- RBAC: `admin` | `organizer` | `customer` roles
- Automatic token refresh with queued retries on the frontend

### Event Management
- Create events with multi-tier seating (VIP / Premium / Standard / Economy)
- Publish/unpublish events
- Paginated event listing with category + status filters

### Booking System
- Interactive seat map with real-time status updates
- 5-minute Redis-backed seat lock — atomic Lua script prevents race conditions
- 10-minute booking confirmation window
- Auto-expiry job: releases stale pending bookings every 60 seconds
- Cancel bookings with automatic seat release

### Real-Time Updates
- Socket.IO event rooms — clients join/leave per event
- Live seat transitions: `available → locked → booked`
- Booking expiry notifications delivered to the booking owner's socket room

---

## Available Scripts

```bash
pnpm dev              # Start all apps in watch mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript check across entire monorepo
pnpm test             # Run all tests
pnpm format           # Prettier format all files
pnpm clean            # Remove all build artifacts
```

---

## Environment Variables

### Backend (`apps/api/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_HOST` | Yes | Redis hostname |
| `REDIS_PORT` | No | Redis port (default 6379) |
| `JWT_ACCESS_SECRET` | Yes | Min 32 chars |
| `JWT_REFRESH_SECRET` | Yes | Min 32 chars |
| `CORS_ORIGIN` | No | Frontend URL |
| `PORT` | No | Server port (default 4000) |
| `LOG_LEVEL` | No | Pino log level (default info) |

### Frontend (`apps/web/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — system design, seat locking flow, auth flow, database indexes
- [API Reference](docs/API.md) — full REST API documentation with request/response examples
- [CLAUDE.md](CLAUDE.md) — engineering principles and coding standards for AI-assisted development

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`) — every PR: install → lint → type-check → test → build → docker validation
- **Release** (`.github/workflows/release.yml`) — main branch push: build + push Docker images to GHCR
