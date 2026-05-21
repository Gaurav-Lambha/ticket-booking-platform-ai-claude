import type { SeatStatus } from './event.types.js';

export interface ServerToClientEvents {
  'seat:locked': (data: SeatLockedEvent) => void;
  'seat:unlocked': (data: SeatUnlockedEvent) => void;
  'seat:booked': (data: SeatBookedEvent) => void;
  'booking:confirmed': (data: BookingConfirmedEvent) => void;
  'booking:expired': (data: BookingExpiredEvent) => void;
  'event:updated': (data: EventUpdatedEvent) => void;
}

export interface ClientToServerEvents {
  'join:event': (eventId: string) => void;
  'leave:event': (eventId: string) => void;
}

export interface SeatLockedEvent {
  eventId: string;
  seatId: string;
  status: SeatStatus;
  lockedUntil: Date;
}

export interface SeatUnlockedEvent {
  eventId: string;
  seatId: string;
  status: SeatStatus;
}

export interface SeatBookedEvent {
  eventId: string;
  seatId: string;
  status: SeatStatus;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  userId: string;
}

export interface BookingExpiredEvent {
  bookingId: string;
  userId: string;
  releasedSeatIds: string[];
}

export interface EventUpdatedEvent {
  eventId: string;
  availableSeats: number;
}
