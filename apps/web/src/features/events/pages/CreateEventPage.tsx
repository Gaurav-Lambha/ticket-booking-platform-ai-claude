import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button, Card, Input } from '@repo/ui';
import type { CreateEventRequest, CreateSeatRequest, SeatTier } from '@repo/types';
import { apiClient } from '@/lib/api/client.ts';
import { eventKeys } from '../hooks/useEvents.ts';

interface SeatSection {
  localId: string;
  tier: SeatTier;
  rowStart: string;
  rowEnd: string;
  seatsPerRow: number;
  price: number;
}

const TIER_LABELS: Record<SeatTier, string> = {
  vip: 'VIP',
  premium: 'Premium',
  standard: 'Standard',
  economy: 'Economy',
};

const TIER_COLORS: Record<SeatTier, string> = {
  vip: 'bg-purple-100 text-purple-800',
  premium: 'bg-yellow-100 text-yellow-800',
  standard: 'bg-blue-100 text-blue-800',
  economy: 'bg-gray-100 text-gray-800',
};

function expandRows(rowStart: string, rowEnd: string): string[] {
  const s = rowStart.toUpperCase().charCodeAt(0);
  const e = rowEnd.toUpperCase().charCodeAt(0);
  if (isNaN(s) || isNaN(e) || e < s) return [];
  return Array.from({ length: e - s + 1 }, (_, i) => String.fromCharCode(s + i));
}

function sectionToSeats(section: SeatSection): CreateSeatRequest[] {
  const rows = expandRows(section.rowStart, section.rowEnd);
  const seats: CreateSeatRequest[] = [];
  for (const row of rows) {
    for (let n = 1; n <= section.seatsPerRow; n++) {
      seats.push({ row, number: n, tier: section.tier, price: section.price });
    }
  }
  return seats;
}

const emptySectionForm = (): Omit<SeatSection, 'localId'> => ({
  tier: 'standard',
  rowStart: '',
  rowEnd: '',
  seatsPerRow: 10,
  price: 0,
});

export default function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    venue: { name: '', address: '', city: '', country: '' },
  });

  const [sections, setSections] = useState<SeatSection[]>([]);
  const [sectionForm, setSectionForm] = useState(emptySectionForm());
  const [sectionError, setSectionError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const res = await apiClient.post('/events', data);
      return res.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
      void navigate('/events');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sections.length === 0) {
      setSectionError('Add at least one seat section before creating the event.');
      return;
    }
    setSectionError('');
    const seats = sections.flatMap(sectionToSeats);
    mutation.mutate({ ...form, seats } as CreateEventRequest);
  };

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setVenue = (key: string, value: string) => {
    setForm((f) => ({ ...f, venue: { ...f.venue, [key]: value } }));
  };

  const setSF = (key: keyof typeof sectionForm, value: unknown) => {
    setSectionForm((f) => ({ ...f, [key]: value }));
  };

  const addSection = () => {
    const { tier, rowStart, rowEnd, seatsPerRow, price } = sectionForm;
    if (!rowStart || !rowEnd) {
      setSectionError('Row Start and Row End are required.');
      return;
    }
    if (!/^[A-Za-z]$/.test(rowStart) || !/^[A-Za-z]$/.test(rowEnd)) {
      setSectionError('Row Start and Row End must be single letters (A–Z).');
      return;
    }
    if (rowEnd.toUpperCase().charCodeAt(0) < rowStart.toUpperCase().charCodeAt(0)) {
      setSectionError('Row End must be >= Row Start.');
      return;
    }
    if (seatsPerRow < 1 || seatsPerRow > 100) {
      setSectionError('Seats per row must be between 1 and 100.');
      return;
    }
    if (price < 0) {
      setSectionError('Price must be 0 or greater.');
      return;
    }
    setSectionError('');
    setSections((s) => [...s, { localId: crypto.randomUUID(), tier, rowStart: rowStart.toUpperCase(), rowEnd: rowEnd.toUpperCase(), seatsPerRow, price }]);
    setSectionForm(emptySectionForm());
  };

  const removeSection = (localId: string) => {
    setSections((s) => s.filter((sec) => sec.localId !== localId));
  };

  const totalSeats = sections.reduce(
    (sum, sec) => sum + expandRows(sec.rowStart, sec.rowEnd).length * sec.seatsPerRow,
    0,
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Event</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Event Title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                required
              />
            </div>
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                required
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* Venue */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Venue</h2>
          <div className="space-y-4">
            <Input label="Venue Name" value={form.venue.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenue('name', e.target.value)} required />
            <Input label="Address" value={form.venue.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenue('address', e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.venue.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenue('city', e.target.value)} required />
              <Input label="Country" value={form.venue.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenue('country', e.target.value)} required />
            </div>
          </div>
        </Card>

        {/* Seat Configuration */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Seats</h2>
            {totalSeats > 0 && (
              <span className="text-sm text-gray-500">{totalSeats} total seats</span>
            )}
          </div>

          {/* Add section form */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Seat Section</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
                <select
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sectionForm.tier}
                  onChange={(e) => setSF('tier', e.target.value as SeatTier)}
                >
                  {(Object.keys(TIER_LABELS) as SeatTier[]).map((t) => (
                    <option key={t} value={t}>{TIER_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Row Start</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="A"
                  maxLength={1}
                  value={sectionForm.rowStart}
                  onChange={(e) => setSF('rowStart', e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Row End</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="E"
                  maxLength={1}
                  value={sectionForm.rowEnd}
                  onChange={(e) => setSF('rowEnd', e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Seats per Row</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sectionForm.seatsPerRow}
                  onChange={(e) => setSF('seatsPerRow', parseInt(e.target.value, 10) || 1)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sectionForm.price}
                  onChange={(e) => setSF('price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="secondary" onClick={addSection} className="w-full">
                  + Add Section
                </Button>
              </div>
            </div>
            {sectionError && (
              <p className="mt-2 text-xs text-red-600">{sectionError}</p>
            )}
          </div>

          {/* Section list */}
          {sections.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No seat sections added yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sections.map((sec) => {
                const rows = expandRows(sec.rowStart, sec.rowEnd);
                const count = rows.length * sec.seatsPerRow;
                return (
                  <li key={sec.localId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[sec.tier]}`}>
                        {TIER_LABELS[sec.tier]}
                      </span>
                      <span className="text-sm text-gray-700">
                        Rows {sec.rowStart}–{sec.rowEnd} &nbsp;&middot;&nbsp; {sec.seatsPerRow} seats/row &nbsp;&middot;&nbsp; ${sec.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">({count} seats)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(sec.localId)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium ml-4"
                      aria-label="Remove section"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            Failed to create event. Please try again.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/events')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
