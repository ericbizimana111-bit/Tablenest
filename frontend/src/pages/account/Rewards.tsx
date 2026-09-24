import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Bike, Copy, Crown, Gift, Percent, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { loyaltyApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, formatBookingDate, timeAgo } from '@/lib/format';
import { PageHead } from '@/layouts/AccountLayout';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Loader';

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export default function Rewards() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['loyalty'], queryFn: loyaltyApi.get });
  const redeem = useMutation({
    mutationFn: loyaltyApi.redeem,
    onSuccess: (r) => {
      toast.success(`Voucher ${r.voucher.code} is yours — use it at checkout`);
      qc.invalidateQueries({ queryKey: ['loyalty'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const copy = (code: string) => navigator.clipboard.writeText(code).then(() => toast.success('Code copied'));

  if (isLoading || !data) return <Skeleton className="h-72" />;
  return (
    <div className="space-y-8">
      <PageHead eyebrow="Loyalty" title="Rewards" lead="Every completed order and visit earns points. Turn them into vouchers you can use at checkout." />

      <section className="relative overflow-hidden rounded-[28px] bg-herb-900 p-7 text-paper sm:p-9">
        <div className="absolute -top-16 -right-16 size-64 rounded-full border-[40px] border-paper/[0.04]" />
        <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.2em] text-saffron-300 uppercase">
              <Crown className="size-4" /> {data.tier} member
            </p>
            <p className="mt-4 font-display text-7xl leading-none tabular-nums">{data.points}</p>
            <p className="mt-1 text-paper/70">points to spend · {data.lifetimePoints} earned in total</p>
          </div>
          <div className="flex gap-2">
            {TIERS.map((t) => (
              <span key={t} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', t === data.tier ? 'bg-saffron-400 text-herb-950' : 'bg-paper/10 text-paper/60')}>
                {t}
              </span>
            ))}
          </div>
        </div>
        {data.nextTier && (
          <div className="relative mt-8">
            <div className="h-2.5 overflow-hidden rounded-full bg-paper/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${data.tierProgress}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full bg-saffron-400" />
            </div>
            <p className="mt-2 text-sm text-paper/70">
              {data.nextTier.pointsNeeded} more points to reach {data.nextTier.name}
            </p>
          </div>
        )}
      </section>

      {!!data.vouchers.length && (
        <section>
          <h2 className="mb-4 text-2xl text-ink">Your vouchers</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.vouchers.map((v) => (
              <div key={v.code} className="flex items-center gap-4 rounded-[20px] border border-dashed border-saffron-300 bg-saffron-50 p-4">
                <Ticket className="size-6 shrink-0 text-saffron-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{v.title}</p>
                  <p className="text-[12.5px] text-ink-3">Valid until {formatBookingDate(v.expiresAt, { day: 'numeric', month: 'short' })}</p>
                </div>
                <button onClick={() => copy(v.code)} className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-mono text-sm font-semibold text-ink shadow-sm hover:bg-white">
                  {v.code} <Copy className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl text-ink">Rewards menu</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.rewards.map((r) => {
            const afford = data.points >= r.points;
            const Icon = r.discountType === 'free_delivery' ? Bike : r.discountType === 'percentage' ? Percent : Gift;
            return (
              <div key={r.id} className={cn('flex flex-col rounded-[22px] border bg-card p-5', afford ? 'border-line' : 'border-line opacity-70')}>
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-paper-2 text-herb-700">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-xl text-ink tabular-nums">{r.points} pts</span>
                </div>
                <p className="mt-4 font-display text-xl text-ink">{r.title}</p>
                <p className="mt-1 flex-1 text-[13.5px] text-ink-3">
                  {r.description}. Valid {r.validDays} days.
                </p>
                <Button
                  className="mt-4"
                  variant={afford ? 'dark' : 'outline'}
                  disabled={!afford}
                  loading={redeem.isPending && redeem.variables === r.id}
                  onClick={() => redeem.mutate(r.id)}
                >
                  {afford ? 'Redeem' : `${r.points - data.points} more points`}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {!!data.transactions.length && (
        <section>
          <h2 className="mb-4 text-2xl text-ink">History</h2>
          <ul className="divide-y divide-line rounded-[22px] border border-line bg-card">
            {data.transactions.map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.description}</p>
                  <p className="text-[12px] text-ink-4">{timeAgo(t.date)}</p>
                </div>
                <span className={cn('font-semibold tabular-nums', t.points > 0 ? 'text-herb-600' : 'text-ink-3')}>
                  {t.points > 0 ? '+' : ''}
                  {t.points}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
