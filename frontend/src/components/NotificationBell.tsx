import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarDays, Gift, Info, MessageSquare, Receipt } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import { cn, timeAgo } from '@/lib/format';
import type { AppNotification } from '@/lib/types';
import { IconButton } from '@/ui/Button';

const ICON: Record<AppNotification['type'], typeof Bell> = {
  order: Receipt,
  booking: CalendarDays,
  promotion: Gift,
  review: MessageSquare,
  payment: Receipt,
  system: Info,
};

export function NotificationBell({ allHref = '/notifications' }: { allHref?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const unread = useQuery({ queryKey: ['notifications', 'unread'], queryFn: notificationApi.unread, refetchInterval: 45_000 });
  const list = useQuery({ queryKey: ['notifications', 'list', 1], queryFn: () => notificationApi.list(1), enabled: open });
  const markAll = useMutation({ mutationFn: notificationApi.readAll, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const count = unread.data?.count ?? 0;
  const go = async (n: AppNotification) => {
    setOpen(false);
    if (!n.isRead) notificationApi.read(n._id).then(() => qc.invalidateQueries({ queryKey: ['notifications'] }));
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <IconButton label={count ? `Notifications, ${count} unread` : 'Notifications'} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Bell className={cn('size-5', count > 0 && 'origin-top animate-[wiggle_2.4s_ease-in-out_infinite]')} />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-tomato-500 px-1 text-[10px] leading-4 font-bold text-white ring-2 ring-paper">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </IconButton>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] origin-top-right overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="font-display text-lg text-ink">Updates</p>
              {count > 0 && (
                <button onClick={() => markAll.mutate()} className="text-xs font-semibold text-herb-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[380px] overflow-y-auto border-t border-line">
              {list.isLoading && <p className="p-6 text-center text-sm text-ink-3">Loading…</p>}
              {list.data?.notifications.length === 0 && <p className="p-8 text-center text-sm text-ink-3">You're all caught up.</p>}
              {list.data?.notifications.slice(0, 8).map((n) => {
                const Icon = ICON[n.type] ?? Info;
                return (
                  <button key={n._id} onClick={() => go(n)} className={cn('flex w-full gap-3 px-4 py-3 text-left transition hover:bg-paper', !n.isRead && 'bg-saffron-50/60')}>
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-paper-2 text-herb-700">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink">{n.title}</span>
                        {!n.isRead && <span className="size-1.5 shrink-0 rounded-full bg-tomato-500" />}
                      </span>
                      <span className="line-clamp-2 text-[13px] text-ink-3">{n.message}</span>
                      <span className="mt-0.5 block text-[11px] text-ink-4">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <Link to={allHref} onClick={() => setOpen(false)} className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-herb-700 hover:bg-paper">
              See all updates
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
