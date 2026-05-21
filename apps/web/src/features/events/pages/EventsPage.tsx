import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Card, Spinner } from '@repo/ui';
import type { IEvent } from '@repo/types';
import { useEvents } from '../hooks/useEvents.ts';

function EventCard({ event }: { event: IEvent }) {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-48 object-cover rounded-t-lg -mx-6 -mt-6 mb-4"
            style={{ width: 'calc(100% + 3rem)' }}
          />
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
            <Badge variant="info">{event.category}</Badge>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-3">{event.description}</p>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.venue.name}, {event.venue.city}
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-600">
              {event.availableSeats} seats left
            </span>
            <Badge variant={event.availableSeats > 0 ? 'success' : 'error'}>
              {event.availableSeats > 0 ? 'Available' : 'Sold out'}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useEvents({ page, limit: 12 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="mt-1 text-gray-500">Discover and book events near you</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-gray-500">Failed to load events. Please try again.</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {data.items.length === 0 && (
            <div className="text-center py-20 text-gray-500">No events found.</div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.hasPrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasNext}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
