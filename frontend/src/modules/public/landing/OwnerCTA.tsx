import { useNavigate } from 'react-router-dom';

export default function OwnerCTA() {
    const navigate = useNavigate();

    return (
        <section style={{
            padding: '0 48px 56px', maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
            <div style={{
                background: '#F97316', borderRadius: 18, padding: '48px 56px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 10px 30px rgba(249,115,22,0.25)',
                position: 'relative', overflow: 'hidden',
            }}
                className="owner-cta-inner"
            >
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: -40, right: 100,
                    width: 120, height: 120, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                }} />
                <div style={{
                    position: 'absolute', bottom: -30, right: 200,
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{
                        color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 10,
                        letterSpacing: '-0.5px',
                    }}>
                        Are you a restaurant owner?
                    </h3>
                    <p style={{
                        color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0,
                        fontWeight: 300, maxWidth: 480,
                    }}>
                        Join TableNest and reach thousands of hungry customers every day. Grow your restaurant with us.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/partner/register')}
                    style={{
                        background: 'white', color: '#EA580C', padding: '14px 32px',
                        borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: 14, fontFamily: 'Poppins',
                        whiteSpace: 'nowrap', transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        position: 'relative', zIndex: 1,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#172033';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#EA580C';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    List Your Restaurant →
                </button>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .owner-cta-inner { flex-direction: column !important; text-align: center !important; gap: 20px !important; padding: 36px 28px !important; }
                }
            `}</style>
        </section>
    );
}
