import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarCheck, Clock, Moon, Sun, Sunrise, Users } from 'lucide-react';
import { reservationApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, formatBookingDate, formatTime, isoDay } from '@/lib/format';
import type { Reservation, Restaurant } from '@/lib/types';
import { useAuth } from '@/auth/useAuth';
import { bookingIntent } from '@/stores/intent';
import { Button, LinkButton } from '@/ui/Button';
import { EmptyState, QtyStepper } from '@/ui/bits';
import { Input, Textarea } from '@/ui/Field';
import { Skeleton } from '@/ui/Loader';

const MEALS = [
  { key: 'morning', label: 'Morning', icon: Sunrise, test: (m: number) => m < 11 * 60 },
  { key: 'lunch', label: 'Lunch', icon: Sun, test: (m: number) => m >= 11 * 60 && m < 16 * 60 },
  { key: 'dinner', label: 'Evening', icon: Moon, test: (m: number) => m >= 16 * 60 },
];

/** The moment of booking: a place card drops onto the table. */
function Reserved({ booking, restaurant, onAnother }: { booking: Reservation; restaurant: Restaurant; onAnother: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-6 text-center">
      <div className="relative mx-auto h-48 w-full max-w-sm">
        {/* table edge */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6 }} className="absolute inset-x-0 bottom-6 h-3 rounded-full bg-herb-900/90" />
        <motion.div
          initial={{ y: -140, rotate: -18, opacity: 0 }}
          animate={{ y: 0, rotate: -3, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.2 }}
          className="absolute bottom-9 left-1/2 w-64 -translate-x-1/2"
        >
          <div className="relative rounded-[14px] border border-line bg-card px-6 pt-5 pb-4 shadow-[var(--shadow-lift)]">
            <div className="absolute top-2 left-1/2 h-px w-3/4 -translate-x-1/2 bg-line" />
            <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-4 uppercase">Reserved</p>
            <p className="mt-1 font-display text-2xl text-ink italic">{booking.customerName?.split(' ')[0] || 'For you'}</p>
            <p className="mt-1 text-[13px] text-ink-3">
              {formatBookingDate(booking.date)} · {formatTime(booking.time)} · {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <h3 className="text-[30px] leading-tight text-ink">Table requested</h3>
        <p className="mt-2 text-ink-3">
          {restaurant.name} will confirm shortly — we'll let you know the moment they do.
          {booking.tableNumber && ` Table ${booking.tableNumber} is being held for you.`}
        </p>
        <p className="mt-4 inline-block rounded-full bg-paper-2 px-4 py-1.5 font-mono text-sm font-semibold text-ink-2">Ref {booking.bookingRef}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <LinkButton to="/my-bookings" variant="dark">
            See my bookings
          </LinkButton>
          <Button variant="outline" onClick={onAnother}>
            Book another time
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function BookTab({ restaurant }: { restaurant: Restaurant }) {
  const intent = useMemo(() => bookingIntent.get(), []);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [date, setDate] = useState(intent.date && intent.date >= isoDay(0) ? intent.date : isoDay(0));
  const [guests, setGuests] = useState(intent.guests || 2);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [done, setDone] = useState<Reservation | null>(null);

  const days = Array.from({ length: 21 }, (_, i) => isoDay(i));
  const availability = useQuery({
    queryKey: ['availability', restaurant._id, date, guests],
    queryFn: () => reservationApi.availability(restaurant._id, date, guests),
    enabled: restaurant.dineIn,
  });

  const book = useMutation({
    mutationFn: () => reservationApi.create({ restaurantId: restaurant._id, date, time: time!, guests, notes: notes.trim() || undefined, phone: phone.trim() || undefined }),
    onSuccess: (r) => {
      setDone(r);
      qc.invalidateQueries({ queryKey: ['availability', restaurant._id] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: () => qc.invalidateQueries({ queryKey: ['availability', restaurant._id, date, guests] }),
  });

  if (!restaurant.dineIn) {
    return <EmptyState icon={<CalendarCheck className="size-6" />} title="Takeaway and delivery only" body={`${restaurant.name} doesn't take table reservations, but you can order from the menu.`} />;
  }
  if (done) return <Reserved booking={done} restaurant={restaurant} onAnother={() => (setDone(null), setTime(null), book.reset())} />;

  const slots = availability.data?.slots ?? [];
  const free = slots.filter((s) => s.available).length;
  const signInFirst = () => {
    bookingIntent.set({ date, guests });
    navigate(`/login?next=${encodeURIComponent(location.pathname + '?tab=book')}`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">When?</h3>
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {days.map((d, i) => {
              const dt = new Date(`${d}T12:00:00`);
              const active = d === date;
              return (
                <button
                  key={d}
                  onClick={() => (setDate(d), setTime(null))}
                  aria-pressed={active}
                  className={cn(
                    'flex w-[64px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition',
                    active ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card text-ink-2 hover:border-line-2',
                  )}
                >
                  <span className={cn('text-[11px] font-semibold uppercase', active ? 'text-saffron-300' : 'text-ink-4')}>
                    {i === 0 ? 'Today' : dt.toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className="font-display text-2xl leading-tight">{dt.getDate()}</span>
                  <span className="text-[11px]">{dt.toLocaleDateString(undefined, { month: 'short' })}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-paper-2 text-herb-700">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Party size</p>
              <p className="text-[12.5px] text-ink-3">For more than 20, call the restaurant.</p>
            </div>
          </div>
          <QtyStepper value={guests} min={1} max={20} onChange={(v) => (setGuests(v), setTime(null))} label="Guests" />
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-ink">What time?</h3>
            {!availability.isLoading && !availability.data?.closed && <span className="text-[12.5px] text-ink-3">{free} free times</span>}
          </div>
          {availability.isLoading ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 12 }, (_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : availability.data?.closed ? (
            <p className="rounded-2xl bg-paper-2 p-5 text-sm text-ink-3">Closed on {formatBookingDate(date, { weekday: 'long' })}. Try another day.</p>
          ) : free === 0 ? (
            <p className="rounded-2xl bg-paper-2 p-5 text-sm text-ink-3">No tables left for {guests} on this day. Try another day or a smaller party.</p>
          ) : (
            <div className="space-y-5">
              {MEALS.map((meal) => {
                const inMeal = slots.filter((s) => {
                  const [h, m] = s.time.split(':').map(Number);
                  return meal.test(h * 60 + m);
                });
                if (!inMeal.length) return null;
                return (
                  <div key={meal.key}>
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-ink-4 uppercase">
                      <meal.icon className="size-3.5" /> {meal.label}
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {inMeal.map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setTime(s.time)}
                          aria-pressed={time === s.time}
                          className={cn(
                            'h-11 rounded-xl border text-[14px] font-semibold tabular-nums transition',
                            !s.available
                              ? 'cursor-not-allowed border-transparent bg-paper-2/60 text-ink-4 line-through decoration-ink-4/40'
                              : time === s.time
                                ? 'scale-[1.04] border-tomato-500 bg-tomato-500 text-white shadow-[0_8px_18px_-10px_rgb(217_71_43/0.9)]'
                                : 'border-line bg-card text-ink hover:-translate-y-0.5 hover:border-herb-500',
                          )}
                        >
                          {formatTime(s.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <aside>
        <div className="sticky top-[150px] rounded-[24px] border border-line bg-card p-5">
          <p className="font-display text-xl text-ink">Your booking</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Date</dt>
              <dd className="font-semibold text-ink">{formatBookingDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Guests</dt>
              <dd className="font-semibold text-ink">{guests}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Time</dt>
              <dd className="font-semibold text-ink">
                <AnimatePresence mode="wait">
                  <motion.span key={time ?? 'none'} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1">
                    {time ? formatTime(time) : <span className="text-ink-4">Pick a time</span>}
                  </motion.span>
                </AnimatePresence>
              </dd>
            </div>
          </dl>
          {user?.role === 'customer' && (
            <div className="mt-5 space-y-3">
              <Input label="Phone" optional value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="So they can reach you" inputMode="tel" />
              <Textarea label="Anything they should know?" optional value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))} placeholder="Birthday, high chair, allergies…" className="[&_textarea]:min-h-20" />
            </div>
          )}
          {book.isError && <p className="mt-4 rounded-xl bg-tomato-50 p-3 text-[13px] text-tomato-700">{errorMessage(book.error)}</p>}
          {!user ? (
            <Button variant="primary" size="lg" block className="mt-5" disabled={!time} onClick={signInFirst}>
              Sign in to book
            </Button>
          ) : user.role !== 'customer' ? (
            <p className="mt-5 rounded-xl bg-paper-2 p-3 text-[13px] text-ink-3">Bookings are made from a diner account.</p>
          ) : (
            <Button variant="primary" size="lg" block className="mt-5" disabled={!time} loading={book.isPending} onClick={() => book.mutate()} icon={<Clock className="size-4" />}>
              {time ? `Request ${formatTime(time)}` : 'Choose a time'}
            </Button>
          )}
          <p className="mt-3 text-center text-[12px] text-ink-4">Free to book. The restaurant confirms your table.</p>
          <p className="mt-2 text-center text-[12px] text-ink-4">
            Changed your mind later? <Link to="/my-bookings" className="underline">Manage bookings</Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
