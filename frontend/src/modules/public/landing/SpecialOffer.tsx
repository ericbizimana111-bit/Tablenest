import { useNavigate } from 'react-router-dom';
import { Sparkles, Tag, ArrowRight } from 'lucide-react';

export default function SpecialOffer() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                .offer-order-btn {
                    background: #F97316;
                    color: #FFFFFF;
                    transition: all 0.25s ease;
                }
                .offer-order-btn:hover {
                    background: #EA580C;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(249, 115, 22, 0.35);
                }
                @media (max-width: 960px) {
                    .offer-banner-grid {
                        grid-template-columns: 1fr !important;
                        gap: 36px !important;
                        padding: 36px 28px !important;
                    }
                    .offer-visual-col {
                        justify-content: center !important;
                    }
                }
            `}</style>

            <section style={{
                background: '#FFFFFF',
                padding: '40px 0 90px',
                width: '100%',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    <div className="offer-banner-grid" style={{
                        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                        borderRadius: 26,
                        border: '1.5px solid #FED7AA',
                        padding: '50px 60px',
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr',
                        gap: 50,
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 12px 36px rgba(249, 115, 22, 0.08)',
                    }}>
                        {/* ─── LEFT CONTENT ─── */}
                        <div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                color: '#EA580C',
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: 12,
                            }}>
                                <Tag size={13} />
                                SPECIAL OFFER
                            </div>

                            <h2 style={{
                                fontSize: 'clamp(26px, 3vw, 36px)',
                                fontWeight: 800,
                                color: '#0F172A',
                                letterSpacing: '-0.8px',
                                lineHeight: 1.22,
                                marginBottom: 16,
                            }}>
                                Great Food, Happy Customers, Thriving Restaurants
                            </h2>

                            <p style={{
                                fontSize: 14.5,
                                color: '#64748B',
                                lineHeight: 1.7,
                                marginBottom: 30,
                                maxWidth: 540,
                            }}>
                                Customers discover new flavours and enjoy special deals. Restaurant owners attract more diners and grow their revenue. TableNest makes every meal and every business better.
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                                flexWrap: 'wrap',
                            }}>
                                <button
                                    className="offer-order-btn"
                                    onClick={() => navigate('/restaurants')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        border: 'none',
                                        padding: '12px 28px',
                                        borderRadius: 10,
                                        fontSize: 14.5,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    Order Now
                                    <ArrowRight size={16} />
                                </button>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <span style={{
                                        fontSize: 24,
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        letterSpacing: '-0.5px',
                                    }}>
                                        $58.99
                                    </span>
                                    <span style={{
                                        fontSize: 15,
                                        color: '#94A3B8',
                                        textDecoration: 'line-through',
                                        fontWeight: 500,
                                    }}>
                                        $79.99
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ─── RIGHT GRAPHIC: 2x1 SUPER COMBO ─── */}
                        <div className="offer-visual-col" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            position: 'relative',
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: 420,
                                background: '#FFFFFF',
                                borderRadius: 20,
                                padding: '24px 28px',
                                border: '1.5px solid #FED7AA',
                                boxShadow: '0 16px 36px rgba(249, 115, 22, 0.12)',
                                position: 'relative',
                            }}>
                                {/* Discount badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: -12,
                                    left: -12,
                                    background: '#F97316',
                                    color: '#FFFFFF',
                                    borderRadius: '50%',
                                    width: 54,
                                    height: 54,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                                    transform: 'rotate(-10deg)',
                                }}>
                                    <span>30%</span>
                                    <span>OFF</span>
                                </div>

                                {/* Banner Header */}
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: 16,
                                    paddingBottom: 12,
                                    borderBottom: '1px dashed #FED7AA',
                                }}>
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#FFF7ED',
                                        color: '#EA580C',
                                        padding: '4px 14px',
                                        borderRadius: 9999,
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: '0.06em',
                                        marginBottom: 6,
                                    }}>
                                        LIMITED TIME
                                    </div>
                                    <h4 style={{
                                        fontSize: 22,
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        letterSpacing: '-0.5px',
                                        margin: 0,
                                    }}>
                                        2x1 SUPER COMBO
                                    </h4>
                                </div>

                                {/* Food & Character Illustration container */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    padding: '10px 0',
                                }}>
                                    {/* Food icons combo representation */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                                        <div style={{
                                            fontSize: 42,
                                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                                            lineHeight: 1,
                                        }}>
                                            🍔 🥤 🍟
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#EA580C' }}>
                                            Double Burger + Drinks + Fries
                                        </span>
                                    </div>

                                    {/* Happy diner avatar badge */}
                                    <div style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '3px solid #FED7AA',
                                        flexShrink: 0,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
                                            alt="Delighted Customer"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: 14,
                                    background: '#FFF7ED',
                                    borderRadius: 10,
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                    color: '#475569',
                                    fontWeight: 500,
                                }}>
                                    <span>Code: <strong style={{ color: '#EA580C' }}>NEST2X1</strong></span>
                                    <span style={{ color: '#16A34A', fontWeight: 600 }}>Active Today</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
