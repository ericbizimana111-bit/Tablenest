import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Clock, LifeBuoy, MapPin, PartyPopper, Phone, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { formatDateTime } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import { OrderProgress, stepsFor } from '@/components/OrderProgress';
import { ReviewDialog } from '@/components/ReviewDialog';
import { Button, LinkButton } from '@/ui/Button';
import { EmptyState, OrderStatusBadge } from '@/ui/bits';
import { Confirm } from '@/ui/Overlay';
import { PageLoader } from '@/ui/Loader';

const ACTIVE = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

export default function OrderTracking() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const money = useMoney();
  const qc = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [review, setReview] = useState(false);
  const { data: o, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.one(id),
    // Keep the page live while the kitchen is working on it.
    refetchInterval: (query) => (query.state.data && ACTIVE.includes(query.state.data.status) ? 10_000 : false),
  });
  const cancel = useMutation({
    mutationFn: () => orderApi.cancel(id),
    onSuccess: () => {
      toast.success('Order cancelled');
      setConfirmCancel(false);
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (isLoading) return <PageLoader label="Checking with the kitchen…" />;
  if (!o) return <EmptyState icon={<LifeBuoy className="size-6" />} title="Order not found" body="It may belong to another account." action={<LinkButton to="/my-orders">My orders</LinkButton>} />;

  const steps = stepsFor(o);
  const step = steps.find((s) => s.status === o.status);
  const live = ACTIVE.includes(o.status);
  const eta = o.estimatedDelivery && live ? new Date(o.estimatedDelivery).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : null;

  return (
    <div className="space-y-6">
      <Link to="/my-orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink">
        <ArrowLeft className="size-4" /> All orders
      </Link>

      <AnimatePresence>
        {params.get('placed') && o.status === 'placed' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-[24px] bg-saffron-100 p-5">
            <motion.span initial={{ rotate: -40, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }} className="grid size-12 shrink-0 place-items-center rounded-full bg-saffron-400 text-herb-950">
              <PartyPopper className="size-6" />
            </motion.span>
            <div>
              <p className="font-display text-xl text-ink">Order placed!</p>
              <p className="text-sm text-ink-2">{o.restaurantName} has it now. This page updates by itself.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="rounded-[28px] border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-ink-4 uppercase">
              {o.orderNumber} · {o.orderType.replace('_', ' ')}
            </p>
            <h1 className="mt-2 text-[34px] leading-tight text-ink sm:text-[42px]">
              <AnimatePresence mode="wait">
                <motion.span key={o.status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="block">
                  {o.status === 'cancelled' ? 'Order cancelled' : step?.line}
                </motion.span>
              </AnimatePresence>
            </h1>
            <p className="mt-1 text-ink-3">
              from{' '}
              <Link to={`/restaurants/${o.restaurantId}`} className="font-semibold text-ink hover:underline">
                {o.restaurantName}
              </Link>
            </p>
          </div>
          <div className="text-right">
            <OrderStatusBadge status={o.status} />
            {eta && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-3">
                <Clock className="size-4" /> Expected around <b className="text-ink">{eta}</b>
              </p>
            )}
          </div>
        </div>
        <div className="mt-8">
          <OrderProgress order={o} />
        </div>
        {live && (
          <p className="mt-6 flex items-center gap-2 text-[12.5px] text-ink-4">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-herb-500 text-herb-500/60" /> Live — updates every few seconds
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[24px] border border-line bg-card p-6">
          <h2 className="text-xl text-ink">Receipt</h2>
          <ul className="mt-4 divide-y divide-line">
            {o.items.map((i) => (
              <li key={i.menuItemId} className="flex justify-between gap-3 py-3 text-[15px]">
                <span className="text-ink-2">
                  <b className="font-semibold text-ink">{i.quantity}×</b> {i.name}
                  {i.notes && <span className="block text-[12.5px] text-ink-4">“{i.notes}”</span>}
                </span>
                <span className="font-semibold text-ink tabular-nums">{money(i.price * i.quantity, o.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-dashed border-line-2 pt-4 text-sm">
            {[
              ['Food', o.subtotal],
              o.discount ? [`Discount${o.promoCode ? ` (${o.promoCode})` : ''}`, -o.discount] : null,
              o.deliveryFee ? ['Delivery', o.deliveryFee] : null,
              o.serviceFee ? ['Service fee', o.serviceFee] : null,
              o.tax ? ['Tax', o.tax] : null,
              o.tip ? ['Tip', o.tip] : null,
            ]
              .filter(Boolean)
              .map((row) => (
                <div key={row![0] as string} className="flex justify-between">
                  <dt className="text-ink-3">{row![0]}</dt>
                  <dd className="font-semibold text-ink tabular-nums">{(row![1] as number) < 0 ? `− ${money(-(row![1] as number), o.currency)}` : money(row![1] as number, o.currency)}</dd>
                </div>
              ))}
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-display text-2xl text-ink tabular-nums">{money(o.total, o.currency)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12.5px] text-ink-4">
            {o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'refunded' ? 'Refunded' : 'To pay in person'} · placed {formatDateTime(o.createdAt)}
          </p>
        </section>

        <aside className="space-y-4">
          {o.deliveryAddress && (
            <div className="rounded-[20px] border border-line bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin className="size-4 text-herb-600" /> Delivering to
              </p>
              <p className="mt-1 text-[14px] text-ink-3">{o.deliveryAddress}</p>
            </div>
          )}
          {o.customerPhone && (
            <div className="rounded-[20px] border border-line bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Phone className="size-4 text-herb-600" /> Contact number
              </p>
              <p className="mt-1 text-[14px] text-ink-3">{o.customerPhone}</p>
            </div>
          )}
          {['placed', 'confirmed'].includes(o.status) && (
            <Button variant="danger" block onClick={() => setConfirmCancel(true)}>
              Cancel order
            </Button>
          )}
          {o.status === 'delivered' && !o.reviewed && (
            <Button variant="primary" block icon={<Star className="size-4" />} onClick={() => setReview(true)}>
              Review this order
            </Button>
          )}
          <LinkButton to="/help#contact" variant="ghost" block icon={<LifeBuoy className="size-4" />}>
            Problem with this order?
          </LinkButton>
        </aside>
      </div>

      <Confirm
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancel.mutate()}
        loading={cancel.isPending}
        title="Cancel this order?"
        body="The restaurant will be told straight away. Any voucher you used is returned to you."
        confirmLabel="Cancel order"
      />
      <ReviewDialog open={review} onClose={() => setReview(false)} target={{ orderId: o._id, restaurantName: o.restaurantName }} />
    </div>
  );
}
