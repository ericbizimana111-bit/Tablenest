import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Ban, CheckCheck, RefreshCw, Wallet, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { axisTick, chartTooltip, gridStroke } from '@/lib/chart';
import { errorMessage } from '@/lib/http';
import { cn, formatBookingDate, formatMoney } from '@/lib/format';
import type { Charge } from '@/lib/types';
import { DashHead, Panel, Stat } from '@/layouts/DashboardLayout';
import { Badge, Chip, EmptyState, Pager } from '@/ui/bits';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Field';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const TYPE_LABEL: Record<string, string> = { commission: 'Commission', service_fee: 'Service fees', booking_fee: 'Booking fees', subscription: 'Subscriptions', sponsorship: 'Featured placement' };
const period = (offset = 0) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function Charges({ currency }: { currency: string }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState('unpaid');
  const [page, setPage] = useState(1);
  const [voiding, setVoiding] = useState<Charge | null>(null);
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'charges', status, page], queryFn: () => adminApi.charges({ status, page }), placeholderData: (p) => p });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });
  const pay = useMutation({
    mutationFn: (ids: string[]) => adminApi.markPaid({ ids }),
    onSuccess: (r) => (toast.success(`${r.updated} marked as settled`), setSelected([]), refresh()),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const voidIt = useMutation({
    mutationFn: () => adminApi.voidCharge(voiding!._id, reason.trim()),
    onSuccess: () => (setVoiding(null), setReason(''), refresh()),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const list = data?.charges ?? [];
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Panel
      title="Ledger"
      pad={false}
      action={
        <div className="flex items-center gap-2">
          {!!selected.length && (
            <Button size="sm" variant="dark" icon={<CheckCheck className="size-4" />} loading={pay.isPending} onClick={() => pay.mutate(selected)}>
              Settle {selected.length}
            </Button>
          )}
          {['unpaid', 'paid', 'void'].map((s) => (
            <Chip key={s} active={status === s} onClick={() => (setStatus(s), setPage(1), setSelected([]))}>
              {s === 'unpaid' ? 'Due' : s === 'paid' ? 'Settled' : 'Voided'}
            </Chip>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <Skeleton className="m-5 h-40" />
      ) : !list.length ? (
        <EmptyState className="m-5 border-0" icon={<Wallet className="size-6" />} title="Nothing here" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c._id} className={cn(selected.includes(c._id) && 'bg-herb-50')}>
                  <td className="w-10 pl-5">{c.status === 'unpaid' && <input type="checkbox" className="size-4 accent-herb-700" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} aria-label="Select charge" />}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-ink">{TYPE_LABEL[c.type] ?? c.type}</p>
                    <p className="max-w-md truncate text-[12.5px] text-ink-3">{c.description}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-3">{c.period}</td>
                  <td className="px-3 py-3 text-ink-3">{formatBookingDate(c.createdAt, { day: 'numeric', month: 'short' })}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatMoney(c.amount, c.currency || currency)}</td>
                  <td className="px-5 py-3 text-right">
                    {c.status === 'unpaid' ? (
                      <button onClick={() => setVoiding(c)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-3 hover:text-tomato-600">
                        <Ban className="size-3.5" /> Void
                      </button>
                    ) : (
                      <Badge tone={c.status === 'paid' ? 'herb' : 'neutral'}>{c.status === 'paid' ? 'Settled' : 'Voided'}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && (
        <div className="pb-4">
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}
      <Modal
        open={!!voiding}
        onClose={() => setVoiding(null)}
        size="sm"
        title="Void this charge?"
        description="The restaurant will no longer owe it. This is recorded in the audit log."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setVoiding(null)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={reason.trim().length < 3} loading={voidIt.isPending} onClick={() => voidIt.mutate()}>
              Void charge
            </Button>
          </div>
        }
      >
        <Input label="Reason" autoFocus value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </Panel>
  );
}

export default function AdminRevenue() {
  const qc = useQueryClient();
  const [from, setFrom] = useState(period(-5));
  const [to, setTo] = useState(period(0));
  const [confirmRun, setConfirmRun] = useState(false);
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'revenue', from, to], queryFn: () => adminApi.revenue(from, to), enabled: from <= to, placeholderData: (p) => p });
  const run = useMutation({
    mutationFn: () => adminApi.runSubscriptions(),
    onSuccess: (r) => (toast.success(`${r.created} subscription charges created for ${r.period}`), setConfirmRun(false), qc.invalidateQueries({ queryKey: ['admin'] })),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const reconcile = useMutation({
    mutationFn: adminApi.reconcile,
    onSuccess: (r) => (toast.success(`Checked ${r.ordersChecked ?? 0} orders and ${r.reservationsChecked} bookings`), qc.invalidateQueries({ queryKey: ['admin'] })),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const money = (n: number) => formatMoney(n, data?.currency);

  return (
    <>
      <DashHead
        title="Revenue"
        lead="What TableNest earns: commission on completed orders, the guest service fee, booking fees, plans and featured placement."
        action={
          <>
            <Button size="sm" variant="outline" icon={<RefreshCw className="size-4" />} loading={reconcile.isPending} onClick={() => reconcile.mutate()}>
              Reconcile
            </Button>
            <Button size="sm" variant="dark" icon={<Zap className="size-4" />} onClick={() => setConfirmRun(true)}>
              Bill this month's plans
            </Button>
          </>
        }
      />
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Input label="From" type="month" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className="w-44" />
        <Input label="To" type="month" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} className="w-44" />
      </div>
      {error ? (
        <p className="rounded-xl bg-tomato-50 p-4 text-sm text-tomato-700">{errorMessage(error)}</p>
      ) : isLoading || !data ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat tone="dark" label="Earned" value={money(data.total)} hint={`${from} to ${to}`} icon={<Wallet className="size-4" />} />
            <Stat label="Collected" value={money(data.collected)} />
            <Stat label="Outstanding" value={money(data.outstanding)} tone={data.outstanding ? 'saffron' : 'plain'} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Panel title="By month">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byPeriod} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} tick={axisTick} />
                    <YAxis tickLine={false} axisLine={false} tick={axisTick} width={60} />
                    <Tooltip {...chartTooltip} cursor={{ fill: 'rgba(15,42,32,0.05)' }} formatter={(v) => [money(Number(v)), 'Revenue']} />
                    <Bar dataKey="amount" fill="#1d4a37" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="By source">
              {data.byType.length ? (
                <ul className="space-y-3">
                  {data.byType.map((t) => (
                    <li key={t.type}>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-ink">{TYPE_LABEL[t.type] ?? t.type}</span>
                        <span className="tabular-nums">{money(t.amount)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-paper-2">
                        <div className="h-full rounded-full bg-saffron-400" style={{ width: `${(t.amount / (data.total || 1)) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-[12px] text-ink-4">{t.count} entries</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-ink-3">No revenue in this range.</p>
              )}
            </Panel>
          </div>
          {!!data.topRestaurants.length && (
            <Panel title="Top partners">
              <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {data.topRestaurants.map((r, i) => (
                  <li key={r.restaurantId} className="flex items-center gap-3 text-sm">
                    <span className="w-5 font-display text-lg text-ink-4">{i + 1}</span>
                    <span className="flex-1 truncate font-semibold text-ink">{r.name}</span>
                    <span className="tabular-nums">{money(r.amount)}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          )}
          <Charges currency={data.currency} />
        </div>
      )}
      <Confirm
        open={confirmRun}
        onClose={() => setConfirmRun(false)}
        onConfirm={() => run.mutate()}
        loading={run.isPending}
        tone="dark"
        title={`Bill plans for ${period(0)}?`}
        body="Creates this month's subscription charge for every active restaurant on a paid plan. Safe to run twice — nobody is charged twice for the same month."
        confirmLabel="Create charges"
      />
    </>
  );
}
