import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { formatDateTime, formatMoney, timeAgo } from '@/lib/format';
import type { Order } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { Chip, EmptyState, OrderStatusBadge, Pager, Segmented } from '@/ui/bits';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Field';
import { Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

const FILTERS = [
  ['', 'All'],
  ['active', 'In progress'],
  ['delivered', 'Completed'],
  ['cancelled', 'Cancelled'],
];
const ACTIVE = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

function Correct({ o, onClose }: { o: Order; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<'delivered' | 'cancelled'>('delivered');
  const [note, setNote] = useState('');
  const run = useMutation({
    mutationFn: () => adminApi.correctOrder(o._id, status, note.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Order corrected');
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={`Correct order #${o.orderNumber}`}
      description="Use this when a restaurant forgot to close an order, or it has to be cancelled on their behalf. Revenue entries follow the new status automatically."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" disabled={note.trim().length < 3} loading={run.isPending} onClick={() => run.mutate()}>
            Apply
          </Button>
        </div>
      }
    >
      <Segmented
        id="adm-correct"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'delivered', label: 'Mark completed' },
          { value: 'cancelled', label: 'Cancel' },
        ]}
      />
      <Input className="mt-4" label="Note for the audit log" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Owner confirmed by phone it was delivered" />
    </Modal>
  );
}

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [correcting, setCorrecting] = useState<Order | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'orders', status, page], queryFn: () => adminApi.orders({ status, page }), placeholderData: (p) => p });

  return (
    <>
      <DashHead title="Orders" lead="Every order on the platform, newest first." />
      <div className="mb-5 flex gap-2">
        {FILTERS.map(([v, l]) => (
          <Chip key={v} active={status === v} onClick={() => (setStatus(v), setPage(1))}>
            {l}
          </Chip>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.items.length ? (
        <EmptyState icon={<Receipt className="size-6" />} title="No orders" />
      ) : (
        <div className="overflow-hidden rounded-[22px] border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-paper text-[12px] tracking-wide text-ink-3 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Restaurant</th>
                  <th className="px-5 py-3 font-semibold">Guest</th>
                  <th className="px-5 py-3 font-semibold">Placed</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((o) => (
                  <tr key={o._id}>
                    <td className="px-5 py-3">
                      <p className="font-mono font-semibold">#{o.orderNumber}</p>
                      <p className="text-[12px] text-ink-4">{o.orderType.replace('_', ' ')}</p>
                    </td>
                    <td className="px-5 py-3">{o.restaurantName || '—'}</td>
                    <td className="px-5 py-3">{o.customerName || '—'}</td>
                    <td className="px-5 py-3 text-ink-3" title={formatDateTime(o.createdAt)}>
                      {timeAgo(o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatMoney(o.total, o.currency || undefined)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {ACTIVE.includes(o.status) && (
                        <Button size="sm" variant="ghost" onClick={() => setCorrecting(o)}>
                          Correct
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
      {correcting && <Correct o={correcting} onClose={() => setCorrecting(null)} />}
    </>
  );
}
