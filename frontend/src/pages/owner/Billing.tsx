import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Receipt, Sparkles, Wallet } from 'lucide-react';
import { billingApi } from '@/lib/api';
import { cn, formatBookingDate, formatMoney } from '@/lib/format';
import { usePublicSettings } from '@/lib/settings';
import type { Charge } from '@/lib/types';
import { DashHead, Panel, Stat } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { LinkButton } from '@/ui/Button';
import { Badge, EmptyState } from '@/ui/bits';
import { Skeleton } from '@/ui/Loader';

const TYPE_LABEL: Record<Charge['type'], string> = {
  commission: 'Order commission',
  service_fee: 'Service fee',
  booking_fee: 'Booking fee',
  subscription: 'Plan subscription',
  sponsorship: 'Featured placement',
};

function lastMonths(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}
const monthName = (p: string) => new Date(`${p}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });

function Statement() {
  const periods = lastMonths(12);
  const [period, setPeriod] = useState(periods[0]);
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'statement', period], queryFn: () => billingApi.statement(period), placeholderData: (p) => p });
  const settings = usePublicSettings();
  const money = (n: number) => formatMoney(n, data?.currency);
  const plans = settings.data?.plans;

  return (
    <>
      <DashHead
        title="Billing"
        lead="Exactly what TableNest charges and why — every line is tied to a real order, booking or plan."
        action={
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-base !h-10 !w-auto" aria-label="Statement month">
            {periods.map((p) => (
              <option key={p} value={p}>
                {monthName(p)}
              </option>
            ))}
          </select>
        }
      />
      {isLoading || !data ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat tone="dark" label={`${monthName(period)} total`} value={money(data.totals.total)} hint={`${money(data.totals.paid)} settled`} icon={<Receipt className="size-4" />} />
            <Stat label="Due this month" value={money(data.totals.unpaid)} tone={data.totals.unpaid ? 'saffron' : 'plain'} icon={<Wallet className="size-4" />} />
            <Stat label="Outstanding, all months" value={money(data.outstandingAllPeriods)} hint="Settled with your account manager" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Panel title="Charges" pad={false}>
              {data.charges.length ? (
                <ul className="divide-y divide-line">
                  {data.charges.map((c) => (
                    <li key={c._id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{TYPE_LABEL[c.type]}</p>
                        <p className="truncate text-[12.5px] text-ink-3">
                          {c.description} · {formatBookingDate(c.createdAt, { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <Badge tone={c.status === 'paid' ? 'herb' : c.status === 'void' ? 'neutral' : 'saffron'}>{c.status === 'paid' ? 'Settled' : c.status === 'void' ? 'Voided' : 'Due'}</Badge>
                      <span className={cn('w-24 text-right font-semibold tabular-nums', c.status === 'void' && 'text-ink-4 line-through')}>{money(c.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState className="m-5 border-0" icon={<Receipt className="size-6" />} title="Nothing charged" body={`No charges for ${monthName(period)}.`} />
              )}
            </Panel>

            <div className="space-y-6">
              <Panel title="Your plan">
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-3xl text-ink capitalize">{data.plan}</p>
                  <p className="text-sm text-ink-3">{Math.round(data.commissionRate * 1000) / 10}% per completed order</p>
                </div>
                {plans && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {(['starter', 'pro'] as const).map((p) => (
                      <div key={p} className={cn('rounded-2xl border p-4', data.plan === p ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line')}>
                        <p className="flex items-center gap-1.5 font-semibold capitalize">
                          {data.plan === p && <Check className="size-4 text-saffron-300" />} {p}
                        </p>
                        <p className="mt-2 font-display text-2xl">{plans[p].monthlyFee ? money(plans[p].monthlyFee) : 'Free'}</p>
                        <p className={cn('text-[12.5px]', data.plan === p ? 'text-paper/70' : 'text-ink-3')}>
                          {plans[p].monthlyFee ? 'per month + ' : ''}
                          {Math.round(plans[p].commissionRate * 100)}% commission
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {data.plan === 'starter' && plans && plans.pro.commissionRate < plans.starter.commissionRate && (
                  <p className="mt-4 text-[13px] text-ink-3">
                    Pro pays for itself once your monthly order sales pass about{' '}
                    <b className="text-ink">{money(Math.ceil(plans.pro.monthlyFee / (plans.starter.commissionRate - plans.pro.commissionRate)))}</b>.
                  </p>
                )}
                <LinkButton to="/help" variant="outline" size="sm" className="mt-4">
                  Talk to us about your plan
                </LinkButton>
              </Panel>

              <Panel>
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-saffron-50 text-saffron-600">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg text-ink">{data.sponsoredUntil && new Date(data.sponsoredUntil) > new Date() ? 'You are featured' : 'Get featured'}</p>
                    <p className="mt-1 text-[13.5px] text-ink-3">
                      {data.sponsoredUntil && new Date(data.sponsoredUntil) > new Date()
                        ? `Your restaurant is at the top of Discover until ${formatBookingDate(data.sponsoredUntil, { day: 'numeric', month: 'long' })}.`
                        : 'Featured restaurants sit at the top of Discover and the home page, clearly labelled as featured.'}
                    </p>
                    <LinkButton to="/help" variant="soft" size="sm" className="mt-3">
                      Ask about featured placement
                    </LinkButton>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function OwnerBilling() {
  return <OwnerGate>{() => <Statement />}</OwnerGate>;
}
