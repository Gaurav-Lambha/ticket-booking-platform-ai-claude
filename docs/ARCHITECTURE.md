# Architecture

## Overview

TicketHub is a monorepo-based, event-driven ticket booking platform built for production scale. It implements Clean Architecture throughout the backend and feature-based architecture on the frontend.

---

## Monorepo Structure

```
ticket-booking-platform/
├── apps/
│   ├── api/                  # Express + Node.js backend
│   └── web/                  # React + Vite frontend
├── packages/
│   ├── types/                # Shared TypeScript interfaces
│   ├── ui/                   # Shared React components
│   ├── config/               # Shared constants + Redis key helpers
│   ├── eslint-config/        # Shared ESLint rules
│   └── tsconfig/             # Shared TypeScript configs
├── infra/
│   ├── nginx/                # Reverse proxy configs
│   └── github-actions/       # CI/CD workflow templates
└── docs/                     # Documentation
```

---

## Backend Architecture (Clean Architecture)

```
src/
├── core/                     # Framework-agnostic business rules
│   ├── config/               # Environment validation (Zod)
│   ├── errors/               # AppError + global error handler
│   ├── logger/               # Pino logger
│   └── utils/                # asyncWrapper, apiResponse, pagination
│
├── infrastructure/           # External concerns (DB, cache, sockets)
│   ├── database/             # MongoDB connection
│   ├── cache/                # Redis client
│   └── socket/               # Socket.IO service
│
├── modules/                  # Feature modules (self-contained)
│   ├── auth/                 # Register, login, refresh, RBAC
│   ├── events/               # Event CRUD + seat management
│   ├── bookings/             # Booking lifecycle + seat locking
│   └── health/               # Health check endpoint
│
└── shared/
    └── middleware/           # auth, validate, rateLimiter
```

### Clean Architecture Dependency Rule
```
Routes → Controller → Service → Repository → Schema (Mongoose)
                ↑
            Middleware
```

- **Controllers** — parse request, call service, send response
- **Services** — business logic, orchestration across repositories
- **Repositories** — database queries only, no business logic
- **Schemas** — Mongoose model definitions with indexes

---

## Frontend Architecture (Feature-Based)

```
src/
├── features/
│   ├── auth/                 # AuthContext, authStore, Protected routes, login/register pages
│   ├── events/               # Event listing, detail, create pages + React Query hooks
│   └── booking/              # Seat map, booking flow, my bookings
├── layouts/                  # MainLayout (nav + outlet)
├── lib/
│   ├── api/                  # Axios client with token refresh interceptor
│   └── socket/               # Socket.IO hook for real-time seat updates
└── App.tsx                   # Route definitions, QueryClient, providers
```

### State Management Strategy

| Concern | Tool |
|---|---|
| Server state (events, bookings) | React Query (TanStack Query) |
| Auth state (user, tokens) | Zustand (persisted to localStorage) |
| Local UI state | React `useState` |
| Real-time seat state | Socket.IO → React Query cache mutation |

---

## Seat Locking Flow

```
User selects seats
        │
        ▼
POST /bookings/lock
  ├── Validate event is published
  ├── Validate seats are available in DB
  ├── Atomic Redis Lua script: lock all seats or fail entirely
  ├── Create Booking (status: pending, expiresAt: +10min)
  ├── Update seat status to 'locked' in MongoDB
  └── Emit socket events to all clients in event room
        │
        ▼
5-minute countdown on client
        │
    ┌───┴───────────────────────┐
    │ Confirm                   │ Expire (timeout or user cancels)
    ▼                           ▼
POST /bookings/:id/confirm     Cron job runs every 60s
  ├── Verify booking ownership    ├── Find expired pending bookings
  ├── Verify not expired          ├── Release Redis locks
  ├── Update seats → 'booked'     ├── Update seats → 'available'
  ├── Release Redis locks         └── Emit unlock events to clients
  ├── Decrement event.availableSeats
  └── Emit booking:confirmed
```

### Race Condition Prevention

The Redis Lua script runs atomically — it checks all seat locks and only acquires them if all are free. No partial lock state is possible.

```lua
-- Check all seats free → lock all seats (atomic via Lua eval)
for i = 1, #keys do
  if redis.call('GET', keys[i]) ~= false then
    return error  -- abort entire operation
  end
end
for i = 1, #keys do
  redis.call('SET', keys[i], value, 'EX', ttl)
end
```

---

## Authentication Flow

```
Register/Login
    └── POST /auth/register | /auth/login
          ├── bcrypt.hash (salt=12)
          ├── Sign JWT access token (15 min)
          ├── Sign JWT refresh token (7 days)
          └── Store hashed refresh token in DB

Authenticated Request
    └── Authorization: Bearer <accessToken>
          └── auth.middleware.ts: jwt.verify() → attach user to req

Token Refresh
    └── POST /auth/refresh
          ├── Verify refresh token signature
          ├── Compare with stored token (rotation check)
          ├── Issue new access + refresh tokens
          └── Invalidate old refresh token
```

---

## Real-Time Architecture (Socket.IO)

```
Client                     Server (Socket.IO)
  │                              │
  ├── connect ────────────────►  │
  ├── emit: join:event ────────► │ socket.join(`event:${eventId}`)
  │                              │
  │  ◄─── seat:locked ──────────┤ emitSeatLocked() → to event room
  │  ◄─── seat:unlocked ────────┤ emitSeatUnlocked()
  │  ◄─── seat:booked ──────────┤ emitSeatBooked()
  │  ◄─── booking:expired ──────┤ emitBookingExpired() → to user room
  │                              │
  ├── emit: leave:event ───────► │ socket.leave(`event:${eventId}`)
  └── disconnect ──────────────► │
```

---

## Security

| Layer | Mechanism |
|---|---|
| Passwords | bcrypt (12 salt rounds) |
| Auth | JWT (RS256 compatible, HS256 by default) |
| RBAC | Role-checked middleware per route |
| Input validation | Zod schemas on all request bodies + query strings |
| HTTP hardening | Helmet (14 security headers) |
| Rate limiting | 100 req/15min global, 10 req/15min on auth endpoints |
| CORS | Explicit allow-list, credentials mode |
| Payload size | Express JSON limit: 10kb |
| Secrets | Environment variables only, never logged |

---

## Database Indexes

### Users
- `{ email: 1 }` — unique, login lookups

### Events
- `{ status: 1, startDate: 1 }` — browse/filter queries
- `{ category: 1, status: 1 }` — category filter
- `{ title: 1 }` — text search

### Seats
- `{ eventId: 1, status: 1 }` — available seats query
- `{ eventId: 1, row: 1, number: 1 }` — unique seat per event

### Bookings
- `{ userId: 1, status: 1 }` — user booking history
- `{ expiresAt: 1 }` — TTL index for expired booking cleanup

---

## Infrastructure Topology

```
Internet
    │
  [Nginx reverse proxy :80]
    ├── /api/*       → Express API :4000
    ├── /socket.io/* → Socket.IO :4000 (WebSocket upgrade)
    └── /            → React SPA (nginx static)

[Express API]
    ├── MongoDB (mongo:27017)
    └── Redis (redis:6379)
```
