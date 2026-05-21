import { z } from 'zod';

const venueSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

const seatSchema = z.object({
  row: z.string().min(1).max(10),
  number: z.number().int().positive(),
  tier: z.enum(['vip', 'premium', 'standard', 'economy']),
  price: z.number().min(0),
});

export const createEventSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  venue: venueSchema,
  startDate: z.string().datetime({ message: 'Invalid start date' }),
  endDate: z.string().datetime({ message: 'Invalid end date' }),
  category: z.string().min(1).max(100),
  tags: z.array(z.string()).max(10).optional(),
  imageUrl: z.string().url().optional(),
  seats: z.array(seatSchema).min(1).max(10000),
});

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  category: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
