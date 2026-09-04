import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../../shared/utils/auth.utils';
import { Menu, X } from 'lucide-react';
import { ConfirmModal } from '../../../shared/components/ui/ConfirmModal/ConfirmModal';

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Restaurants', path: '/restaurants' },
    { label: 'About Us', path: '/about-us' },
    { label: 'FAQ', path: '/faq' },
];

export default function LandingHeader() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleNav = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <>
            <style>{`
                .ln-nav-link { transition: color 0.2s ease; cursor: pointer; }
                .ln-nav-link:hover { color: #F97316 !important; }
                .ln-btn-hover { transition: all 0.2s ease; }
                .ln-btn-hover:hover { background: #EA580C !important; transform: scale(1.03); }
            `}</style>

            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 72,
                background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 48px', zIndex: 1000,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                {/* Brand Logo */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => handleNav('/')}
                >
                    <div style={{
                        width: 36, height: 36, background: '#F97316', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                            <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 21, letterSpacing: '-0.5px' }}>TableNest</span>
                </div>

                {/* Centered Desktop Nav Links */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 32, position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                }}
                    className="ln-desktop-nav"
                >
                    {NAV_LINKS.map(l => (
                        <span
                            key={l.label}
                            className="ln-nav-link"
                            style={{ fontSize: 14.5, color: '#CBD5E1', fontWeight: 500 }}
                            onClick={() => handleNav(l.path)}
                        >
                            {l.label}
                        </span>
                    ))}
                </div>

                {/* Right side auth buttons */}
                <div className="ln-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
                    {isAuthenticated && user ? (
                        <>
                            <span
                                className="ln-nav-link"
                                style={{ fontSize: 14, color: '#F97316', fontWeight: 600 }}
                                onClick={() => navigate(getRoleHomePath(user.role))}
                            >
                                Dashboard
                            </span>
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                style={{
                                    padding: '8px 20px', border: '1.5px solid rgba(255,255,255,0.2)',
                                    borderRadius: 8, background: 'transparent', fontSize: 13,
                                    cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500,
                                    color: '#CBD5E1', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#CBD5E1'; }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <span
                                className="ln-nav-link"
                                style={{ fontSize: 14.5, color: '#CBD5E1', fontWeight: 500 }}
                                onClick={() => handleNav('/login')}
                            >
                                Log In
                            </span>
                            <button
                                className="ln-btn-hover"
                                onClick={() => handleNav('/register')}
                                style={{
                                    background: '#F97316', color: 'white', padding: '9px 22px',
                                    borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 13.5, fontFamily: 'Poppins',
                                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                                }}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="ln-mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{
                        display: 'none', background: 'none', border: 'none',
                        color: 'white', cursor: 'pointer', padding: 8,
                    }}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div
                    className="ln-mobile-overlay"
                    style={{
                        position: 'fixed', top: 72, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.97)', zIndex: 999,
                        display: 'flex', flexDirection: 'column', padding: '24px 32px',
                        gap: 0, overflowY: 'auto',
                    }}
                >
                    {NAV_LINKS.map(l => (
                        <div
                            key={l.label}
                            onClick={() => handleNav(l.path)}
                            style={{
                                padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
                                color: '#CBD5E1', fontSize: 16, fontWeight: 500, cursor: 'pointer',
                            }}
                        >
                            {l.label}
                        </div>
                    ))}
                    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {isAuthenticated && user ? (
                            <>
                                <button
                                    onClick={() => { navigate(getRoleHomePath(user.role)); setMobileOpen(false); }}
                                    style={{
                                        padding: '12px', borderRadius: 8, border: 'none',
                                        background: '#F97316', color: 'white', fontSize: 15,
                                        fontWeight: 600, fontFamily: 'Poppins', cursor: 'pointer',
                                    }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    style={{
                                        padding: '12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.2)',
                                        background: 'transparent', color: '#CBD5E1', fontSize: 15,
                                        fontWeight: 500, fontFamily: 'Poppins', cursor: 'pointer',
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleNav('/login')}
                                    style={{
                                        padding: '12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.2)',
                                        background: 'transparent', color: '#CBD5E1', fontSize: 15,
                                        fontWeight: 500, fontFamily: 'Poppins', cursor: 'pointer',
                                    }}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => handleNav('/register')}
                                    style={{
                                        padding: '12px', borderRadius: 8, border: 'none',
                                        background: '#F97316', color: 'white', fontSize: 15,
                                        fontWeight: 600, fontFamily: 'Poppins', cursor: 'pointer',
                                    }}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .ln-desktop-nav { display: none !important; }
                    .ln-mobile-toggle { display: block !important; }
                }
            `}</style>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={() => { logout(); setShowLogoutConfirm(false); setMobileOpen(false); }}
            />
        </>
    );
}
