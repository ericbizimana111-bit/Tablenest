import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Armchair, Banknote, Bike, Check, CreditCard, LoaderCircle, MapPin, ShoppingBag, Tag, X } from 'lucide-react';
import { orderApi, restaurantApi, userApi, type OrderBody } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, requestKey } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { OrderType } from '@/lib/types';
import { useAuth } from '@/auth/useAuth';
import { cartSubtotal, useCart } from '@/stores/cart';
import { Button, LinkButton } from '@/ui/Button';
import { EmptyState, Photo, QtyStepper } from '@/ui/bits';
import { Input, Textarea } from '@/ui/Field';
import { PageLoader } from '@/ui/Loader';
import { tableIntent } from '@/stores/intent';

const TYPE_META: Record<OrderType, { label: string; body: string; icon: typeof Bike }> = {
  delivery: { label: 'Delivery', body: 'Brought to your door', icon: Bike },
  pickup: { label: 'Pickup', body: 'Collect it yourself', icon: ShoppingBag },
  dine_in: { label: 'Dine in', body: 'Eat at the restaurant', icon: Armchair },
};

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Checkout() {
  const { user } = useAuth();
  const money = useMoney();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { lines, restaurantId, setQuantity, clear } = useCart();
  const key = useRef(requestKey());

  const restaurant = useQuery({ queryKey: ['restaurant', restaurantId], queryFn: () => restaurantApi.one(restaurantId!), enabled: !!restaurantId });
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: userApi.addresses });

  const r = restaurant.data;
  const types = useMemo(() => (r ? (['delivery', 'pickup', 'dine_in'] as OrderType[]).filter((t) => (t === 'delivery' ? r.delivery : t === 'pickup' ? r.pickup : r.dineIn)) : []), [r]);
  const [type, setType] = useState<OrderType | null>(null);
  const atTable = tableIntent.get(restaurantId);
  const orderType = type && types.includes(type) ? type : atTable && types.includes('dine_in') ? 'dine_in' : types[0];
  const saved = addresses.data?.addresses ?? [];
  const [addrIdx, setAddrIdx] = useState<number | 'new'>(-1);
  const chosenIdx = addrIdx === -1 ? (saved.length ? Math.max(0, saved.findIndex((a) => a.isDefault)) : 'new') : addrIdx;
  const [manualAddress, setManualAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [promoDraft, setPromoDraft] = useState('');
  const [promo, setPromo] = useState<string | undefined>();
  const [tipPct, setTipPct] = useState<number>(0);

  const subtotalEstimate = cartSubtotal(lines);
  const tip = Math.round(subtotalEstimate * tipPct) / 100;
  const address =
    orderType === 'delivery'
      ? chosenIdx === 'new'
        ? manualAddress.trim()
        : [saved[chosenIdx]?.street, saved[chosenIdx]?.city, saved[chosenIdx]?.state, saved[chosenIdx]?.zip].filter(Boolean).join(', ')
      : undefined;

  const body: OrderBody | null =
    restaurantId && orderType && lines.length
      ? { restaurantId, orderType, items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })), promoCode: promo, tip: tip || undefined, tableId: orderType === 'dine_in' ? atTable?.tableId : undefined }
      : null;
  const quoteKey = useDebounced(JSON.stringify(body), 350);
  const quote = useQuery({
    queryKey: ['quote', quoteKey],
    queryFn: () => orderApi.quote(JSON.parse(quoteKey)),
    enabled: !!body && quoteKey !== 'null',
    retry: false,
    placeholderData: (p) => p,
  });
  const promoError = promo && quote.isError ? errorMessage(quote.error) : null;

  const place = useMutation({
    mutationFn: () => orderApi.place({ ...body!, deliveryAddress: address, notes: notes.trim() || undefined, phone: phone.trim() || undefined }, key.current),
    onSuccess: (order) => {
      clear();
      key.current = requestKey();
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      navigate(`/my-orders/${order._id}/track?placed=1`, { replace: true });
    },
  });

  if (!lines.length) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={<ShoppingBag className="size-6" />} title="Your bag is empty" body="Add a few dishes from a restaurant's menu and come back here to check out." action={<LinkButton to="/restaurants?service=delivery">Find something to eat</LinkButton>} />
      </div>
    );
  }
  if (restaurant.isLoading) return <PageLoader label="Preparing checkout…" />;
  if (!r) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<X className="size-6" />}
          title="This restaurant isn't available"
          body="It may have stopped taking orders. Your bag has been kept — you can clear it and start again."
          action={<Button onClick={() => (clear(), navigate('/restaurants'))}>Clear bag</Button>}
        />
      </div>
    );
  }

  const q = quote.data;
  const blocking = quote.isError && !promo ? errorMessage(quote.error) : null;
  const canPlace = !!q && !quote.isFetching && !blocking && !promoError && (orderType !== 'delivery' || !!address);

  return (
    <div className="container-page grid gap-10 pt-6 pb-16 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0 space-y-8">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 text-[40px] leading-tight text-ink">
            Almost at <span className="italic text-herb-700">your table</span>
          </h1>
          <p className="mt-2 text-ink-3">
            Ordering from{' '}
            <Link to={`/restaurants/${r._id}?tab=menu`} className="font-semibold text-ink underline decoration-saffron-300 decoration-2 underline-offset-4">
              {r.name}
            </Link>
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-lg text-ink">How would you like it?</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {types.map((t) => {
              const M = TYPE_META[t];
              const active = orderType === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  aria-pressed={active}
                  className={cn('relative rounded-[20px] border p-4 text-left transition', active ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card hover:border-line-2')}
                >
                  <M.icon className={cn('size-5', active ? 'text-saffron-300' : 'text-herb-600')} />
                  <p className="mt-3 font-semibold">{M.label}</p>
                  <p className={cn('text-[13px]', active ? 'text-paper/70' : 'text-ink-3')}>{t === 'dine_in' && atTable?.tableNumber ? `Served at table ${atTable.tableNumber}` : M.body}</p>
                  {active && (
                    <span className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-saffron-400 text-herb-950">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <AnimatePresence initial={false}>
          {orderType === 'delivery' && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <h2 className="mb-3 text-lg text-ink">Deliver to</h2>
              <div className="grid gap-2">
                {saved.map((a, i) => (
                  <label key={i} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition', chosenIdx === i ? 'border-herb-600 bg-herb-50/60' : 'border-line bg-card')}>
                    <input type="radio" name="addr" checked={chosenIdx === i} onChange={() => setAddrIdx(i)} className="mt-1 accent-herb-700" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{a.label}</span>
                      <span className="text-[13.5px] text-ink-3">{[a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')}</span>
                    </span>
                  </label>
                ))}
                <label className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition', chosenIdx === 'new' ? 'border-herb-600 bg-herb-50/60' : 'border-line bg-card')}>
                  <input type="radio" name="addr" checked={chosenIdx === 'new'} onChange={() => setAddrIdx('new')} className="mt-1 accent-herb-700" />
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <MapPin className="size-4" /> {saved.length ? 'Somewhere else' : 'Delivery address'}
                    </span>
                    {chosenIdx === 'new' && (
                      <textarea
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value.slice(0, 300))}
                        placeholder="Street, building, floor, city — anything the rider needs"
                        className="input-base mt-3 min-h-20 py-3"
                        autoFocus
                      />
                    )}
                  </span>
                </label>
              </div>
              {!saved.length && (
                <p className="mt-2 text-[12.5px] text-ink-3">
                  Tip: save addresses in <Link to="/settings/addresses" className="underline">Addresses & cards</Link> for one-tap checkout.
                </p>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <section className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" hint="The restaurant or rider may call if needed." value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="+250 7xx xxx xxx" />
          <Textarea label="Note for the kitchen" optional value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))} placeholder="No onions, extra spicy, ring the bell…" className="[&_textarea]:min-h-12" />
        </section>

        <section>
          <h2 className="mb-3 text-lg text-ink">Payment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-[20px] border border-herb-900 bg-herb-50/60 p-4">
              <Banknote className="mt-0.5 size-5 text-herb-700" />
              <div>
                <p className="font-semibold text-ink">Pay in person</p>
                <p className="text-[13px] text-ink-3">{orderType === 'delivery' ? 'Cash or card to the rider on delivery.' : 'Pay at the restaurant.'}</p>
              </div>
              <span className="ml-auto grid size-6 place-items-center rounded-full bg-herb-900 text-saffron-300">
                <Check className="size-3.5" />
              </span>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-dashed border-line-2 p-4 opacity-70" aria-disabled>
              <CreditCard className="mt-0.5 size-5 text-ink-4" />
              <div>
                <p className="font-semibold text-ink-3">Pay online</p>
                <p className="text-[13px] text-ink-4">Coming soon</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Summary — every figure comes from the server's quote. */}
      <aside>
        <div className="sticky top-24 rounded-[26px] border border-line bg-card p-5">
          <p className="font-display text-xl text-ink">Order summary</p>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={l.menuItemId} className="flex items-center gap-3">
                <Photo src={l.image} alt="" label={l.name} className="size-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{l.name}</p>
                  <p className="text-[12.5px] text-ink-3">{money(l.price)}</p>
                </div>
                <QtyStepper size="sm" value={l.quantity} onChange={(v) => setQuantity(l.menuItemId, v)} label={`Quantity of ${l.name}`} />
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-full border border-line bg-paper px-3.5 focus-within:border-herb-500">
              <Tag className="size-4 text-ink-4" />
              <input
                value={promoDraft}
                onChange={(e) => setPromoDraft(e.target.value.toUpperCase())}
                placeholder="Promo or reward code"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold tracking-wide outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-4"
                aria-label="Promo code"
              />
            </label>
            {promo ? (
              <Button variant="ghost" size="md" onClick={() => (setPromo(undefined), setPromoDraft(''))}>
                Remove
              </Button>
            ) : (
              <Button variant="outline" size="md" disabled={!promoDraft.trim()} onClick={() => setPromo(promoDraft.trim())}>
                Apply
              </Button>
            )}
          </div>
          {promoError && <p className="mt-2 text-[12.5px] font-medium text-tomato-600">{promoError}</p>}
          {promo && q && !promoError && q.discount > 0 && <p className="mt-2 text-[12.5px] font-medium text-herb-700">Code applied — you save {money(q.discount)}.</p>}

          <div className="mt-5">
            <p className="mb-2 text-[13px] font-semibold text-ink-2">Add a tip for the team</p>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((p) => (
                <button key={p} onClick={() => setTipPct(p)} aria-pressed={tipPct === p} className={cn('h-10 rounded-xl border text-[13px] font-semibold transition', tipPct === p ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card text-ink-2 hover:border-line-2')}>
                  {p ? `${p}%` : 'None'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t-[1.5px] border-dashed border-line-2" />
          <dl className="mt-5 space-y-2 text-sm">
            {q ? (
              <>
                <Row label="Food" value={money(q.subtotal)} />
                {q.discount > 0 && <Row label={q.promoCode ? `Discount (${q.promoCode})` : 'Offer'} value={`− ${money(q.discount)}`} tone="herb" />}
                {orderType === 'delivery' && <Row label="Delivery" value={q.deliveryFee ? money(q.deliveryFee) : 'Free'} />}
                {q.serviceFee > 0 && <Row label="Service fee" value={money(q.serviceFee)} />}
                {q.tax > 0 && <Row label={`Tax (${Math.round(q.taxRate * 100)}%)`} value={money(q.tax)} />}
                {q.tip > 0 && <Row label="Tip" value={money(q.tip)} />}
              </>
            ) : (
              !blocking && (
                <p className="flex items-center gap-2 text-ink-3">
                  <LoaderCircle className="size-4 animate-spin" /> Calculating…
                </p>
              )
            )}
          </dl>
          {blocking && <p className="mt-3 rounded-xl bg-tomato-50 p-3 text-[13px] text-tomato-700">{blocking}</p>}
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-semibold text-ink">Total</span>
            <motion.span key={q?.total} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl text-ink tabular-nums">
              {q ? money(q.total) : '—'}
            </motion.span>
          </div>
          {place.isError && <p className="mt-3 rounded-xl bg-tomato-50 p-3 text-[13px] text-tomato-700">{errorMessage(place.error)}</p>}
          <Button variant="primary" size="lg" block className="mt-4" disabled={!canPlace} loading={place.isPending} onClick={() => place.mutate()}>
            {orderType === 'delivery' && !address ? 'Add a delivery address' : q ? `Place order · ${money(q.total)}` : 'Place order'}
          </Button>
          <p className="mt-3 text-center text-[12px] text-ink-4">You can cancel until the kitchen starts cooking.</p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'herb' }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-3">{label}</dt>
      <dd className={cn('font-semibold tabular-nums', tone === 'herb' ? 'text-herb-700' : 'text-ink')}>{value}</dd>
    </div>
  );
}
