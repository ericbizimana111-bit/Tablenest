import React, { useState, useEffect } from 'react';
import { Bell, Settings, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { notificationsAPI } from '../../services/api';

interface TopbarProps {
    placeholder?: string;
    onSearch?: (q: string) => void;
    notifPath?: string;
    settingsPath?: string;
}

export default function Topbar({ placeholder = 'Search...', onSearch, notifPath, settingsPath }: TopbarProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (user) {
            notificationsAPI.getUnreadCount().then(r => setUnread(r.data.count)).catch(() => { });
        }
    }, [user]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    return (
        <header style={{
            position: 'fixed', top: 0, left: 220, right: 0, height: 60,
            background: 'white', borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', padding: '0 24px',
            gap: 16, zIndex: 30,
        }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                    value={query}
                    onChange={handleSearch}
                    placeholder={placeholder}
                    style={{
                        width: '100%', padding: '8px 12px 8px 36px',
                        border: '1.5px solid #E2E8F0', borderRadius: 8,
                        fontSize: 14, fontFamily: 'Poppins, sans-serif',
                        outline: 'none', background: '#F8FAFC',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Bell */}
                <button
                    onClick={() => notifPath && navigate(notifPath)}
                    style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#475569' }}
                >
                    <Bell size={20} />
                    {unread > 0 && (
                        <span style={{
                            position: 'absolute', top: 4, right: 4,
                            background: '#F97316', color: 'white', borderRadius: 9999,
                            fontSize: 10, fontWeight: 700, padding: '0 4px', minWidth: 16, textAlign: 'center',
                        }}>{unread > 9 ? '9+' : unread}</span>
                    )}
                </button>

                {/* Settings */}
                <button
                    onClick={() => settingsPath && navigate(settingsPath)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#475569' }}
                >
                    <Settings size={20} />
                </button>

                {/* Avatar */}
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#F97316', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', overflow: 'hidden',
                }}>
                    {user?.avatar
                        ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : user?.fullName?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}