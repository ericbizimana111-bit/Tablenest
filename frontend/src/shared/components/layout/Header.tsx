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
                .nav-link:hover { color: #B91C1C !important; }
                .btn-hover { transition: all 0.2s ease; }
                .btn-hover:hover { background: #991B1B !important; transform: scale(1.02); color: #ffffff !important; }
            `}</style>

            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 75,
                background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #E5E7EB', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', padding: '0 80px',
                zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}>
                {/* Brand Logo */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => handleNav('Home', '/')}
                >
                    <div style={{
                        width: 38, height: 38, background: '#B91C1C', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(185, 28, 28, 0.3)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                            <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span style={{ color: '#111827', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>TableNest</span>
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
                                color: activeTab === l.label ? '#B91C1C' : '#4B5563',
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
                                    height: 2, background: '#B91C1C', borderRadius: 2,
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
                                style={{ fontSize: 14, color: '#B91C1C', cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => { navigate(getRoleHomePath(user.role)); scrollToTop(); }}
                            >
                                Dashboard
                            </span>
                            <button
                                onClick={() => { logout(); scrollToTop(); }}
                                style={{
                                    padding: '9px 20px', border: '1.5px solid #E5E7EB',
                                    borderRadius: 8, background: 'white', fontSize: 13,
                                    cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500,
                                    color: '#6B7280',
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
                                    fontSize: 15, color: activeTab === 'Log In' ? '#B91C1C' : '#4B5563',
                                    cursor: 'pointer', fontWeight: activeTab === 'Log In' ? 700 : 500,
                                    position: 'relative', padding: '4px 0',
                                }}
                            >
                                Log In
                                {activeTab === 'Log In' && (
                                    <span style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        height: 2, background: '#B91C1C', borderRadius: 2,
                                    }} />
                                )}
                            </span>
                            <button
                                onClick={() => { navigate('/register'); scrollToTop(); }}
                                className="btn-hover"
                                style={{
                                    background: '#B91C1C', color: 'white', padding: '10px 24px',
                                    borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                                    boxShadow: '0 2px 4px rgba(185, 28, 28, 0.2)',
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
