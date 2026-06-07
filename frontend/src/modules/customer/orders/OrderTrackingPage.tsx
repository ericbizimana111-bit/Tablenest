import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, Circle, Clock, Phone, MessageSquare, AlertTriangle, XCircle, MapPin } from 'lucide-react';
import { ordersAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import type { Order, OrderItem } from '../../../shared/types/order.types';

const STATUS_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: <CheckCircle size={18} /> },
    { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={18} /> },
    { key: 'preparing', label: 'Preparing', sub: 'Chef is crafting your meal', icon: <Circle size={18} /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', sub: 'Pending', icon: <Circle size={18} /> },
    { key: 'delivered', label: 'Delivered', sub: 'Estimated 8:05 PM', icon: <Circle size={18} /> },
];

export default function OrderTrackingPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: order, isLoading } = useQuery<Order>({
        queryKey: ['order', id],
        queryFn: () => ordersAPI.getById(id!).then(r => r.data),
        enabled: !!id,
        initialData: DEMO_ORDER,
        refetchInterval: 15000,
    });

    if (isLoading) return <Spinner />;
    const o = order || DEMO_ORDER;

    const currentStep = STATUS_STEPS.findIndex(s => s.key === o.status);

    return (
        <div className="fade-in">
            <button onClick={() => navigate('/my-orders')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 20, fontFamily: 'Poppins' }}>
                <ChevronLeft size={16} /> Back to Orders
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Order info + timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>Order #{o._id?.slice(-5) || '00284'}</div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{o.restaurantName || "L'Artisan Bistro"}</div>
                                <div style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} /> Today, 7:15 PM
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 20, color: '#B91C1C' }}>${o.total?.toFixed(2) || '124.50'}</div>
                        </div>
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
                            {(o.items || DEMO_ORDER.items).map((item: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                                    <span>{item.quantity || 1}x {item.name}</span>
                                    <span style={{ color: '#6B7280' }}>${item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status timeline */}
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Order Status</div>
                        {STATUS_STEPS.map((step, i) => {
                            const done = i < currentStep;
                            const active = i === currentStep;
                            return (
                                <div key={step.key} style={{ display: 'flex', gap: 14, paddingBottom: i < STATUS_STEPS.length - 1 ? 16 : 0, position: 'relative' }}>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div style={{ position: 'absolute', left: 11, top: 26, width: 2, height: 'calc(100% - 10px)', background: done ? '#16A34A' : '#E5E7EB' }} />
                                    )}
                                    <div style={{ color: done ? '#16A34A' : active ? '#D97706' : '#D1D5DB', flexShrink: 0, zIndex: 1, background: 'white' }}>
                                        {done ? <CheckCircle size={24} fill="#16A34A" color="white" style={{ background: '#16A34A', borderRadius: '50%' }} />
                                            : active ? <Circle size={24} color="#D97706" />
                                                : <Circle size={24} color="#D1D5DB" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: active ? 600 : 500, fontSize: 14, color: done ? '#16A34A' : active ? '#D97706' : '#9CA3AF' }}>{step.label}</div>
                                        {active && step.sub && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{step.sub}</div>}
                                        {done && <div style={{ fontSize: 12, color: '#9CA3AF' }}>7:{15 + i * 3} PM</div>}
                                        {!done && !active && step.sub && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{step.sub}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Map + driver */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div style={{ background: '#D97706', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} color="white" />
                            <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Arriving in ~18 minutes</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <div style={{ textAlign: 'center', color: '#6B7280' }}>
                                <MapPin size={48} color="#B91C1C" />
                                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>Live tracking map</div>
                                <div style={{ fontSize: 11, opacity: 0.7 }}>Driver en route</div>
                            </div>
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB' }}>
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="Driver" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>Marcus Thompson</div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ color: '#F59E0B' }}>★</span> 4.9 · Delivery Pro
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Phone size={15} color="#B91C1C" />
                                    </button>
                                    <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <MessageSquare size={15} color="#B91C1C" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <AlertTriangle size={16} color="#9CA3AF" />
                            <span style={{ fontSize: 14, color: '#374151' }}>Having issues with your order? We're here to help.</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button style={{ flex: 1, padding: '9px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>Report Issue</button>
                            <button style={{ flex: 1, padding: '9px', border: '1.5px solid #DC2626', borderRadius: 8, background: 'white', color: '#DC2626', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Cancel Order</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DEMO_ORDER = {
    _id: '00284', restaurantName: "L'Artisan Bistro", status: 'preparing', total: 124.50,
    items: [{ name: 'Wagyu Beef Burger', price: 64.00, quantity: 2 }, { name: 'Truffle Fries', price: 18.50, quantity: 1 }, { name: 'Bordeaux Reserve', price: 42.00, quantity: 1 }],
};