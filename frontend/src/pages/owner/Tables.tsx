import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Armchair, Plus, QrCode, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { tableApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, timeAgo } from '@/lib/format';
import type { DiningTable, Restaurant, TableStatus } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button, LinkButton } from '@/ui/Button';
import { EmptyState } from '@/ui/bits';
import { Input, Textarea } from '@/ui/Field';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const STATUS: Record<TableStatus, { label: string; tile: string; dot: string }> = {
  available: { label: 'Free', tile: 'border-herb-200 bg-herb-50 text-herb-800', dot: 'bg-herb-500' },
  occupied: { label: 'Seated', tile: 'border-herb-900 bg-herb-900 text-paper', dot: 'bg-saffron-400' },
  reserved: { label: 'Held', tile: 'border-saffron-200 bg-saffron-50 text-saffron-700', dot: 'bg-saffron-500' },
  blocked: { label: 'Out of use', tile: 'border-line-2 bg-paper-2 text-ink-4', dot: 'bg-ink-4' },
};

function TableSheet({ t, onClose }: { t: DiningTable; onClose: () => void }) {
  const qc = useQueryClient();
  const [number, setNumber] = useState(t.tableNumber);
  const [capacity, setCapacity] = useState(t.capacity);
  const [notes, setNotes] = useState(t.serverNotes ?? '');
  const [removing, setRemoving] = useState(false);
  const done = () => qc.invalidateQueries({ queryKey: ['owner', 'tables'] });
  const onError = (e: unknown) => toast.error(errorMessage(e));
  const status = useMutation({ mutationFn: (s: TableStatus) => tableApi.setStatus(t._id, s, s === 'available' ? undefined : notes.trim() || undefined), onSuccess: () => (done(), onClose()), onError });
  const save = useMutation({ mutationFn: () => tableApi.update(t._id, { tableNumber: number.trim(), capacity, serverNotes: notes.trim() || null }), onSuccess: () => (done(), toast.success('Saved')), onError });
  const remove = useMutation({ mutationFn: () => tableApi.remove(t._id), onSuccess: () => (done(), onClose()), onError });

  return (
    <Modal open onClose={onClose} title={`Table ${t.tableNumber}`} description={`${STATUS[t.status].label}${t.seatedAt ? ` · seated ${timeAgo(t.seatedAt)}` : ''}`}>
      <p className="mb-2 text-sm font-semibold text-ink-2">Set status</p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(STATUS) as TableStatus[]).map((s) => (
          <button
            key={s}
            disabled={status.isPending}
            onClick={() => status.mutate(s)}
            className={cn('flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition', t.status === s ? STATUS[s].tile : 'border-line bg-card text-ink hover:border-line-2')}
          >
            <span className={cn('size-2.5 rounded-full', STATUS[s].dot)} /> {STATUS[s].label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Table name" value={number} maxLength={20} onChange={(e) => setNumber(e.target.value)} />
        <Input label="Seats" type="number" min={1} max={50} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
        <Textarea label="Server notes" optional className="sm:col-span-2" rows={2} maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Birthday, high chair, allergy…" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Button variant="ghost" className="text-tomato-600" icon={<Trash2 className="size-4" />} onClick={() => setRemoving(true)}>
          Remove
        </Button>
        <Button variant="dark" loading={save.isPending} disabled={!number.trim() || capacity < 1} onClick={() => save.mutate()}>
          Save details
        </Button>
      </div>
      <Confirm open={removing} onClose={() => setRemoving(false)} onConfirm={() => remove.mutate()} loading={remove.isPending} title={`Remove table ${t.tableNumber}?`} body="Tables with upcoming bookings can't be removed until those are moved or cancelled." confirmLabel="Remove table" />
    </Modal>
  );
}

function Floor({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'tables', r._id], queryFn: () => tableApi.list(r._id), refetchInterval: 30_000 });
  const [open, setOpen] = useState<DiningTable | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ number: '', capacity: 4 });
  const add = useMutation({
    mutationFn: () => tableApi.create(draft.number.trim(), draft.capacity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner', 'tables'] });
      setDraft({ number: '', capacity: draft.capacity });
      setAdding(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const tables = [...(data ?? [])].sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  const seats = tables.reduce((s, t) => s + t.capacity, 0);
  const counts = tables.reduce<Record<string, number>>((m, t) => ((m[t.status] = (m[t.status] || 0) + 1), m), {});

  return (
    <>
      <DashHead
        title="Floor & tables"
        lead={tables.length ? `${tables.length} tables · ${seats} seats. Bookings are matched to the smallest free table that fits the party.` : 'Tables power online bookings — guests can only book when a table fits their party.'}
        action={
          <>
            {!!tables.length && (
              <LinkButton to="/owner/qrcodes" variant="outline" size="sm" icon={<QrCode className="size-4" />}>
                QR codes
              </LinkButton>
            )}
            <Button variant="primary" size="sm" icon={<Plus className="size-4" />} onClick={() => setAdding(true)}>
              Add table
            </Button>
          </>
        }
      />
      {!!tables.length && (
        <div className="mb-5 flex flex-wrap gap-4 text-sm text-ink-3">
          {(Object.keys(STATUS) as TableStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className={cn('size-2.5 rounded-full', STATUS[s].dot)} /> {STATUS[s].label} <b className="text-ink">{counts[s] || 0}</b>
            </span>
          ))}
        </div>
      )}
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : !tables.length ? (
        <EmptyState icon={<Armchair className="size-6" />} title="No tables yet" body="Add each table with its number of seats. A 2-top, a few 4-tops and a big one for groups is a good start." action={<Button onClick={() => setAdding(true)}>Add your first table</Button>} />
      ) : (
        <div className="rounded-[28px] border border-line bg-[radial-gradient(circle,#e5dbcb_1px,transparent_1px)] [background-size:22px_22px] p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {tables.map((t, i) => (
              <motion.button
                key={t._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(t)}
                className={cn('relative flex aspect-[5/4] flex-col items-center justify-center rounded-[22px] border-2 text-center shadow-sm', t.capacity > 6 && 'col-span-2 aspect-auto', STATUS[t.status].tile)}
              >
                <span className="font-display text-3xl leading-none">{t.tableNumber}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold opacity-80">
                  <Users className="size-3.5" /> {t.capacity}
                </span>
                <span className="mt-1 text-[11px] font-semibold tracking-wide uppercase opacity-70">{STATUS[t.status].label}</span>
                {t.serverNotes && <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-tomato-500" title={t.serverNotes} />}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {open && <TableSheet t={open} onClose={() => setOpen(null)} />}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a table"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="dark" loading={add.isPending} disabled={!draft.number.trim() || draft.capacity < 1} onClick={() => add.mutate()}>
              Add table
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Table name or number" autoFocus value={draft.number} maxLength={20} onChange={(e) => setDraft({ ...draft, number: e.target.value })} placeholder="e.g. 12 or Terrace 2" />
          <Input label="Seats" type="number" min={1} max={50} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} />
        </div>
      </Modal>
    </>
  );
}

export default function OwnerTables() {
  return <OwnerGate>{(r) => <Floor r={r} />}</OwnerGate>;
}
