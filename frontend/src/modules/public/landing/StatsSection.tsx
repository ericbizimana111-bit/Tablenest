import { Store, Users, CalendarCheck, Star, Headphones, ThumbsUp } from 'lucide-react';

const STATS = [
    { icon: <Store size={22} />, value: '10K+', label: 'Restaurants' },
    { icon: <Users size={22} />, value: '2K+', label: 'Happy Customers' },
    { icon: <CalendarCheck size={22} />, value: '50K+', label: 'Total Reservations' },
    { icon: <Star size={22} />, value: '4.8', label: 'Average Rating' },
    { icon: <Headphones size={22} />, value: '24/7', label: 'Customer Support' },
    { icon: <ThumbsUp size={22} />, value: '100%', label: 'Satisfaction' },
];

export default function StatsSection() {
    return (
        <section style={{
            padding: '56px 48px',
            background: '#0F172A',
            maxWidth: '100%',
            width: '100%',
        }}>
            <div className="stats-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24,
                maxWidth: 1280, margin: '0 auto',
            }}>
                {STATS.map(s => (
                    <div key={s.label} style={{
                        textAlign: 'center', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 8,
                    }}>
                        <div style={{
                            color: '#F97316', marginBottom: 4,
                        }}>
                            {s.icon}
                        </div>
                        <div style={{
                            fontSize: 24, fontWeight: 800, color: '#FFFFFF',
                            letterSpacing: '-0.5px',
                        }}>
                            {s.value}
                        </div>
                        <div style={{
                            fontSize: 12, color: '#94A3B8', fontWeight: 500,
                        }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 32px 24px !important; }
                }
                @media (max-width: 480px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </section>
    );
}
