export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IBooking {
  id: string;
  userId: string;
  eventId: string;
  seatIds: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  expiresAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDetail extends IBooking {
  seats: BookedSeat[];
  event: BookingEvent;
  user: BookingUser;
}

export interface BookedSeat {
  id: string;
  row: string;
  number: number;
  tier: string;
  price: number;
}

export interface BookingEvent {
  id: string;
  title: string;
  startDate: Date;
  venue: string;
}

export interface BookingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LockSeatsRequest {
  eventId: string;
  seatIds: string[];
}

export interface LockSeatsResponse {
  locked: boolean;
  lockExpiresAt: Date;
  bookingId: string;
}

export interface ConfirmBookingRequest {
  bookingId: string;
  paymentToken: string;
}

export interface BookingListResponse {
  bookings: IBooking[];
  total: number;
  page: number;
  limit: number;
}
