import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, Circle, Clock, Phone, MessageSquare, AlertTriangle, MapPin, Star } from 'lucide-react';
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
        refetchInterval: 15000,
    });

    if (isLoading) return <Spinner />;
    const o: any = (typeof order === "object" && order && !Array.isArray(order)) ? order : {};

    const currentStep = STATUS_STEPS.findIndex(s => s.key === o.status);

    return (
        <div className="fade-in">
            <button onClick={() => navigate('/my-orders')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 14, marginBottom: 20, fontFamily: 'Poppins' }}>
                <ChevronLeft size={16} /> Back to Orders
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Order info + timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>Order #{o._id?.slice(-5) || '00284'}</div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{o.restaurantName || 'Restaurant'}</div>
                                <div style={{ fontSize: 13, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} /> {o.createdAt ? new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Order time'}
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 20, color: '#F97316' }}>${o.total?.toFixed(2) || '0.00'}</div>
                        </div>
                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
                            {(o.items || []).map((item: OrderItem, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                                    <span>{item.quantity || 1}x {item.name}</span>
                                    <span style={{ color: '#475569' }}>${item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status timeline */}
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Order Status</div>
                        {STATUS_STEPS.map((step, i) => {
                            const done = i < currentStep;
                            const active = i === currentStep;
                            return (
                                <div key={step.key} style={{ display: 'flex', gap: 14, paddingBottom: i < STATUS_STEPS.length - 1 ? 16 : 0, position: 'relative' }}>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div style={{ position: 'absolute', left: 11, top: 26, width: 2, height: 'calc(100% - 10px)', background: done ? '#16A34A' : '#E2E8F0' }} />
                                    )}
                                    <div style={{ color: done ? '#16A34A' : active ? '#F59E0B' : '#CBD5E1', flexShrink: 0, zIndex: 1, background: 'white' }}>
                                        {done ? <CheckCircle size={24} fill="#16A34A" color="white" style={{ background: '#16A34A', borderRadius: '50%' }} />
                                            : active ? <Circle size={24} color="#F59E0B" />
                                                : <Circle size={24} color="#CBD5E1" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: active ? 600 : 500, fontSize: 14, color: done ? '#16A34A' : active ? '#F59E0B' : '#94A3B8' }}>{step.label}</div>
                                        {active && step.sub && <div style={{ fontSize: 12, color: '#94A3B8' }}>{step.sub}</div>}
                                        {done && <div style={{ fontSize: 12, color: '#94A3B8' }}>7:{15 + i * 3} PM</div>}
                                        {!done && !active && step.sub && <div style={{ fontSize: 12, color: '#94A3B8' }}>{step.sub}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Map + driver */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <div style={{ background: '#F59E0B', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} color="white" />
                            <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Arriving in ~18 minutes</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <div style={{ textAlign: 'center', color: '#475569' }}>
                                <MapPin size={48} color="#F97316" />
                                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>Live tracking map</div>
                                <div style={{ fontSize: 11, opacity: 0.7 }}>Driver en route</div>
                            </div>
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#F97316' }}>
                                        {o.driverName?.[0]?.toUpperCase() || 'D'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{o.driverName || 'Driver assigned'}</div>
                                        {o.driverRating && (
                                            <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Star size={12} fill="#F59E0B" color="#F59E0B" /> {o.driverRating} · Delivery Pro
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Phone size={15} color="#F97316" />
                                    </button>
                                    <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <MessageSquare size={15} color="#F97316" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <AlertTriangle size={16} color="#94A3B8" />
                            <span style={{ fontSize: 14, color: '#475569' }}>Having issues with your order? We're here to help.</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button style={{ flex: 1, padding: '9px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>Report Issue</button>
                            <button style={{ flex: 1, padding: '9px', border: '1.5px solid #DC2626', borderRadius: 8, background: 'white', color: '#DC2626', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Cancel Order</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

