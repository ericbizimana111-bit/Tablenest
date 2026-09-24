import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarDays, CheckCheck, Gift, Info, MessageSquare, Receipt, Trash2 } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import { cn, timeAgo } from '@/lib/format';
import type { AppNotification } from '@/lib/types';
import { PageHead } from '@/layouts/AccountLayout';
import { Button } from '@/ui/Button';
import { Chip, EmptyState } from '@/ui/bits';
import { Confirm } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const ICON: Record<AppNotification['type'], typeof Bell> = { order: Receipt, booking: CalendarDays, promotion: Gift, review: MessageSquare, payment: Receipt, system: Info };
const FILTERS = [
  { v: 'all', l: 'Everything' },
  { v: 'order', l: 'Orders' },
  { v: 'booking', l: 'Bookings' },
  { v: 'review', l: 'Reviews' },
  { v: 'system', l: 'Account' },
];

export default function Notifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [clearing, setClearing] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['notifications', 'list', type, page], queryFn: () => notificationApi.list(page, type), placeholderData: (p) => p });
  const refresh = () => qc.invalidateQueries({ queryKey: ['notifications'] });
  const readAll = useMutation({ mutationFn: notificationApi.readAll, onSuccess: refresh });
  const clear = useMutation({ mutationFn: notificationApi.clear, onSuccess: () => (refresh(), setClearing(false)) });

  const open = (n: AppNotification) => {
    if (!n.isRead) notificationApi.read(n._id).then(refresh);
    if (n.link) navigate(n.link);
  };

  return (
    <div>
      <PageHead
        eyebrow="Inbox"
        title="Updates"
        action={
          <div className="flex gap-2">
            {!!data?.unread && (
              <Button variant="outline" size="sm" icon={<CheckCheck className="size-4" />} onClick={() => readAll.mutate()}>
                Mark all read
              </Button>
            )}
            {!!data?.total && (
              <Button variant="ghost" size="sm" icon={<Trash2 className="size-4" />} onClick={() => setClearing(true)}>
                Clear
              </Button>
            )}
          </div>
        }
      />
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <Chip key={f.v} active={type === f.v} onClick={() => (setType(f.v), setPage(1))}>
            {f.l}
          </Chip>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !data?.notifications.length ? (
        <EmptyState icon={<Bell className="size-6" />} title="All quiet" body="Booking confirmations, order updates and replies to your reviews will appear here." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-card">
          {data.notifications.map((n) => {
            const Icon = ICON[n.type] ?? Info;
            return (
              <li key={n._id}>
                <button onClick={() => open(n)} className={cn('flex w-full gap-4 px-5 py-4 text-left transition hover:bg-paper', !n.isRead && 'bg-saffron-50/50')}>
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', n.isRead ? 'bg-paper-2 text-ink-3' : 'bg-herb-900 text-saffron-300')}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{n.title}</span>
                      {!n.isRead && <span className="size-2 rounded-full bg-tomato-500" />}
                    </span>
                    <span className="block text-[14px] text-ink-3">{n.message}</span>
                  </span>
                  <span className="shrink-0 text-[12px] text-ink-4">{timeAgo(n.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {data && data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Newer
          </Button>
          <span className="text-sm text-ink-3">
            {page} / {data.pages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            Older
          </Button>
        </div>
      )}
      <Confirm open={clearing} onClose={() => setClearing(false)} onConfirm={() => clear.mutate()} loading={clear.isPending} title="Clear all updates?" body="This removes every notification. It can't be undone." confirmLabel="Clear all" />
    </div>
  );
}
