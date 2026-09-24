import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight, Armchair, Bike, CalendarDays, Check, Gift, Heart, MapPin, Receipt, Sparkles, UtensilsCrossed } from 'lucide-react';
import { loyaltyApi, orderApi, reservationApi, restaurantApi, userApi } from '@/lib/api';
import { cn, formatBookingDate, formatTime } from '@/lib/format';
import { useAuth } from '@/auth/useAuth';
import { useExperience } from '@/stores/experience';
import { useFavorites } from '@/features/favorites';
import { OrderProgress } from '@/components/OrderProgress';
import { RestaurantCard } from '@/components/RestaurantCard';
import { BookingStatusBadge } from '@/ui/bits';
import { LinkButton } from '@/ui/Button';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Home() {
  const { user } = useAuth();
  const ask = useExperience((s) => s.ask);
  const [params] = useSearchParams();
  const { ids: favIds } = useFavorites();
  const active = useQuery({ queryKey: ['my-orders', 'active'], queryFn: () => orderApi.mine({ status: 'active', limit: 3 }), refetchInterval: 20_000 });
  const anyOrder = useQuery({ queryKey: ['my-orders', 'any'], queryFn: () => orderApi.mine({ limit: 1 }) });
  const bookings = useQuery({ queryKey: ['my-bookings'], queryFn: reservationApi.mine });
  const loyalty = useQuery({ queryKey: ['loyalty'], queryFn: loyaltyApi.get });
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: userApi.addresses });
  const picks = useQuery({ queryKey: ['featured', 3], queryFn: () => restaurantApi.featured(3) });

  const today = new Date().toISOString().slice(0, 10);
  const next = (bookings.data ?? [])
    .filter((b) => ['pending', 'confirmed'].includes(b.status) && b.date.slice(0, 10) >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  const checklist = [
    { done: true, label: 'Create your account', to: '/settings' },
    { done: favIds.size > 0, label: 'Save a restaurant you like', to: '/restaurants' },
    { done: (bookings.data?.length ?? 0) > 0, label: 'Book your first table', to: '/restaurants?service=dine_in' },
    { done: (anyOrder.data?.total ?? 0) > 0, label: 'Place your first order', to: '/restaurants?service=delivery' },
    { done: (addresses.data?.addresses.length ?? 0) > 0, label: 'Save a delivery address', to: '/settings/addresses' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const loaded = bookings.isSuccess && anyOrder.isSuccess && addresses.isSuccess;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">{params.get('welcome') ? 'Welcome to TableNest' : 'My table'}</p>
        <h1 className="mt-3 text-[38px] leading-tight text-ink sm:text-[46px]">
          {greeting()}, <span className="italic text-herb-700">{user?.fullName.split(' ')[0]}</span>.
        </h1>
        <p className="mt-2 text-ink-3">What are we eating?</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <LinkButton to="/restaurants?service=dine_in" variant="dark" icon={<Armchair className="size-4" />}>
            Book a table
          </LinkButton>
          <LinkButton to="/restaurants?service=delivery" variant="outline" icon={<Bike className="size-4" />}>
            Order food
          </LinkButton>
          <button onClick={() => ask('')} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-herb-700 hover:bg-herb-50">
            <Sparkles className="size-4" /> Ask the concierge
          </button>
        </div>
      </div>

      {!!active.data?.orders.length && (
        <section className="space-y-3">
          {active.data.orders.map((o) => (
            <Link key={o._id} to={`/my-orders/${o._id}/track`} className="block rounded-[24px] border border-herb-200 bg-card p-5 transition hover:shadow-[var(--shadow-card)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-herb-600">
                    <span className="size-2 animate-pulse-dot rounded-full bg-herb-500 text-herb-500/60" /> Live order · {o.orderNumber}
                  </p>
                  <p className="mt-1 font-display text-xl text-ink">{o.restaurantName}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-herb-700">
                  Track <ArrowRight className="size-4" />
                </span>
              </div>
              <OrderProgress order={o} compact />
            </Link>
          ))}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[24px] border border-line bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-ink">Next table</h2>
            <Link to="/my-bookings" className="text-[13px] font-semibold text-herb-700 hover:underline">
              All bookings
            </Link>
          </div>
          {next ? (
            <div className="mt-5 flex gap-4">
              <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-herb-900 py-3 text-paper">
                <span className="text-[11px] font-semibold text-saffron-300 uppercase">{formatBookingDate(next.date, { month: 'short' })}</span>
                <span className="font-display text-4xl leading-none">{new Date(next.date).getUTCDate()}</span>
                <span className="text-[11px] text-paper/70">{formatBookingDate(next.date, { weekday: 'short' })}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-xl text-ink">{next.restaurantName}</p>
                <p className="mt-1 text-sm text-ink-3">
                  {formatTime(next.time)} · {next.guests} {next.guests === 1 ? 'guest' : 'guests'}
                </p>
                <div className="mt-2">
                  <BookingStatusBadge status={next.status} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-paper p-4">
              <CalendarDays className="size-8 text-line-2" />
              <p className="text-sm text-ink-3">
                Nothing booked yet.{' '}
                <Link to="/restaurants?service=dine_in" className="font-semibold text-herb-700 underline">
                  Find a table
                </Link>
              </p>
            </div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-[24px] bg-herb-900 p-6 text-paper">
          <Gift className="absolute -right-4 -bottom-4 size-32 text-paper/5" />
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Rewards</h2>
            <Link to="/rewards" className="text-[13px] font-semibold text-saffron-300 hover:underline">
              Redeem
            </Link>
          </div>
          <p className="mt-4 font-display text-5xl text-saffron-300 tabular-nums">{loyalty.data?.points ?? '—'}</p>
          <p className="text-sm text-paper/70">points · {loyalty.data?.tier ?? '…'} member</p>
          {loyalty.data?.nextTier && (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-paper/10">
                <motion.div className="h-full rounded-full bg-saffron-400" initial={{ width: 0 }} animate={{ width: `${loyalty.data.tierProgress}%` }} transition={{ duration: 1.2 }} />
              </div>
              <p className="mt-2 text-[12.5px] text-paper/60">
                {loyalty.data.nextTier.pointsNeeded} points to {loyalty.data.nextTier.name}
              </p>
            </div>
          )}
        </section>
      </div>

      {loaded && doneCount < checklist.length && (
        <section className="rounded-[24px] border border-line bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl text-ink">Getting settled in</h2>
              <p className="text-sm text-ink-3">
                {doneCount} of {checklist.length} done — each one makes the next visit faster.
              </p>
            </div>
            <div className="relative size-14">
              <svg viewBox="0 0 36 36" className="size-14 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="4" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="var(--color-herb-600)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={94.2}
                  initial={{ strokeDashoffset: 94.2 }}
                  animate={{ strokeDashoffset: 94.2 * (1 - doneCount / checklist.length) }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-sm font-bold text-ink">{Math.round((doneCount / checklist.length) * 100)}%</span>
            </div>
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link to={c.to} className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3 transition', c.done ? 'border-transparent bg-herb-50 text-herb-700' : 'border-line hover:border-herb-500')}>
                  <span className={cn('grid size-6 place-items-center rounded-full', c.done ? 'bg-herb-600 text-white' : 'border-2 border-line-2')}>{c.done && <Check className="size-3.5" />}</span>
                  <span className={cn('text-sm font-semibold', c.done ? 'line-through decoration-herb-300' : 'text-ink')}>{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { to: '/my-orders', icon: Receipt, label: 'Orders', sub: anyOrder.data ? `${anyOrder.data.total} total` : '' },
          { to: '/my-bookings', icon: CalendarDays, label: 'Bookings', sub: bookings.data ? `${bookings.data.length} total` : '' },
          { to: '/favorites', icon: Heart, label: 'Favourites', sub: `${favIds.size} saved` },
          { to: '/settings/addresses', icon: MapPin, label: 'Addresses', sub: addresses.data ? `${addresses.data.addresses.length} saved` : '' },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="group rounded-[20px] border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
            <q.icon className="size-5 text-herb-600 transition group-hover:-rotate-6" />
            <p className="mt-3 font-semibold text-ink">{q.label}</p>
            <p className="text-[12.5px] text-ink-3">{q.sub}</p>
          </Link>
        ))}
      </div>

      {!!picks.data?.restaurants.length && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl text-ink">You might like</h2>
            <Link to="/restaurants" className="text-[13px] font-semibold text-herb-700 hover:underline">
              Browse all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {picks.data.restaurants.map((r, i) => (
              <RestaurantCard key={r._id} restaurant={r} index={i} />
            ))}
          </div>
        </section>
      )}
      {(anyOrder.data?.total ?? 0) === 0 && (bookings.data?.length ?? 0) === 0 && loaded && (
        <p className="flex items-center gap-2 text-sm text-ink-3">
          <UtensilsCrossed className="size-4" /> Your orders and bookings will appear here.
        </p>
      )}
    </div>
  );
}
