# CLAUDE.md

## Project Overview

Enterprise-grade ticket booking platform built with:
- TurboRepo monorepo
- React + Vite (frontend)
- Node.js + Express (backend)
- MongoDB + Mongoose (database)
- Redis (seat locking + caching)
- Socket.IO (real-time updates)
- TypeScript everywhere

---

## Repository Structure

```
apps/
  web/          # React + Vite frontend
  api/          # Express backend (Clean Architecture)

packages/
  types/        # Shared TypeScript types
  ui/           # Shared React UI components
  config/       # Shared runtime config helpers
  eslint-config/# Shared ESLint rules
  tsconfig/     # Shared TypeScript configs

infra/
  docker/       # Dockerfiles
  nginx/        # Nginx reverse proxy config
  github-actions/ # CI/CD workflow templates

docs/           # Architecture + API documentation
```

---

## Engineering Principles

- Follow Clean Architecture (controller → service → repository)
- Use SOLID principles
- Prefer composition over inheritance
- Avoid tight coupling
- Keep modules isolated and self-contained
- Maintain feature-based architecture in frontend
- Shared types live only in `packages/types`

---

## Coding Standards

### TypeScript
- Strict mode enabled everywhere
- Never use `any` — use `unknown` and narrow properly
- Use interfaces for object shapes, types for unions/aliases
- Shared types must live in `packages/types`

### React
- Functional components only
- Custom hooks for all side effects
- Avoid prop drilling — use Zustand for global state
- Use React Query for all server state
- Use React Router v6 for navigation

### Backend
- Controller → Service → Repository — never skip layers
- Controllers must remain thin (validate input, call service, return response)
- Business logic lives exclusively in services
- Repositories handle all database interactions
- Middleware handles auth, validation, and cross-cutting concerns

---

## Security Standards

- Hash passwords with bcrypt (salt rounds ≥ 12)
- JWT access tokens (15 min TTL) + refresh tokens (7 day TTL)
- Role-based authorization via RBAC middleware
- Validate and sanitize all incoming request payloads
- Use Helmet for HTTP header hardening
- Enable CORS with explicit allow-list
- Apply rate limiting on all public endpoints
- Never log sensitive data (passwords, tokens)

---

## Performance Standards

- Use Redis for seat locking and session caching
- MongoDB indexes on all query fields
- Paginate all list endpoints
- Avoid N+1 queries — use aggregation pipelines
- Lazy load all React routes
- Code-split heavy components

---

## Module Structure (Backend)

Each feature module follows this structure:
```
modules/<name>/
  <name>.controller.ts
  <name>.service.ts
  <name>.repository.ts
  <name>.routes.ts
  <name>.validation.ts
  <name>.dto.ts
  <name>.schema.ts
  interfaces/
```

---

## Commit Rules

Use conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code restructure without behavior change
- `chore:` — tooling, deps, config
- `docs:` — documentation only
- `test:` — adding or updating tests
- `perf:` — performance improvement

Example: `feat(auth): implement JWT refresh token rotation`

---

## Folder Rules

- Shared types → `packages/types` only
- Shared UI components → `packages/ui` only
- No circular dependencies between packages
- Infrastructure config stays isolated in `infra/`
- Never import `apps/api` from `apps/web` directly — use API calls

---

## Forbidden Patterns

- No business logic in controllers
- No direct database access from routes or controllers
- No hardcoded secrets — use environment variables
- No `any` type usage
- No React components longer than 300 lines
- No synchronous blocking operations in Express handlers
- No unhandled promise rejections

---

## AI Agent Instructions

When generating code for this project:
1. Always follow Clean Architecture boundaries
2. Generate complete, production-ready implementations (no placeholders)
3. Add input validation at every API boundary
4. Add proper error handling with typed errors
5. Use dependency injection patterns
6. Keep files focused and single-responsibility
7. Ensure all types are shared through `packages/types`
8. Add JSDoc only for non-obvious business logic
