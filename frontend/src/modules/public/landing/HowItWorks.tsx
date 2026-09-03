import { Search, Calendar, CreditCard, Heart } from 'lucide-react';

const STEPS = [
    {
        n: '01',
        icon: <Search size={20} />,
        title: 'Find Your Spot',
        desc: 'Search by cuisine, location, or atmosphere.',
    },
    {
        n: '02',
        icon: <Calendar size={20} />,
        title: 'Choose Your Time',
        desc: 'Pick the perfect date and time that suits you.',
    },
    {
        n: '03',
        icon: <CreditCard size={20} />,
        title: 'Book or Order',
        desc: 'Book your table or pre-order your favorite meals.',
    },
    {
        n: '04',
        icon: <Heart size={20} />,
        title: 'Enjoy Your Moment',
        desc: 'Sit back, relax, and enjoy the experience.',
    },
];

export default function HowItWorks() {
    return (
        <section style={{
            padding: '72px 48px', background: '#FFFFFF',
            maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
            <h2 style={{
                textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 56,
                color: '#0F172A', letterSpacing: '-0.5px',
            }}>
                How It Works
            </h2>

            <div className="how-it-works-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
                position: 'relative',
            }}>
                {/* Connecting line */}
                <div style={{
                    position: 'absolute', top: 30, left: '14%', right: '14%',
                    height: 2, background: '#E2E8F0', zIndex: 0,
                }} className="how-line" />

                {STEPS.map(s => (
                    <div key={s.n} style={{
                        textAlign: 'center', position: 'relative', zIndex: 1,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                        {/* Number circle */}
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: '#F97316', color: 'white', fontWeight: 700, fontSize: 17,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20, boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
                        }}>
                            {s.n}
                        </div>

                        {/* Icon */}
                        <div style={{
                            color: '#F97316', marginBottom: 12,
                        }}>
                            {s.icon}
                        </div>

                        {/* Title */}
                        <div style={{
                            fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#0F172A',
                        }}>
                            {s.title}
                        </div>

                        {/* Description */}
                        <p style={{
                            fontSize: 13, color: '#475569', maxWidth: 200,
                            margin: '0 auto', lineHeight: 1.6,
                        }}>
                            {s.desc}
                        </p>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .how-it-works-grid { grid-template-columns: 1fr 1fr !important; gap: 40px 24px !important; }
                    .how-line { display: none !important; }
                }
                @media (max-width: 480px) {
                    .how-it-works-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
