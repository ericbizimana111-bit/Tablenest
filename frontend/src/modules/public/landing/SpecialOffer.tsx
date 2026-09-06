import { useNavigate } from 'react-router-dom';
import { Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useScrollReveal, useRevealChildren, useImageReveal } from '../../../shared/hooks/useScrollReveal';

const foodHero = new URL('../../../assets/dish_burger.jpg', import.meta.url).href;

export default function SpecialOffer() {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLDivElement>(null);
    const bannerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(bannerRef, 'stagger');
    useImageReveal(imgRef);

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
                <div ref={sectionRef} style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    <div ref={bannerRef} className="offer-banner-grid stagger" style={{
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
                                Discover great meals. <span style={{ color: '#EA580C' }}>Enjoy what's on offer.</span>
                            </h2>

                            <p style={{
                                fontSize: 14.5,
                                color: '#64748B',
                                lineHeight: 1.7,
                                marginBottom: 30,
                                maxWidth: 540,
                            }}>
                                TableNest helps diners find standout restaurants and gives owners a place to be seen. Better discoveries, better meals, better offers — all in one place.
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                                flexWrap: 'wrap',
                            }}>
                                <button
                                    className="btn-press offer-order-btn"
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
                                    Explore Restaurants
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* ─── RIGHT VISUAL: Restaurant / Food Discovery ─── */}
                        <div className="offer-visual-col" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            position: 'relative',
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: 420,
                                borderRadius: 20,
                                overflow: 'hidden',
                                border: '1.5px solid #FED7AA',
                                boxShadow: '0 16px 36px rgba(249, 115, 22, 0.12)',
                                position: 'relative',
                            }}>
                                <img
                                    ref={imgRef}
                                    src={foodHero}
                                    alt="TableNest restaurant discovery and great meals"
                                    style={{
                                        width: '100%',
                                        height: 300,
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 16,
                                    left: 16,
                                    background: 'rgba(15, 23, 42, 0.75)',
                                    backdropFilter: 'blur(8px)',
                                    color: '#FFFFFF',
                                    padding: '8px 14px',
                                    borderRadius: 9999,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}>
                                    <Sparkles size={14} color="#F97316" />
                                    Discover. Dine. Repeat.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
