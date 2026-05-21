import type { Request, Response } from 'express';

import { asyncWrapper } from '../../core/utils/asyncWrapper.js';
import { sendCreated, sendSuccess } from '../../core/utils/apiResponse.js';
import type { BookingService } from './booking.service.js';

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  lockSeats = asyncWrapper(async (req: Request, res: Response) => {
    const result = await this.bookingService.lockSeatsAndCreatePendingBooking(
      req.body,
      req.user!.userId,
    );
    sendCreated(res, result, 'Seats locked successfully');
  });

  confirmBooking = asyncWrapper(async (req: Request, res: Response) => {
    const booking = await this.bookingService.confirmBooking(req.params['id']!, req.user!.userId);
    sendSuccess(res, booking, 'Booking confirmed');
  });

  cancelBooking = asyncWrapper(async (req: Request, res: Response) => {
    const booking = await this.bookingService.cancelBooking(req.params['id']!, req.user!.userId);
    sendSuccess(res, booking, 'Booking cancelled');
  });

  getUserBookings = asyncWrapper(async (req: Request, res: Response) => {
    const bookings = await this.bookingService.getUserBookings(req.user!.userId, req.query);
    sendSuccess(res, bookings);
  });
}
