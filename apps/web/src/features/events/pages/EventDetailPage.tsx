import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, Spinner } from '@repo/ui';
import { useEvent, useEventSeats } from '../hooks/useEvents.ts';
import { SeatMap } from '@/features/booking/components/SeatMap.tsx';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id!);
  const { data: seats } = useEventSeats(id!);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/events" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/events" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover rounded-xl"
            />
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">{event.category}</Badge>
              <Badge variant={event.status === 'published' ? 'success' : 'neutral'}>
                {event.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          </div>

          <Card>
            <h2 className="text-lg font-semibold mb-3">About this event</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
          </Card>

          {seats && seats.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold mb-4">Seat Map</h2>
              <SeatMap seats={seats} eventId={id!} selectedSeatIds={[]} onSeatToggle={() => {}} readOnly />
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Date</dt>
                <dd className="text-gray-900">
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Time</dt>
                <dd className="text-gray-900">
                  {new Date(event.startDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Venue</dt>
                <dd className="text-gray-900">{event.venue.name}</dd>
                <dd className="text-gray-500">{event.venue.address}</dd>
                <dd className="text-gray-500">{event.venue.city}, {event.venue.country}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Availability</dt>
                <dd className="text-gray-900 font-medium">
                  {event.availableSeats} / {event.totalSeats} seats
                </dd>
              </div>
            </dl>

            {event.status === 'published' && event.availableSeats > 0 && (
              <Link to={`/events/${event.id}/book`} className="block mt-6">
                <Button className="w-full" size="lg">
                  Book Tickets
                </Button>
              </Link>
            )}

            {event.availableSeats === 0 && (
              <div className="mt-6 text-center">
                <Badge variant="error" className="text-sm px-4 py-2">
                  Sold Out
                </Badge>
              </div>
            )}
          </Card>

          {event.tags.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="neutral">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
