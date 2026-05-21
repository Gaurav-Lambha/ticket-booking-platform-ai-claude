import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

import { SOCKET_EVENTS } from '@repo/config';
import type { ServerToClientEvents, ClientToServerEvents } from '@repo/types';
import { useAuthStore } from '@/features/auth/authStore.ts';
import { eventKeys } from '@/features/events/hooks/useEvents.ts';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';

export function useEventSocket(eventId: string) {
  const socketRef = useRef<AppSocket | null>(null);
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!eventId) return;

    const socket: AppSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit(SOCKET_EVENTS.JOIN_EVENT, eventId);
    });

    socket.on(SOCKET_EVENTS.SEAT_LOCKED, ({ seatId, status, lockedUntil }) => {
      queryClient.setQueryData(eventKeys.seats(eventId), (old: unknown[]) =>
        old?.map((s: unknown) => {
          const seat = s as { id: string };
          return seat.id === seatId ? { ...seat, status, lockedUntil } : seat;
        }),
      );
    });

    socket.on(SOCKET_EVENTS.SEAT_UNLOCKED, ({ seatId, status }) => {
      queryClient.setQueryData(eventKeys.seats(eventId), (old: unknown[]) =>
        old?.map((s: unknown) => {
          const seat = s as { id: string };
          return seat.id === seatId ? { ...seat, status, lockedBy: undefined, lockedUntil: undefined } : seat;
        }),
      );
    });

    socket.on(SOCKET_EVENTS.SEAT_BOOKED, ({ seatId, status }) => {
      queryClient.setQueryData(eventKeys.seats(eventId), (old: unknown[]) =>
        old?.map((s: unknown) => {
          const seat = s as { id: string };
          return seat.id === seatId ? { ...seat, status } : seat;
        }),
      );
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_EVENT, eventId);
      socket.disconnect();
    };
  }, [eventId, accessToken, queryClient]);

  return socketRef;
}
