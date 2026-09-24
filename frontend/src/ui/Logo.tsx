import { Link } from 'react-router-dom';
import { cn } from '@/lib/format';

/** The mark: a nest (two cradling arcs) holding a saffron plate. */
export function LogoMark({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const stroke = tone === 'dark' ? '#16392b' : '#f7f2e9';
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M8 30c0 13.3 10.7 24 24 24s24-10.7 24-24" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      <path d="M17 30c0 8.3 6.7 15 15 15s15-6.7 15-15" fill="none" stroke={stroke} strokeOpacity=".4" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="22" r="9.5" fill="#edb041" />
    </svg>
  );
}

export function Logo({ tone = 'dark', to = '/', className, compact }: { tone?: 'dark' | 'light'; to?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="TableNest home">
      <LogoMark tone={tone} className="size-8 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-12" />
      {!compact && (
        <span className={cn('font-display text-[22px] leading-none font-semibold tracking-tight', tone === 'dark' ? 'text-herb-900' : 'text-paper')}>
          Table<span className="italic font-medium">Nest</span>
        </span>
      )}
    </Link>
  );
}
