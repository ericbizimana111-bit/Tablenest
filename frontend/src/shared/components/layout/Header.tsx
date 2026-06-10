
import { useNavigate } from 'react-router-dom';

export default function Header({ activeTab, setActiveTab }) {
    const navigate = useNavigate();

    return (
        <>
            {/* Embedded Shared Header Styles */}
            <style>{`
                .nav-link {
                    transition: color 0.2s ease;
                }
                .nav-link:hover {
                    color: #B91C1C !important;
                }
                .btn-hover {
                    transition: all 0.2s ease;
                }
                .btn-hover:hover {
                    background: #991B1B !important;
                    transform: scale(1.02);
                    color: #ffffff !important;
                }
            `}</style>

            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 75, background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                {/* Brand Logo Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => { navigate('/'); if (setActiveTab) setActiveTab('Home'); }}>
                    <div style={{ width: 38, height: 38, background: '#B91C1C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(185, 28, 28, 0.3)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                            <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span style={{ color: '#111827', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>TableNest</span>
                </div>

                {/* Centered Navigation Links */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    {['Home', 'Restaurants', 'How It Works', 'About Us', 'FAQ'].map(l => (
                        <span key={l} className="nav-link"
                            style={{ fontSize: 15, color: activeTab === l ? '#B91C1C' : '#4B5563', cursor: 'pointer', fontWeight: activeTab === l ? 700 : 500, position: 'relative', padding: '4px 0' }}


                            onClick={() => {
                                if (setActiveTab) setActiveTab(l);

                                if (l === 'Restaurants') navigate('/restaurants');
                                if (l === 'Home') navigate('/');
                                if (l === 'How It Works') navigate('/');
                                if (l === 'About Us') navigate('/about-us');
                                if (l === 'FAQ') navigate('/faq');
                            }}>
                            {l}


                            {activeTab === l && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#B91C1C', borderRadius: 2 }} />}
                        </span>
                    ))}
                </div>

                {/* Authentication CTAs Right Grouping */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
                    <span onClick={() => { navigate('/login'); if (setActiveTab) setActiveTab('Log In'); }} className="nav-link"
                        style={{ fontSize: 15, color: activeTab === 'Log In' ? '#B91C1C' : '#4B5563', cursor: 'pointer', fontWeight: activeTab === 'Log In' ? 700 : 500, position: 'relative', padding: '4px 0' }}>
                        Log In
                        {activeTab === 'Log In' && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#B91C1C', borderRadius: 2 }} />}
                    </span>
                    <button onClick={() => navigate('/register')} className="btn-hover" style={{ background: '#B91C1C', color: 'white', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins', boxShadow: '0 2px 4px rgba(185, 28, 28, 0.2)' }}>Sign Up</button>
                </div>
            </nav>
        </>
    );
}