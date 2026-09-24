import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Calendar, Tag, Settings, CheckCheck, Trash2, Bell, Star, CreditCard } from 'lucide-react';
import { notificationsAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import type { Notification } from '../../../shared/types/user.types';

const TABS = ['All', 'Orders', 'Bookings', 'Promotions', 'System'] as const;
const TYPE_ICONS: Partial<Record<Notification['type'], React.ReactNode>> = {
    order: <ShoppingBag size={18} />, booking: <Calendar size={18} />, promotion: <Tag size={18} />,
    system: <Settings size={18} />, review: <Star size={18} />, payment: <CreditCard size={18} />,
};
const TYPE_STYLE: Partial<Record<Notification['type'], { color: string; bg: string }>> = {
    order: { color: '#e9500e', bg: '#fff6ee' },
    booking: { color: '#a15c07', bg: '#fff3d6' },
    promotion: { color: '#a15c07', bg: '#fff3d6' },
    system: { color: '#4a4038', bg: '#f6eee4' },
    review: { color: '#1d5fd1', bg: '#e5f0ff' },
    payment: { color: '#17803d', bg: '#e6f7ec' },
};

type NotificationTab = (typeof TABS)[number];
const TAB_TYPE: Record<NotificationTab, string | undefined> = { All: undefined, Orders: 'order', Bookings: 'booking', Promotions: 'promotion', System: 'system' };

export default function NotificationsPage() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [tab, setTab] = useState<NotificationTab>('All');
    const [limit, setLimit] = useState(20);
    const currentType = TAB_TYPE[tab];

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', currentType, limit],
        queryFn: () => notificationsAPI.getAll({ type: currentType, limit }).then((r) => r.data),
        refetchInterval: 60000,
    });

    const markAllMut = useMutation({ mutationFn: () => notificationsAPI.markAllRead(), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
    const clearMut = useMutation({ mutationFn: () => notificationsAPI.clearAll(), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
    const markOneMut = useMutation({ mutationFn: (id: string) => notificationsAPI.markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });

    const notifications: Notification[] = data?.notifications || [];
    const total: number = data?.total || 0;

    const getTimeLabel = (createdAt?: string) => {
        if (!createdAt) return '';
        const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const openNotification = (n: Notification) => {
        if (!n.isRead) markOneMut.mutate(n._id);
        if (n.link) navigate(n.link);
    };

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Notifications</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Stay on top of your orders and bookings.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => markAllMut.mutate()} className="btn btn-outline btn-sm"><CheckCheck size={14} /> Mark all read</button>
                    <button onClick={() => clearMut.mutate()} className="btn btn-outline btn-sm"><Trash2 size={14} /> Clear all</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-line)', marginBottom: 20 }}>
                {TABS.map((t) => (
                    <button key={t} onClick={() => { setTab(t); setLimit(20); }} style={{ padding: '10px 18px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--color-brand-600)' : 'var(--color-ink-soft)', borderBottom: tab === t ? '2.5px solid var(--color-brand-500)' : '2.5px solid transparent', marginBottom: -2, cursor: 'pointer' }}>
                        {t}
                    </button>
                ))}
            </div>

            {isLoading ? <Spinner /> : notifications.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Bell size={44} style={{ margin: '0 auto 16px', color: '#c9bdaf' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No notifications</div>
                    <div style={{ fontSize: 14, color: 'var(--color-ink-mute)' }}>You're all caught up!</div>
                </div>
            ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {notifications.map((n) => {
                        const style = TYPE_STYLE[n.type] || { color: '#4a4038', bg: 'var(--color-sand)' };
                        return (
                            <div
                                key={n._id}
                                onClick={() => openNotification(n)}
                                style={{
                                    display: 'flex', gap: 14, padding: '18px 20px',
                                    background: n.isRead ? '#fff' : 'var(--color-brand-50)',
                                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--color-brand-500)',
                                    borderBottom: '1px solid var(--color-sand)', cursor: 'pointer',
                                }}
                            >
                                <div style={{ width: 42, height: 42, borderRadius: '50%', background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {TYPE_ICONS[n.type] || <Bell size={18} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 12 }}>
                                        <div style={{ fontWeight: n.isRead ? 600 : 800, fontSize: 14 }}>{n.title}</div>
                                        <span style={{ fontSize: 12, color: 'var(--color-ink-mute)', flexShrink: 0 }}>{getTimeLabel(n.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>{n.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {notifications.length < total && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button onClick={() => setLimit((l) => l + 20)} className="btn btn-outline">Load more</button>
                </div>
            )}
        </div>
    );
}
