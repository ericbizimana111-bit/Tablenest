import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { DashHead } from '@/layouts/DashboardLayout';
import { Badge, EmptyState, Pager } from '@/ui/bits';
import { Input } from '@/ui/Field';
import { Skeleton } from '@/ui/Loader';

/** "admin.restaurant_status" → "Restaurant status" */
const human = (action: string) => {
  const s = action.split('.').slice(1).join(' ').replace(/_/g, ' ') || action;
  return s[0].toUpperCase() + s.slice(1);
};

export default function AdminAudit() {
  const [draft, setDraft] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'audit', action, page], queryFn: () => adminApi.audit({ action, page }), placeholderData: (p) => p });

  return (
    <>
      <DashHead title="Audit log" lead="Every sensitive action — approvals, suspensions, plan changes, refunds, settings — with who did it and when." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setAction(draft.trim());
        }}
        className="mb-5 max-w-sm"
      >
        <Input aria-label="Filter by action" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Filter by action, e.g. admin.settings_updated" leading={<Search className="size-4" />} />
      </form>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.items.length ? (
        <EmptyState icon={<ScrollText className="size-6" />} title="No entries" />
      ) : (
        <ol className="relative space-y-3 border-l-2 border-dashed border-line-2 pl-6">
          {data.items.map((e) => (
            <li key={e._id} className="relative rounded-[18px] border border-line bg-card p-4">
              <span className="absolute top-5 -left-[31px] size-3 rounded-full border-2 border-paper bg-herb-600" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{human(e.action)}</p>
                {e.actorRole && <Badge tone={e.actorRole === 'admin' ? 'ink' : 'neutral'}>{e.actorRole}</Badge>}
                <span className="ml-auto text-[12.5px] text-ink-4">{formatDateTime(e.createdAt)}</span>
              </div>
              <p className="mt-1 font-mono text-[12px] text-ink-4">
                {e.action}
                {e.targetType && ` · ${e.targetType} ${e.targetId ?? ''}`}
              </p>
              {Object.keys(e.meta ?? {}).length > 0 && (
                <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                  {Object.entries(e.meta).map(([k, v]) => (
                    <div key={k} className="flex gap-1">
                      <dt className="text-ink-4">{k}:</dt>
                      <dd className="max-w-[320px] truncate text-ink-2">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          ))}
        </ol>
      )}
      {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}
