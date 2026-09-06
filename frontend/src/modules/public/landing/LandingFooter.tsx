import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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

    return (
        <>
            <style>{`
                .footer-link {
                    color: #64748B;
                    text-decoration: none;
                    font-size: 13.5px;
                    transition: color 0.2s ease;
                    display: block;
                    margin-bottom: 12px;
                }
                .footer-link:hover {
                    color: #F97316 !important;
                }
                .footer-social-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: #F97316;
                    color: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }
                .footer-social-btn:hover {
                    background: #EA580C;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(249, 115, 22, 0.35);
                }
                .footer-subscribe-btn {
                    background: #F97316;
                    color: #FFFFFF;
                    transition: all 0.2s ease;
                }
                .footer-subscribe-btn:hover {
                    background: #EA580C;
                    box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
                }
                @media (max-width: 1024px) {
                    .footer-main-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 36px !important;
                    }
                }
                @media (max-width: 680px) {
                    .footer-main-grid {
                        grid-template-columns: 1fr !important;
                        gap: 32px !important;
                    }
                }
            `}</style>

            <footer style={{
                background: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                fontFamily: 'Poppins, sans-serif',
                paddingTop: 64,
                paddingBottom: 40,
                width: '100%',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    <div className="footer-main-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.4fr',
                        gap: 32,
                        marginBottom: 48,
                    }}>
                        {/* ─── Column 1: Brand & Socials ─── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{
                                    width: 38,
                                    height: 38,
                                    background: '#F97316',
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 3px 10px rgba(249, 115, 22, 0.3)',
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                                        <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                                    </svg>
                                </div>
                                <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A', letterSpacing: '-0.4px' }}>
                                    TableNest
                                </span>
                            </div>

                            <p style={{
                                fontSize: 13.5,
                                color: '#64748B',
                                lineHeight: 1.7,
                                maxWidth: 260,
                                marginBottom: 20,
                            }}>
                                TableNest — the all-in-one platform for restaurant management and food ordering. Discover, manage, and grow.
                            </p>

                            {/* Social Buttons: X, LinkedIn, Instagram */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                {/* X (Twitter) */}
                                <a href="https://x.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="X (Twitter)">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>

                                {/* LinkedIn */}
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>

                                {/* Instagram */}
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="Instagram">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* ─── Column 2: Customer Service ─── */}
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>
                                Customer Service
                            </h4>
                            <Link to="/faq" className="footer-link">FAQ</Link>
                            <Link to="/about-us" className="footer-link">Contact</Link>
                            <Link to="/faq" className="footer-link">Privacy Policy</Link>
                            <Link to="/faq" className="footer-link">Terms of Service</Link>
                        </div>

                        {/* ─── Column 3: Company ─── */}
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>
                                Company
                            </h4>
                            <Link to="/about-us" className="footer-link">About Us</Link>
                            <Link to="/about-us" className="footer-link">Pricing</Link>
                            <Link to="/" className="footer-link">Our Story</Link>
                            <Link to="/register" className="footer-link">Partner With Us</Link>
                        </div>

                        {/* ─── Column 4: Quick Links ─── */}
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>
                                Quick Links
                            </h4>
                            <Link to="/restaurants" className="footer-link">Offers</Link>
                            <Link to="/restaurants" className="footer-link">Explore Restaurants</Link>
                            <Link to="/restaurants" className="footer-link">Track Order</Link>
                            <Link to="/register" className="footer-link">Get Started</Link>
                            <Link to="/about-us" className="footer-link">Pricing</Link>
                        </div>

                        {/* ─── Column 5: Newsletter ─── */}
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                                Sign Up Our Newsletters
                            </h4>
                            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>
                                Stay connected and get the latest updates.
                            </p>

                            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: 8,
                                        border: '1.5px solid #E2E8F0',
                                        fontSize: 13.5,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        color: '#0F172A',
                                        background: '#FFFFFF',
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="footer-subscribe-btn"
                                    style={{
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    Subscribe Now
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom Copyright bar */}
                    <div style={{
                        borderTop: '1px solid #F1F5F9',
                        paddingTop: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12.5,
                        color: '#94A3B8',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}>
                        <div>© {new Date().getFullYear()} TableNest. All rights reserved.</div>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <Link to="/faq" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</Link>
                            <Link to="/faq" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
