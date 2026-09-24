import React from 'react';

const MAP: Record<string, string> = {
    active: 'badge-green', delivered: 'badge-green', confirmed: 'badge-green', open: 'badge-green',
    successful: 'badge-green', available: 'badge-green', ready: 'badge-green', paid: 'badge-green', completed: 'badge-green',

    pending: 'badge-amber', reserved: 'badge-amber', in_transit: 'badge-amber',

    placed: 'badge-blue', new_order: 'badge-blue',

    accepted: 'badge-purple', preparing: 'badge-purple', in_progress: 'badge-purple',

    out_for_delivery: 'badge-brand', arrived: 'badge-brand',

    cancelled: 'badge-red', suspended: 'badge-red', rejected: 'badge-red', occupied: 'badge-red',
    unavailable: 'badge-red', no_show: 'badge-red', failed: 'badge-red',

    refunded: 'badge-gray', inactive: 'badge-gray', closed: 'badge-gray', blocked: 'badge-gray',
};

export function StatusBadge({ status }: { status: string }) {
    const cls = MAP[status?.toLowerCase()] || 'badge-gray';
    return <span className={`badge ${cls}`}>{status?.replace(/_/g, ' ')}</span>;
}

export default StatusBadge;
