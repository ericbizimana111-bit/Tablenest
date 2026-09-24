import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, Pencil, Star, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { reservationApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, formatBookingDate, formatTime, isoDay } from '@/lib/format';
import type { Reservation } from '@/lib/types';
import { PageHead } from '@/layouts/AccountLayout';
import { ReviewDialog } from '@/components/ReviewDialog';
import { Button, LinkButton } from '@/ui/Button';
import { BookingStatusBadge, EmptyState, Photo, QtyStepper, Segmented } from '@/ui/bits';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

function Reschedule({ booking, onClose }: { booking: Reservation; onClose: () => void }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(booking.date.slice(0, 10) < isoDay(0) ? isoDay(0) : booking.date.slice(0, 10));
  const [guests, setGuests] = useState(booking.guests);
  const [time, setTime] = useState<string | null>(null);
  const slots = useQuery({ queryKey: ['availability', booking.restaurantId, date, guests], queryFn: () => reservationApi.availability(booking.restaurantId, date, guests) });
  const save = useMutation({
    mutationFn: () => reservationApi.update(booking._id, { date, time: time!, guests }),
    onSuccess: () => {
      toast.success('Booking moved — the restaurant will re-confirm');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title="Change booking"
      description={booking.restaurantName ?? undefined}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Keep as is
          </Button>
          <Button variant="primary" disabled={!time} loading={save.isPending} onClick={() => save.mutate()}>
            Move booking
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {Array.from({ length: 14 }, (_, i) => isoDay(i)).map((d) => (
            <button key={d} onClick={() => (setDate(d), setTime(null))} className={cn('h-14 w-14 shrink-0 rounded-2xl border text-center', d === date ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card')}>
              <span className="block text-[10px] font-semibold uppercase opacity-70">{new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="font-display text-lg">{new Date(`${d}T12:00:00`).getDate()}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-paper p-3">
          <span className="text-sm font-semibold text-ink">Guests</span>
          <QtyStepper value={guests} min={1} max={20} onChange={(v) => (setGuests(v), setTime(null))} label="Guests" />
        </div>
        {slots.isLoading ? (
          <Skeleton className="h-24" />
        ) : !slots.data?.slots.some((s) => s.available) ? (
          <p className="rounded-2xl bg-paper-2 p-4 text-sm text-ink-3">{slots.data?.closed ? 'Closed that day.' : 'No free times that day.'}</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.data.slots
              .filter((s) => s.available)
              .map((s) => (
                <button key={s.time} onClick={() => setTime(s.time)} className={cn('h-10 rounded-xl border text-sm font-semibold', time === s.time ? 'border-tomato-500 bg-tomato-500 text-white' : 'border-line bg-card hover:border-herb-500')}>
                  {formatTime(s.time)}
                </button>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Bookings() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState<Reservation | null>(null);
  const [reviewing, setReviewing] = useState<Reservation | null>(null);
  const [reason, setReason] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['my-bookings'], queryFn: reservationApi.mine, refetchInterval: 30_000 });
  const cancel = useMutation({
    mutationFn: (b: Reservation) => reservationApi.cancel(b._id, reason.trim() || undefined),
    onSuccess: () => {
      toast.success('Booking cancelled');
      setCancelling(null);
      setReason('');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const today = isoDay(0);
  const all = data ?? [];
  const upcoming = all.filter((b) => ['pending', 'confirmed', 'arrived'].includes(b.status) && b.date.slice(0, 10) >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = all.filter((b) => !upcoming.includes(b));
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div>
      <PageHead
        eyebrow="Your tables"
        title="Bookings"
        action={<Segmented id="bk" value={tab} onChange={setTab} options={[{ value: 'upcoming', label: `Upcoming${upcoming.length ? ` · ${upcoming.length}` : ''}` }, { value: 'past', label: 'Past' }]} />}
      />
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : !list.length ? (
        <EmptyState
          icon={<CalendarDays className="size-6" />}
          title={tab === 'upcoming' ? 'No tables booked' : 'No past bookings'}
          body="Pick a restaurant and a free time — it takes under a minute."
          action={<LinkButton to="/restaurants?service=dine_in">Find a table</LinkButton>}
        />
      ) : (
        <ul className="space-y-4">
          {list.map((b) => {
            const canChange = ['pending', 'confirmed'].includes(b.status);
            return (
              <li key={b._id} className="flex overflow-hidden rounded-[24px] border border-line bg-card">
                <div className={cn('flex w-24 shrink-0 flex-col items-center justify-center border-r-[1.5px] border-dashed border-line-2 py-5 sm:w-28', canChange ? 'bg-herb-900 text-paper' : 'bg-paper-2 text-ink-2')}>
                  <span className={cn('text-[11px] font-semibold uppercase', canChange ? 'text-saffron-300' : 'text-ink-4')}>{formatBookingDate(b.date, { month: 'short' })}</span>
                  <span className="font-display text-4xl leading-none">{new Date(b.date).getUTCDate()}</span>
                  <span className="mt-0.5 text-[12px] opacity-70">{formatBookingDate(b.date, { weekday: 'short' })}</span>
                </div>
                <div className="min-w-0 flex-1 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/restaurants/${b.restaurantId}`} className="font-display text-xl text-ink hover:underline">
                      {b.restaurantName}
                    </Link>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" /> {formatTime(b.time)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" /> {b.guests}
                    </span>
                    {b.tableNumber && <span>Table {b.tableNumber}</span>}
                    {b.bookingRef && <span className="font-mono text-[12.5px]">{b.bookingRef}</span>}
                  </p>
                  {b.cancelReason && b.status === 'cancelled' && <p className="mt-2 text-[13px] text-tomato-600">{b.cancelReason}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canChange && (
                      <>
                        <Button size="sm" variant="outline" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(b)}>
                          Change
                        </Button>
                        <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={() => setCancelling(b)}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {b.status === 'completed' && (
                      <Button size="sm" variant="soft" icon={<Star className="size-3.5" />} onClick={() => setReviewing(b)}>
                        Review your visit
                      </Button>
                    )}
                  </div>
                </div>
                <Photo src={b.restaurantImage} alt="" label={b.restaurantName || ''} className="hidden w-40 shrink-0 md:block" />
              </li>
            );
          })}
        </ul>
      )}

      {editing && <Reschedule booking={editing} onClose={() => setEditing(null)} />}
      <Confirm
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && cancel.mutate(cancelling)}
        loading={cancel.isPending}
        title="Cancel this booking?"
        body={cancelling ? `${cancelling.restaurantName} · ${formatBookingDate(cancelling.date)} at ${formatTime(cancelling.time)}. The table is released for other guests.` : ''}
        confirmLabel="Cancel booking"
      >
        <input value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))} placeholder="Reason (optional)" className="input-base mt-4" />
      </Confirm>
      <ReviewDialog open={!!reviewing} onClose={() => setReviewing(null)} target={reviewing && { reservationId: reviewing._id, restaurantName: reviewing.restaurantName }} />
    </div>
  );
}
