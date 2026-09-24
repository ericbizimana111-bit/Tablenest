import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Minus, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { inventoryApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, timeAgo } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { InventoryItem, Restaurant } from '@/lib/types';
import { DashHead, Stat } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button } from '@/ui/Button';
import { Chip, EmptyState } from '@/ui/bits';
import { Input } from '@/ui/Field';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

function ItemForm({ initial, onClose }: { initial: Partial<InventoryItem>; onClose: () => void }) {
  const qc = useQueryClient();
  const [d, setD] = useState<Partial<InventoryItem>>(initial);
  const [err, setErr] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      const body = { name: d.name?.trim(), unit: d.unit?.trim() || 'pcs', quantity: Number(d.quantity) || 0, minQuantity: Number(d.minQuantity) || 0, supplier: d.supplier?.trim() || null, cost: d.cost === null || d.cost === undefined ? undefined : Number(d.cost) };
      return d._id ? inventoryApi.update(d._id, body) : inventoryApi.create(body);
    },
    onSuccess: () => (qc.invalidateQueries({ queryKey: ['owner', 'inventory'] }), onClose()),
    onError: (e) => setErr(errorMessage(e)),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title={d._id ? `Edit ${initial.name}` : 'Add stock item'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" disabled={!d.name?.trim()} loading={save.isPending} onClick={() => save.mutate()}>
            Save
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Item" className="sm:col-span-2" value={d.name ?? ''} maxLength={80} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="e.g. Basmati rice" />
        <Input label="In stock" type="number" min={0} step="any" value={d.quantity ?? ''} onChange={(e) => setD({ ...d, quantity: Number(e.target.value) })} />
        <Input label="Unit" value={d.unit ?? ''} maxLength={20} onChange={(e) => setD({ ...d, unit: e.target.value })} placeholder="kg, L, pcs…" />
        <Input label="Warn me below" type="number" min={0} step="any" value={d.minQuantity ?? ''} onChange={(e) => setD({ ...d, minQuantity: Number(e.target.value) })} />
        <Input label="Cost per unit" optional type="number" min={0} step="any" value={d.cost ?? ''} onChange={(e) => setD({ ...d, cost: e.target.value === '' ? null : Number(e.target.value) })} />
        <Input label="Supplier" optional className="sm:col-span-2" value={d.supplier ?? ''} maxLength={100} onChange={(e) => setD({ ...d, supplier: e.target.value })} />
      </div>
      {err && <p className="mt-4 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">{err}</p>}
    </Modal>
  );
}

function Stock({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const money = useMoney();
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'inventory', r._id], queryFn: () => inventoryApi.list(r._id) });
  const [editing, setEditing] = useState<Partial<InventoryItem> | null>(null);
  const [removing, setRemoving] = useState<InventoryItem | null>(null);
  const [lowOnly, setLowOnly] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['owner', 'inventory'] });
  const adjust = useMutation({ mutationFn: (v: { id: string; quantity: number }) => inventoryApi.update(v.id, { quantity: v.quantity }), onSuccess: refresh, onError: (e) => toast.error(errorMessage(e)) });
  const remove = useMutation({ mutationFn: inventoryApi.remove, onSuccess: () => (setRemoving(null), refresh()), onError: (e) => toast.error(errorMessage(e)) });

  const items = data ?? [];
  const isLow = (i: InventoryItem) => i.quantity <= i.minQuantity;
  const low = items.filter(isLow);
  const value = items.reduce((s, i) => s + (i.cost ?? 0) * i.quantity, 0);
  const shown = lowOnly ? low : items;

  return (
    <>
      <DashHead
        title="Inventory"
        lead="Keep an eye on what's running low before service, not during it."
        action={
          <Button variant="primary" size="sm" icon={<Plus className="size-4" />} onClick={() => setEditing({ unit: 'kg', quantity: 0, minQuantity: 0 })}>
            Add item
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !items.length ? (
        <EmptyState icon={<Package className="size-6" />} title="Nothing tracked yet" body="Add the ingredients you can't run out of — oil, rice, your signature spice." />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Items tracked" value={items.length} icon={<Package className="size-4" />} />
            <Stat label="Running low" value={low.length} tone={low.length ? 'saffron' : 'plain'} icon={<AlertTriangle className="size-4" />} />
            <Stat label="Stock value" value={money(value)} hint="Based on cost per unit" />
          </div>
          <div className="mb-4 flex gap-2">
            <Chip active={!lowOnly} onClick={() => setLowOnly(false)}>
              Everything
            </Chip>
            <Chip active={lowOnly} onClick={() => setLowOnly(true)}>
              Running low ({low.length})
            </Chip>
          </div>
          <div className="overflow-hidden rounded-[22px] border border-line bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-paper text-[12px] tracking-wide text-ink-3 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 font-semibold">In stock</th>
                    <th className="px-5 py-3 font-semibold">Supplier</th>
                    <th className="px-5 py-3 font-semibold">Restocked</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((i) => (
                    <tr key={i._id} className={cn(isLow(i) && 'bg-saffron-50/60')}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{i.name}</p>
                        <p className="text-[12px] text-ink-4">
                          Warn below {i.minQuantity} {i.unit}
                          {i.cost ? ` · ${money(i.cost)}/${i.unit}` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="inline-flex items-center gap-1 rounded-full border border-line bg-paper p-0.5">
                          <button onClick={() => adjust.mutate({ id: i._id, quantity: Math.max(0, i.quantity - 1) })} className="grid size-7 place-items-center rounded-full hover:bg-card" aria-label={`Use one ${i.unit} of ${i.name}`}>
                            <Minus className="size-3.5" />
                          </button>
                          <span className={cn('min-w-16 text-center font-semibold tabular-nums', isLow(i) ? 'text-saffron-700' : 'text-ink')}>
                            {i.quantity} {i.unit}
                          </span>
                          <button onClick={() => adjust.mutate({ id: i._id, quantity: i.quantity + 1 })} className="grid size-7 place-items-center rounded-full hover:bg-card" aria-label={`Add one ${i.unit} of ${i.name}`}>
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-3">{i.supplier || '—'}</td>
                      <td className="px-5 py-3 text-ink-3">{i.lastRestocked ? timeAgo(i.lastRestocked) : '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setEditing(i)} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label={`Edit ${i.name}`}>
                            <Pencil className="size-4" />
                          </button>
                          <button onClick={() => setRemoving(i)} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-tomato-50 hover:text-tomato-600" aria-label={`Delete ${i.name}`}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {editing && <ItemForm initial={editing} onClose={() => setEditing(null)} />}
      <Confirm open={!!removing} onClose={() => setRemoving(null)} onConfirm={() => removing && remove.mutate(removing._id)} loading={remove.isPending} title={`Stop tracking ${removing?.name}?`} confirmLabel="Delete" />
    </>
  );
}

export default function OwnerInventory() {
  return <OwnerGate>{(r) => <Stock r={r} />}</OwnerGate>;
}
