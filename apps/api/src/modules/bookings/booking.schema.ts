import mongoose, { type Document, Schema } from 'mongoose';

import type { BookingStatus, PaymentStatus } from '@repo/types';

export interface IBookingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  seatIds: mongoose.Types.ObjectId[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  expiresAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    seatIds: [{ type: Schema.Types.ObjectId, ref: 'Seat' }],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    totalAmount: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, required: true },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ eventId: 1, status: 1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BookingModel = mongoose.model<IBookingDocument>('Booking', bookingSchema);
