import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, Spinner } from '@repo/ui';
import type { IBooking, PaginatedResponse } from '@repo/types';
import { apiClient } from '@/lib/api/client.ts';

const bookingStatusVariant = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'neutral',
  expired: 'error',
} as const;

function BookingCard({ booking, onCancel }: { booking: IBooking; onCancel: (id: string) => void }) {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">Booking #{booking.id.slice(-8).toUpperCase()}</p>
          <p className="font-semibold text-gray-900">
            {booking.seatIds.length} seat{booking.seatIds.length > 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant={bookingStatusVariant[booking.status]}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <dl className="space-y-1 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <dt>Total amount</dt>
          <dd className="font-medium text-gray-900">${booking.totalAmount.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Booked on</dt>
          <dd>{new Date(booking.createdAt).toLocaleDateString()}</dd>
        </div>
        {booking.status === 'pending' && (
          <div className="flex justify-between text-orange-600">
            <dt>Expires at</dt>
            <dd>{new Date(booking.expiresAt).toLocaleTimeString()}</dd>
          </div>
        )}
      </dl>

      <div className="flex items-center gap-2">
        <Link to={`/events/${booking.eventId}`}>
          <Button variant="secondary" size="sm">View Event</Button>
        </Link>
        {canCancel && (
          <Button variant="danger" size="sm" onClick={() => onCancel(booking.id)}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function MyBookingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PaginatedResponse<IBooking> }>('/bookings');
      return data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await apiClient.post(`/bookings/${bookingId}/cancel`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-1 text-gray-500">Your ticket purchase history</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {data && (
        <>
          {data.items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">No bookings yet.</p>
              <Link to="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={(id) => cancelMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
