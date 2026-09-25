import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Armchair, CalendarDays, ChefHat, Star, Wallet } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { formatTime, timeAgo } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { Restaurant } from '@/lib/types';
import { DashHead, Panel, Stat } from '@/layouts/DashboardLayout';
import { OwnerGate, StatusBanner } from '@/components/OwnerGate';
import { BookingStatusBadge, EmptyState, OrderStatusBadge, Photo } from '@/ui/bits';
import { LinkButton } from '@/ui/Button';
import { Skeleton } from '@/ui/Loader';
import { useAuth } from '@/auth/useAuth';
import { axisTick, chartTooltip, gridStroke } from '@/lib/chart';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Body({ r }: { r: Restaurant }) {
  const money = useMoney();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'dashboard', r._id], queryFn: () => analyticsApi.dashboard(r._id), refetchInterval: 60_000 });

  return (
    <>
      <StatusBanner r={r} />
      <DashHead
        title={
          <>
            {greeting()}, <span className="italic text-herb-700">{user?.fullName.split(' ')[0]}</span>
          </>
        }
        lead="Here is how service is going today."
        action={
          <>
            <LinkButton to="/owner/orders" variant="dark" size="sm" icon={<ChefHat className="size-4" />}>
              Open the pass
            </LinkButton>
            <LinkButton to="/owner/reservations" variant="outline" size="sm" icon={<CalendarDays className="size-4" />}>
              Tonight's book
            </LinkButton>
          </>
        }
      />
      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat tone="dark" label="Today's sales" value={money(data.todayRevenue)} hint={`${data.todayOrders} orders · ${money(data.monthRevenue)} this month`} icon={<Wallet className="size-4" />} />
            <Stat label="Waiting to accept" value={data.pendingOrders} hint={data.pendingOrders ? 'Guests are waiting — accept or decline' : 'Nothing waiting'} icon={<ChefHat className="size-4" />} tone={data.pendingOrders ? 'saffron' : 'plain'} />
            <Stat label="Bookings today" value={data.todayReservations} hint={`${data.pendingReservations} awaiting confirmation`} icon={<CalendarDays className="size-4" />} />
            <Stat label="Tables in use" value={`${data.activeTables}/${data.totalTables}`} hint={data.rating ? `Rated ${data.rating.toFixed(1)} from ${data.totalReviews} reviews` : 'No reviews yet'} icon={<Armchair className="size-4" />} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel title="Last 7 days" action={<Link to="/owner/analytics" className="text-sm font-semibold text-herb-700 hover:underline">Full analytics</Link>}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueChart} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2f6f51" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#2f6f51" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
                    <YAxis tickLine={false} axisLine={false} tick={axisTick} width={56} />
                    <Tooltip {...chartTooltip} formatter={(v, n) => (n === 'revenue' ? [money(Number(v)), 'Sales'] : [v, 'Orders'])} />
                    <Area type="monotone" dataKey="revenue" stroke="#1d4a37" strokeWidth={2.5} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Best sellers this month">
              {data.topItems.length ? (
                <ol className="space-y-3">
                  {data.topItems.map((t, i) => (
                    <li key={t.name} className="flex items-center gap-3">
                      <span className="w-5 font-display text-lg text-ink-4">{i + 1}</span>
                      <Photo src={t.image} alt="" className="size-11 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{t.name}</p>
                        <p className="text-[12px] text-ink-3">{t.sold} sold</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-ink">{money(t.revenue)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-8 text-center text-sm text-ink-3">Your first completed orders will rank here.</p>
              )}
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Latest orders" pad={false} action={<Link to="/owner/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-herb-700">All <ArrowRight className="size-3.5" /></Link>}>
              {data.recentOrders.length ? (
                <ul className="divide-y divide-line">
                  {data.recentOrders.map((o) => (
                    <li key={o._id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          #{o.orderNumber} · {o.customerName || 'Guest'}
                        </p>
                        <p className="truncate text-[12px] text-ink-3">
                          {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')} · {timeAgo(o.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{money(o.total, o.currency)}</span>
                      <OrderStatusBadge status={o.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState className="m-5" icon={<ChefHat className="size-6" />} title="No orders yet" body="Share your restaurant page or print table QR codes to get the first ones in." />
              )}
            </Panel>
            <Panel title="Coming up" pad={false} action={<Link to="/owner/reservations" className="inline-flex items-center gap-1 text-sm font-semibold text-herb-700">Book <ArrowRight className="size-3.5" /></Link>}>
              {data.upcomingReservations.length ? (
                <ul className="divide-y divide-line">
                  {data.upcomingReservations.map((b) => (
                    <li key={b._id} className="flex items-center gap-4 px-5 py-3">
                      <div className="w-14 text-center">
                        <p className="font-display text-lg leading-none text-ink">{formatTime(b.time)}</p>
                        <p className="mt-1 text-[11px] text-ink-4">{new Date(b.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' })}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{b.customerName || 'Guest'}</p>
                        <p className="text-[12px] text-ink-3">
                          {b.guests} guests{b.tableNumber ? ` · table ${b.tableNumber}` : ''}
                        </p>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState className="m-5" icon={<Star className="size-6" />} title="The book is open" body="Upcoming reservations will line up here." />
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

export default function OwnerOverview() {
  return <OwnerGate>{(r) => <Body r={r} />}</OwnerGate>;
}
