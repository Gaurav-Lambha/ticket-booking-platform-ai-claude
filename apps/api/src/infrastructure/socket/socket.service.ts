import type { Server } from 'socket.io';

import { SOCKET_EVENTS } from '@repo/config';
import type { ServerToClientEvents, ClientToServerEvents } from '@repo/types';
import { logger } from '../../core/logger/logger.js';

type AppSocketServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class SocketService {
  private io: AppSocketServer | null = null;

  initialize(io: AppSocketServer): void {
    this.io = io;

    io.on('connection', (socket) => {
      logger.info({ socketId: socket.id }, 'Client connected');

      socket.on(SOCKET_EVENTS.JOIN_EVENT, (eventId: string) => {
        void socket.join(`event:${eventId}`);
        logger.debug({ socketId: socket.id, eventId }, 'Client joined event room');
      });

      socket.on(SOCKET_EVENTS.LEAVE_EVENT, (eventId: string) => {
        void socket.leave(`event:${eventId}`);
        logger.debug({ socketId: socket.id, eventId }, 'Client left event room');
      });

      socket.on('disconnect', (reason) => {
        logger.info({ socketId: socket.id, reason }, 'Client disconnected');
      });
    });
  }

  emitSeatLocked(eventId: string, seatId: string, lockedUntil: Date): void {
    this.io?.to(`event:${eventId}`).emit(SOCKET_EVENTS.SEAT_LOCKED, {
      eventId,
      seatId,
      status: 'locked',
      lockedUntil,
    });
  }

  emitSeatUnlocked(eventId: string, seatId: string): void {
    this.io?.to(`event:${eventId}`).emit(SOCKET_EVENTS.SEAT_UNLOCKED, {
      eventId,
      seatId,
      status: 'available',
    });
  }

  emitSeatBooked(eventId: string, seatId: string): void {
    this.io?.to(`event:${eventId}`).emit(SOCKET_EVENTS.SEAT_BOOKED, {
      eventId,
      seatId,
      status: 'booked',
    });
  }

  emitBookingConfirmed(bookingId: string, userId: string): void {
    this.io?.to(`user:${userId}`).emit(SOCKET_EVENTS.BOOKING_CONFIRMED, {
      bookingId,
      userId,
    });
  }

  emitBookingExpired(bookingId: string, userId: string, releasedSeatIds: string[]): void {
    this.io?.to(`user:${userId}`).emit(SOCKET_EVENTS.BOOKING_EXPIRED, {
      bookingId,
      userId,
      releasedSeatIds,
    });
  }
}

export const socketService = new SocketService();
