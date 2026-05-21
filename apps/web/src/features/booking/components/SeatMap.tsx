import { clsx } from 'clsx';

import type { ISeat, SeatTier } from '@repo/types';

interface SeatMapProps {
  seats: ISeat[];
  eventId: string;
  selectedSeatIds: string[];
  onSeatToggle: (seatId: string) => void;
  readOnly?: boolean;
}

const tierColors: Record<SeatTier, string> = {
  vip: 'bg-purple-200 hover:bg-purple-300 data-[selected]:bg-purple-600',
  premium: 'bg-yellow-200 hover:bg-yellow-300 data-[selected]:bg-yellow-600',
  standard: 'bg-blue-200 hover:bg-blue-300 data-[selected]:bg-blue-600',
  economy: 'bg-gray-200 hover:bg-gray-300 data-[selected]:bg-gray-600',
};

const tierPriceColor: Record<SeatTier, string> = {
  vip: 'text-purple-700',
  premium: 'text-yellow-700',
  standard: 'text-blue-700',
  economy: 'text-gray-700',
};

export function SeatMap({ seats, selectedSeatIds, onSeatToggle, readOnly = false }: SeatMapProps) {
  const rows = [...new Set(seats.map((s) => s.row))].sort();

  const getSeatClasses = (seat: ISeat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const isBooked = seat.status === 'booked';
    const isLocked = seat.status === 'locked';

    return clsx(
      'w-8 h-8 rounded text-xs font-medium transition-colors flex items-center justify-center cursor-pointer',
      isBooked && 'bg-red-400 text-red-800 cursor-not-allowed opacity-60',
      isLocked && !isSelected && 'bg-orange-300 text-orange-800 cursor-not-allowed opacity-70',
      !isBooked && !isLocked && tierColors[seat.tier],
      isSelected && 'ring-2 ring-indigo-500 ring-offset-1',
      readOnly && 'cursor-default pointer-events-none',
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="mb-4 flex items-center gap-1 justify-center bg-gray-800 text-white rounded-lg py-2 px-4 text-sm font-medium">
          STAGE / SCREEN
        </div>

        <div className="space-y-2">
          {rows.map((row) => {
            const rowSeats = seats.filter((s) => s.row === row).sort((a, b) => a.number - b.number);
            return (
              <div key={row} className="flex items-center gap-2">
                <span className="w-6 text-xs text-gray-500 font-medium text-right">{row}</span>
                <div className="flex gap-1 flex-wrap">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      className={getSeatClasses(seat)}
                      onClick={() => {
                        if (!readOnly && seat.status === 'available') {
                          onSeatToggle(seat.id);
                        }
                      }}
                      disabled={readOnly || seat.status !== 'available'}
                      title={`Row ${seat.row}, Seat ${seat.number} — ${seat.tier} — $${seat.price}`}
                      aria-pressed={selectedSeatIds.includes(seat.id)}
                      aria-label={`Seat ${seat.row}${seat.number}`}
                      data-selected={selectedSeatIds.includes(seat.id) ? '' : undefined}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          {(['vip', 'premium', 'standard', 'economy'] as SeatTier[]).map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div className={clsx('w-4 h-4 rounded', tierColors[tier].split(' ')[0])} />
              <span className={tierPriceColor[tier] + ' capitalize'}>{tier}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-red-400 opacity-60" />
            <span className="text-gray-500">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-orange-300 opacity-70" />
            <span className="text-gray-500">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
