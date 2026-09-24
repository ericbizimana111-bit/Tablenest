import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/format';
import { LogoMark } from './Logo';

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn('size-5 animate-spin text-herb-600', className)} aria-label="Loading" />;
}

/** Full-page wait: the logo breathes while a stored session is checked or a route loads. */
export function PageLoader({ label = 'Setting your table…' }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <LogoMark className="size-12 animate-pulse" />
        </div>
        <p className="text-sm text-ink-3">{label}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}
