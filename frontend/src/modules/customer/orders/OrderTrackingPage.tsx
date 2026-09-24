import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, Circle, Clock, MapPin, Phone, LifeBuoy, XCircle, Bike, ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { ordersAPI, restaurantsAPI, supportAPI } from '../../../shared/services/api';
import { Spinner, Modal } from '../../../shared/components/ui/index';
import type { Order } from '../../../shared/types/order.types';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

const FLOW = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const LABELS: Record<string, string> = {
    placed: 'Order placed', confirmed: 'Confirmed by restaurant', preparing: 'Being prepared',
    ready: 'Ready', out_for_delivery: 'Out for delivery', delivered: 'Delivered',
};

export default function OrderTrackingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [issue, setIssue] = useState('');
    const [showIssue, setShowIssue] = useState(false);

    const { data: order, isLoading } = useQuery<Order>({
        queryKey: ['order', id],
        queryFn: () => ordersAPI.getById(id!).then((r) => r.data),
        enabled: !!id,
        refetchInterval: 15000,
    });

    const { data: restaurant } = useQuery<Restaurant>({
        queryKey: ['order-restaurant', order?.restaurantId],
        queryFn: () => restaurantsAPI.getPublicById(order!.restaurantId).then((r) => r.data),
        enabled: !!order?.restaurantId,
    });

    const cancelMut = useMutation({
        mutationFn: () => ordersAPI.cancel(id!),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['order', id] }); toast.success('Order cancelled'); },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Could not cancel — it may already be preparing'),
    });

    const supportMut = useMutation({
        mutationFn: () => supportAPI.create({ subject: `Issue with order ${order?.orderNumber}`, description: issue, type: 'order' }),
        onSuccess: () => { toast.success('Support ticket submitted'); setShowIssue(false); setIssue(''); },
        onError: () => toast.error('Could not submit ticket'),
    });

    if (isLoading || !order) return <Spinner />;

    const steps = order.orderType === 'delivery' ? FLOW : FLOW.filter((s) => s !== 'out_for_delivery');
    const currentStep = order.status === 'cancelled' ? -1 : steps.indexOf(order.status);
    const historyTime = (status: string) => order.statusHistory?.find((h) => h.status === status)?.time;
    const canCancel = ['placed', 'confirmed'].includes(order.status);

    const typeIcon = order.orderType === 'delivery' ? <Bike size={15} /> : order.orderType === 'pickup' ? <ShoppingBasket size={15} /> : <UtensilsCrossed size={15} />;

    return (
        <div className="animate-fade-up">
            <button onClick={() => navigate('/my-orders')} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
                <ChevronLeft size={16} /> Back to orders
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tracking-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 2 }}>{order.orderNumber}</div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{order.restaurantName}</div>
                                <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                                </div>
                            </div>
                            <span className="badge badge-brand">{typeIcon} {order.orderType.replace('_', ' ')}</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 12 }}>
                            {order.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                                    <span>{item.quantity}x {item.name}</span>
                                    <span style={{ color: 'var(--color-ink-soft)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px dashed var(--color-line)', marginTop: 10, paddingTop: 10 }}>
                            <Money label="Subtotal" v={order.subtotal} />
                            {order.discount > 0 && <Money label="Discount" v={-order.discount} color="#17803d" />}
                            {order.deliveryFee > 0 && <Money label="Delivery fee" v={order.deliveryFee} />}
                            <Money label="Tax" v={order.tax} />
                            {order.tip > 0 && <Money label="Tip" v={order.tip} />}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginTop: 6 }}>
                                <span>Total</span><span style={{ color: 'var(--color-brand-600)' }}>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {order.status === 'cancelled' ? (
                        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                            <XCircle size={30} color="#c0271b" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontWeight: 700 }}>This order was cancelled</div>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Order status</div>
                            {steps.map((step, i) => {
                                const done = i < currentStep;
                                const active = i === currentStep;
                                const t = historyTime(step);
                                return (
                                    <div key={step} style={{ display: 'flex', gap: 14, paddingBottom: i < steps.length - 1 ? 18 : 0, position: 'relative' }}>
                                        {i < steps.length - 1 && <div style={{ position: 'absolute', left: 11, top: 26, width: 2, height: 'calc(100% - 8px)', background: done ? '#17803d' : 'var(--color-line)' }} />}
                                        {done ? <CheckCircle size={24} color="#fff" style={{ background: '#17803d', borderRadius: '50%', flexShrink: 0 }} /> : <Circle size={24} color={active ? 'var(--color-brand-500)' : '#e5d9cb'} style={{ flexShrink: 0 }} />}
                                        <div>
                                            <div style={{ fontWeight: active ? 700 : 600, fontSize: 14, color: done ? '#17803d' : active ? 'var(--color-brand-600)' : 'var(--color-ink-mute)' }}>{LABELS[step]}</div>
                                            {t && <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ background: 'var(--color-ink)', color: '#fff', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>
                                {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled'
                                    ? `Estimated ${new Date(order.estimatedDelivery).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                                    : order.status === 'delivered' ? 'Order complete' : 'Awaiting restaurant'}
                            </span>
                        </div>
                        <div style={{ padding: 18 }}>
                            {order.orderType === 'delivery' && order.deliveryAddress && (
                                <div style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--color-ink-soft)', marginBottom: 10 }}><MapPin size={15} color="var(--color-brand-500)" style={{ flexShrink: 0 }} /> {order.deliveryAddress}</div>
                            )}
                            {order.orderType === 'dine_in' && order.tableNumber && (
                                <div style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--color-ink-soft)', marginBottom: 10 }}><UtensilsCrossed size={15} color="var(--color-brand-500)" /> Table {order.tableNumber}</div>
                            )}
                            {order.orderType === 'pickup' && restaurant?.address && (
                                <div style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--color-ink-soft)', marginBottom: 10 }}><MapPin size={15} color="var(--color-brand-500)" /> Pickup at {restaurant.address}</div>
                            )}
                            {order.notes && <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', fontStyle: 'italic', marginBottom: 10 }}>"{order.notes}"</div>}
                            {restaurant?.phone && (
                                <a href={`tel:${restaurant.phone}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                                    <Phone size={13} /> Call restaurant
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13.5, color: 'var(--color-ink-soft)' }}>
                            <LifeBuoy size={16} /> Having issues with your order?
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowIssue(true)} className="btn btn-outline" style={{ flex: 1 }}>Report issue</button>
                            {canCancel && <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending} className="btn btn-danger" style={{ flex: 1 }}>Cancel order</button>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={showIssue} onClose={() => setShowIssue(false)} title="Report an issue" width={420}>
                <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={4} className="input" style={{ resize: 'vertical', marginBottom: 14 }} placeholder="What went wrong with this order?" />
                <button onClick={() => supportMut.mutate()} disabled={!issue.trim() || supportMut.isPending} className="btn btn-primary" style={{ width: '100%' }}>
                    {supportMut.isPending ? 'Submitting…' : 'Submit'}
                </button>
            </Modal>
            <style>{`@media (max-width: 900px) { .tracking-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

function Money({ label, v, color }: { label: string; v: number; color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: color || 'var(--color-ink-mute)', marginBottom: 4 }}>
            <span>{label}</span><span>{v < 0 ? '-' : ''}${Math.abs(v).toFixed(2)}</span>
        </div>
    );
}
