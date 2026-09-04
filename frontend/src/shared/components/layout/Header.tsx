import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthContext';
import { getRoleHomePath } from '../../utils/auth.utils';

interface HeaderProps {
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
}

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Restaurants', path: '/restaurants' },
    { label: 'About Us', path: '/about-us' },
    { label: 'FAQ', path: '/faq' },
];

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const handleNav = (label: string, path: string) => {
        if (setActiveTab) setActiveTab(label);
        navigate(path);
        scrollToTop();
    };

    return (
        <>
            <style>{`
                .nav-link { transition: color 0.2s ease; }
                .nav-link:hover { color: #F97316 !important; }
                .btn-hover { transition: all 0.2s ease; }
                .btn-hover:hover { background: #EA580C !important; transform: scale(1.02); color: #ffffff !important; }
            `}</style>

            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 75,
                background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #E2E8F0', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', padding: '0 80px',
                zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}>
                {/* Brand Logo */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => handleNav('Home', '/')}
                >
                    <div style={{
                        width: 38, height: 38, background: '#F97316', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                            <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span style={{ color: '#0F172A', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>TableNest</span>
                </div>

                {/* Centered Navigation Links */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 36, position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                }}>
                    {NAV_LINKS.map(l => (
                        <span
                            key={l.label}
                            className="nav-link"
                            style={{
                                fontSize: 15,
                                color: activeTab === l.label ? '#F97316' : '#475569',
                                cursor: 'pointer',
                                fontWeight: activeTab === l.label ? 700 : 500,
                                position: 'relative', padding: '4px 0',
                            }}
                            onClick={() => handleNav(l.label, l.path)}
                        >
                            {l.label}
                            {activeTab === l.label && (
                                <span style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    height: 2, background: '#F97316', borderRadius: 2,
                                }} />
                            )}
                        </span>
                    ))}
                </div>

                {/* Right side — auth-aware */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                    {isAuthenticated && user ? (
                        <>
                            <span
                                className="nav-link"
                                style={{ fontSize: 14, color: '#F97316', cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => { navigate(getRoleHomePath(user.role)); scrollToTop(); }}
                            >
                                Dashboard
                            </span>
                            <button
                                onClick={() => { if (window.confirm('Are you sure you want to logout?')) { logout(); scrollToTop(); } }}
                                style={{
                                    padding: '9px 20px', border: '1.5px solid #E2E8F0',
                                    borderRadius: 8, background: 'white', fontSize: 13,
                                    cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500,
                                    color: '#475569',
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <span
                                onClick={() => { navigate('/login'); scrollToTop(); }}
                                className="nav-link"
                                style={{
                                    fontSize: 15, color: activeTab === 'Log In' ? '#F97316' : '#475569',
                                    cursor: 'pointer', fontWeight: activeTab === 'Log In' ? 700 : 500,
                                    position: 'relative', padding: '4px 0',
                                }}
                            >
                                Log In
                                {activeTab === 'Log In' && (
                                    <span style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        height: 2, background: '#F97316', borderRadius: 2,
                                    }} />
                                )}
                            </span>
                            <button
                                onClick={() => { navigate('/register'); scrollToTop(); }}
                                className="btn-hover"
                                style={{
                                    background: '#F97316', color: 'white', padding: '10px 24px',
                                    borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                                    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)',
                                }}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}
