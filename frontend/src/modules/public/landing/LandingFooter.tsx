import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer style={{
            background: '#0F172A', color: 'white', padding: '56px 48px 24px',
        }}>
            <div className="footer-grid" style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40,
                maxWidth: 1280, margin: '0 auto', marginBottom: 40,
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{
                            width: 34, height: 34, background: '#F97316', borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                                <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>TableNest</span>
                    </div>
                    <p style={{
                        fontSize: 13, color: '#94A3B8', lineHeight: 1.7, maxWidth: 280,
                    }}>
                        The complete restaurant management and dining platform. Discover, book, and enjoy the finest restaurants near you.
                    </p>
                </div>

                {/* Explore */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'white' }}>
                        Explore
                    </div>
                    {[
                        { label: 'Home', path: '/' },
                        { label: 'Browse Restaurants', path: '/restaurants' },
                        { label: 'About Us', path: '/about-us' },
                        { label: 'FAQ', path: '/faq' },
                    ].map(l => (
                        <Link key={l.path} to={l.path} style={{
                            fontSize: 13, color: '#94A3B8', marginBottom: 10,
                            display: 'block', textDecoration: 'none', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* For Restaurants */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'white' }}>
                        For Restaurants
                    </div>
                    {[
                        { label: 'Partner With Us', path: '/partner/register' },
                        { label: 'Login', path: '/login' },
                        { label: 'Sign Up', path: '/register' },
                    ].map(l => (
                        <Link key={l.path} to={l.path} style={{
                            fontSize: 13, color: '#94A3B8', marginBottom: 10,
                            display: 'block', textDecoration: 'none', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Contact */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'white' }}>
                        Contact
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Mail size={14} color="#94A3B8" />
                        <span style={{ fontSize: 13, color: '#94A3B8' }}>support@tablenest.com</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Phone size={14} color="#94A3B8" />
                        <span style={{ fontSize: 13, color: '#94A3B8' }}>1-800-RESERVE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={14} color="#94A3B8" />
                        <span style={{ fontSize: 13, color: '#94A3B8' }}>New York, NY</span>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{
                borderTop: '1px solid rgba(71,85,105,0.4)', paddingTop: 20,
                maxWidth: 1280, margin: '0 auto',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
            }}>
                <div style={{ fontSize: 12.5, color: '#475569' }}>
                    © {new Date().getFullYear()} TableNest. All rights reserved.
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                    {['Privacy Policy', 'Terms of Service'].map(text => (
                        <span key={text} style={{
                            fontSize: 12.5, color: '#475569', cursor: 'pointer',
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                        >
                            {text}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
                }
            `}</style>
        </footer>
    );
}
