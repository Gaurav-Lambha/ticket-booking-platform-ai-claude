import type { PaginationOptions } from '../../core/utils/pagination.js';
import type { IEventDocument, ISeatDocument } from './event.schema.js';
import { EventModel, SeatModel } from './event.schema.js';
import type { CreateEventRequest, CreateSeatRequest } from '@repo/types';

export class EventRepository {
  async findAll(
    filter: Record<string, unknown>,
    options: PaginationOptions,
  ): Promise<{ events: IEventDocument[]; total: number }> {
    const [events, total] = await Promise.all([
      EventModel.find(filter).sort(options.sort).skip(options.skip).limit(options.limit).lean(),
      EventModel.countDocuments(filter),
    ]);
    return { events: events as IEventDocument[], total };
  }

  async findById(id: string): Promise<IEventDocument | null> {
    return EventModel.findById(id);
  }

  async create(
    data: Omit<CreateEventRequest, 'seats'> & { organizerId: string; totalSeats: number; availableSeats: number },
  ): Promise<IEventDocument> {
    return EventModel.create(data);
  }

  async update(id: string, data: Partial<IEventDocument>): Promise<IEventDocument | null> {
    return EventModel.findByIdAndUpdate(id, data, { new: true });
  }

  async decrementAvailableSeats(eventId: string, count: number): Promise<void> {
    await EventModel.findByIdAndUpdate(eventId, { $inc: { availableSeats: -count } });
  }

  async incrementAvailableSeats(eventId: string, count: number): Promise<void> {
    await EventModel.findByIdAndUpdate(eventId, { $inc: { availableSeats: count } });
  }

  async createSeats(seats: (CreateSeatRequest & { eventId: string })[]): Promise<ISeatDocument[]> {
    return SeatModel.insertMany(seats) as unknown as ISeatDocument[];
  }

  async findSeatsByEventId(eventId: string): Promise<ISeatDocument[]> {
    return SeatModel.find({ eventId });
  }

  async findSeatsByIds(seatIds: string[]): Promise<ISeatDocument[]> {
    return SeatModel.find({ _id: { $in: seatIds } });
  }

  async findAvailableSeatsByEventId(eventId: string): Promise<ISeatDocument[]> {
    return SeatModel.find({ eventId, status: 'available' });
  }

  async updateSeatStatus(
    seatId: string,
    status: string,
    extra?: Partial<ISeatDocument>,
  ): Promise<ISeatDocument | null> {
    return SeatModel.findByIdAndUpdate(seatId, { status, ...extra }, { new: true });
  }

  async bulkUpdateSeatStatus(seatIds: string[], status: string): Promise<void> {
    await SeatModel.updateMany({ _id: { $in: seatIds } }, { status });
  }
}
