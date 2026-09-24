import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Armchair, ArrowUpRight, Bike, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import { cn, openState } from '@/lib/format';
import { Photo, RatingSeal } from '@/ui/bits';
import { useFavorites } from '@/features/favorites';

/**
 * The reservation-ticket card. Top: the room (photo) with live status. Bottom, past the perforation:
 * the stub — how you can eat here and the two things you can do right now.
 */
export function RestaurantCard({ restaurant: r, index = 0, className }: { restaurant: Restaurant; index?: number; className?: string }) {
  const { isSaved, toggle } = useFavorites();
  const state = openState(r);
  const saved = isSaved(r._id);
  const location = [r.cuisineType, r.priceRange, r.city].filter(Boolean).join('  ·  ');
  const canOrder = r.acceptingOrders && (r.delivery || r.pickup);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex flex-col rounded-[var(--radius-card)] border border-line bg-card shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      {/* Photo */}
      <div className="relative m-2 mb-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
        <Photo
          src={r.images?.[0] || r.logo}
          alt={r.name}
          label={r.name}
          className="size-full transition-transform duration-[1.2s] ease-[var(--ease-out-quint)] group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold backdrop-blur-md',
              state.open ? 'bg-white/90 text-herb-700' : 'bg-black/45 text-white',
            )}
          >
            <span className={cn('size-1.5 rounded-full', state.open ? 'animate-pulse-dot bg-herb-500 text-herb-500/60' : 'bg-white/70')} />
            {state.label}
            {state.detail && <span className="font-medium opacity-70">{state.detail}</span>}
          </span>
          {r.sponsored && (
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron-400/95 px-2 py-1 text-[11px] font-bold text-herb-950">
              <Sparkles className="size-3" /> Featured
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggle(r._id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${r.name} from favourites` : `Save ${r.name}`}
          className="absolute top-2.5 right-2.5 z-10 grid size-9 place-items-center rounded-full bg-white/90 text-ink backdrop-blur transition hover:scale-110 active:scale-95"
        >
          <Heart className={cn('size-[17px] transition', saved ? 'fill-tomato-500 text-tomato-500' : 'text-ink-2')} />
        </button>
      </div>
        <RatingSeal rating={r.rating} className="absolute right-3 -bottom-5 z-10 rounded-full ring-4 ring-card" />
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-4">
        <h3 className="pr-12 text-[22px] leading-tight text-ink">
          <Link to={`/restaurants/${r._id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {r.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-[13px] font-medium tracking-wide text-ink-3">{location}</p>
        {r.totalReviews > 0 && <p className="mt-1 text-[12px] text-ink-4">{r.totalReviews} reviews</p>}
      </div>

      {/* Perforation + stub */}
      <div className="ticket-tear transition-colors duration-500 group-hover:border-saffron-300" />
      <div className="relative flex items-center justify-between gap-3 px-5 py-3.5 transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-y-0.5">
        <ul className="flex items-center gap-3 text-[12px] font-medium text-ink-3" aria-label="Ways to eat here">
          {r.dineIn && (
            <li className="inline-flex items-center gap-1" title="Table reservations">
              <Armchair className="size-3.5" /> Tables
            </li>
          )}
          {r.delivery && (
            <li className="inline-flex items-center gap-1" title="Delivery">
              <Bike className="size-3.5" /> Delivery
            </li>
          )}
          {r.pickup && !r.delivery && (
            <li className="inline-flex items-center gap-1" title="Pickup">
              <ShoppingBag className="size-3.5" /> Pickup
            </li>
          )}
        </ul>
        <div className="relative z-10 flex items-center gap-1.5">
          {r.dineIn && (
            <Link
              to={`/restaurants/${r._id}?tab=book`}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-herb-700 transition hover:bg-herb-50"
            >
              Book
            </Link>
          )}
          {canOrder && (
            <Link
              to={`/restaurants/${r._id}?tab=menu`}
              className="inline-flex items-center gap-1 rounded-full bg-herb-900 px-3 py-1.5 text-[12.5px] font-semibold text-paper transition hover:bg-herb-700"
            >
              Order <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-card p-2">
      <div className="skeleton aspect-[4/3] rounded-[16px]" />
      <div className="space-y-2 px-3 py-4">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
      <div className="ticket-tear" />
      <div className="flex justify-between px-3 py-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-7 w-20 rounded-full" />
      </div>
    </div>
  );
}
