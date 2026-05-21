export const APP_CONSTANTS = {
  SEAT_LOCK_TTL_SECONDS: 300, // 5 minutes
  BOOKING_EXPIRY_MINUTES: 10,
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: 12,
  MAX_SEATS_PER_BOOKING: 10,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX: 10,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SEAT_ALREADY_LOCKED: 'SEAT_ALREADY_LOCKED',
  SEAT_ALREADY_BOOKED: 'SEAT_ALREADY_BOOKED',
  BOOKING_EXPIRED: 'BOOKING_EXPIRED',
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const SOCKET_EVENTS = {
  SEAT_LOCKED: 'seat:locked',
  SEAT_UNLOCKED: 'seat:unlocked',
  SEAT_BOOKED: 'seat:booked',
  BOOKING_CONFIRMED: 'booking:confirmed',
  BOOKING_EXPIRED: 'booking:expired',
  EVENT_UPDATED: 'event:updated',
  JOIN_EVENT: 'join:event',
  LEAVE_EVENT: 'leave:event',
} as const;

export const REDIS_KEYS = {
  seatLock: (eventId: string, seatId: string) => `seat:lock:${eventId}:${seatId}`,
  userSession: (userId: string) => `session:${userId}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
  eventSeats: (eventId: string) => `event:seats:${eventId}`,
} as const;
