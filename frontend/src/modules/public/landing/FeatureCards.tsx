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
        <div style={{ width: '100%' }}>
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
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            borderRadius: 16,
                            padding: '30px 24px',
                            background: '#FFFFFF',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 32px -8px rgba(0, 0, 0, 0.14)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)';
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
                            fontWeight: 700, fontSize: 16.5, marginBottom: 8, color: '#0F172A',
                        }}>
                            {f.title}
                        </div>
                        <p style={{
                            fontSize: 13.5, color: '#475569', lineHeight: 1.65, margin: 0, marginBottom: 16,
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
        </div>
    );
}
