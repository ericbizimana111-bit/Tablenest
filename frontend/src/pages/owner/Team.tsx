import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { staffApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import type { Restaurant, StaffMember } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button } from '@/ui/Button';
import { Avatar, Badge, EmptyState } from '@/ui/bits';
import { Input, Toggle } from '@/ui/Field';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const ROLES = ['Manager', 'Chef', 'Cook', 'Server', 'Host', 'Bartender', 'Cashier', 'Rider', 'Cleaner'];

function MemberForm({ initial, onClose }: { initial: Partial<StaffMember>; onClose: () => void }) {
  const qc = useQueryClient();
  const [m, setM] = useState<Partial<StaffMember>>(initial);
  const [err, setErr] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      const body = { name: m.name?.trim(), email: m.email?.trim(), phone: m.phone?.trim() || null, role: m.role?.trim() || 'Server', isActive: m.isActive ?? true };
      return m._id ? staffApi.update(m._id, body) : staffApi.create(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner', 'staff'] });
      onClose();
    },
    onError: (e) => setErr(errorMessage(e)),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title={m._id ? `Edit ${initial.name}` : 'Add a team member'}
      description="A contact list for your team. Team members don't get a login."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" disabled={!m.name?.trim() || !/^\S+@\S+\.\S+$/.test(m.email ?? '')} loading={save.isPending} onClick={() => save.mutate()}>
            Save
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={m.name ?? ''} maxLength={80} onChange={(e) => setM({ ...m, name: e.target.value })} />
        <Input label="Role" list="staff-roles" value={m.role ?? ''} maxLength={40} onChange={(e) => setM({ ...m, role: e.target.value })} placeholder="Server" />
        <datalist id="staff-roles">
          {ROLES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        <Input label="Email" type="email" value={m.email ?? ''} onChange={(e) => setM({ ...m, email: e.target.value })} />
        <Input label="Phone" optional type="tel" value={m.phone ?? ''} onChange={(e) => setM({ ...m, phone: e.target.value })} />
        <div className="sm:col-span-2">
          <Toggle checked={m.isActive ?? true} onChange={(v) => setM({ ...m, isActive: v })} label="Currently working here" />
        </div>
      </div>
      {err && <p className="mt-4 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">{err}</p>}
    </Modal>
  );
}

function Crew({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'staff', r._id], queryFn: () => staffApi.list(r._id) });
  const [editing, setEditing] = useState<Partial<StaffMember> | null>(null);
  const [removing, setRemoving] = useState<StaffMember | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    onSuccess: () => (setRemoving(null), qc.invalidateQueries({ queryKey: ['owner', 'staff'] })),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const team = data ?? [];

  return (
    <>
      <DashHead
        title="Team"
        lead="Who's on your crew and how to reach them."
        action={
          <Button variant="primary" size="sm" icon={<Plus className="size-4" />} onClick={() => setEditing({ isActive: true })}>
            Add member
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !team.length ? (
        <EmptyState icon={<Users className="size-6" />} title="Just you so far" body="Add your chefs, servers and riders to keep everyone's contact in one place." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((m) => (
            <div key={m._id} className={cn('rounded-[22px] border border-line bg-card p-5', !m.isActive && 'opacity-60')}>
              <div className="flex items-center gap-3">
                <Avatar name={m.name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{m.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge tone="herb">{m.role}</Badge>
                    {!m.isActive && <Badge>Former</Badge>}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-[13px] text-ink-3">
                <a href={`mailto:${m.email}`} className="flex items-center gap-2 truncate hover:text-ink">
                  <Mail className="size-3.5 shrink-0" /> {m.email}
                </a>
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="flex items-center gap-2 hover:text-ink">
                    <Phone className="size-3.5 shrink-0" /> {m.phone}
                  </a>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-1 border-t border-line pt-3">
                <button onClick={() => setEditing(m)} className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label={`Edit ${m.name}`}>
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => setRemoving(m)} className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-tomato-50 hover:text-tomato-600" aria-label={`Remove ${m.name}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <MemberForm initial={editing} onClose={() => setEditing(null)} />}
      <Confirm open={!!removing} onClose={() => setRemoving(null)} onConfirm={() => removing && remove.mutate(removing._id)} loading={remove.isPending} title={`Remove ${removing?.name}?`} confirmLabel="Remove" />
    </>
  );
}

export default function OwnerTeam() {
  return <OwnerGate>{(r) => <Crew r={r} />}</OwnerGate>;
}
