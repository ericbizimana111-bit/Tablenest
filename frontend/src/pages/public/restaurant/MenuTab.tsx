import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { BadgePercent, Plus, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuApi, promotionApi } from '@/lib/api';
import type { MenuItem, Restaurant } from '@/lib/types';
import { cn } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import { cartCount, cartSubtotal, useCart } from '@/stores/cart';
import { useShell } from '@/stores/shell';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/ui/Button';
import { Badge, EmptyState, Photo, QtyStepper } from '@/ui/bits';
import { Confirm } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

function DishRow({ item, restaurant, highlight, canOrder }: { item: MenuItem; restaurant: Restaurant; highlight: boolean; canOrder: boolean }) {
  const money = useMoney();
  const { lines, add, setQuantity, replaceWith, restaurantName } = useCart();
  const [conflict, setConflict] = useState(false);
  const inBag = lines.find((l) => l.menuItemId === item._id)?.quantity ?? 0;
  const ref = useRef<HTMLLIElement>(null);
  const soldOut = item.isSoldOut;
  const entry = { menuItemId: item._id, name: item.name, price: item.price, image: item.image };

  useEffect(() => {
    if (highlight) setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
  }, [highlight]);

  const onAdd = () => {
    if (!add(restaurant, entry)) return setConflict(true);
    toast.success(`${item.name} added`, { id: `add-${item._id}` });
  };

  return (
    <li
      ref={ref}
      className={cn(
        'group flex gap-4 rounded-[20px] p-3 transition-colors sm:gap-5 sm:p-4',
        highlight ? 'bg-saffron-50 ring-2 ring-saffron-300' : 'hover:bg-card',
        soldOut && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-[19px] leading-snug text-ink">{item.name}</h4>
          {soldOut && <Badge tone="tomato">Sold out</Badge>}
          {item.tags?.slice(0, 2).map((t) => (
            <Badge key={t} tone="herb">
              {t}
            </Badge>
          ))}
        </div>
        {item.description && <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-3">{item.description}</p>}
        <div className="mt-3 flex items-center gap-3">
          <span className="font-semibold text-ink tabular-nums">{money(item.price)}</span>
          {canOrder && !soldOut && (
            <AnimatePresence mode="wait" initial={false}>
              {inBag ? (
                <motion.div key="qty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <QtyStepper size="sm" value={inBag} onChange={(v) => setQuantity(item._id, v)} label={`Quantity of ${item.name}`} />
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={onAdd}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-herb-900 pr-3.5 pl-2.5 text-[12.5px] font-semibold text-paper transition hover:bg-herb-700 active:scale-95"
                  aria-label={`Add ${item.name}`}
                >
                  <Plus className="size-4" /> Add
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      {item.image && (
        <button type="button" onClick={canOrder && !soldOut && !inBag ? onAdd : undefined} className="relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28" tabIndex={-1} aria-hidden>
          <Photo src={item.image} alt="" className="size-full transition-transform duration-700 group-hover:scale-110" />
        </button>
      )}
      <Confirm
        open={conflict}
        onClose={() => setConflict(false)}
        tone="dark"
        title="Start a new bag?"
        body={`Your bag has dishes from ${restaurantName}. One order goes to one kitchen — start a new bag with ${item.name} from ${restaurant.name}?`}
        confirmLabel="Start new bag"
        onConfirm={() => {
          replaceWith(restaurant, entry);
          setConflict(false);
          toast.success(`${item.name} added`);
        }}
      />
    </li>
  );
}

function BagPanel({ restaurant }: { restaurant: Restaurant }) {
  const money = useMoney();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lines, restaurantId, setQuantity } = useCart();
  const mine = restaurantId === restaurant._id ? lines : [];
  const subtotal = cartSubtotal(mine);
  const checkout = () => navigate(user ? '/checkout' : '/login?next=/checkout');

  return (
    <div className="rounded-[24px] border border-line bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-xl text-ink">Your bag</p>
        {mine.length > 0 && <span className="text-[13px] text-ink-3">{cartCount(mine)} items</span>}
      </div>
      {mine.length === 0 ? (
        <div className="py-8 text-center">
          <ShoppingBag className="mx-auto size-8 text-line-2" />
          <p className="mt-3 text-sm text-ink-3">Add dishes from the menu — your bag builds up here.</p>
        </div>
      ) : (
        <>
          <ul className="mt-4 max-h-[340px] space-y-3 overflow-y-auto pr-1">
            {mine.map((l) => (
              <li key={l.menuItemId} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{l.name}</p>
                  <p className="text-[12.5px] text-ink-3">{money(l.price * l.quantity)}</p>
                </div>
                <QtyStepper size="sm" value={l.quantity} onChange={(v) => setQuantity(l.menuItemId, v)} label={`Quantity of ${l.name}`} />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-line-2 pt-4">
            <span className="text-sm text-ink-3">Food subtotal</span>
            <span className="font-display text-2xl text-ink">{money(subtotal)}</span>
          </div>
          {restaurant.delivery && restaurant.minOrder > 0 && subtotal < restaurant.minOrder && (
            <p className="mt-2 text-[12.5px] text-saffron-700">Delivery needs a minimum of {money(restaurant.minOrder)}. Pickup has no minimum.</p>
          )}
          <Button variant="primary" size="lg" block className="mt-4" onClick={checkout}>
            Checkout
          </Button>
        </>
      )}
    </div>
  );
}

export function MenuTab({ restaurant }: { restaurant: Restaurant }) {
  const money = useMoney();
  const [params] = useSearchParams();
  const highlight = params.get('dish');
  const setCart = useShell((s) => s.setCart);
  const menu = useQuery({ queryKey: ['menu', restaurant._id], queryFn: () => menuApi.full(restaurant._id) });
  const promos = useQuery({ queryKey: ['promos', restaurant._id], queryFn: () => promotionApi.active(restaurant._id) });
  const { lines, restaurantId } = useCart();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const canOrder = restaurant.acceptingOrders && (restaurant.delivery || restaurant.pickup || restaurant.dineIn) && !!restaurant.openNow;
  const categories = useMemo(() => menu.data ?? [], [menu.data]);
  const mineCount = restaurantId === restaurant._id ? cartCount(lines) : 0;
  const mineTotal = restaurantId === restaurant._id ? cartSubtotal(lines) : 0;

  // Scroll-spy: highlight the category you are reading.
  useEffect(() => {
    if (!categories.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveCat(visible.target.id.replace('cat-', ''));
      },
      { rootMargin: '-140px 0px -60% 0px' },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c._id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [categories]);

  if (menu.isLoading) {
    return (
      <div className="grid gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }
  if (!categories.length) {
    return <EmptyState icon={<UtensilsCrossed className="size-6" />} title="The menu is being written" body="This restaurant hasn't published dishes yet. You can still book a table." />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)_320px]">
      <nav className="hidden lg:block" aria-label="Menu sections">
        <div className="sticky top-[150px] flex flex-col gap-1">
          {categories.map((c) => (
            <a
              key={c._id}
              href={`#cat-${c._id}`}
              className={cn(
                'relative rounded-xl px-3 py-2 text-[14px] font-semibold transition',
                activeCat === c._id ? 'text-ink' : 'text-ink-3 hover:text-ink',
              )}
            >
              {activeCat === c._id && <motion.span layoutId="menu-cat" className="absolute inset-0 -z-10 rounded-xl bg-paper-2" />}
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="min-w-0">
        <div className="scrollbar-none sticky top-[136px] z-20 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-paper/90 px-4 py-2 backdrop-blur lg:hidden">
          {categories.map((c) => (
            <a
              key={c._id}
              href={`#cat-${c._id}`}
              className={cn('h-9 shrink-0 rounded-full border px-3.5 text-[13px] leading-9 font-semibold', activeCat === c._id ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card text-ink-2')}
            >
              {c.name}
            </a>
          ))}
        </div>

        {!canOrder && (
          <div className="mb-6 rounded-2xl border border-saffron-200 bg-saffron-50 px-4 py-3 text-sm text-saffron-700">
            {restaurant.acceptingOrders ? 'The kitchen is closed right now — browse the menu and order when they open.' : 'This restaurant is not taking online orders at the moment.'}
          </div>
        )}

        {!!promos.data?.length && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {promos.data.map((p) => (
              <div key={p._id} className="flex items-center gap-3 rounded-2xl border border-dashed border-saffron-300 bg-saffron-50/60 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-saffron-400 text-herb-950">
                  <BadgePercent className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.discountType === 'percentage' ? `${p.discountValue}% off` : `${money(p.discountValue)} off`} · {p.name}
                  </p>
                  <p className="text-[12.5px] text-ink-3">
                    {p.code ? (
                      <>
                        Use code <b className="font-mono">{p.code}</b>
                      </>
                    ) : (
                      'Applied automatically'
                    )}
                    {p.minOrder > 0 && ` on orders over ${money(p.minOrder)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-10">
          {categories.map((c) => (
            <section key={c._id} id={`cat-${c._id}`} className="scroll-mt-40">
              <h3 className="mb-2 flex items-baseline gap-3 px-3 text-[26px] text-ink">
                {c.name}
                <span className="h-px flex-1 translate-y-[-6px] border-t border-dashed border-line-2" />
                <span className="text-[13px] font-sans font-semibold text-ink-4">{c.items?.length}</span>
              </h3>
              <ul className="divide-y divide-line/70">
                {c.items?.map((i) => (
                  <DishRow key={i._id} item={i} restaurant={restaurant} highlight={highlight === i._id} canOrder={canOrder} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-[150px]">
          <BagPanel restaurant={restaurant} />
        </div>
      </aside>

      <AnimatePresence>
        {mineCount > 0 && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setCart(true)}
            className="fixed inset-x-4 bottom-[calc(max(10px,env(safe-area-inset-bottom))+80px)] z-30 flex items-center justify-between rounded-full bg-tomato-500 py-3 pr-5 pl-3 text-white shadow-[0_18px_40px_-14px_rgb(217_71_43/0.9)] lg:hidden"
          >
            <span className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-white/20 text-sm font-bold">{mineCount}</span>
              <span className="font-semibold">View bag</span>
            </span>
            <span className="font-semibold">{money(mineTotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
