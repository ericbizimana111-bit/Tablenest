import { Search, Calendar, Utensils, ArrowRight } from 'lucide-react';

const FEATURES = [
    {
        icon: <Search size={22} />,
        title: 'Explore Top Restaurants',
        desc: 'Find and book the best restaurants with real-time availability and reviews.',
        link: 'Explore Now →',
    },
    {
        icon: <Calendar size={22} />,
        title: 'Instant Reservations',
        desc: 'Reserve your table in seconds with instant confirmations.',
        link: 'Book Now →',
    },
    {
        icon: <Utensils size={22} />,
        title: 'Pre-Order & Enjoy',
        desc: 'Skip the wait — order ahead and pick up your favorite meals on the go.',
        link: 'Order Now →',
    },
];

export default function FeatureCards() {
    return (
        <section style={{
            padding: '48px 48px 56px', background: '#FFFFFF',
            maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
            }}
                className="feature-cards-grid"
            >
                {FEATURES.map(f => (
                    <div
                        key={f.title}
                        className="feature-card"
                        style={{
                            border: '1px solid #E2E8F0', borderRadius: 14, padding: '28px 24px',
                            background: '#FFFFFF', transition: 'all 0.3s',
                            cursor: 'default',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            background: '#FFF7ED', color: '#F97316', width: 48, height: 48,
                            borderRadius: 12, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', marginBottom: 18,
                        }}>
                            {f.icon}
                        </div>
                        <div style={{
                            fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#0F172A',
                        }}>
                            {f.title}
                        </div>
                        <p style={{
                            fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: 0, marginBottom: 14,
                        }}>
                            {f.desc}
                        </p>
                        <span style={{
                            fontSize: 13, fontWeight: 600, color: '#F97316', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                            {f.link}
                        </span>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .feature-cards-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
