import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { CornerDownRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { timeAgo } from '@/lib/format';
import type { Restaurant, Review } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button } from '@/ui/Button';
import { Avatar, EmptyState, RatingSeal, Stars } from '@/ui/bits';
import { Skeleton } from '@/ui/Loader';

function ReplyBox({ review, onDone }: { review: Review; onDone: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState(review.ownerReply ?? '');
  const send = useMutation({
    mutationFn: () => reviewApi.reply(review._id, text.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner', 'reviews'] });
      toast.success('Reply published');
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="mt-3">
      <textarea autoFocus rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} className="input-base !h-auto py-3" placeholder="Thank them, answer questions, or explain what you're fixing. Replies are public." aria-label="Your reply" />
      <div className="mt-2 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button size="sm" variant="dark" disabled={text.trim().length < 2} loading={send.isPending} onClick={() => send.mutate()}>
          Publish reply
        </Button>
      </div>
    </div>
  );
}

function List({ r }: { r: Restaurant }) {
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'reviews', r._id, page], queryFn: () => reviewApi.forRestaurant(r._id, page), placeholderData: (p) => p });
  const max = Math.max(1, ...Object.values(data?.distribution ?? {}));
  const unanswered = data?.reviews.filter((v) => !v.ownerReply).length ?? 0;

  return (
    <>
      <DashHead title="Reviews" lead="Every review comes from a guest who actually ordered or dined with you. Thoughtful replies are the cheapest marketing there is." />
      {isLoading || !data ? (
        <Skeleton className="h-72" />
      ) : !data.total ? (
        <EmptyState icon={<MessageSquare className="size-6" />} title="No reviews yet" body="Guests can review after a completed order or visit. Great first plates make great first reviews." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-[22px] border border-line bg-card p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-4">
              <RatingSeal rating={data.avgRating} />
              <div>
                <p className="font-display text-3xl text-ink">{data.avgRating.toFixed(1)}</p>
                <p className="text-sm text-ink-3">{data.total} reviews</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = data.distribution[n] ?? 0;
                return (
                  <div key={n} className="flex items-center gap-3 text-sm">
                    <span className="w-3 text-ink-3">{n}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(c / max) * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-saffron-400" />
                    </div>
                    <span className="w-6 text-right text-ink-3 tabular-nums">{c}</span>
                  </div>
                );
              })}
            </div>
            {!!unanswered && <p className="mt-6 rounded-xl bg-saffron-50 p-3 text-[13px] text-saffron-700">{unanswered} on this page still waiting for your reply.</p>}
          </aside>
          <div>
            <ul className="space-y-3">
              {data.reviews.map((v) => (
                <li key={v._id} className="rounded-[22px] border border-line bg-card p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={v.customerName || 'Guest'} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-semibold text-ink">{v.customerName || 'Guest'}</p>
                        <Stars value={v.rating} />
                        <span className="text-[12px] text-ink-4">
                          {timeAgo(v.createdAt)} · {v.reservationId ? 'Dined in' : 'Ordered'}
                        </span>
                      </div>
                      {v.comment ? <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{v.comment}</p> : <p className="mt-2 text-sm text-ink-4 italic">Left a rating without comment.</p>}
                      {replying === v._id ? (
                        <ReplyBox review={v} onDone={() => setReplying(null)} />
                      ) : v.ownerReply ? (
                        <div className="mt-3 flex gap-2 rounded-2xl bg-paper p-3.5">
                          <CornerDownRight className="mt-0.5 size-4 shrink-0 text-herb-600" />
                          <div className="min-w-0 flex-1 text-sm">
                            <p className="font-semibold text-herb-800">Your reply</p>
                            <p className="text-ink-2">{v.ownerReply}</p>
                          </div>
                          <button onClick={() => setReplying(v._id)} className="self-start text-[13px] font-semibold text-ink-3 hover:text-ink">
                            Edit
                          </button>
                        </div>
                      ) : (
                        <Button className="mt-3" size="sm" variant="soft" icon={<CornerDownRight className="size-4" />} onClick={() => setReplying(v._id)}>
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {data.pages > 1 && (
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
          </div>
        </div>
      )}
    </>
  );
}

export default function OwnerReviews() {
  return <OwnerGate>{(r) => <List r={r} />}</OwnerGate>;
}
