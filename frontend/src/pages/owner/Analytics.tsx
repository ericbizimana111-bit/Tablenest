import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Repeat, ShoppingBag, Users, Wallet } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { axisTick, chartTooltip, gridStroke, PALETTE } from '@/lib/chart';
import { cn } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { Restaurant } from '@/lib/types';
import { DashHead, Panel, Stat } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { bookingStatusLabel, Segmented } from '@/ui/bits';
import { Skeleton } from '@/ui/Loader';

const TYPE_LABEL = { delivery: 'Delivery', pickup: 'Pickup', dine_in: 'Dine in' } as const;
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Heatmap({ r }: { r: Restaurant }) {
  const { data } = useQuery({ queryKey: ['owner', 'heatmap', r._id], queryFn: () => analyticsApi.heatmap(r._id) });
  const cells = data ?? [];
  const hours = cells.length ? Array.from(new Set(cells.map((c) => c.hour))).sort((a, b) => a - b) : [];
  const span = hours.length ? Array.from({ length: hours[hours.length - 1] - hours[0] + 1 }, (_, i) => hours[0] + i) : [];
  const max = Math.max(1, ...cells.map((c) => c.count));
  const at = (d: number, h: number) => cells.find((c) => c.day === d + 1 && c.hour === h)?.count ?? 0;

  return (
    <Panel title="When guests book">
      {!span.length ? (
        <p className="py-10 text-center text-sm text-ink-3">Your busiest days and hours will appear once bookings come in.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1 text-[11px]">
            <thead>
              <tr>
                <th />
                {span.map((h) => (
                  <th key={h} className="w-8 font-medium text-ink-4">
                    {String(h).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEK.map((d, di) => (
                <tr key={d}>
                  <th className="pr-2 text-left font-semibold text-ink-3">{d}</th>
                  {span.map((h) => {
                    const v = at(di, h);
                    return (
                      <td key={h} title={`${d} ${h}:00 — ${v} bookings`} className="size-8 rounded-md" style={{ background: v ? `rgba(29, 74, 55, ${0.12 + (v / max) * 0.88})` : '#efe6d6' }}>
                        {v > 0 && <span className={cn('block text-center font-semibold', v / max > 0.5 ? 'text-paper' : 'text-herb-900')}>{v}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function Charts({ r }: { r: Restaurant }) {
  const money = useMoney();
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'overview', r._id, days], queryFn: () => analyticsApi.overview(r._id, Number(days)), placeholderData: (p) => p });

  return (
    <>
      <DashHead
        title="Analytics"
        lead="Completed orders and real bookings only — cancelled orders never inflate your numbers."
        action={
          <Segmented
            id="an-days"
            value={days}
            onChange={setDays}
            options={[
              { value: '7', label: '7 days' },
              { value: '30', label: '30 days' },
              { value: '90', label: '90 days' },
            ]}
          />
        }
      />
      {isLoading || !data ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat tone="dark" label="Sales" value={money(data.revenue)} hint={`Last ${data.days} days`} icon={<Wallet className="size-4" />} />
            <Stat label="Orders" value={data.orders} hint={`Average ${money(data.averageOrder)}`} icon={<ShoppingBag className="size-4" />} />
            <Stat label="Guests who ordered" value={data.customers} icon={<Users className="size-4" />} />
            <Stat label="Came back" value={`${Math.round(data.repeatRate)}%`} hint="Ordered more than once" icon={<Repeat className="size-4" />} />
          </div>

          <Panel title="Sales by day">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="an-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f6f51" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2f6f51" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={60} />
                  <Tooltip {...chartTooltip} formatter={(v) => [money(Number(v)), 'Sales']} />
                  <Area type="monotone" dataKey="revenue" stroke="#1d4a37" strokeWidth={2.5} fill="url(#an-rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Bookings & covers">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bookingsDaily} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
                    <YAxis tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} />
                    <Tooltip {...chartTooltip} cursor={{ fill: 'rgba(15,42,32,0.05)' }} formatter={(v, n) => [v, n === 'guests' ? 'Guests' : 'Bookings']} />
                    <Bar dataKey="guests" fill="#edb041" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="bookings" fill="#1d4a37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="How guests order">
              {data.orderTypes.length ? (
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="size-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.orderTypes} dataKey="orders" nameKey="type" innerRadius={52} outerRadius={88} paddingAngle={3} stroke="none">
                          {data.orderTypes.map((t, i) => (
                            <Cell key={t.type} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...chartTooltip} formatter={(v, n) => [v, TYPE_LABEL[n as keyof typeof TYPE_LABEL] ?? n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="w-full space-y-3">
                    {data.orderTypes.map((t, i) => (
                      <li key={t.type} className="flex items-center gap-3 text-sm">
                        <span className="size-3 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                        <span className="flex-1 font-semibold text-ink">{TYPE_LABEL[t.type]}</span>
                        <span className="text-ink-3">{t.orders} orders</span>
                        <span className="w-24 text-right font-semibold tabular-nums">{money(t.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-ink-3">No completed orders in this period.</p>
              )}
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Top dishes">
              {data.topItems.length ? (
                <ol className="space-y-3">
                  {data.topItems.map((t, i) => {
                    const top = data.topItems[0].sold || 1;
                    return (
                      <li key={t.name}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-semibold text-ink">
                            <span className="mr-2 font-display text-ink-4">{i + 1}</span>
                            {t.name}
                          </span>
                          <span className="text-ink-3 tabular-nums">
                            {t.sold} · {money(t.revenue)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-paper-2">
                          <div className="h-full rounded-full bg-herb-600" style={{ width: `${(t.sold / top) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="py-10 text-center text-sm text-ink-3">No dishes sold in this period.</p>
              )}
            </Panel>
            <Panel title="Booking outcomes">
              {data.reservationStatus.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {data.reservationStatus.map((s) => (
                    <div key={s.status} className="rounded-2xl bg-paper p-4">
                      <p className="font-display text-3xl text-ink tabular-nums">{s.count}</p>
                      <p className="text-[13px] text-ink-3">{bookingStatusLabel(s.status)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-ink-3">No bookings in this period.</p>
              )}
            </Panel>
          </div>

          <Heatmap r={r} />
        </div>
      )}
    </>
  );
}

export default function OwnerAnalytics() {
  return <OwnerGate>{(r) => <Charts r={r} />}</OwnerGate>;
}
