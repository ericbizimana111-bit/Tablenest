import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Gift, Mail, Share2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { referralApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { timeAgo } from '@/lib/format';
import { PageHead } from '@/layouts/AccountLayout';
import { Badge, EmptyState } from '@/ui/bits';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Field';
import { Skeleton } from '@/ui/Loader';

export default function Referrals() {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['referrals'], queryFn: referralApi.get });
  const invite = useMutation({
    mutationFn: () => referralApi.invite(email.trim()),
    onSuccess: () => {
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      qc.invalidateQueries({ queryKey: ['referrals'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (isLoading || !data) return <Skeleton className="h-64" />;
  const link = `${location.origin}/register?ref=${data.code}`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Join me on TableNest', text: `Use my code ${data.code} and we both earn reward points.`, url: link });
      else {
        await navigator.clipboard.writeText(link);
        toast.success('Invite link copied');
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="space-y-8">
      <PageHead eyebrow="Share the table" title="Invite friends" lead="When a friend joins with your code and completes their first order or visit, you both get 500 points." />
      <section className="grid gap-6 rounded-[28px] border border-line bg-card p-6 sm:p-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-ink-3">Your code</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-2xl border-2 border-dashed border-saffron-300 bg-saffron-50 px-5 py-3 font-mono text-2xl font-bold tracking-wider text-ink">{data.code}</span>
            <Button variant="outline" icon={<Copy className="size-4" />} onClick={() => navigator.clipboard.writeText(data.code).then(() => toast.success('Code copied'))}>
              Copy
            </Button>
          </div>
          <Button className="mt-4" variant="dark" icon={<Share2 className="size-4" />} onClick={share}>
            Share invite link
          </Button>
          <p className="mt-6 font-display text-4xl text-herb-800 tabular-nums">{data.totalEarned}</p>
          <p className="text-sm text-ink-3">points earned from friends so far</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
          className="rounded-[22px] bg-paper p-5"
        >
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Mail className="size-4 text-herb-600" /> Invite by email
          </p>
          <Input className="mt-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@example.com" aria-label="Friend's email" />
          <Button type="submit" className="mt-3" block variant="primary" loading={invite.isPending} disabled={!/^\S+@\S+\.\S+$/.test(email)} icon={<UserPlus className="size-4" />}>
            Send invitation
          </Button>
        </form>
      </section>
      <section>
        <h2 className="mb-4 text-2xl text-ink">Invited</h2>
        {data.referrals.length ? (
          <ul className="divide-y divide-line rounded-[22px] border border-line bg-card">
            {data.referrals.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{r.name || r.email}</p>
                  <p className="truncate text-[12px] text-ink-4">
                    {r.email} · {timeAgo(r.invitedAt)}
                  </p>
                </div>
                <Badge tone={r.status === 'successful' ? 'herb' : 'saffron'}>{r.status === 'successful' ? `+${r.reward} pts` : 'Waiting for first order'}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Gift className="size-6" />} title="No invitations yet" body="Share your code — the first friend is the best one." />
        )}
      </section>
    </div>
  );
}
