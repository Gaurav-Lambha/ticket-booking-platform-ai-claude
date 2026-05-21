import type { PaginationOptions } from '../../core/utils/pagination.js';
import { BookingModel, type IBookingDocument } from './booking.schema.js';

export class BookingRepository {
  async create(data: {
    userId: string;
    eventId: string;
    seatIds: string[];
    totalAmount: number;
    expiresAt: Date;
  }): Promise<IBookingDocument> {
    return BookingModel.create(data);
  }

  async findById(id: string): Promise<IBookingDocument | null> {
    return BookingModel.findById(id);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<IBookingDocument | null> {
    return BookingModel.findOne({ _id: id, userId });
  }

  async findByUserId(
    userId: string,
    options: PaginationOptions,
  ): Promise<{ bookings: IBookingDocument[]; total: number }> {
    const [bookings, total] = await Promise.all([
      BookingModel.find({ userId }).sort(options.sort).skip(options.skip).limit(options.limit),
      BookingModel.countDocuments({ userId }),
    ]);
    return { bookings, total };
  }

  async updateStatus(
    id: string,
    status: string,
    extra?: Partial<IBookingDocument>,
  ): Promise<IBookingDocument | null> {
    return BookingModel.findByIdAndUpdate(id, { status, ...extra }, { new: true });
  }

  async findExpiredPendingBookings(): Promise<IBookingDocument[]> {
    return BookingModel.find({
      status: 'pending',
      expiresAt: { $lte: new Date() },
    });
  }
}
