import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Utensils } from 'lucide-react';

export default function LandingFooter() {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }
        toast.success('Thank you for subscribing to TableNest newsletter!');
        setEmail('');
    };

    const shopLinks = [
        { label: 'Explore Restaurants', to: '/restaurants' },
        { label: 'Book a Table', to: '/book' },
        { label: 'Order Online', to: '/order' },
        { label: 'Catering Services', to: '/catering' },
    ];
    const helpLinks = [
        { label: 'Track My Order', to: '/track' },
        { label: 'Cancellations & Refunds', to: '/cancellations' },
        { label: 'FAQs', to: '/faq' },
        { label: 'Contact Support', to: '/contact' },
    ];

    return (
        <footer
            style={{
                background: '#FFFFFF',
                width: '100%',
                padding: '64px 40px 40px',
                fontFamily: 'Poppins, sans-serif',
            }}
        >
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 40,
            }}
                className="footer-grid"
            >
                {/* ─── Brand column ─── */}
                <div style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 16,
                    }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            background: '#F97316',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 3px 10px rgba(249, 115, 22, 0.3)',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                                <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                            </svg>
                        </div>
                        <span style={{
                            fontWeight: 800,
                            fontSize: 18,
                            color: '#0F172A',
                            letterSpacing: '0.05em',
                        }}>
                            TableNest
                        </span>
                    </div>

                    <p style={{
                        fontSize: 13,
                        color: '#64748B',
                        lineHeight: 1.65,
                        marginBottom: 20,
                        maxWidth: 240,
                    }}>
                        The all-in-one platform for restaurant management and food ordering. Discover, manage, and grow.
                    </p>
                </div>

                {/* ─── Explore column ─── */}
                <div style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <h3 style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#F97316',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: 16,
                        fontFamily: 'Poppins, sans-serif',
                    }}>
                        Explore
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {shopLinks.map(({ label, to }) => (
                            <li key={label}>
                                <Link
                                    to={to}
                                    style={{
                                        color: '#475569',
                                        fontSize: 13.5,
                                        textDecoration: 'none',
                                        transition: 'color 0.2s ease',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLElement).style.color = '#0F172A';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLElement).style.color = '#475569';
                                    }}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ─── Support column ─── */}
                <div style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <h3 style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#F97316',
                        letterSpacing: '0.1em',
                        marginBottom: 16,
                        fontFamily: 'Poppins, sans-serif',
                    }}>
                        Help
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {helpLinks.map(({ label, to }) => (
                            <li key={label}>
                                <Link
                                    to={to}
                                    style={{
                                        color: '#475569',
                                        fontSize: 13.5,
                                        textDecoration: 'none',
                                        transition: 'color 0.2s ease',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLElement).style.color = '#0F172A';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLElement).style.color = '#475569';
                                    }}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ─── Newsletter column ─── */}
                <div style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <h3 style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0F172A',
                        letterSpacing: '0.1em',
                        marginBottom: 12,
                        fontFamily: 'Poppins, sans-serif',
                    }}>
                        Stay in the loop
                    </h3>
                    <p style={{
                        fontSize: 13,
                        color: '#64748B',
                        lineHeight: 1.6,
                        marginBottom: 14,
                    }}>
                        Exclusive deals &amp; restaurant updates, straight to your inbox.
                    </p>

                    <form
                        onSubmit={handleSubscribe}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            overflow: 'hidden',
                        }}
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={{
                                flex: 1,
                                minWidth: 0,
                                padding: '10px 12px',
                                fontSize: 13,
                                color: '#334155',
                                outline: 'none',
                                border: 'none',
                                background: 'transparent',
                                fontFamily: 'inherit',
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                background: '#F97316',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 0,
                                padding: '10px 18px',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'background 0.2s ease',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.background = '#EA580C';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.background = '#F97316';
                            }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* ─── Bottom bar ─── */}
            <div style={{
                maxWidth: 1280,
                margin: '40px auto 0',
                width: '100%',
                borderTop: '1px solid #E2E8F0',
                paddingTop: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
            }}>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: 0 }}>
                    © {new Date().getFullYear()} TableNest. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: 20 }}>
                    <Link to="/privacy" style={{ color: '#94A3B8', fontSize: 12.5, textDecoration: 'none' }}>
                        Privacy
                    </Link>
                    <Link to="/terms" style={{ color: '#94A3B8', fontSize: 12.5, textDecoration: 'none' }}>
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
