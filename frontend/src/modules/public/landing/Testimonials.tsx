import { Star, ArrowRight } from 'lucide-react';

const TESTIMONIALS = [
    {
        text: 'TableNest made it so easy to find the perfect restaurant for our anniversary. The reservation process was seamless!',
        name: 'Sarah Jenkins',
        role: 'Food Critic',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        rating: 5,
    },
    {
        text: 'The pre-order feature is a game-changer for lunch hours. I skip the line and my food is ready when I arrive.',
        name: 'David Chen',
        role: 'Busy Professional',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        rating: 5,
    },
    {
        text: 'I\'ve discovered so many amazing local restaurants through TableNest. Highly recommend it to all food lovers!',
        name: 'Emily Rodriguez',
        role: 'Local Guide',
        img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <section style={{
            padding: '64px 48px', background: '#F8FAFC',
            maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36,
            }}>
                <h2 style={{
                    fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px',
                }}>
                    What Our Customers Say
                </h2>
                <span style={{
                    color: '#F97316', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                }}>
                    View All Reviews <ArrowRight size={15} />
                </span>
            </div>

            <div className="testimonials-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
            }}>
                {TESTIMONIALS.map(t => (
                    <div
                        key={t.name}
                        style={{
                            background: '#FFFFFF', borderRadius: 14, padding: '28px 24px 24px',
                            border: '1px solid #E2E8F0', position: 'relative',
                            transition: 'all 0.3s', overflow: 'hidden',
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
                        {/* Orange left accent */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                            background: '#F97316', borderRadius: '14px 0 0 14px',
                        }} />

                        {/* Stars */}
                        <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                            ))}
                        </div>

                        {/* Quote */}
                        <p style={{
                            fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0,
                            marginBottom: 20, fontStyle: 'italic',
                        }}>
                            "{t.text}"
                        </p>

                        {/* Author */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                                src={t.img}
                                alt={t.name}
                                style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    objectFit: 'cover', border: '2px solid #FEE2E2',
                                }}
                            />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                                    {t.name}
                                </div>
                                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
                                    {t.role}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .testimonials-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
