# Ticket Booking Platform


- TurboRepo monorepo
- Setup claude.md 
- React frontend with Vite
- Node.js Express backend
- MongoDB with Mongoose
- JWT authentication
- Role based access
- Seat locking system
- Socket.IO for realtime seat updates
- Shared types package
- Shared UI package
- Production ready architecture
- Docker support
- CI/CD GitHub actions
- Clean architecture


## Master Claude Prompt

```txt
You are a Principal Software Architect and Senior Staff Engineer.

Create a production-ready scalable ticket booking platform using modern enterprise architecture and clean code practices.

# Tech Stack

Monorepo:
- TurboRepo
- pnpm

Frontend:
- React.js
- Vite
- TypeScript
- TailwindCSS
- React Router
- React Query (TanStack Query)
- Zustand for state management
- Socket.IO client

Backend:
- Node.js
- Express.js
- TypeScript
- Clean Architecture
- Repository Pattern
- Service Layer
- JWT Authentication
- RBAC (Role Based Access Control)
- Socket.IO server
- Redis for seat locking
- Winston/Pino logging

Database:
- MongoDB
- Mongoose ODM

Infrastructure:
- Docker
- Docker Compose
- GitHub Actions CI/CD
- ESLint
- Prettier
- Husky
- lint-staged

Architecture Requirements:
- Production-ready architecture
- Scalable modular structure
- Shared packages
- API versioning
- Validation layer
- Error handling middleware
- Rate limiting
- Security best practices
- Environment-based configuration
- Health check endpoint
- Feature-based module structure

# Monorepo Structure

apps/
  web/
  api/

packages/
  ui/
  types/
  config/
  eslint-config/
  tsconfig/

infra/
  docker/
  nginx/
  github-actions/

docs/

# Required Features

Authentication:
- Register/Login
- JWT access token
- Refresh token
- Role-based authorization
- Password hashing using bcrypt

Booking System:
- Event creation
- Seat management
- Seat locking
- Booking expiration
- Booking confirmation
- Prevent double booking

Realtime Features:
- Live seat updates
- Seat lock notifications
- Booking status updates

Shared Packages:
- Shared TypeScript types
- Shared UI components
- Shared utility functions

# Seat Locking Requirements

Implement Redis-based temporary seat locking:
- Lock seat for 5 minutes
- Auto release expired locks
- Prevent race conditions
- Handle concurrent booking requests

# Backend Requirements

Use Clean Architecture:

src/
  modules/
  core/
  infrastructure/
  shared/

Each module should contain:
- controller
- service
- repository
- routes
- validation
- dto
- schema
- interfaces

Include:
- Global error handling
- Async wrapper utility
- API response formatter
- Logger middleware
- Auth middleware
- RBAC middleware

# Frontend Requirements

Use feature-based folder structure.

Include:
- Protected routes
- Auth context
- API service layer
- React Query setup
- WebSocket hooks
- Reusable UI components
- Error boundaries
- Lazy loading
- Suspense

# Docker Requirements

Generate:
- Dockerfile for frontend
- Dockerfile for backend
- docker-compose.yml

Services:
- frontend
- backend
- mongodb
- redis
- nginx

# GitHub Actions Requirements

Create CI/CD workflows:
- Install dependencies
- Lint
- Type check
- Run tests
- Build apps
- Docker build validation

# Code Quality

Setup:
- ESLint
- Prettier
- Husky
- Commit linting
- Conventional commits

# Documentation

Generate:
- README.md
- Architecture.md
- API documentation
- Environment variable examples

# Generate Files

Generate:
1. Complete folder structure
2. TurboRepo setup
3. package.json files
4. tsconfig files
5. Docker configs
6. GitHub Actions workflows
7. Express server setup
8. React Vite setup
9. MongoDB connection setup
10. Redis connection setup
11. JWT authentication module
12. RBAC middleware
13. Socket.IO integration
14. Booking module
15. Seat locking implementation
16. Shared UI package
17. Shared types package

# Coding Standards

- Use TypeScript everywhere
- Avoid any type
- Use async/await
- Use SOLID principles
- Use dependency injection where possible
- Write scalable enterprise code
- Add comments only where necessary
- Keep code modular and reusable

# Output Order

1. Folder Structure
2. TurboRepo Setup
3. Shared Packages
4. Backend Setup
5. Frontend Setup
6. Authentication
7. Booking System
8. Realtime Socket.IO
9. Redis Seat Locking
10. Docker Setup
11. GitHub Actions
12. Final Architecture Explanation
```

---

# `claude.md` Example

Create a root-level `CLAUDE.md`.

```md
# CLAUDE.md

## Project Overview

Enterprise-grade ticket booking platform built with:
- TurboRepo
- React + Vite
- Node.js + Express
- MongoDB
- Redis
- Socket.IO
- TypeScript

---

# Engineering Principles

- Follow Clean Architecture
- Use SOLID principles
- Prefer composition over inheritance
- Avoid tight coupling
- Keep modules isolated
- Write reusable components
- Maintain feature-based architecture

---

# Coding Standards

## TypeScript
- Strict mode enabled
- Avoid `any`
- Use interfaces/types properly
- Shared types must live in packages/types

## React
- Use functional components
- Use hooks only
- Avoid prop drilling
- Use React Query for API state
- Use Zustand for global state

## Backend
- Use controller/service/repository pattern
- Keep business logic inside services
- Controllers should remain thin
- Use middleware for auth and validation

---

# Security Standards

- Hash passwords using bcrypt
- JWT access + refresh tokens
- Role-based authorization
- Validate all inputs
- Sanitize request payloads
- Use Helmet middleware
- Enable CORS properly
- Apply rate limiting

---

# Performance Standards

- Use Redis caching where needed
- Optimize MongoDB indexes
- Use pagination
- Avoid N+1 queries
- Lazy load frontend modules
- Use code splitting

---

# PR Review Guidelines

## Review Checklist

### Architecture
- Does the code follow Clean Architecture?
- Is the module isolated?
- Is business logic inside services?

### Code Quality
- Is the code reusable?
- Is duplication avoided?
- Are naming conventions clear?

### Security
- Are inputs validated?
- Is auth protected properly?
- Any sensitive data exposed?

### Performance
- Any unnecessary re-renders?
- Any blocking DB operations?
- Any unoptimized queries?

### Testing
- Are unit tests added?
- Are edge cases covered?

---

# Commit Rules

Use conventional commits:

- feat:
- fix:
- refactor:
- chore:
- docs:
- test:

Example:
feat(auth): implement JWT refresh token flow

---

# Folder Rules

- Shared types only inside packages/types
- Shared UI only inside packages/ui
- Avoid circular dependencies
- Keep infra configs isolated

---

# Forbidden

- No business logic in controllers
- No direct DB access from routes
- No hardcoded secrets
- No usage of `any`
- No large components (>300 lines)

---

# AI Agent Instructions

When generating code:
1. Prefer scalable solutions
2. Keep files modular
3. Generate production-ready code
4. Add validation
5. Add proper error handling
6. Avoid placeholder implementations
7. Prefer typed APIs
8. Keep naming consistent
```

---

# PR Review Prompt for Claude

```txt
Review this PR as a Staff Engineer.

Focus on:
- Clean Architecture
- Scalability
- Security
- Performance
- Type safety
- Reusability
- SOLID principles
- MongoDB optimization
- React performance
- Socket.IO scalability
- Redis locking safety
- API consistency

Check for:
- Code smells
- Tight coupling
- Duplicate logic
- Missing validations
- Race conditions
- Auth vulnerabilities
- Unhandled edge cases
- Error handling gaps

Provide:
1. Critical Issues
2. Improvements
3. Performance Suggestions
4. Security Suggestions
5. Final Verdict
```
