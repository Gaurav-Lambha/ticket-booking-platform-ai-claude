import { useQuery } from '@tanstack/react-query';

import type { IEvent, PaginatedResponse } from '@repo/types';
import { apiClient } from '@/lib/api/client.ts';

interface EventsQuery {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}

export const eventKeys = {
  all: ['events'] as const,
  list: (query: EventsQuery) => [...eventKeys.all, 'list', query] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  seats: (id: string) => [...eventKeys.all, 'seats', id] as const,
};

export function useEvents(query: EventsQuery = {}) {
  return useQuery({
    queryKey: eventKeys.list(query),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PaginatedResponse<IEvent> }>('/events', {
        params: { ...query, status: query.status ?? 'published' },
      });
      return data.data;
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: IEvent }>(`/events/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useEventSeats(eventId: string) {
  return useQuery({
    queryKey: eventKeys.seats(eventId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: import('@repo/types').ISeat[] }>(
        `/events/${eventId}/seats`,
      );
      return data.data;
    },
    enabled: !!eventId,
    staleTime: 0,
  });
}
