import React, { useEffect, useState } from 'react';
import { Bell, Settings, Search, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { notificationsAPI } from '../../services/api';

interface TopbarProps {
    placeholder?: string;
    onSearch?: (q: string) => void;
    notifPath?: string;
    settingsPath?: string;
    showCart?: boolean;
}

export default function Topbar({ placeholder = 'Search...', onSearch, notifPath, settingsPath, showCart }: TopbarProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { cart, cartItemCount } = useOrderStore();
    const [unread, setUnread] = useState(0);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!user) return;
        const load = () => notificationsAPI.getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => undefined);
        load();
        const id = setInterval(load, 60000);
        return () => clearInterval(id);
    }, [user]);

    const submitSearch = () => {
        if (!query.trim()) return;
        if (onSearch) onSearch(query);
        else navigate(`/restaurants?search=${encodeURIComponent(query)}`);
    };

    const itemCount = cartItemCount();

    return (
        <header style={{
            position: 'fixed', top: 0, left: 220, right: 0, height: 60,
            background: 'white', borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, zIndex: 30,
        }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
                    onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                    placeholder={placeholder}
                    className="input"
                    style={{ paddingLeft: 36, background: '#F8FAFC' }}
                />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                {showCart && cart && itemCount > 0 && (
                    <button onClick={() => navigate(`/restaurants/${cart.restaurantId}?tab=menu`)} className="btn-icon" style={{ position: 'relative', background: 'none', border: 'none', color: '#475569' }} title="View cart">
                        <ShoppingBag size={20} />
                        <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--color-brand-500)', color: 'white', borderRadius: 9999, fontSize: 10, fontWeight: 700, padding: '0 4px', minWidth: 16, textAlign: 'center' }}>{itemCount}</span>
                    </button>
                )}
                <button onClick={() => notifPath && navigate(notifPath)} className="btn-icon" style={{ position: 'relative', background: 'none', border: 'none', color: '#475569' }}>
                    <Bell size={20} />
                    {unread > 0 && (
                        <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--color-brand-500)', color: 'white', borderRadius: 9999, fontSize: 10, fontWeight: 700, padding: '0 4px', minWidth: 16, textAlign: 'center' }}>{unread > 9 ? '9+' : unread}</span>
                    )}
                </button>
                <button onClick={() => settingsPath && navigate(settingsPath)} className="btn-icon" style={{ background: 'none', border: 'none', color: '#475569' }}>
                    <Settings size={20} />
                </button>
                <button
                    onClick={() => settingsPath && navigate(settingsPath)}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-brand-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, cursor: 'pointer', overflow: 'hidden', border: 'none' }}
                >
                    {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.fullName?.charAt(0).toUpperCase()}
                </button>
            </div>
        </header>
    );
}
