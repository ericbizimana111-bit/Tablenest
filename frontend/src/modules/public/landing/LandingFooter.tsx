import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer style={{
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            fontFamily: 'Poppins, sans-serif',
        }}>
            {/* Main footer grid */}
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                padding: '56px 64px 40px',
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                gap: 40,
            }}
                className="footer-grid"
            >
                {/* ── Brand Column ── */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{
                            width: 40, height: 40, background: '#F97316', borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                                <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 20, color: '#0F172A', letterSpacing: '-0.3px' }}>TableNest</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.7, maxWidth: 240, marginBottom: 24 }}>
                        Discover, book, and enjoy the best restaurants near you. Great food, great company, great moments.
                    </p>

                    {/* Social Icons */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[
                            {
                                label: 'Instagram',
                                path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                            },
                            {
                                label: 'Facebook',
                                path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                            },
                            {
                                label: 'Twitter',
                                path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                            },
                            {
                                label: 'LinkedIn',
                                path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                            },
                        ].map(({ label, path }) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                style={{
                                    width: 34, height: 34, borderRadius: 8,
                                    background: '#EEF2FF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    color: '#64748B',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#F97316';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = '#EEF2FF';
                                    e.currentTarget.style.color = '#64748B';
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d={path} />
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Explore Column ── */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 20 }}>Explore</div>
                    {[
                        { label: 'Home', path: '/' },
                        { label: 'Browse Restaurants', path: '/restaurants' },
                        { label: 'About Us', path: '/about-us' },
                        { label: 'How it Works', path: '/' },
                        { label: 'FAQ', path: '/faq', highlight: true },
                    ].map(l => (
                        <Link
                            key={l.path + l.label}
                            to={l.path}
                            style={{
                                fontSize: 13.5,
                                color: l.highlight ? '#F97316' : '#64748B',
                                marginBottom: 12,
                                display: 'block',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                                fontWeight: l.highlight ? 600 : 400,
                            }}
                            onMouseEnter={e => { if (!l.highlight) e.currentTarget.style.color = '#F97316'; }}
                            onMouseLeave={e => { if (!l.highlight) e.currentTarget.style.color = '#64748B'; }}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* ── For Restaurants Column ── */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 20 }}>For Restaurants</div>
                    {[
                        { label: 'Partner With Us', path: '/partner/register' },
                        { label: 'Login', path: '/login' },
                        { label: 'Sign Up', path: '/register' },
                        { label: 'Resources', path: '/' },
                    ].map(l => (
                        <Link
                            key={l.path + l.label}
                            to={l.path}
                            style={{
                                fontSize: 13.5, color: '#64748B', marginBottom: 12,
                                display: 'block', textDecoration: 'none', transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* ── Contact Column ── */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 20 }}>Contact</div>
                    {[
                        { Icon: Mail, text: 'support@tablenest.com' },
                        { Icon: Phone, text: '1-800-RESERVE' },
                        { Icon: MapPin, text: 'New York, NY' },
                    ].map(({ Icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: '#FFF7ED', border: '1px solid #FED7AA',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Icon size={14} color="#F97316" />
                            </div>
                            <span style={{ fontSize: 13.5, color: '#64748B' }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div style={{
                borderTop: '1px solid #E2E8F0',
                maxWidth: 1280,
                margin: '0 auto',
                padding: '20px 64px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
            }}
                className="footer-bottom"
            >
                <span style={{ fontSize: 13, color: '#94A3B8' }}>
                    © {new Date().getFullYear()} TableNest. All rights reserved.
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text, i) => (
                        <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                                style={{ fontSize: 13, color: '#64748B', cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                            >
                                {text}
                            </span>
                            {i < 2 && <span style={{ color: '#CBD5E1', fontSize: 16 }}>•</span>}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; padding: 40px 32px 32px !important; }
                }
                @media (max-width: 600px) {
                    .footer-grid { grid-template-columns: 1fr !important; }
                    .footer-bottom { padding: 16px 24px !important; }
                }
            `}</style>
        </footer>
    );
}
