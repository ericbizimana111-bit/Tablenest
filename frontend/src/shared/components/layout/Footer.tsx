import React from 'react';

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
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'white' }}>Quick Links</div>
                    {['Dashboard', 'Bookings', 'Analytics'].map(l => (
                        <div key={l} style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8, cursor: 'pointer' }}>{l}</div>
                    ))}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'white' }}>For Restaurants</div>
                    {['Join TableNest', 'Partner Perks', 'Support Center'].map(l => (
                        <div key={l} style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8, cursor: 'pointer' }}>{l}</div>
                    ))}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'white' }}>Contact Info</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>support@tablenest.com</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>1-800-RESERVE</div>
                </div>
            </div>
            <div style={{ borderTop: '1px solid #374151', paddingTop: 16, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                © 2024 TableNest. Culinary artistry meets operational precision.
            </div>
        </footer>
    );
}