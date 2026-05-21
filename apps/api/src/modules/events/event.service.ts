import { AppError } from '../../core/errors/AppError.js';
import { buildPaginatedResponse, parsePaginationQuery } from '../../core/utils/pagination.js';
import type { CreateEventRequest, IEvent, ISeat, PaginatedResponse, PaginationQuery } from '@repo/types';
import type { EventRepository } from './event.repository.js';
import type { IEventDocument, ISeatDocument } from './event.schema.js';

export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async getEvents(
    query: PaginationQuery & { status?: string; category?: string },
  ): Promise<PaginatedResponse<IEvent>> {
    const options = parsePaginationQuery(query);
    const filter: Record<string, unknown> = {};

    if (query.status) filter['status'] = query.status;
    if (query.category) filter['category'] = query.category;

    const { events, total } = await this.eventRepository.findAll(filter, options);
    const mapped = events.map(this.toEventResponse);

    return buildPaginatedResponse(mapped, total, options.page, options.limit);
  }

  async getEventById(id: string): Promise<IEvent> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    }
    return this.toEventResponse(event);
  }

  async createEvent(dto: CreateEventRequest, organizerId: string): Promise<IEvent> {
    const totalSeats = dto.seats.length;
    const event = await this.eventRepository.create({
      title: dto.title,
      description: dto.description,
      organizerId,
      venue: dto.venue,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      category: dto.category,
      tags: dto.tags ?? [],
      imageUrl: dto.imageUrl,
      totalSeats,
      availableSeats: totalSeats,
    });

    const seatsData = dto.seats.map((s) => ({ ...s, eventId: event.id as string }));
    await this.eventRepository.createSeats(seatsData);

    return this.toEventResponse(event);
  }

  async getEventSeats(eventId: string): Promise<ISeat[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    }
    const seats = await this.eventRepository.findSeatsByEventId(eventId);
    return seats.map(this.toSeatResponse);
  }

  async publishEvent(eventId: string, organizerId: string): Promise<IEvent> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    }
    if (event.organizerId.toString() !== organizerId) {
      throw AppError.forbidden('Not authorized to modify this event');
    }
    const updated = await this.eventRepository.update(eventId, { status: 'published' });
    return this.toEventResponse(updated!);
  }

  private toEventResponse(event: IEventDocument): IEvent {
    return {
      id: event.id as string,
      title: event.title,
      description: event.description,
      organizerId: event.organizerId.toString(),
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      imageUrl: event.imageUrl,
      category: event.category,
      tags: event.tags,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private toSeatResponse(seat: ISeatDocument): ISeat {
    return {
      id: seat.id as string,
      eventId: seat.eventId.toString(),
      row: seat.row,
      number: seat.number,
      tier: seat.tier,
      price: seat.price,
      status: seat.status,
      lockedBy: seat.lockedBy?.toString(),
      lockedUntil: seat.lockedUntil,
    };
  }
}
