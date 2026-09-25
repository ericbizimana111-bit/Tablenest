import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Armchair, Bike, ChefHat, Clock, MapPin, Phone, ShoppingBag, StickyNote, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, formatDateTime, timeAgo } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import { useNow } from '@/lib/useNow';
import type { Order, OrderStatus } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button } from '@/ui/Button';
import { EmptyState, OrderStatusBadge, Segmented } from '@/ui/bits';
import { Confirm } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const COLUMNS: Array<{ status: OrderStatus; title: string; hint: string }> = [
  { status: 'placed', title: 'New', hint: 'Accept or decline' },
  { status: 'confirmed', title: 'Accepted', hint: 'Fire when ready' },
  { status: 'preparing', title: 'On the stove', hint: 'Cooking now' },
  { status: 'ready', title: 'On the pass', hint: 'Hand over or send out' },
  { status: 'out_for_delivery', title: 'On the road', hint: 'With the rider' },
];

/** The single forward move for an order, matching the backend's ORDER_FLOW. */
function nextStep(o: Order): { to: OrderStatus; label: string } | null {
  switch (o.status) {
    case 'placed':
      return { to: 'confirmed', label: 'Accept' };
    case 'confirmed':
      return { to: 'preparing', label: 'Start cooking' };
    case 'preparing':
      return { to: 'ready', label: 'Mark ready' };
    case 'ready':
      return o.orderType === 'delivery' ? { to: 'out_for_delivery', label: 'Send out' } : { to: 'delivered', label: o.orderType === 'dine_in' ? 'Served' : 'Collected' };
    case 'out_for_delivery':
      return { to: 'delivered', label: 'Delivered' };
    default:
      return null;
  }
}

const TYPE_ICON = { delivery: Bike, pickup: ShoppingBag, dine_in: Armchair };

function Ticket({ o, onMove, onCancel, busy }: { o: Order; onMove: (s: OrderStatus) => void; onCancel: () => void; busy: boolean }) {
  const money = useMoney();
  const next = nextStep(o);
  const Icon = TYPE_ICON[o.orderType];
  const now = useNow();
  const mins = Math.floor((now - new Date(o.createdAt).getTime()) / 60000);
  const late = o.status === 'placed' ? mins >= 5 : mins >= 40;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="relative rounded-[18px] border border-line bg-card shadow-[0_1px_0_rgba(28,26,21,0.04)]"
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <div>
          <p className="font-mono text-[13px] font-bold text-ink">#{o.orderNumber}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-3">{o.customerName || 'Guest'}</p>
        </div>
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold', late ? 'bg-tomato-50 text-tomato-600' : 'bg-paper-2 text-ink-3')}>
          <Clock className="size-3" /> {mins < 1 ? 'now' : `${mins}m`}
        </span>
      </div>
      <p className="mt-2 flex items-center gap-1.5 px-4 text-[12.5px] font-semibold text-herb-700">
        <Icon className="size-3.5" />
        {o.orderType === 'delivery' ? 'Delivery' : o.orderType === 'pickup' ? 'Pickup' : `Dine in${o.tableNumber ? ` · table ${o.tableNumber}` : ''}`}
      </p>
      <ul className="mx-4 mt-3 space-y-1 border-y border-dashed border-line-2 py-3">
        {o.items.map((i, k) => (
          <li key={k} className="text-[13.5px] text-ink">
            <span className="font-bold tabular-nums">{i.quantity}×</span> {i.name}
            {i.notes && <span className="block pl-5 text-[12px] text-saffron-700">{i.notes}</span>}
          </li>
        ))}
      </ul>
      {(o.notes || o.deliveryAddress || o.customerPhone) && (
        <div className="space-y-1 px-4 pt-3 text-[12.5px] text-ink-3">
          {o.notes && (
            <p className="flex gap-1.5">
              <StickyNote className="mt-0.5 size-3.5 shrink-0 text-saffron-600" /> {o.notes}
            </p>
          )}
          {o.orderType === 'delivery' && o.deliveryAddress && (
            <p className="flex gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0" /> {o.deliveryAddress}
            </p>
          )}
          {o.customerPhone && (
            <a href={`tel:${o.customerPhone}`} className="flex gap-1.5 hover:text-ink">
              <Phone className="mt-0.5 size-3.5 shrink-0" /> {o.customerPhone}
            </a>
          )}
        </div>
      )}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-[12px] text-ink-4">{o.paymentStatus === 'paid' ? 'Paid' : 'Pay on handover'}</span>
        <span className="font-display text-lg tabular-nums text-ink">{money(o.total, o.currency)}</span>
      </div>
      <div className="flex gap-2 p-4">
        {next && (
          <Button size="sm" variant={o.status === 'placed' ? 'primary' : 'dark'} className="flex-1" loading={busy} onClick={() => onMove(next.to)}>
            {next.label}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onCancel} aria-label={o.status === 'placed' ? 'Decline order' : 'Cancel order'} icon={<X className="size-4" />}>
          {o.status === 'placed' ? 'Decline' : ''}
        </Button>
      </div>
    </motion.article>
  );
}

function Board() {
  const qc = useQueryClient();
  const [cancelling, setCancelling] = useState<Order | null>(null);
  const [reason, setReason] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['owner', 'orders', 'active'],
    queryFn: () => orderApi.kitchen({ status: 'active', limit: 100 }),
    refetchInterval: 15_000,
  });
  const move = useMutation({
    mutationFn: (v: { id: string; status: OrderStatus; note?: string }) => orderApi.setStatus(v.id, v.status, v.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner'] });
      setCancelling(null);
      setReason('');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const orders = data?.orders ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {COLUMNS.map((c) => (
          <Skeleton key={c.status} className="h-80" />
        ))}
      </div>
    );
  }
  if (!orders.length) {
    return <EmptyState icon={<ChefHat className="size-6" />} title="The pass is clear" body="New orders appear here within seconds. This page refreshes itself, so you can leave it open on a kitchen tablet." />;
  }
  return (
    <>
      <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {COLUMNS.map((c) => {
          const list = orders.filter((o) => o.status === c.status);
          if (c.status === 'out_for_delivery' && !list.length) return null;
          return (
            <section key={c.status} className="w-[290px] shrink-0 snap-start rounded-[22px] bg-paper-2/70 p-3 xl:w-auto xl:flex-1">
              <header className="mb-3 flex items-baseline justify-between px-1">
                <div>
                  <h2 className="font-display text-lg text-ink">{c.title}</h2>
                  <p className="text-[12px] text-ink-4">{c.hint}</p>
                </div>
                <span className={cn('grid min-w-7 place-items-center rounded-full px-2 text-[13px] leading-7 font-bold', c.status === 'placed' && list.length ? 'bg-tomato-500 text-white' : 'bg-card text-ink-3')}>{list.length}</span>
              </header>
              <div className="space-y-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {list.map((o) => (
                    <Ticket key={o._id} o={o} busy={move.isPending && move.variables?.id === o._id} onMove={(s) => move.mutate({ id: o._id, status: s })} onCancel={() => setCancelling(o)} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          );
        })}
      </div>
      <Confirm
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && move.mutate({ id: cancelling._id, status: 'cancelled', note: reason.trim() || undefined })}
        loading={move.isPending}
        title={cancelling?.status === 'placed' ? `Decline order #${cancelling?.orderNumber}?` : `Cancel order #${cancelling?.orderNumber}?`}
        body="The guest is notified straight away."
        confirmLabel={cancelling?.status === 'placed' ? 'Decline order' : 'Cancel order'}
      >
        <label className="mt-4 block text-sm font-semibold text-ink-2">
          Reason for the guest <span className="font-normal text-ink-4">(optional)</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} className="input-base mt-1.5" placeholder="e.g. Kitchen closing early tonight" />
        </label>
      </Confirm>
    </>
  );
}

function History() {
  const money = useMoney();
  const q = useInfiniteQuery({
    queryKey: ['owner', 'orders', 'past'],
    queryFn: ({ pageParam }) => orderApi.kitchen({ status: 'past', page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (l) => (l.page < l.pages ? l.page + 1 : undefined),
  });
  const orders = q.data?.pages.flatMap((p) => p.orders) ?? [];
  if (q.isLoading) return <Skeleton className="h-64" />;
  if (!orders.length) return <EmptyState icon={<ChefHat className="size-6" />} title="No finished orders yet" body="Completed and cancelled orders are kept here for your records." />;
  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-paper text-[12px] tracking-wide text-ink-3 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Guest</th>
              <th className="px-5 py-3 font-semibold">Items</th>
              <th className="px-5 py-3 font-semibold">When</th>
              <th className="px-5 py-3 text-right font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-paper/60">
                <td className="px-5 py-3 font-mono font-semibold">#{o.orderNumber}</td>
                <td className="px-5 py-3">{o.customerName || 'Guest'}</td>
                <td className="max-w-[260px] truncate px-5 py-3 text-ink-3">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</td>
                <td className="px-5 py-3 text-ink-3" title={formatDateTime(o.createdAt)}>
                  {timeAgo(o.createdAt)}
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{money(o.total, o.currency)}</td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {q.hasNextPage && (
        <div className="border-t border-line p-4 text-center">
          <Button variant="outline" size="sm" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
            Load older orders
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OwnerOrders() {
  const [tab, setTab] = useState<'live' | 'past'>('live');
  return (
    <OwnerGate>
      {() => (
        <>
          <DashHead
            title="Orders"
            lead={tab === 'live' ? 'Live board — refreshes every 15 seconds. Move each ticket along as the kitchen works.' : 'Every completed and cancelled order.'}
            action={
              <Segmented
                id="owner-orders"
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'live', label: 'Live board' },
                  { value: 'past', label: 'History' },
                ]}
              />
            }
          />
          {tab === 'live' ? <Board /> : <History />}
        </>
      )}
    </OwnerGate>
  );
}
