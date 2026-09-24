import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, supportApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, timeAgo } from '@/lib/format';
import type { SupportTicket } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { Badge, Chip, EmptyState, Pager } from '@/ui/bits';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Loader';

const STATUS: Record<SupportTicket['status'], { label: string; tone: 'saffron' | 'sky' | 'herb' | 'neutral' }> = {
  open: { label: 'Open', tone: 'saffron' },
  in_progress: { label: 'In progress', tone: 'sky' },
  resolved: { label: 'Resolved', tone: 'herb' },
  closed: { label: 'Closed', tone: 'neutral' },
};
const author = (t: SupportTicket) => (t.userId && typeof t.userId === 'object' ? t.userId : null);

function Thread({ t }: { t: SupportTicket }) {
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'support'] });
  const reply = useMutation({ mutationFn: () => supportApi.reply(t._id, msg.trim()), onSuccess: () => (setMsg(''), refresh()), onError: (e) => toast.error(errorMessage(e)) });
  const setStatus = useMutation({ mutationFn: (status: string) => adminApi.updateTicket(t._id, { status }), onSuccess: refresh, onError: (e) => toast.error(errorMessage(e)) });
  const a = author(t);
  const authorId = a?._id ?? (typeof t.userId === 'string' ? t.userId : null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl text-ink">{t.subject}</h2>
          <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
        </div>
        <p className="mt-1 text-[13px] text-ink-3">
          {a ? `${a.fullName} · ${a.email} · ${a.role === 'customer' ? 'guest' : a.role}` : 'Unknown user'} · {t.type} · {timeAgo(t.createdAt)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['in_progress', 'resolved', 'closed'] as const)
            .filter((s) => s !== t.status)
            .map((s) => (
              <Button key={s} size="sm" variant="outline" loading={setStatus.isPending && setStatus.variables === s} onClick={() => setStatus.mutate(s)}>
                Mark {STATUS[s].label.toLowerCase()}
              </Button>
            ))}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-paper-2 p-3.5 text-sm whitespace-pre-wrap text-ink-2">{t.description}</div>
        {t.responses.map((r, i) => {
          const mine = r.authorId !== authorId;
          return (
            <div key={i} className={cn('max-w-[85%] rounded-2xl p-3.5 text-sm whitespace-pre-wrap', mine ? 'ml-auto rounded-tr-sm bg-herb-900 text-paper' : 'rounded-tl-sm bg-paper-2 text-ink-2')}>
              {r.message}
              <p className={cn('mt-1 text-[11px]', mine ? 'text-paper/50' : 'text-ink-4')}>
                {mine ? 'Support' : a?.fullName || 'User'} · {timeAgo(r.createdAt)}
              </p>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (msg.trim()) reply.mutate();
        }}
        className="flex gap-2 border-t border-line p-4"
      >
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={2} maxLength={2000} className="input-base !h-auto flex-1 resize-none py-2.5" placeholder="Write a reply — the user is notified" aria-label="Reply" />
        <Button type="submit" variant="dark" loading={reply.isPending} disabled={!msg.trim()} icon={<Send className="size-4" />} aria-label="Send reply" />
      </form>
    </div>
  );
}

export default function AdminSupport() {
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'support', status, page], queryFn: () => adminApi.support({ status, page }), placeholderData: (p) => p, refetchInterval: 60_000 });
  const tickets = data?.tickets ?? [];
  const current = tickets.find((t) => t._id === openId) ?? null;

  return (
    <>
      <DashHead title="Support" lead="Requests from guests and restaurant owners." />
      <div className="mb-5 flex gap-2">
        {[
          ['open', 'Open'],
          ['in_progress', 'In progress'],
          ['resolved', 'Resolved'],
          ['', 'All'],
        ].map(([v, l]) => (
          <Chip key={v} active={status === v} onClick={() => (setStatus(v), setPage(1), setOpenId(null))}>
            {l}
          </Chip>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !tickets.length ? (
        <EmptyState icon={<LifeBuoy className="size-6" />} title="Inbox zero" body="No tickets with this status." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div>
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t._id}>
                  <button onClick={() => setOpenId(t._id)} className={cn('w-full rounded-2xl border p-4 text-left transition', openId === t._id ? 'border-herb-900 bg-herb-50' : 'border-line bg-card hover:border-line-2')}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-ink">{t.subject}</p>
                      <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[12.5px] text-ink-3">
                      {author(t)?.fullName || 'User'} · {timeAgo(t.createdAt)} · {t.responses.length} replies
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
          </div>
          <div className="min-h-[480px] overflow-hidden rounded-[22px] border border-line bg-card">
            {current ? <Thread key={current._id} t={current} /> : <p className="grid h-full min-h-[480px] place-items-center text-sm text-ink-3">Choose a ticket to read and reply.</p>}
          </div>
        </div>
      )}
    </>
  );
}
