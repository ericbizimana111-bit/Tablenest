import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Receipt, Store, Users, Wallet } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatMoney, timeAgo } from '@/lib/format';
import { DashHead, Panel, Stat } from '@/layouts/DashboardLayout';
import { orderStatusLabel, Badge, EmptyState } from '@/ui/bits';
import { LinkButton } from '@/ui/Button';
import { Skeleton } from '@/ui/Loader';
import type { OrderStatus } from '@/lib/types';

const sum = (o: Record<string, number>) => Object.values(o).reduce((s, n) => s + n, 0);

function Breakdown({ data, label }: { data: Record<string, number>; label?: (k: string) => string }) {
  const total = sum(data) || 1;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <p className="py-6 text-center text-sm text-ink-3">Nothing yet.</p>;
  return (
    <ul className="space-y-3">
      {entries.map(([k, n]) => (
        <li key={k}>
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-ink capitalize">{label ? label(k) : k.replace(/_/g, ' ')}</span>
            <span className="text-ink-3 tabular-nums">{n}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-paper-2">
            <div className="h-full rounded-full bg-herb-600" style={{ width: `${(n / total) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminOverview() {
  const stats = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.stats, refetchInterval: 60_000 });
  const pending = useQuery({ queryKey: ['admin', 'restaurants', 'pending-list'], queryFn: () => adminApi.restaurants({ status: 'pending' }) });
  const s = stats.data;
  const money = (n: number) => formatMoney(n, s?.platformRevenueThisMonth.currency);

  return (
    <>
      <DashHead title="Platform" lead="The health of TableNest at a glance." />
      {!s ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat tone="dark" label="Our revenue this month" value={money(s.platformRevenueThisMonth.total)} hint={`${money(s.platformRevenueThisMonth.collected)} collected · ${money(s.platformRevenueThisMonth.outstanding)} outstanding`} icon={<Wallet className="size-4" />} />
            <Stat label="Completed order value" value={money(s.grossMerchandiseValue)} hint="All-time, delivered orders" icon={<Receipt className="size-4" />} />
            <Stat label="Last 24 hours" value={s.ordersLast24h} hint={`orders · ${s.reservationsLast24h} bookings`} icon={<CalendarDays className="size-4" />} />
            <Stat label="People" value={sum(s.users)} hint={`${s.users.customer ?? 0} guests · ${s.users.owner ?? 0} owners`} icon={<Users className="size-4" />} />
          </div>

          <Panel
            title={
              <span className="flex items-center gap-2">
                Waiting for approval {!!pending.data?.total && <Badge tone="saffron">{pending.data.total}</Badge>}
              </span>
            }
            pad={false}
            action={
              <Link to="/admin/restaurants?status=pending" className="inline-flex items-center gap-1 text-sm font-semibold text-herb-700">
                Review all <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            {pending.data?.items.length ? (
              <ul className="divide-y divide-line">
                {pending.data.items.slice(0, 5).map((r) => (
                  <li key={r._id} className="flex items-center gap-3 px-5 py-3">
                    <Store className="size-4 text-ink-4" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                      <p className="text-[12px] text-ink-3">
                        {r.cuisineType} · {r.city || r.address} · applied {r.createdAt ? timeAgo(r.createdAt) : ''}
                      </p>
                    </div>
                    <LinkButton to="/admin/restaurants?status=pending" size="sm" variant="soft">
                      Review
                    </LinkButton>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState className="m-5 border-0" icon={<Store className="size-6" />} title="All caught up" body="No restaurants waiting for review." />
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Restaurants">
              <Breakdown data={s.restaurants} />
            </Panel>
            <Panel title="Orders by status">
              <Breakdown data={s.orders} label={(k) => orderStatusLabel(k as OrderStatus)} />
            </Panel>
            <Panel title="Accounts">
              <Breakdown data={s.users} />
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
