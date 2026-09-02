import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Calendar, Tag, Settings, CheckCheck, Trash2, Bell, Star } from 'lucide-react';
import { notificationsAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import type { Notification } from '../../../shared/types/user.types';
import toast from 'react-hot-toast';

const TABS = ['All', 'Orders', 'Bookings', 'Promotions', 'System'] as const;
const TYPE_ICONS: Partial<Record<Notification['type'], React.ReactNode>> = {
    order: <ShoppingBag size={18} />,
    booking: <Calendar size={18} />,
    promotion: <Tag size={18} />,
    system: <Settings size={18} />,
    review: <Star size={18} />,
};
const TYPE_COLORS: Partial<Record<Notification['type'], string>> = {
    order: '#F97316', booking: '#F59E0B', promotion: '#F59E0B', system: '#475569', review: '#2563EB',
};
const TYPE_BG: Partial<Record<Notification['type'], string>> = {
    order: '#FEE2E2', booking: '#FEF3C7', promotion: '#FEF3C7', system: '#F1F5F9', review: '#DBEAFE',
};

type NotificationTab = (typeof TABS)[number];

const TIME_UPDATE_INTERVAL = 60000; // 1 minute

export default function NotificationsPage() {
    const qc = useQueryClient();
    const [tab, setTab] = useState<NotificationTab>('All');

    const currentType = tab === 'All' ? undefined :
        tab === 'Orders' ? 'order' :
            tab === 'Bookings' ? 'booking' :
                tab === 'Promotions' ? 'promotion' :
                    tab === 'System' ? 'system' : undefined;

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', currentType],
        queryFn: () => notificationsAPI.getAll({ type: currentType, limit: 20 }).then(r => r.data),
        initialData: { notifications: [], unread: 0 } as { notifications: Notification[]; unread: number },
        refetchInterval: TIME_UPDATE_INTERVAL,
    });

    const markAllMut = useMutation({
        mutationFn: () => notificationsAPI.markAllRead(),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
    });
    const clearMut = useMutation({
        mutationFn: () => notificationsAPI.clearAll(),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Notifications cleared'); },
    });
    const markOneMut = useMutation({
        mutationFn: (id: string) => notificationsAPI.markRead(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const notifications = data?.notifications || [];
    const filtered = currentType ? notifications.filter((n) => n.type === currentType) : notifications;

    const getTimeLabel = (createdAt: string) => {
        if (!createdAt) return '';
        const diffMs = new Date().getTime() - new Date(createdAt).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) return `${mins} mins ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Notification Center</h1>
                    <p style={{ fontSize: 14, color: '#475569', marginTop: 2 }}>Stay updated on your culinary adventures and table bookings.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => markAllMut.mutate()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <CheckCheck size={14} /> Mark All as Read
                    </button>
                    <button onClick={() => clearMut.mutate()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Trash2 size={14} /> Clear All
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E2E8F0', marginBottom: 20 }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{ padding: '10px 20px', border: 'none', background: 'transparent', fontFamily: 'Poppins', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? '#F97316' : '#475569', borderBottom: tab === t ? '2px solid #F97316' : '2px solid transparent', marginBottom: -2, cursor: 'pointer' }}>
                        {t}
                    </button>
                ))}
            </div>

            {isLoading ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 6 }}>No notifications</div>
                            <div style={{ fontSize: 14 }}>You're all caught up!</div>
                        </div>
                    ) : filtered.map((n: Notification, i: number) => (
                        <div key={n._id || i}
                            onClick={() => !n.isRead && markOneMut.mutate(n._id)}
                            style={{
                                display: 'flex', gap: 14, padding: '18px 20px',
                                background: n.isRead ? 'white' : '#FFFBFB',
                                borderLeft: n.isRead ? '3px solid transparent' : '3px solid #F97316',
                                borderBottom: '1px solid #F1F5F9',
                                cursor: n.isRead ? 'default' : 'pointer',
                            }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: TYPE_BG[n.type] || '#F1F5F9', color: TYPE_COLORS[n.type] || '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {TYPE_ICONS[n.type] || <Bell size={18} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: '#0F172A' }}>{n.title}</div>
                                    <span style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0, marginLeft: 12 }}>{getTimeLabel(n.createdAt) || n.time}</span>
                                </div>
                                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>{n.message}</p>
                                {n.actions && (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {n.actions.map((a: string, ai: number) => (
                                            <span key={ai} style={{ fontSize: 13, color: ai === 0 ? '#F97316' : '#475569', fontWeight: 500, cursor: 'pointer' }}>{a}</span>
                                        ))}
                                    </div>
                                )}
                                {n.type === 'promotion' && n.cta && (
                                    <button style={{ padding: '6px 16px', background: '#F97316', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                        {n.cta}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filtered.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button onClick={() => toast.success('All notifications loaded')} style={{ padding: '10px 28px', border: '1.5px solid #E2E8F0', borderRadius: 9999, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', color: '#475569', fontWeight: 500 }}>
                        Load More Notifications
                    </button>
                </div>
            )}
        </div>
    );
}

