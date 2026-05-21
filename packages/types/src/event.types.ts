export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type SeatStatus = 'available' | 'locked' | 'booked';
export type SeatTier = 'vip' | 'premium' | 'standard' | 'economy';

export interface ISeat {
  id: string;
  eventId: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  lockedBy?: string;
  lockedUntil?: Date;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  organizerId: string;
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

export interface IVenue {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CreateEventRequest {
  title: string;
  description: string;
  venue: IVenue;
  startDate: string;
  endDate: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  seats: CreateSeatRequest[];
}

export interface CreateSeatRequest {
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
}

export interface EventListResponse {
  events: IEvent[];
  total: number;
  page: number;
  limit: number;
}
