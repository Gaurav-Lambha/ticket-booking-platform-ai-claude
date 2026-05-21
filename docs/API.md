# API Documentation

Base URL: `http://localhost:4000/api/v1`

All responses follow this envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## Authentication

### POST /auth/register
Create a new customer account.

**Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "firstName": "Jane",
  "lastName": "Doe"
}
```
**Response 201**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "email": "...", "role": "customer", ... },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

---

### POST /auth/login
```json
{ "email": "user@example.com", "password": "SecurePass1" }
```
**Response 200** — same structure as register

---

### POST /auth/refresh
Exchange a refresh token for new tokens.
```json
{ "refreshToken": "..." }
```

---

### POST /auth/logout
`Authorization: Bearer <accessToken>`

Revokes the current refresh token.

---

### GET /auth/me
`Authorization: Bearer <accessToken>`

Returns the authenticated user's profile.

---

## Events

### GET /events
List published events with pagination.

**Query params**
| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| status | string | published | Filter by status |
| category | string | — | Filter by category |
| sortBy | string | createdAt | Sort field |
| sortOrder | asc/desc | desc | Sort direction |

**Response 200**
```json
{
  "data": {
    "items": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /events/:id
Get a single event by ID.

---

### GET /events/:id/seats
Get all seats for an event (includes real-time status).

**Response**
```json
{
  "data": [
    {
      "id": "...",
      "row": "A",
      "number": 1,
      "tier": "vip",
      "price": 150,
      "status": "available"
    }
  ]
}
```

---

### POST /events
`Authorization: Bearer <accessToken>` | Roles: admin, organizer

Create a new event with seats.
```json
{
  "title": "Concert Night",
  "description": "An amazing evening...",
  "venue": {
    "name": "Grand Arena",
    "address": "123 Main St",
    "city": "Mumbai",
    "country": "India"
  },
  "startDate": "2025-12-31T18:00:00.000Z",
  "endDate": "2025-12-31T23:00:00.000Z",
  "category": "music",
  "seats": [
    { "row": "A", "number": 1, "tier": "vip", "price": 150 },
    { "row": "A", "number": 2, "tier": "vip", "price": 150 }
  ]
}
```

---

### PATCH /events/:id/publish
`Authorization: Bearer <accessToken>` | Roles: admin, organizer (own event only)

Publish a draft event.

---

## Bookings

### POST /bookings/lock
`Authorization: Bearer <accessToken>`

Lock seats and create a pending booking (10-minute window).

```json
{
  "eventId": "...",
  "seatIds": ["seatId1", "seatId2"]
}
```

**Response 201**
```json
{
  "data": {
    "locked": true,
    "lockExpiresAt": "2025-01-01T12:10:00.000Z",
    "bookingId": "..."
  }
}
```

**Error codes**
- `SEAT_ALREADY_LOCKED` — one or more seats are locked by another user
- `SEAT_ALREADY_BOOKED` — one or more seats already confirmed
- `EVENT_NOT_FOUND` — invalid event ID

---

### POST /bookings/:id/confirm
`Authorization: Bearer <accessToken>`

Confirm a pending booking (simulates payment).
```json
{ "paymentToken": "mock-payment-token" }
```

---

### POST /bookings/:id/cancel
`Authorization: Bearer <accessToken>`

Cancel a pending or confirmed booking. Releases seat locks.

---

### GET /bookings
`Authorization: Bearer <accessToken>`

List the authenticated user's bookings (paginated).

---

## Health Check

### GET /health
No authentication required.

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "services": {
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

---

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| TOKEN_EXPIRED | 401 | Access token expired (refresh needed) |
| INVALID_TOKEN | 401 | Refresh token invalid or revoked |
| FORBIDDEN | 403 | Insufficient role permissions |
| NOT_FOUND | 404 | Generic not found |
| EVENT_NOT_FOUND | 404 | Event does not exist |
| USER_NOT_FOUND | 404 | User does not exist |
| BOOKING_NOT_FOUND | 404 | Booking does not exist |
| EMAIL_ALREADY_EXISTS | 409 | Email already registered |
| SEAT_ALREADY_LOCKED | 409 | Seat locked by concurrent user |
| SEAT_ALREADY_BOOKED | 409 | Seat already confirmed |
| BOOKING_EXPIRED | 400 | Lock window elapsed |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |
