import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatusBadge } from '../../../shared/components/ui/index';
import { ChefHat, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

type OrderItem = { name: string; quantity: number; price: number };
type KitchenOrder = {
    _id: string;
    status: string;
    total: number;
    items: OrderItem[];
    createdAt: string;
    notes?: string;
};

const COLUMNS = [
    { key: 'placed', label: 'New Orders', statuses: ['placed'] },
    { key: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
    { key: 'preparing', label: 'Preparing', statuses: ['preparing'] },
    { key: 'ready', label: 'Ready', statuses: ['ready', 'out_for_delivery'] },
];

const NEXT_STATUS: Record<string, string> = {
    placed: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'out_for_delivery',
    out_for_delivery: 'delivered',
};

export default function KitchenDisplay() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: myRestaurant } = useQuery<{ _id: string }>({
        queryKey: ['my-restaurant'],
        queryFn: () => restaurantsAPI.getMyRestaurant().then(r => r.data),
        enabled: !user?.restaurantId,
    });

    const restaurantId = user?.restaurantId?.toString() || myRestaurant?._id || '';

    const { data, isLoading } = useQuery<{ orders: KitchenOrder[] }>({
        queryKey: ['kitchen-orders', restaurantId],
        queryFn: () => ordersAPI.getByRestaurant(restaurantId, { limit: 50 }).then(r => r.data),
        enabled: !!restaurantId,
        refetchInterval: 15000,
    });

    const updateMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            ordersAPI.updateStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kitchen-orders', restaurantId] });
            toast.success('Order updated');
        },
        onError: () => toast.error('Could not update order'),
    });

    const orders = (data?.orders || []).filter(o => !['delivered', 'cancelled'].includes(o.status));

    const getColumnOrders = (statuses: string[]) =>
        orders.filter(o => statuses.includes(o.status));

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ChefHat size={24} color="#B91C1C" /> Kitchen Display
                </h1>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Live order board for kitchen staff.</p>
            </div>

            {!restaurantId ? (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center', color: '#6B7280' }}>
                    No restaurant linked to this account.
                </div>
            ) : isLoading ? (
                <div style={{ color: '#6B7280' }}>Loading orders...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {COLUMNS.map(col => (
                        <div key={col.key} style={{ background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', minHeight: 420 }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', background: 'white', borderRadius: '12px 12px 0 0' }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{col.label}</div>
                                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{getColumnOrders(col.statuses).length} orders</div>
                            </div>
                            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {getColumnOrders(col.statuses).map(order => (
                                    <div key={order._id} style={{ background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', padding: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 700, fontSize: 13 }}>#{order._id.slice(-6).toUpperCase()}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={{ fontSize: 13, marginBottom: 4 }}>
                                                {item.quantity}x {item.name}
                                            </div>
                                        ))}
                                        {order.notes && (
                                            <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 6 }}>{order.notes}</div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                            <span style={{ fontWeight: 600, color: '#B91C1C' }}>${order.total?.toFixed(2)}</span>
                                            {NEXT_STATUS[order.status] && (
                                                <button
                                                    onClick={() => updateMut.mutate({ id: order._id, status: NEXT_STATUS[order.status] })}
                                                    disabled={updateMut.isPending}
                                                    style={{ padding: '6px 10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}
                                                >
                                                    Advance
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {getColumnOrders(col.statuses).length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#D1D5DB', fontSize: 12, padding: 20 }}>No orders</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
