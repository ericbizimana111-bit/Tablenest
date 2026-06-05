
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination, StatCard } from '../../../shared/components/ui/index';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

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

    const orders = data?.orders || DEMO_ORDERS;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Order Management</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Real-time oversight of TableNest culinary transactions.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>↓ Export Data</button>
                    <button style={{ padding: '8px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>+ Create Order</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Today's Revenue" value={`$${(stats?.revenue || 14290).toLocaleString()}`} icon={<DollarSign size={20} />} trend="+12.5%" trendUp />
                <StatCard label="Active Orders" value={stats?.active || 48} icon={<ShoppingBag size={20} />} />
                <StatCard label="Total Diners" value={stats?.total || 156} icon={<Users size={20} />} />
                <StatCard label="Avg. Order Value" value={`$${stats?.avgValue || 297.70}`} icon={<TrendingUp size={20} />} />
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
                            {orders.map((o: any) => (
                                <tr key={o._id}>
                                    <td style={{ color: '#B91C1C', fontWeight: 600, fontSize: 13 }}>#TN-{o._id?.slice(-4).toUpperCase() || o.orderId}</td>
                                    <td style={{ fontSize: 13 }}>{o.restaurantName || o.restaurantId}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{o.customerName || o.customerId}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{o.items?.length || 1}x items</td>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>${o.total?.toFixed(2) || o.total}</td>
                                    <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, fontSize: 18 }}>👁</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Showing {orders.length} of {data?.total || 48} orders</span>
                    <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                </div>
            </div>
        </div>
    );
}

const DEMO_ORDERS = [
    { _id: '8921', orderId: '8921', restaurantName: 'The Gilded Fork', customerName: 'Elena Rodriguez', status: 'placed', total: 512.00 },
    { _id: '8920', orderId: '8920', restaurantName: 'Azure Coastal', customerName: 'Marcus Chen', status: 'confirmed', total: 245.50 },
    { _id: '8919', orderId: '8919', restaurantName: 'Bistro No. 9', customerName: 'Sarah Jenkins', status: 'delivered', total: 480.00 },
    { _id: '8918', orderId: '8918', restaurantName: 'Terra & Grain', customerName: "Liam O'Connor", status: 'preparing', total: 68.00 },
    { _id: '8917', orderId: '8917', restaurantName: 'The Gilded Fork', customerName: 'Diana Prince', status: 'cancelled', total: 1200.00 },
];
