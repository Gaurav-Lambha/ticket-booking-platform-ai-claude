import mongoose, { type Document, Schema } from 'mongoose';

import type { EventStatus, IVenue, SeatStatus, SeatTier } from '@repo/types';

export interface ISeatDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  lockedBy?: mongoose.Types.ObjectId;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventDocument extends Document {
  title: string;
  description: string;
  organizerId: mongoose.Types.ObjectId;
  venue: IVenue;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  totalSeats: number;
  availableSeats: number;
  imageUrl?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false },
);

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    venue: { type: venueSchema, required: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
      index: true,
    },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1, status: 1 });

const seatSchema = new Schema<ISeatDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    tier: {
      type: String,
      enum: ['vip', 'premium', 'standard', 'economy'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      index: true,
    },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lockedUntil: { type: Date },
  },
  { timestamps: true },
);

seatSchema.index({ eventId: 1, status: 1 });
seatSchema.index({ eventId: 1, row: 1, number: 1 }, { unique: true });

export const EventModel = mongoose.model<IEventDocument>('Event', eventSchema);
export const SeatModel = mongoose.model<ISeatDocument>('Seat', seatSchema);
