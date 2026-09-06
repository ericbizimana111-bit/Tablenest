import { useNavigate } from 'react-router-dom';

export default function OwnerCTA() {
    const navigate = useNavigate();

    return (
        <section style={{
            width: '100%',
            background: '#FFFFFF',
            padding: '64px 0 88px',
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '0 48px' }}>
                <div
                    className="owner-cta-inner"
                    style={{
                        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                        border: '1.5px solid #FDBA74',
                        borderRadius: 22,
                        padding: '48px 56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 12px 36px -8px rgba(249, 115, 22, 0.14)',
                        position: 'relative',
                        overflow: 'hidden',
                        gap: 32,
                    }}
                >
                    {/* Decorative subtle circles */}
                    <div style={{
                        position: 'absolute', top: -50, right: 120,
                        width: 140, height: 140, borderRadius: '50%',
                        background: 'rgba(249, 115, 22, 0.06)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -40, right: 240,
                        width: 90, height: 90, borderRadius: '50%',
                        background: 'rgba(249, 115, 22, 0.05)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 620 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#FFFFFF',
                            border: '1px solid #FED7AA',
                            borderRadius: 9999,
                            padding: '4px 14px',
                            marginBottom: 14,
                        }}>
                            <span style={{
                                color: '#EA580C',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                            }}>
                                ✦ Partner with TableNest
                            </span>
                        </div>

                        <h3 style={{
                            color: '#0F172A',
                            fontSize: 'clamp(22px, 2.5vw, 28px)',
                            fontWeight: 800,
                            marginBottom: 10,
                            letterSpacing: '-0.5px',
                            lineHeight: 1.25,
                        }}>
                            Great Food, Happy Diners, Thriving Restaurants.
                        </h3>
                        <p style={{
                            color: '#475569',
                            fontSize: 14.5,
                            margin: 0,
                            lineHeight: 1.65,
                        }}>
                            Join TableNest to reach thousands of diners daily, manage reservations seamlessly,
                            and accelerate your revenue with automated order tracking and menu management.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/partner/register')}
                        style={{
                            background: '#F97316',
                            color: '#FFFFFF',
                            padding: '16px 36px',
                            borderRadius: 12,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 14.5,
                            fontFamily: 'Poppins',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
                            position: 'relative',
                            zIndex: 1,
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#EA580C';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(234, 88, 12, 0.38)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#F97316';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(249, 115, 22, 0.3)';
                        }}
                    >
                        List Your Restaurant →
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .owner-cta-inner {
                        flex-direction: column !important;
                        text-align: center !important;
                        gap: 24px !important;
                        padding: 36px 28px !important;
                    }
                }
            `}</style>
        </section>
    );
}
