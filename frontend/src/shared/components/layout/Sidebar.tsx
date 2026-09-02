import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: number;
}

interface SidebarProps {
    title: string;
    subtitle: string;
    navItems: NavItem[];
    bottomUser?: boolean;
}

export default function Sidebar({ title, subtitle, navItems, bottomUser = true }: SidebarProps) {
    const { user, logout } = useAuthStore();

    return (
        <aside style={{
            width: 220, minHeight: '100vh', background: '#172033',
            borderRight: '1px solid #1E293B', display: 'flex',
            flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 40,
        }}>
            {/* Logo */}
            <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ color: '#F97316', fontWeight: 700, fontSize: 18 }}>{title}</div>
                <div style={{ color: '#94A3B8', fontSize: 12 }}>{subtitle}</div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8,
                            color: isActive ? 'white' : '#CBD5E1',
                            background: isActive ? '#F97316' : 'transparent',
                            textDecoration: 'none', fontSize: 14, fontWeight: 500,
                            marginBottom: 2, transition: 'all 0.15s', cursor: 'pointer',
                        })}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            if (!el.style.background.includes('rgb(249')) {
                                el.style.background = 'rgba(249, 115, 22, 0.15)';
                                el.style.color = '#F97316';
                            }
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            if (!el.style.background.includes('rgb(249')) {
                                el.style.background = 'transparent';
                                el.style.color = '#CBD5E1';
                            }
                        }}
                    >
                        <span style={{ flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                            <span style={{
                                background: '#F97316', color: 'white', borderRadius: 9999,
                                fontSize: 11, fontWeight: 600, padding: '1px 7px', minWidth: 20,
                                textAlign: 'center',
                            }}>{item.badge}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom user */}
            {bottomUser && user && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #1E293B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#F97316', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: 14, flexShrink: 0,
                            overflow: 'hidden',
                        }}>
                            {user.avatar
                                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.fullName}
                            </div>
                            <div style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.email}
                            </div>
                        </div>
                        <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }} title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}