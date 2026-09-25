import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Armchair, ArrowRight, Bike, CornerDownLeft, Search, Sparkles, Store, UtensilsCrossed } from 'lucide-react';
import { menuApi, restaurantApi } from '@/lib/api';
import { cn } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import { useExperience } from '@/stores/experience';
import { Photo } from '@/ui/bits';

function useDebounced<T>(value: T, ms = 220) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Row = { key: string; label: string; sub?: string; icon: React.ReactNode; image?: string | null; run: () => void };

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const money = useMoney();
  const ask = useExperience((s) => s.ask);
  const term = useDebounced(q.trim());

  const restaurants = useQuery({ queryKey: ['search', 'r', term], queryFn: () => restaurantApi.list({ search: term, limit: 5 }), enabled: open && term.length >= 2 });
  const dishes = useQuery({ queryKey: ['search', 'd', term], queryFn: () => menuApi.search(term), enabled: open && term.length >= 2 });

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    if (term.length >= 2) {
      restaurants.data?.restaurants.forEach((r) =>
        out.push({
          key: `r${r._id}`,
          label: r.name,
          sub: [r.cuisineType, r.city].filter(Boolean).join(' · '),
          icon: <Store className="size-4" />,
          image: r.images?.[0],
          run: () => go(`/restaurants/${r._id}`),
        }),
      );
      dishes.data?.dishes.slice(0, 5).forEach((d) =>
        out.push({
          key: `d${d._id}`,
          label: d.name,
          sub: `${money(d.price)} · ${d.restaurant.name}`,
          icon: <UtensilsCrossed className="size-4" />,
          image: d.image,
          run: () => go(`/restaurants/${d.restaurant._id}?tab=menu&dish=${d._id}`),
        }),
      );
      out.push({ key: 'all', label: `See every result for “${term}”`, icon: <Search className="size-4" />, run: () => go(`/restaurants?search=${encodeURIComponent(term)}`) });
      out.push({
        key: 'ask',
        label: `Ask the concierge: “${term}”`,
        sub: 'Describe what you feel like — it will find it',
        icon: <Sparkles className="size-4" />,
        run: () => {
          onClose();
          ask(term);
        },
      });
    } else {
      out.push(
        { key: 'book', label: 'Book a table', sub: 'Restaurants taking reservations', icon: <Armchair className="size-4" />, run: () => go('/restaurants?service=dine_in') },
        { key: 'order', label: 'Order for delivery', sub: 'Restaurants that deliver', icon: <Bike className="size-4" />, run: () => go('/restaurants?service=delivery') },
        { key: 'all', label: 'Browse every restaurant', icon: <Store className="size-4" />, run: () => go('/restaurants') },
        { key: 'ask', label: 'Ask the concierge', sub: '“Somewhere quiet for 4 on Friday?”', icon: <Sparkles className="size-4" />, run: () => (onClose(), ask('')) },
      );
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, restaurants.data, dishes.data, money]);

  // Reset the query each time the palette opens, and the highlight whenever the term changes.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQ('');
      setActive(0);
    }
  }
  const [prevTerm, setPrevTerm] = useState(term);
  if (term !== prevTerm) {
    setPrevTerm(term);
    setActive(0);
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(rows.length - 1, a + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    }
    if (e.key === 'Enter') rows[active]?.run();
  };

  const loading = term.length >= 2 && (restaurants.isFetching || dishes.isFetching);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" onKeyDown={onKey}>
          <motion.div className="absolute inset-0 bg-herb-950/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search TableNest"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[26px] border border-line bg-card shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="size-5 text-ink-3" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Restaurant, cuisine or dish…"
                className="h-16 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-4"
                aria-controls="search-results"
                aria-activedescendant={rows[active] ? `sr-${rows[active].key}` : undefined}
              />
              {loading && <span className="size-4 animate-spin rounded-full border-2 border-line border-t-herb-600" />}
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-3 sm:block">Esc</kbd>
            </div>
            <ul id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
              {term.length >= 2 && !loading && !restaurants.data?.restaurants.length && !dishes.data?.dishes.length && (
                <li className="px-4 pt-3 pb-1 text-sm text-ink-3">No exact matches — try the concierge below.</li>
              )}
              {rows.map((r, i) => (
                <li key={r.key} id={`sr-${r.key}`} role="option" aria-selected={i === active}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={r.run}
                    className={cn('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition', i === active ? 'bg-paper' : 'hover:bg-paper/60')}
                  >
                    {r.image !== undefined ? (
                      <Photo src={r.image} alt="" label={r.label} className="size-11 shrink-0 rounded-xl" />
                    ) : (
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-paper-2 text-herb-700">{r.icon}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">{r.label}</span>
                      {r.sub && <span className="block truncate text-[13px] text-ink-3">{r.sub}</span>}
                    </span>
                    {i === active ? <CornerDownLeft className="size-4 text-ink-3" /> : <ArrowRight className="size-4 text-line-2" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
