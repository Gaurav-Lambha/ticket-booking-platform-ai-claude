import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button, Card, Spinner } from '@repo/ui';
import { useEvent, useEventSeats, eventKeys } from '@/features/events/hooks/useEvents.ts';
import { useEventSocket } from '@/lib/socket/useEventSocket.ts';
import { apiClient } from '@/lib/api/client.ts';
import { SeatMap } from '../components/SeatMap.tsx';
import type { LockSeatsResponse } from '@repo/types';

type BookingStep = 'select' | 'confirm' | 'success';

export default function BookingPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [step, setStep] = useState<BookingStep>('select');
  const [lockResponse, setLockResponse] = useState<LockSeatsResponse | null>(null);
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: event, isLoading: eventLoading } = useEvent(eventId!);
  const { data: seats, isLoading: seatsLoading } = useEventSeats(eventId!);

  useEventSocket(eventId!);

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId],
    );
  }, []);

  const lockMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ data: LockSeatsResponse }>('/bookings/lock', {
        eventId,
        seatIds: selectedSeatIds,
      });
      return data.data;
    },
    onSuccess: (data) => {
      setLockResponse(data);
      setLockExpiry(new Date(data.lockExpiresAt));
      setStep('confirm');

      const interval = setInterval(() => {
        const remaining = Math.max(0, new Date(data.lockExpiresAt).getTime() - Date.now());
        setTimeLeft(Math.floor(remaining / 1000));
        if (remaining <= 0) {
          clearInterval(interval);
          setStep('select');
          setSelectedSeatIds([]);
        }
      }, 1000);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/bookings/${lockResponse?.bookingId}/confirm`, {
        paymentToken: 'mock-payment-token',
      });
      return data.data;
    },
    onSuccess: async () => {
      setStep('success');
      await queryClient.invalidateQueries({ queryKey: eventKeys.seats(eventId!) });
      await queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId!) });
    },
  });

  const selectedSeats = seats?.filter((s) => selectedSeatIds.includes(s.id)) ?? [];
  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  if (eventLoading || seatsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event || !seats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Event not found.</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your tickets have been booked successfully.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => void navigate('/bookings')}>
            View My Bookings
          </Button>
          <Button onClick={() => void navigate('/events')}>Browse More Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to={`/events/${eventId}`} className="text-sm text-indigo-600 hover:underline">
          ← Back to event
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {step === 'select' ? 'Select Seats' : 'Confirm Booking'}
        </h1>
        <p className="text-gray-500">{event.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            {step === 'select' && (
              <SeatMap
                seats={seats}
                eventId={eventId!}
                selectedSeatIds={selectedSeatIds}
                onSeatToggle={toggleSeat}
              />
            )}
            {step === 'confirm' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Seats locked for</h2>
                  <span className="text-lg font-bold text-indigo-600">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Your seats are reserved until {lockExpiry?.toLocaleTimeString()}. Complete payment to confirm.
                </p>
                <SeatMap
                  seats={seats}
                  eventId={eventId!}
                  selectedSeatIds={selectedSeatIds}
                  onSeatToggle={() => {}}
                  readOnly
                />
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            {selectedSeats.length === 0 ? (
              <p className="text-sm text-gray-500">No seats selected</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {selectedSeats.map((seat) => (
                  <li key={seat.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Row {seat.row}, Seat {seat.number} ({seat.tier})
                    </span>
                    <span className="font-medium">${seat.price}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
            </div>

            {step === 'select' && (
              <Button
                className="w-full mt-4"
                onClick={() => lockMutation.mutate()}
                disabled={selectedSeatIds.length === 0}
                isLoading={lockMutation.isPending}
              >
                Reserve {selectedSeatIds.length > 0 ? `${selectedSeatIds.length} seat${selectedSeatIds.length > 1 ? 's' : ''}` : 'Seats'}
              </Button>
            )}

            {step === 'confirm' && (
              <div className="space-y-2 mt-4">
                <Button
                  className="w-full"
                  onClick={() => confirmMutation.mutate()}
                  isLoading={confirmMutation.isPending}
                >
                  Confirm & Pay ${totalAmount.toFixed(2)}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('select');
                    setSelectedSeatIds([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            {(lockMutation.isError || confirmMutation.isError) && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                Something went wrong. Please try again.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
