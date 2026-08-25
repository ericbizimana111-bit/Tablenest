import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{ background: '#1F1F1F', color: 'white', padding: '40px 80px 20px', marginTop: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginBottom: 32 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'white' }}>TableNest</div>
                    <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>
                        Culinary artistry meets operational precision. The complete management system for modern restaurateurs.
                    </p>
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'white' }}>Explore</div>
                    {[
                        { label: 'Home', path: '/' },
                        { label: 'Browse Restaurants', path: '/restaurants' },
                        { label: 'About Us', path: '/about-us' },
                        { label: 'FAQ', path: '/faq' },
                    ].map(l => (
                        <Link key={l.path} to={l.path} style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8, display: 'block', textDecoration: 'none' }}>
                            {l.label}
                        </Link>
                    ))}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'white' }}>For Restaurants</div>
                    {[
                        { label: 'Partner With Us', path: '/partner/register' },
                        { label: 'Login', path: '/login' },
                        { label: 'Sign Up', path: '/register' },
                    ].map(l => (
                        <Link key={l.path} to={l.path} style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8, display: 'block', textDecoration: 'none' }}>
                            {l.label}
                        </Link>
                    ))}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'white' }}>Contact</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>support@tablenest.com</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>1-800-RESERVE</div>
                </div>
            </div>
            <div style={{ borderTop: '1px solid #374151', paddingTop: 16, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                © {new Date().getFullYear()} TableNest. Culinary artistry meets operational precision.
            </div>
        </footer>
    );
}
