
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination, StatCard } from '../../../shared/components/ui/index';
import { DollarSign, ShoppingBag, Users, TrendingUp, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
    _id: string;
    orderId?: string;
    restaurantName?: string;
    restaurantId?: string;
    customerName?: string;
    customerId?: string;
    status?: string;
    items?: unknown[];
    total?: number;
}

export default function AdminOrders() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, status],
        queryFn: () => ordersAPI.getAll({ page, limit: 15, status }).then(r => r.data),
    });
    const { data: stats } = useQuery({
        queryKey: ['order-stats'],
        queryFn: () => ordersAPI.getStats().then(r => r.data),
    });

    const orders: Order[] = (data as { orders?: Order[] } | undefined)?.orders || [];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Order Management</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Real-time oversight of TableNest culinary transactions.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => toast.success('Export coming soon')} style={{ padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>↓ Export Data</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Today's Revenue" value={`$${(stats?.revenue || 0).toLocaleString()}`} icon={<DollarSign size={20} />} />
                <StatCard label="Active Orders" value={stats?.active || 0} icon={<ShoppingBag size={20} />} />
                <StatCard label="Total Orders" value={stats?.total || 0} icon={<Users size={20} />} />
                <StatCard label="Avg. Order Value" value={`$${stats?.avgValue || 0}`} icon={<TrendingUp size={20} />} />
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>Recent Activity</div>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        style={{ padding: '7px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                        <option value="">All Statuses</option>
                        {['placed', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(s => (
                            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                        ))}
                    </select>
                </div>

                {isLoading ? <Spinner /> : (
                    <table className="data-table">
                        <thead><tr>{['Order ID', 'Restaurant', 'Customer', 'Status', 'Items', 'Total', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id}>
                                    <td style={{ color: '#B91C1C', fontWeight: 600, fontSize: 13 }}>#TN-{o._id?.slice(-4).toUpperCase() || o.orderId}</td>
                                    <td style={{ fontSize: 13 }}>{o.restaurantName || o.restaurantId}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{o.customerName || o.customerId}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{o.items?.length || 1}x items</td>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>${o.total?.toFixed(2) || o.total}</td>
                                    <td><button onClick={() => toast.success('Order details coming soon')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }} title="View order"><Eye size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Showing {orders.length} of {data?.total || orders.length} orders</span>
                    <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                </div>
            </div>
        </div>
    );
}

