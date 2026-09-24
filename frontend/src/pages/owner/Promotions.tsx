import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { promotionApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, formatBookingDate, isoDay } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { Promotion, Restaurant } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button } from '@/ui/Button';
import { Badge, EmptyState, Segmented } from '@/ui/bits';
import { Input, Textarea, Toggle } from '@/ui/Field';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

type Draft = Partial<Promotion>;

function stateOf(p: Promotion): { label: string; tone: 'herb' | 'saffron' | 'neutral' } {
  const today = isoDay();
  if (!p.isActive) return { label: 'Paused', tone: 'neutral' };
  if (p.startDate.slice(0, 10) > today) return { label: 'Scheduled', tone: 'saffron' };
  if (p.endDate.slice(0, 10) < today) return { label: 'Ended', tone: 'neutral' };
  if (p.usageLimit && (p.usedCount ?? 0) >= p.usageLimit) return { label: 'Used up', tone: 'neutral' };
  return { label: 'Running', tone: 'herb' };
}

function PromoForm({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const qc = useQueryClient();
  const [d, setD] = useState<Draft>(initial);
  const [err, setErr] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      const body: Draft = {
        name: d.name?.trim(),
        description: d.description?.trim() || null,
        discountType: d.discountType ?? 'percentage',
        discountValue: Number(d.discountValue),
        minOrder: Number(d.minOrder) || 0,
        usageLimit: d.usageLimit ? Number(d.usageLimit) : 0,
        startDate: d.startDate?.slice(0, 10),
        endDate: d.endDate?.slice(0, 10),
        code: d.code?.trim().toUpperCase() || null,
        isActive: d.isActive ?? true,
      };
      return d._id ? promotionApi.update(d._id, body) : promotionApi.create(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner', 'promotions'] });
      toast.success(d._id ? 'Promotion updated' : 'Promotion created');
      onClose();
    },
    onError: (e) => setErr(errorMessage(e)),
  });
  const pct = (d.discountType ?? 'percentage') === 'percentage';
  const valid = !!d.name?.trim() && Number(d.discountValue) > 0 && (!pct || Number(d.discountValue) <= 100) && !!d.startDate && !!d.endDate && d.endDate >= d.startDate;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={d._id ? 'Edit promotion' : 'New promotion'}
      description="Promotions without a code apply automatically at checkout. The discount is always calculated on our side."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" disabled={!valid} loading={save.isPending} onClick={() => save.mutate()}>
            {d._id ? 'Save' : 'Create promotion'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" className="sm:col-span-2" maxLength={80} value={d.name ?? ''} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="e.g. Tuesday lunch deal" />
        <Textarea label="Description" optional rows={2} className="sm:col-span-2" maxLength={500} value={d.description ?? ''} onChange={(e) => setD({ ...d, description: e.target.value })} />
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-semibold text-ink-2">Discount</p>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              id="promo-type"
              size="sm"
              value={d.discountType ?? 'percentage'}
              onChange={(v) => setD({ ...d, discountType: v })}
              options={[
                { value: 'percentage', label: 'Percent off' },
                { value: 'flat', label: 'Amount off' },
              ]}
            />
            <Input className="w-36" aria-label="Discount value" type="number" min={0.01} max={pct ? 100 : undefined} step="0.01" value={d.discountValue ?? ''} onChange={(e) => setD({ ...d, discountValue: e.target.value === '' ? undefined : Number(e.target.value) })} trailing={pct ? '%' : undefined} />
          </div>
        </div>
        <Input label="Starts" type="date" value={d.startDate?.slice(0, 10) ?? ''} onChange={(e) => setD({ ...d, startDate: e.target.value })} />
        <Input label="Ends" type="date" min={d.startDate?.slice(0, 10)} value={d.endDate?.slice(0, 10) ?? ''} onChange={(e) => setD({ ...d, endDate: e.target.value })} />
        <Input label="Minimum order" optional type="number" min={0} value={d.minOrder ?? ''} onChange={(e) => setD({ ...d, minOrder: Number(e.target.value) })} />
        <Input label="Total uses" optional hint="Leave empty for unlimited" type="number" min={0} value={d.usageLimit || ''} onChange={(e) => setD({ ...d, usageLimit: Number(e.target.value) })} />
        <Input label="Checkout code" optional hint="3–30 letters or numbers. Empty = applies automatically." className="sm:col-span-2" value={d.code ?? ''} onChange={(e) => setD({ ...d, code: e.target.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase() })} placeholder="e.g. WELCOME10" />
        <div className="sm:col-span-2">
          <Toggle checked={d.isActive ?? true} onChange={(v) => setD({ ...d, isActive: v })} label="Active" description="Pause any time without deleting it." />
        </div>
      </div>
      {err && <p className="mt-4 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">{err}</p>}
    </Modal>
  );
}

function Promos({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const money = useMoney();
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'promotions', r._id], queryFn: () => promotionApi.forRestaurant(r._id) });
  const [editing, setEditing] = useState<Draft | null>(null);
  const [removing, setRemoving] = useState<Promotion | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ['owner', 'promotions'] });
  const toggle = useMutation({ mutationFn: promotionApi.toggle, onSuccess: refresh, onError: (e) => toast.error(errorMessage(e)) });
  const remove = useMutation({ mutationFn: promotionApi.remove, onSuccess: () => (setRemoving(null), refresh()), onError: (e) => toast.error(errorMessage(e)) });
  const blank: Draft = { discountType: 'percentage', startDate: isoDay(), endDate: isoDay(30), isActive: true };

  return (
    <>
      <DashHead
        title="Promotions"
        lead="Deals bring new guests in and give regulars a reason to come back. Running promotions are shown on your page and in Discover."
        action={
          <Button variant="primary" size="sm" icon={<Plus className="size-4" />} onClick={() => setEditing(blank)}>
            New promotion
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !data?.length ? (
        <EmptyState icon={<Megaphone className="size-6" />} title="No promotions yet" body="Try 10% off weekday lunches, or an amount off first orders with a code you share on social media." action={<Button onClick={() => setEditing(blank)}>Create one</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => {
            const s = stateOf(p);
            return (
              <article key={p._id} className={cn('flex flex-col rounded-[22px] border bg-card', s.tone === 'herb' ? 'border-herb-200' : 'border-line')}>
                <div className="flex items-start gap-4 p-5">
                  <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-saffron-50 text-center">
                    <span className="font-display text-xl leading-none text-saffron-700">{p.discountType === 'percentage' ? `${p.discountValue}%` : money(p.discountValue)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-ink">{p.name}</p>
                      <Badge tone={s.tone} dot>
                        {s.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-ink-3">
                      {formatBookingDate(p.startDate, { day: 'numeric', month: 'short' })} – {formatBookingDate(p.endDate, { day: 'numeric', month: 'short' })}
                      {p.minOrder ? ` · min ${money(p.minOrder)}` : ''}
                    </p>
                    {p.code ? <p className="mt-2 inline-block rounded-lg border border-dashed border-saffron-300 px-2 py-0.5 font-mono text-[13px] font-bold text-ink">{p.code}</p> : <p className="mt-2 text-[12.5px] text-herb-700">Applies automatically</p>}
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-1 border-t border-dashed border-line-2 px-3 py-2.5">
                  <span className="px-2 text-[12.5px] text-ink-3">
                    Used {p.usedCount ?? 0}
                    {p.usageLimit ? ` / ${p.usageLimit}` : ''}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <Button size="sm" variant="ghost" loading={toggle.isPending && toggle.variables === p._id} onClick={() => toggle.mutate(p._id)}>
                      {p.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <button onClick={() => setEditing(p)} className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label={`Edit ${p.name}`}>
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => setRemoving(p)} className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-tomato-50 hover:text-tomato-600" aria-label={`Delete ${p.name}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {editing && <PromoForm initial={editing} onClose={() => setEditing(null)} />}
      <Confirm open={!!removing} onClose={() => setRemoving(null)} onConfirm={() => removing && remove.mutate(removing._id)} loading={remove.isPending} title={`Delete ${removing?.name}?`} body="Orders that already used it keep their discount." confirmLabel="Delete" />
    </>
  );
}

export default function OwnerPromotions() {
  return <OwnerGate>{(r) => <Promos r={r} />}</OwnerGate>;
}
