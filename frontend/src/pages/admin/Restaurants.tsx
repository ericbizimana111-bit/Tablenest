import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Search, Sparkles, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { formatBookingDate, timeAgo } from '@/lib/format';
import { usePublicSettings } from '@/lib/settings';
import type { Restaurant, RestaurantStatus } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { Button } from '@/ui/Button';
import { Badge, Chip, EmptyState, Pager, Photo, Segmented } from '@/ui/bits';
import { Input } from '@/ui/Field';
import { Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const STATUS_TONE: Record<RestaurantStatus, 'herb' | 'saffron' | 'tomato' | 'neutral'> = { active: 'herb', pending: 'saffron', suspended: 'tomato', rejected: 'neutral' };
const owner = (r: Restaurant) => (typeof r.ownerId === 'object' ? r.ownerId : null);

type Action = { r: Restaurant; kind: 'status'; to: RestaurantStatus } | { r: Restaurant; kind: 'billing' } | { r: Restaurant; kind: 'sponsor' };

function ActionDialog({ action, onClose }: { action: Action; onClose: () => void }) {
  const qc = useQueryClient();
  const settings = usePublicSettings();
  const { r } = action;
  const [reason, setReason] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro'>(r.plan ?? 'starter');
  const [rate, setRate] = useState(r.commissionRate === null || r.commissionRate === undefined ? '' : String(Math.round(r.commissionRate * 1000) / 10));
  const [weeks, setWeeks] = useState(2);
  const run = useMutation({
    mutationFn: async () => {
      if (action.kind === 'status') return adminApi.setRestaurantStatus(r._id, action.to, reason.trim() || undefined);
      if (action.kind === 'billing') return adminApi.setBilling(r._id, plan, rate === '' ? null : Number(rate) / 100);
      return adminApi.sponsor(r._id, weeks);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Done');
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const needsReason = action.kind === 'status' && (action.to === 'rejected' || action.to === 'suspended');
  const title =
    action.kind === 'status'
      ? { active: r.status === 'pending' ? `Approve ${r.name}?` : `Reactivate ${r.name}?`, rejected: `Reject ${r.name}?`, suspended: `Suspend ${r.name}?`, pending: '' }[action.to]
      : action.kind === 'billing'
        ? `Plan for ${r.name}`
        : `Feature ${r.name}`;

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={needsReason ? 'danger' : 'dark'} loading={run.isPending} disabled={needsReason && reason.trim().length < 3} onClick={() => run.mutate()}>
            Confirm
          </Button>
        </div>
      }
    >
      {action.kind === 'status' &&
        (needsReason ? (
          <Input label="Reason (the owner sees this)" autoFocus value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Photos don't show the restaurant" />
        ) : (
          <p className="text-sm text-ink-3">The restaurant becomes visible to guests immediately and the owner is notified.</p>
        ))}
      {action.kind === 'billing' && (
        <div className="space-y-4">
          <Segmented
            id="adm-plan"
            value={plan}
            onChange={setPlan}
            options={[
              { value: 'starter', label: 'Starter' },
              { value: 'pro', label: 'Pro' },
            ]}
          />
          <Input
            label="Negotiated commission"
            optional
            hint={settings.data ? `Leave empty for the plan default (${Math.round(settings.data.plans[plan].commissionRate * 100)}%).` : undefined}
            type="number"
            min={0}
            max={50}
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            trailing="%"
          />
        </div>
      )}
      {action.kind === 'sponsor' && (
        <div className="space-y-3">
          <Input label="Weeks" type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} />
          {settings.data && <p className="text-sm text-ink-3">A featured-placement charge is added to their statement. Extends any current placement.</p>}
          {r.sponsoredUntil && new Date(r.sponsoredUntil) > new Date() && <p className="text-sm text-herb-700">Currently featured until {formatBookingDate(r.sponsoredUntil, { day: 'numeric', month: 'long' })}.</p>}
        </div>
      )}
    </Modal>
  );
}

export default function AdminRestaurants() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<Action | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'restaurants', status, q, page], queryFn: () => adminApi.restaurants({ status, search: q, page }), placeholderData: (p) => p });
  const setStatus = (s: string) => {
    setPage(1);
    setParams(s ? { status: s } : {}, { replace: true });
  };

  return (
    <>
      <DashHead title="Restaurants" lead="Approve new partners, handle problems and manage plans." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {['', 'pending', 'active', 'suspended', 'rejected'].map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {s ? s[0].toUpperCase() + s.slice(1) : 'All'}
            </Chip>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQ(search.trim());
          }}
          className="w-full lg:w-80"
        >
          <Input aria-label="Search restaurants" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or city" leading={<Search className="size-4" />} />
        </form>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.items.length ? (
        <EmptyState icon={<Store className="size-6" />} title="No restaurants here" />
      ) : (
        <div className="space-y-3">
          {data.items.map((r) => {
            const o = owner(r);
            const featured = r.sponsoredUntil && new Date(r.sponsoredUntil) > new Date();
            return (
              <article key={r._id} className="flex flex-col gap-4 rounded-[22px] border border-line bg-card p-4 md:flex-row md:items-center">
                <Photo src={r.images?.[0] ?? r.logo} alt={r.name} label={r.name} className="h-20 w-full shrink-0 rounded-2xl md:w-28" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{r.name}</p>
                    <Badge tone={STATUS_TONE[r.status]} dot>
                      {r.status}
                    </Badge>
                    <Badge tone="ink">{r.plan ?? 'starter'}</Badge>
                    {featured && (
                      <Badge tone="saffron">
                        <Sparkles className="size-3" /> Featured
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-ink-3">
                    {r.cuisineType} · {[r.address, r.city].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-[12.5px] text-ink-4">
                    {o ? `${o.fullName} · ${o.email}` : 'Owner unknown'} {r.createdAt && `· joined ${timeAgo(r.createdAt)}`}
                    {r.commissionRate !== null && r.commissionRate !== undefined && ` · ${Math.round(r.commissionRate * 1000) / 10}% negotiated`}
                  </p>
                  {r.rejectionReason && r.status !== 'active' && <p className="mt-1 text-[12.5px] text-tomato-600">Reason: {r.rejectionReason}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === 'pending' && (
                    <>
                      <Button size="sm" variant="primary" onClick={() => setAction({ r, kind: 'status', to: 'active' })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAction({ r, kind: 'status', to: 'rejected' })}>
                        Reject
                      </Button>
                    </>
                  )}
                  {r.status === 'active' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setAction({ r, kind: 'billing' })}>
                        Plan
                      </Button>
                      <Button size="sm" variant="soft" icon={<Sparkles className="size-3.5" />} onClick={() => setAction({ r, kind: 'sponsor' })}>
                        Feature
                      </Button>
                      <Button size="sm" variant="ghost" className="text-tomato-600" onClick={() => setAction({ r, kind: 'status', to: 'suspended' })}>
                        Suspend
                      </Button>
                    </>
                  )}
                  {(r.status === 'suspended' || r.status === 'rejected') && (
                    <Button size="sm" variant="dark" onClick={() => setAction({ r, kind: 'status', to: 'active' })}>
                      {r.status === 'rejected' ? 'Approve' : 'Reactivate'}
                    </Button>
                  )}
                  {r.status === 'active' && (
                    <Link to={`/restaurants/${r._id}`} target="_blank" className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label="Open public page">
                      <ExternalLink className="size-4" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
      {action && <ActionDialog action={action} onClose={() => setAction(null)} />}
    </>
  );
}
