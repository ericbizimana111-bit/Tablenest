import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Filter, RefreshCw, Star, Headphones } from 'lucide-react';
import { ordersAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination } from '../../../shared/components/ui/index';
import { useAuthStore } from '../../../shared/store/authStore';
import type { Order, OrderItem } from '../../../shared/types/order.types';
import toast from 'react-hot-toast';

const TABS = ['All', 'Delivered', 'Active', 'Cancelled'];
const FOOD_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=80';

export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { user } = useAuthStore();
    const [tab, setTab] = useState('All');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['my-orders', tab, page],
        queryFn: () => ordersAPI.getMyOrders({ status: tab === 'All' ? undefined : tab.toLowerCase(), page, limit: 10 }).then(r => r.data),
        initialData: { orders: DEMO_ORDERS, total: 3, pages: 12 },
    });

    const reorderMut = useMutation({
        mutationFn: (order: Order) => ordersAPI.create({
            restaurantId: order.restaurantId,
            userId: user?._id || order.customerId,
            items: order.items,
            total: order.total,
        }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-orders'] }); toast.success('Order placed!'); },
    });

    const orders = (data?.orders as Order[]) || DEMO_ORDERS;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Order History</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Review and manage your past culinary experiences.</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 0, background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => { setTab(t); setPage(1); }}
                            style={{ padding: '8px 18px', border: 'none', background: tab === t ? '#1F1F1F' : 'white', color: tab === t ? 'white' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: tab === t ? 600 : 400 }}>
                            {t}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <Calendar size={14} /> Jan 01, 2024 - Dec 31, 2024
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    <Filter size={14} /> Filters
                </button>
            </div>

            {/* Order list */}
            {isLoading ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {orders.map((order: any) => (
                        <div key={order._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                            <img src={order.restaurantImage || FOOD_IMG} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{order.restaurantName || 'Restaurant'}</div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={11} /> {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(order.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: 13, color: '#6B7280' }}>
                                    {order.items.map((i: OrderItem) => `${i.quantity || 1}x ${i.name}`).join(', ')}
                                </div>
                                <div style={{ fontWeight: 700, color: '#B91C1C', fontSize: 16, marginTop: 8 }}>
                                    ${order.total?.toFixed(2)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                {order.status === 'delivered' && (
                                    <button style={{ padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Star size={12} /> Write Review
                                    </button>
                                )}
                                {(order.status === 'placed' || order.status === 'confirmed' || order.status === 'preparing') && (
                                    <button onClick={() => navigate(`/my-orders/${order._id}/track`)}
                                        style={{ padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <RefreshCw size={12} /> Track Order
                                    </button>
                                )}
                                {order.status === 'cancelled' && (
                                    <button style={{ padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Headphones size={12} /> Support
                                    </button>
                                )}
                                <button onClick={() => reorderMut.mutate(order)}
                                    style={{ padding: '8px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <RefreshCw size={12} /> Reorder
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 20 }}>
                <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
            </div>
        </div>
    );
}

const DEMO_ORDERS: Order[] = [
    { _id: '64e1f45d5b8e4f6a8d2a1b01', restaurantId: 'rest1', customerId: 'user1', restaurantName: "L'Osteria di Roma", status: 'delivered', total: 124.50, createdAt: '2024-10-12T07:30:00Z', items: [{ menuItemId: 'm1', name: 'Truffle Fettuccine', price: 32.00, quantity: 2 }, { menuItemId: 'm2', name: 'Tiramisu', price: 12.50, quantity: 1 }, { menuItemId: 'm3', name: 'Pinot Grigio', price: 12.50, quantity: 1 }] },
    { _id: '64e1f45d5b8e4f6a8d2a1b02', restaurantId: 'rest2', customerId: 'user1', restaurantName: 'Sakura Sushi & Grill', status: 'placed', total: 88.20, createdAt: '2024-10-08T06:15:00Z', items: [{ menuItemId: 'm4', name: "Chef's Selection Platter", price: 42.00, quantity: 1 }, { menuItemId: 'm5', name: 'Miso Soup', price: 6.10, quantity: 2 }, { menuItemId: 'm6', name: 'Green Tea', price: 4.00, quantity: 1 }] },
    { _id: '64e1f45d5b8e4f6a8d2a1b03', restaurantId: 'rest3', customerId: 'user1', restaurantName: 'The Burger Collective', status: 'cancelled', total: 64.00, createdAt: '2024-10-01T01:20:00Z', items: [{ menuItemId: 'm7', name: 'Signature BBQ Burger', price: 18.00, quantity: 3 }, { menuItemId: 'm8', name: 'Truffle Fries', price: 10.00, quantity: 2 }] },
];
