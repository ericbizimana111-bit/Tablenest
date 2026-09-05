import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        text: 'Honestly I was skeptical at first but I tried pre-ordering for a Monday lunch rush and it actually worked. Got there, food was ready, no line. Changed my whole workday.',
        name: 'Marcus Bell',
        location: 'Brooklyn, NY',
        rating: 4,
        color: '#3B82F6',
        initials: 'MB',
        date: '2 weeks ago',
    },
    {
        text: 'We used TableNest for my parents\' 40th anniversary dinner. Picked a place we never would\'ve found on our own, and the whole night was perfect. Already booked again for next month.',
        name: 'Priya Sharma',
        location: 'Austin, TX',
        rating: 5,
        color: '#10B981',
        initials: 'PS',
        date: '1 month ago',
    },
    {
        text: 'The QR code ordering is neat but honestly the reservation system is what keeps me coming back. I used to call restaurants and get put on hold for 10 minutes. Now I just tap a button.',
        name: 'Jake Morrison',
        location: 'Chicago, IL',
        rating: 5,
        color: '#F59E0B',
        initials: 'JM',
        date: '3 weeks ago',
    },
    {
        text: 'As someone who runs a small restaurant, the owner dashboard has been really helpful for tracking what people are ordering and when our busy hours actually are.',
        name: 'Rosa Gutierrez',
        location: 'Miami, FL',
        rating: 5,
        color: '#EF4444',
        initials: 'RG',
        date: '1 week ago',
    },
    {
        text: 'Pretty good app overall. The interface is clean and finding restaurants nearby is super easy. Only reason I\'m not giving 5 stars is the search could use some filters for dietary stuff.',
        name: 'Alex Kowalski',
        location: 'Portland, OR',
        rating: 4,
        color: '#8B5CF6',
        initials: 'AK',
        date: '5 days ago',
    },
    {
        text: 'I work nights so I\'m always looking for places open late. Found a 24-hour diner through TableNest that I never knew existed. The pre-order saved me from waiting 30 minutes at 2am.',
        name: 'Danielle Foster',
        location: 'Nashville, TN',
        rating: 4,
        color: '#EC4899',
        initials: 'DF',
        date: '2 months ago',
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
                <div>
                    <h2 style={{
                        fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 4,
                    }}>
                        What Our Customers Say
                    </h2>
                    <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
                        Real reviews from real people who use TableNest
                    </p>
                </div>
                <span style={{
                    color: '#F97316', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                }}>
                    Browse All Reviews →
                </span>
            </div>

            <div className="testimonials-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
            }}>
                {TESTIMONIALS.map((t, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: '#FFFFFF',
                            borderRadius: 12,
                            padding: '24px 22px 20px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            position: 'relative',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Stars — inline, not a separate block */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i < t.rating ? '#F59E0B' : 'transparent'}
                                    color={i < t.rating ? '#F59E0B' : '#CBD5E1'}
                                />
                            ))}
                            <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 6 }}>
                                {t.date}
                            </span>
                        </div>

                        {/* Quote */}
                        <p style={{
                            fontSize: 14, color: '#334155', lineHeight: 1.65,
                            margin: 0, flex: 1,
                        }}>
                            {t.text}
                        </p>

                        {/* Author row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                            {/* Colored initials circle — no stock photo */}
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: t.color + '18',
                                color: t.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700, flexShrink: 0,
                                letterSpacing: '0.5px',
                            }}>
                                {t.initials}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                                    {t.name}
                                </div>
                                <div style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500 }}>
                                    {t.location}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 960px) {
                    .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .testimonials-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
