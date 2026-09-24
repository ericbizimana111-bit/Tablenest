import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus, Star, UtensilsCrossed } from 'lucide-react';
import { cn, initials } from '@/lib/format';
import { assetUrl } from '@/lib/http';
import type { OrderStatus, ReservationStatus } from '@/lib/types';

type Tone = 'neutral' | 'herb' | 'saffron' | 'tomato' | 'ink' | 'sky';
const tones: Record<Tone, string> = {
  neutral: 'bg-paper-2 text-ink-2',
  herb: 'bg-herb-50 text-herb-700 ring-1 ring-inset ring-herb-100',
  saffron: 'bg-saffron-50 text-saffron-700 ring-1 ring-inset ring-saffron-100',
  tomato: 'bg-tomato-50 text-tomato-700 ring-1 ring-inset ring-tomato-100',
  ink: 'bg-herb-900 text-paper',
  sky: 'bg-[#eaf2f8] text-[#285a7d] ring-1 ring-inset ring-[#d3e3ef]',
};

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-semibold', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const ORDER_TONES: Record<OrderStatus, [Tone, string]> = {
  placed: ['saffron', 'Placed'],
  confirmed: ['sky', 'Accepted'],
  preparing: ['saffron', 'Preparing'],
  ready: ['herb', 'Ready'],
  out_for_delivery: ['sky', 'On the way'],
  delivered: ['herb', 'Completed'],
  cancelled: ['tomato', 'Cancelled'],
};
const BOOKING_TONES: Record<ReservationStatus, [Tone, string]> = {
  pending: ['saffron', 'Awaiting confirmation'],
  confirmed: ['herb', 'Confirmed'],
  arrived: ['sky', 'Seated'],
  completed: ['neutral', 'Completed'],
  cancelled: ['tomato', 'Cancelled'],
  no_show: ['tomato', 'No-show'],
};
export const orderStatusLabel = (s: OrderStatus) => ORDER_TONES[s]?.[1] ?? s;
export const bookingStatusLabel = (s: ReservationStatus) => BOOKING_TONES[s]?.[1] ?? s;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const [tone, label] = ORDER_TONES[status] ?? ['neutral', status];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}
export function BookingStatusBadge({ status }: { status: ReservationStatus }) {
  const [tone, label] = BOOKING_TONES[status] ?? ['neutral', status];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

/** Rating shown as a small wax-seal, the way a guide would stamp a recommendation. */
export function RatingSeal({ rating, count, className, size = 'md' }: { rating: number; count?: number; className?: string; size?: 'sm' | 'md' }) {
  if (!rating) {
    return <span className={cn('inline-flex items-center rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-ink-3', className)}>New</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={`Rated ${rating.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ''}`}>
      <span
        className={cn(
          'relative grid place-items-center rounded-full bg-saffron-400 font-display font-semibold text-herb-950 shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]',
          size === 'md' ? 'size-10 text-[15px]' : 'size-8 text-[13px]',
        )}
      >
        {rating.toFixed(1)}
      </span>
      {count !== undefined && <span className="text-[12px] text-ink-3">{count} reviews</span>}
    </span>
  );
}

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)} role={onChange ? 'radiogroup' : undefined} aria-label={onChange ? 'Rating' : `${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star style={{ width: size, height: size }} className={n <= shown ? 'fill-saffron-400 text-saffron-400' : 'text-line-2'} />;
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="p-0.5 transition-transform hover:scale-125"
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </span>
  );
}

/** Image with a composed, on-brand fallback when a record has no photo (never a broken icon). */
export function Photo({ src, alt, className, label }: { src: string | null | undefined; alt: string; className?: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  const url = assetUrl(src);
  if (!url || failed) {
    return (
      <div className={cn('relative grid place-items-center overflow-hidden bg-herb-800 text-herb-200', className)} role="img" aria-label={alt}>
        <svg className="absolute inset-0 size-full opacity-[0.12]" aria-hidden>
          <defs>
            <pattern id="tn-dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tn-dots)" />
        </svg>
        <div className="relative flex flex-col items-center gap-2">
          {label ? <span className="font-display text-4xl text-paper/90 italic">{initials(label)}</span> : <UtensilsCrossed className="size-8" />}
        </div>
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn('object-cover', className)} />;
}

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const url = assetUrl(src);
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size }} className={cn('rounded-full object-cover ring-2 ring-card', className)} />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn('inline-grid place-items-center rounded-full bg-saffron-200 font-semibold text-herb-900 ring-2 ring-card', className)}
      aria-label={name}
    >
      {initials(name) || '?'}
    </span>
  );
}

export function EmptyState({ icon, title, body, action, className }: { icon: ReactNode; title: string; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-2 bg-card/60 px-6 py-14 text-center', className)}>
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-paper-2 text-herb-600">{icon}</div>
      <h3 className="text-xl text-ink">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-3">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function QtyStepper({ value, onChange, min = 0, max = 50, size = 'md', label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: 'sm' | 'md'; label: string }) {
  const s = size === 'sm' ? 'size-8' : 'size-10';
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-card p-0.5" role="group" aria-label={label}>
      <button type="button" className={cn(s, 'grid place-items-center rounded-full text-ink-2 transition hover:bg-paper-2 disabled:opacity-40')} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">
        <Minus className="size-4" />
      </button>
      <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </motion.span>
      <button type="button" className={cn(s, 'grid place-items-center rounded-full text-ink-2 transition hover:bg-paper-2 disabled:opacity-40')} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Pill tabs with a sliding highlight. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
  id = 'seg',
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: ReactNode; icon?: ReactNode }>;
  className?: string;
  size?: 'sm' | 'md';
  id?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-full bg-paper-2 p-1', className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-full font-semibold transition-colors',
              size === 'sm' ? 'h-8 px-3.5 text-[13px]' : 'h-10 px-4 text-sm',
              active ? 'text-paper' : 'text-ink-2 hover:text-ink',
            )}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-herb-900" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative inline-flex items-center gap-2">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, action, className, lead }: { eyebrow?: string; title: ReactNode; action?: ReactNode; className?: string; lead?: ReactNode }) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-[34px] leading-[1.05] text-ink sm:text-[44px]">{title}</h2>
        {lead && <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({ active, onClick, children, icon }: { active?: boolean; onClick?: () => void; children: ReactNode; icon?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition',
        active ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card text-ink-2 hover:border-line-2 hover:text-ink',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** Newer/older pager for server-paginated lists. Renders nothing for a single page. */
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const btn = 'inline-flex h-9 items-center gap-1 rounded-full border border-line bg-card px-3.5 text-[13px] font-semibold text-ink-2 transition hover:border-line-2 disabled:pointer-events-none disabled:opacity-40';
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-ink-3 tabular-nums">
        {page} of {pages}
      </span>
      <button className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
