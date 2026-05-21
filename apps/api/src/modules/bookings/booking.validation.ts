import { z } from 'zod';
import { APP_CONSTANTS } from '@repo/config';

export const lockSeatsSchema = z.object({
  eventId: z.string().min(1),
  seatIds: z
    .array(z.string().min(1))
    .min(1, 'At least one seat required')
    .max(APP_CONSTANTS.MAX_SEATS_PER_BOOKING, `Max ${APP_CONSTANTS.MAX_SEATS_PER_BOOKING} seats`),
});

export const confirmBookingSchema = z.object({
  paymentToken: z.string().min(1, 'Payment token required'),
});

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
