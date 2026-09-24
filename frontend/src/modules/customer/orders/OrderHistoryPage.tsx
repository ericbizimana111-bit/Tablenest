import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, RefreshCw, Star, LifeBuoy, UtensilsCrossed } from 'lucide-react';
import { ordersAPI, supportAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination, Modal } from '../../../shared/components/ui/index';
import { useOrderStore } from '../../../shared/store/orderStore';
import type { Order, OrderItem } from '../../../shared/types/order.types';
import toast from 'react-hot-toast';
import ReviewModal from '../../../shared/components/order/ReviewModal';

const TABS = ['All', 'Active', 'Delivered', 'Cancelled'];

function formatOrderDateTime(createdAt?: string) {
    const parsed = createdAt ? new Date(createdAt) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) return { date: '—', time: '' };
    return {
        date: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
}

export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { addToCart, clearCart } = useOrderStore();
    const [tab, setTab] = useState('All');
    const [page, setPage] = useState(1);
    const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
    const [supportOrder, setSupportOrder] = useState<Order | null>(null);
    const [issue, setIssue] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['my-orders', tab, page],
        queryFn: () => ordersAPI.getMyOrders({ status: tab === 'All' ? undefined : tab.toLowerCase(), page, limit: 10 }).then((r) => r.data),
    });

    const supportMut = useMutation({
        mutationFn: () => supportAPI.create({ subject: `Issue with order ${supportOrder?.orderNumber}`, description: issue, type: 'order' }),
        onSuccess: () => { toast.success('Support ticket submitted — we will follow up by email.'); setSupportOrder(null); setIssue(''); },
        onError: () => toast.error('Could not submit ticket'),
    });

    const orders = (data?.orders as Order[]) || [];

    const reorder = (order: Order) => {
        clearCart();
        order.items.forEach((i: OrderItem) => {
            if (!i.menuItemId) return;
            addToCart(order.restaurantId, order.restaurantName || '', { menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, image: i.image });
        });
        navigate(`/restaurants/${order.restaurantId}?tab=menu`);
    };

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Order history</h1>
                <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Review your past orders and reorder favorites.</p>
            </div>

            <div style={{ display: 'flex', gap: 0, background: '#fff', border: '1.5px solid var(--color-line)', borderRadius: 12, overflow: 'hidden', marginBottom: 20, width: 'fit-content' }}>
                {TABS.map((t) => (
                    <button key={t} onClick={() => { setTab(t); setPage(1); }} style={{ padding: '9px 18px', border: 'none', background: tab === t ? 'var(--color-ink)' : 'white', color: tab === t ? 'white' : 'var(--color-ink-soft)', fontSize: 13, cursor: 'pointer', fontWeight: tab === t ? 700 : 500 }}>
                        {t}
                    </button>
                ))}
            </div>

            {isLoading ? <Spinner /> : orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <UtensilsCrossed size={44} style={{ margin: '0 auto 16px', color: '#c9bdaf' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No orders yet</div>
                    <button onClick={() => navigate('/restaurants')} className="btn btn-primary" style={{ marginTop: 8 }}>Browse restaurants</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {orders.map((order) => {
                        const { date, time } = formatOrderDateTime(order.createdAt);
                        const canTrack = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
                        return (
                            <div key={order._id} className="card card-hover" style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                {order.restaurantImage ? (
                                    <img src={order.restaurantImage} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--color-sand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UtensilsCrossed size={22} color="#c9bdaf" /></div>
                                )}
                                <div style={{ flex: 1, minWidth: 220 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{order.restaurantName}</div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={11} /> {date}{time ? ` · ${time}` : ''} · {order.orderNumber}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>
                                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--color-brand-600)', fontSize: 17, marginTop: 8 }}>${order.total?.toFixed(2)}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                    {order.status === 'delivered' && !order.reviewed && (
                                        <button onClick={() => setReviewOrder(order)} className="btn btn-outline btn-sm"><Star size={12} /> Write review</button>
                                    )}
                                    {canTrack && (
                                        <button onClick={() => navigate(`/my-orders/${order._id}/track`)} className="btn btn-outline btn-sm"><RefreshCw size={12} /> Track order</button>
                                    )}
                                    {order.status === 'cancelled' && (
                                        <button onClick={() => setSupportOrder(order)} className="btn btn-outline btn-sm"><LifeBuoy size={12} /> Get help</button>
                                    )}
                                    <button onClick={() => reorder(order)} className="btn btn-primary btn-sm"><RefreshCw size={12} /> Reorder</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {(data?.pages || 0) > 1 && <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />}

            {reviewOrder && (
                <ReviewModal
                    isOpen={!!reviewOrder}
                    restaurantName={reviewOrder.restaurantName || ''}
                    onClose={() => setReviewOrder(null)}
                    onSubmitted={() => { qc.invalidateQueries({ queryKey: ['my-orders'] }); setReviewOrder(null); }}
                    orderId={reviewOrder._id}
                />
            )}

            <Modal isOpen={!!supportOrder} onClose={() => setSupportOrder(null)} title="Get help with this order" width={440}>
                <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 12 }}>Order {supportOrder?.orderNumber} — describe what happened and our team will follow up.</p>
                <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={4} className="input" style={{ resize: 'vertical', marginBottom: 14 }} placeholder="What went wrong?" />
                <button onClick={() => supportMut.mutate()} disabled={!issue.trim() || supportMut.isPending} className="btn btn-primary" style={{ width: '100%' }}>
                    {supportMut.isPending ? 'Submitting…' : 'Submit ticket'}
                </button>
            </Modal>
        </div>
    );
}
