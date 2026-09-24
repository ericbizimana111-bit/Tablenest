import type { ReactNode } from 'react';
import { Clock, Store, XCircle } from 'lucide-react';
import { useMyRestaurant } from '@/features/owner';
import type { Restaurant } from '@/lib/types';
import { LinkButton } from '@/ui/Button';
import { EmptyState } from '@/ui/bits';
import { Skeleton } from '@/ui/Loader';

/**
 * Renders its children with the owner's restaurant, or explains what's missing.
 * Every owner page sits behind this so none of them has to handle "no restaurant yet".
 */
export function OwnerGate({ children }: { children: (r: Restaurant) => ReactNode }) {
  const { data, isLoading } = useMyRestaurant();
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (!data) {
    return (
      <EmptyState
        className="mt-10"
        icon={<Store className="size-6" />}
        title="Let's set up your restaurant"
        body="Add your details, hours and a few photos. It takes about five minutes, and your progress is saved as you go."
        action={<LinkButton to="/partner/join">Finish setup</LinkButton>}
      />
    );
  }
  return <>{children(data)}</>;
}

/** Banner explaining why a restaurant isn't visible to guests yet. */
export function StatusBanner({ r }: { r: Restaurant }) {
  if (r.status === 'active') return null;
  const pending = r.status === 'pending';
  return (
    <div className={`mb-6 flex gap-3 rounded-[20px] border p-4 ${pending ? 'border-saffron-200 bg-saffron-50' : 'border-tomato-200 bg-tomato-50'}`}>
      {pending ? <Clock className="mt-0.5 size-5 shrink-0 text-saffron-600" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-tomato-600" />}
      <div className="text-sm">
        <p className="font-semibold text-ink">
          {pending ? 'Your restaurant is being reviewed' : r.status === 'rejected' ? 'Your application needs changes' : 'Your restaurant is suspended'}
        </p>
        <p className="mt-0.5 text-ink-3">
          {pending
            ? 'We usually approve within one working day. Meanwhile, build your menu and tables so you are ready on day one.'
            : r.rejectionReason || 'Guests cannot see your restaurant right now. Contact support from the Help page to resolve it.'}
        </p>
      </div>
    </div>
  );
}
