import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { CalendarDays, ChevronLeft, ChevronRight, MessageSquareText, Phone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { reservationApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, formatBookingDate, formatTime, isoDay } from '@/lib/format';
import type { Reservation, ReservationStatus, Restaurant } from '@/lib/types';
import { DashHead, Stat } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button } from '@/ui/Button';
import { BookingStatusBadge, EmptyState, Segmented } from '@/ui/bits';
import { Confirm } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

/** Moves the restaurant can make from each status (mirrors RESERVATION_FLOW on the server). */
const ACTIONS: Partial<Record<ReservationStatus, Array<{ to: ReservationStatus; label: string; variant: 'dark' | 'outline' | 'ghost' | 'primary'; dayOf?: boolean }>>> = {
  pending: [
    { to: 'confirmed', label: 'Confirm', variant: 'primary' },
    { to: 'cancelled', label: 'Decline', variant: 'ghost' },
  ],
  confirmed: [
    { to: 'arrived', label: 'Seated', variant: 'dark', dayOf: true },
    { to: 'no_show', label: 'No-show', variant: 'ghost', dayOf: true },
    { to: 'cancelled', label: 'Cancel', variant: 'ghost' },
  ],
  arrived: [{ to: 'completed', label: 'Finished', variant: 'dark' }],
};

function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function Row({ b, today, onMove, busy }: { b: Reservation; today: string; onMove: (to: ReservationStatus) => void; busy: boolean }) {
  const isToday = b.date.slice(0, 10) === today;
  const actions = (ACTIONS[b.status] ?? []).filter((a) => !a.dayOf || isToday);
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4 sm:w-44">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-herb-900 text-center text-paper">
          <span className="font-display text-[17px] leading-none">{formatTime(b.time)}</span>
        </div>
        <div className="sm:hidden">
          <p className="font-semibold text-ink">{b.customerName || 'Guest'}</p>
          <BookingStatusBadge status={b.status} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="hidden font-semibold text-ink sm:block">{b.customerName || 'Guest'}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {b.guests}
          </span>
          {b.tableNumber && <span>Table {b.tableNumber}</span>}
          {b.bookingRef && <span className="font-mono">{b.bookingRef}</span>}
          {b.customerPhone && (
            <a href={`tel:${b.customerPhone}`} className="inline-flex items-center gap-1 hover:text-ink">
              <Phone className="size-3.5" /> {b.customerPhone}
            </a>
          )}
        </p>
        {b.specialRequests && (
          <p className="mt-1.5 flex gap-1.5 text-[13px] text-saffron-700">
            <MessageSquareText className="mt-0.5 size-3.5 shrink-0" /> {b.specialRequests}
          </p>
        )}
        {b.cancelReason && <p className="mt-1 text-[12.5px] text-ink-4">Reason: {b.cancelReason}</p>}
      </div>
      <div className="hidden sm:block">
        <BookingStatusBadge status={b.status} />
      </div>
      {!!actions.length && (
        <div className="flex gap-2">
          {actions.map((a) => (
            <Button key={a.to} size="sm" variant={a.variant} loading={busy} onClick={() => onMove(a.to)}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </motion.li>
  );
}

function Book({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const today = isoDay();
  const [mode, setMode] = useState<'day' | 'upcoming'>('day');
  const [day, setDay] = useState(today);
  const [status, setStatus] = useState('');
  const [cancel, setCancel] = useState<{ b: Reservation; to: ReservationStatus } | null>(null);
  const [reason, setReason] = useState('');

  const [year, month] = day.split('-').map(Number);
  const cal = useQuery({ queryKey: ['owner', 'calendar', year, month], queryFn: () => reservationApi.calendar(month, year) });
  const stats = useQuery({ queryKey: ['owner', 'res-stats'], queryFn: reservationApi.stats });
  const list = useQuery({
    queryKey: ['owner', 'reservations', mode, day, status],
    queryFn: () => reservationApi.forRestaurant(r._id, mode === 'day' ? { date: day, status, limit: 100 } : { upcoming: 'true', status, limit: 100 }),
    refetchInterval: 30_000,
  });
  const move = useMutation({
    mutationFn: (v: { id: string; to: ReservationStatus; reason?: string }) => reservationApi.setStatus(v.id, v.to, v.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner'] });
      setCancel(null);
      setReason('');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(day, i - 3)), [day]);
  const rows = list.data?.reservations ?? [];
  const covers = rows.filter((b) => !['cancelled', 'no_show'].includes(b.status)).reduce((s, b) => s + b.guests, 0);

  return (
    <>
      <DashHead
        title="Reservations"
        lead="Confirm requests, seat guests and keep the book honest."
        action={
          <Segmented
            id="owner-book"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'day', label: 'By day' },
              { value: 'upcoming', label: 'All upcoming' },
            ]}
          />
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Today" value={stats.data?.todayTotal ?? '—'} hint={`${stats.data?.todayGuests ?? 0} guests expected`} icon={<CalendarDays className="size-4" />} tone="dark" />
        <Stat label="Waiting for you" value={stats.data?.pending ?? '—'} hint="Requests to confirm" tone={stats.data?.pending ? 'saffron' : 'plain'} />
        <Stat label="Confirmed ahead" value={stats.data?.confirmed ?? '—'} hint={`${stats.data?.total ?? 0} bookings all-time`} />
      </div>

      {mode === 'day' && (
        <div className="mb-5 flex items-center gap-2">
          <button onClick={() => setDay(addDays(day, -7))} className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-card hover:bg-paper-2" aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </button>
          <div className="scrollbar-none grid flex-1 auto-cols-[minmax(64px,1fr)] grid-flow-col gap-2 overflow-x-auto">
            {week.map((d) => {
              const c = cal.data?.[d];
              const count = c ? c.confirmed + c.pending + c.completed : 0;
              const active = d === day;
              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={cn('relative rounded-2xl border px-2 py-2.5 text-center transition', active ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card hover:border-line-2')}
                >
                  <span className={cn('block text-[11px] font-semibold uppercase', active ? 'text-saffron-300' : 'text-ink-4')}>
                    {d === today ? 'Today' : formatBookingDate(d, { weekday: 'short' })}
                  </span>
                  <span className="block font-display text-xl leading-tight">{Number(d.slice(8))}</span>
                  <span className={cn('block text-[11px]', active ? 'text-paper/70' : 'text-ink-3')}>{count ? `${count} booked` : '—'}</span>
                  {!!c?.pending && <span className="absolute top-2 right-2 size-2 rounded-full bg-tomato-500" />}
                </button>
              );
            })}
          </div>
          <button onClick={() => setDay(addDays(day, 7))} className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-card hover:bg-paper-2" aria-label="Next week">
            <ChevronRight className="size-4" />
          </button>
          <input type="date" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} className="input-base hidden !w-auto md:block" aria-label="Pick a date" />
        </div>
      )}

      <div className="overflow-hidden rounded-[22px] border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <p className="font-display text-lg text-ink">
            {mode === 'day' ? formatBookingDate(day, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Upcoming'}
            {!!rows.length && <span className="ml-2 font-sans text-sm text-ink-3">{covers} covers</span>}
          </p>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base !h-9 !w-auto !py-0 text-sm" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="pending">Waiting to confirm</option>
            <option value="confirmed">Confirmed</option>
            <option value="arrived">Seated</option>
            <option value="completed">Finished</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-show</option>
          </select>
        </div>
        {list.isLoading ? (
          <Skeleton className="m-5 h-40" />
        ) : rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((b) => (
              <Row
                key={b._id}
                b={b}
                today={today}
                busy={move.isPending && move.variables?.id === b._id}
                onMove={(to) => (to === 'cancelled' ? setCancel({ b, to }) : move.mutate({ id: b._id, to }))}
              />
            ))}
          </ul>
        ) : (
          <EmptyState className="m-5 border-0" icon={<CalendarDays className="size-6" />} title="No bookings here" body={mode === 'day' ? 'Nothing on the book for this day yet.' : 'No upcoming reservations.'} />
        )}
      </div>

      <Confirm
        open={!!cancel}
        onClose={() => setCancel(null)}
        onConfirm={() => cancel && move.mutate({ id: cancel.b._id, to: 'cancelled', reason: reason.trim() || undefined })}
        loading={move.isPending}
        title={cancel?.b.status === 'pending' ? 'Decline this request?' : 'Cancel this booking?'}
        body={`${cancel?.b.customerName || 'The guest'} is notified straight away and the table is freed.`}
        confirmLabel={cancel?.b.status === 'pending' ? 'Decline' : 'Cancel booking'}
      >
        <label className="mt-4 block text-sm font-semibold text-ink-2">
          Message to the guest <span className="font-normal text-ink-4">(optional)</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} className="input-base mt-1.5" placeholder="e.g. Fully booked for a private event" />
        </label>
      </Confirm>
    </>
  );
}

export default function OwnerBookings() {
  return <OwnerGate>{(r) => <Book r={r} />}</OwnerGate>;
}
