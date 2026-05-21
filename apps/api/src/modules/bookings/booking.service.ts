import { APP_CONSTANTS } from '@repo/config';
import type { IBooking, LockSeatsRequest, LockSeatsResponse, PaginatedResponse, PaginationQuery } from '@repo/types';

import { AppError } from '../../core/errors/AppError.js';
import { buildPaginatedResponse, parsePaginationQuery } from '../../core/utils/pagination.js';
import { EventRepository } from '../events/event.repository.js';
import type { BookingRepository } from './booking.repository.js';
import type { IBookingDocument } from './booking.schema.js';
import type { SeatLockService } from './seatLock.service.js';
import type { SocketService } from '../../infrastructure/socket/socket.service.js';

export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly eventRepository: EventRepository,
    private readonly seatLockService: SeatLockService,
    private readonly socketService: SocketService,
  ) {}

  async lockSeatsAndCreatePendingBooking(
    dto: LockSeatsRequest,
    userId: string,
  ): Promise<LockSeatsResponse> {
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    }
    if (event.status !== 'published') {
      throw AppError.badRequest('Event is not available for booking', 'VALIDATION_ERROR');
    }
    if (dto.seatIds.length > APP_CONSTANTS.MAX_SEATS_PER_BOOKING) {
      throw AppError.badRequest(
        `Cannot book more than ${APP_CONSTANTS.MAX_SEATS_PER_BOOKING} seats`,
        'VALIDATION_ERROR',
      );
    }

    const seats = await this.eventRepository.findSeatsByIds(dto.seatIds);
    if (seats.length !== dto.seatIds.length) {
      throw AppError.badRequest('One or more seats not found', 'NOT_FOUND');
    }

    const unavailable = seats.filter((s) => s.status !== 'available');
    if (unavailable.length > 0) {
      throw AppError.conflict('One or more seats are not available', 'SEAT_ALREADY_BOOKED');
    }

    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
    const expiresAt = new Date(Date.now() + APP_CONSTANTS.BOOKING_EXPIRY_MINUTES * 60 * 1000);

    const booking = await this.bookingRepository.create({
      userId,
      eventId: dto.eventId,
      seatIds: dto.seatIds,
      totalAmount,
      expiresAt,
    });

    await this.seatLockService.lockSeats(dto.eventId, dto.seatIds, userId, booking.id as string);

    for (const seat of seats) {
      await this.eventRepository.updateSeatStatus(seat.id as string, 'locked', {
        lockedBy: userId as unknown as never,
        lockedUntil: expiresAt,
      });
      this.socketService.emitSeatLocked(dto.eventId, seat.id as string, expiresAt);
    }

    return {
      locked: true,
      lockExpiresAt: expiresAt,
      bookingId: booking.id as string,
    };
  }

  async confirmBooking(bookingId: string, userId: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) {
      throw AppError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
    }
    if (booking.status !== 'pending') {
      throw AppError.badRequest('Booking is no longer pending', 'VALIDATION_ERROR');
    }
    if (booking.expiresAt < new Date()) {
      await this.expireBooking(booking);
      throw new AppError('Booking has expired', 400, 'BOOKING_EXPIRED');
    }

    const seatIds = booking.seatIds.map((id) => id.toString());

    await this.eventRepository.bulkUpdateSeatStatus(seatIds, 'booked');
    await this.seatLockService.releaseLocks(booking.eventId.toString(), seatIds);
    await this.eventRepository.decrementAvailableSeats(booking.eventId.toString(), seatIds.length);

    const confirmed = await this.bookingRepository.updateStatus(bookingId, 'confirmed', {
      paymentStatus: 'completed',
      confirmedAt: new Date(),
    });

    for (const seatId of seatIds) {
      this.socketService.emitSeatBooked(booking.eventId.toString(), seatId);
    }
    this.socketService.emitBookingConfirmed(bookingId, userId);

    return this.toBookingResponse(confirmed!);
  }

  async cancelBooking(bookingId: string, userId: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) {
      throw AppError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
    }
    if (booking.status === 'cancelled') {
      throw AppError.badRequest('Booking is already cancelled', 'VALIDATION_ERROR');
    }

    const seatIds = booking.seatIds.map((id) => id.toString());

    await this.eventRepository.bulkUpdateSeatStatus(seatIds, 'available');
    await this.seatLockService.releaseLocks(booking.eventId.toString(), seatIds);

    if (booking.status === 'confirmed') {
      await this.eventRepository.incrementAvailableSeats(booking.eventId.toString(), seatIds.length);
    }

    const cancelled = await this.bookingRepository.updateStatus(bookingId, 'cancelled', {
      cancelledAt: new Date(),
    });

    for (const seatId of seatIds) {
      this.socketService.emitSeatUnlocked(booking.eventId.toString(), seatId);
    }

    return this.toBookingResponse(cancelled!);
  }

  async getUserBookings(
    userId: string,
    query: PaginationQuery,
  ): Promise<PaginatedResponse<IBooking>> {
    const options = parsePaginationQuery(query);
    const { bookings, total } = await this.bookingRepository.findByUserId(userId, options);
    return buildPaginatedResponse(bookings.map(this.toBookingResponse), total, options.page, options.limit);
  }

  async processExpiredBookings(): Promise<void> {
    const expired = await this.bookingRepository.findExpiredPendingBookings();

    for (const booking of expired) {
      await this.expireBooking(booking);
    }
  }

  private async expireBooking(booking: IBookingDocument): Promise<void> {
    const seatIds = booking.seatIds.map((id) => id.toString());

    await Promise.all([
      this.bookingRepository.updateStatus(booking.id as string, 'expired'),
      this.eventRepository.bulkUpdateSeatStatus(seatIds, 'available'),
      this.seatLockService.releaseLocks(booking.eventId.toString(), seatIds),
    ]);

    for (const seatId of seatIds) {
      this.socketService.emitSeatUnlocked(booking.eventId.toString(), seatId);
    }
    this.socketService.emitBookingExpired(booking.id as string, booking.userId.toString(), seatIds);
  }

  private toBookingResponse(booking: IBookingDocument): IBooking {
    return {
      id: booking.id as string,
      userId: booking.userId.toString(),
      eventId: booking.eventId.toString(),
      seatIds: booking.seatIds.map((id) => id.toString()),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: booking.totalAmount,
      expiresAt: booking.expiresAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
