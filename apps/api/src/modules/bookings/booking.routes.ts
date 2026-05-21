import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { EventRepository } from '../events/event.repository.js';
import { BookingController } from './booking.controller.js';
import { BookingRepository } from './booking.repository.js';
import { BookingService } from './booking.service.js';
import { SeatLockService } from './seatLock.service.js';
import { bookingQuerySchema, confirmBookingSchema, lockSeatsSchema } from './booking.validation.js';
import { socketService } from '../../infrastructure/socket/socket.service.js';

const router = Router();

const bookingRepository = new BookingRepository();
const eventRepository = new EventRepository();
const seatLockService = new SeatLockService();
const bookingService = new BookingService(
  bookingRepository,
  eventRepository,
  seatLockService,
  socketService,
);
const bookingController = new BookingController(bookingService);

router.use(authenticate);

router.post('/lock', validate(lockSeatsSchema), bookingController.lockSeats);
router.get('/', validate(bookingQuerySchema, 'query'), bookingController.getUserBookings);
router.post('/:id/confirm', validate(confirmBookingSchema), bookingController.confirmBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

export default router;
