import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatusBadge } from '../../../shared/components/ui/index';
import { ChefHat, Clock, Bike, ShoppingBasket, UtensilsCrossed, X } from 'lucide-react';
import type { Order } from '../../../shared/types/order.types';
import toast from 'react-hot-toast';

const COLUMNS = [
    { key: 'placed', label: 'New orders', statuses: ['placed'] },
    { key: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
    { key: 'preparing', label: 'Preparing', statuses: ['preparing'] },
    { key: 'ready', label: 'Ready / out', statuses: ['ready', 'out_for_delivery'] },
];

function nextStatus(order: Order): string | null {
    if (order.status === 'placed') return 'confirmed';
    if (order.status === 'confirmed') return 'preparing';
    if (order.status === 'preparing') return 'ready';
    if (order.status === 'ready') return order.orderType === 'delivery' ? 'out_for_delivery' : 'delivered';
    if (order.status === 'out_for_delivery') return 'delivered';
    return null;
}
const NEXT_LABEL: Record<string, string> = { confirmed: 'Confirm', preparing: 'Start preparing', ready: 'Mark ready', out_for_delivery: 'Send out', delivered: 'Complete' };
const TYPE_ICON: Record<string, React.ReactNode> = { delivery: <Bike size={11} />, pickup: <ShoppingBasket size={11} />, dine_in: <UtensilsCrossed size={11} /> };

export default function KitchenDisplay() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [apiRestaurantId, setApiRestaurantId] = useState('');

    useEffect(() => {
        if (!user?.restaurantId) restaurantsAPI.getMyRestaurant().then((r) => r.data?._id && setApiRestaurantId(r.data._id)).catch(() => undefined);
    }, [user]);
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    const { data, isLoading } = useQuery<{ orders: Order[] }>({
        queryKey: ['kitchen-orders', restaurantId],
        queryFn: () => ordersAPI.getByRestaurant(restaurantId, { status: 'active', limit: 100 }).then((r) => r.data),
        enabled: !!restaurantId,
        refetchInterval: 12000,
    });

    const updateMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => ordersAPI.updateStatus(id, { status }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['kitchen-orders'] }); toast.success('Order updated'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not update order'),
    });
    const cancelMut = useMutation({
        mutationFn: (id: string) => ordersAPI.cancel(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['kitchen-orders'] }); toast.success('Order cancelled'); },
    });

    const orders = data?.orders || [];
    const colOrders = (statuses: string[]) => orders.filter((o) => statuses.includes(o.status)).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ChefHat size={24} color="var(--color-brand-500)" /> Kitchen display
                </h1>
                <p style={{ fontSize: 13, color: 'var(--color-ink-mute)' }}>Live order board — updates automatically every 12s.</p>
            </div>

            {!restaurantId || isLoading ? (
                <div className="skeleton" style={{ height: 300 }} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="kitchen-grid">
                    {COLUMNS.map((col) => (
                        <div key={col.key} style={{ background: 'var(--color-sand)', borderRadius: 16, minHeight: 420, border: '1px solid var(--color-line)' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-line)', background: '#fff', borderRadius: '16px 16px 0 0' }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{col.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{colOrders(col.statuses).length} orders</div>
                            </div>
                            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {colOrders(col.statuses).map((order) => {
                                    const next = nextStatus(order);
                                    return (
                                        <div key={order._id} className="card" style={{ padding: 14 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <span style={{ fontWeight: 800, fontSize: 13 }}>{order.orderNumber}</span>
                                                <span className="badge badge-brand">{TYPE_ICON[order.orderType]} {order.orderType.replace('_', ' ')}</span>
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--color-ink-mute)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={11} /> {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                {order.tableNumber && <span>· Table {order.tableNumber}</span>}
                                            </div>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: 12.5, marginBottom: 3 }}>{item.quantity}x {item.name}</div>
                                            ))}
                                            {order.notes && <div style={{ fontSize: 11, color: 'var(--color-ink-mute)', fontStyle: 'italic', marginTop: 6 }}>"{order.notes}"</div>}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 6 }}>
                                                <span style={{ fontWeight: 800, color: 'var(--color-brand-600)' }}>${order.total.toFixed(2)}</span>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {order.status === 'placed' && (
                                                        <button onClick={() => cancelMut.mutate(order._id)} className="btn-icon" style={{ width: 26, height: 26, padding: 0, color: '#c0271b', border: '1px solid #ffd4d0' }} title="Cancel"><X size={12} /></button>
                                                    )}
                                                    {next && (
                                                        <button onClick={() => updateMut.mutate({ id: order._id, status: next })} disabled={updateMut.isPending} className="btn btn-primary btn-sm">
                                                            {NEXT_LABEL[next]}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {colOrders(col.statuses).length === 0 && <div style={{ textAlign: 'center', color: '#c9bdaf', fontSize: 12, padding: 20 }}>No orders</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@media (max-width: 1100px) { .kitchen-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 640px) { .kitchen-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
