import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X } from 'lucide-react';

import heroCroquettes from '../../../assets/hero_croquettes.jpg';
import heroChicken from '../../../assets/hero_chicken.jpg';

export default function OurStorySection() {
    const navigate = useNavigate();
    const [showVideoModal, setShowVideoModal] = useState(false);

    return (
        <>
            <style>{`
                .story-badge-pill {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #F97316;
                    color: #FFFFFF;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
                    letter-spacing: 0.02em;
                    z-index: 2;
                }
                .story-btn-primary {
                    background: #F97316;
                    color: #FFFFFF;
                    transition: all 0.25s ease;
                }
                .story-btn-primary:hover {
                    background: #EA580C;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
                }
                .story-btn-secondary {
                    background: #FFF7ED;
                    color: #EA580C;
                    border: 1.5px solid #FED7AA;
                    transition: all 0.25s ease;
                }
                .story-btn-secondary:hover {
                    background: #FFEDD5;
                    border-color: #FDBA74;
                    transform: translateY(-2px);
                }
                .story-watch-btn {
                    transition: all 0.2s ease;
                }
                .story-watch-btn:hover {
                    color: #EA580C !important;
                }
                .story-watch-btn:hover .story-play-icon {
                    background: #F97316 !important;
                    color: #FFFFFF !important;
                    transform: scale(1.08);
                }
                @media (max-width: 960px) {
                    .story-grid {
                        grid-template-columns: 1fr !important;
                        gap: 36px !important;
                    }
                    .story-stats-row {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 20px !important;
                    }
                }
                @media (max-width: 600px) {
                    .story-video-card {
                        order: 1 !important;
                    }
                    .story-content-col {
                        order: 2 !important;
                    }
                }
                @media (max-width: 600px) {
                    .story-sub-images {
                        grid-template-columns: 1fr !important;
                    }
                    .story-cta-group {
                        flex-direction: column !important;
                        width: 100% !important;
                    }
                    .story-cta-group button {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                }
            `}</style>

            <section style={{
                background: '#FFFFFF',
                paddingTop: 48,
                paddingBottom: 80,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '1px solid #F1F5F9',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    <div className="story-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1.05fr',
                        gap: 56,
                        alignItems: 'start',
                    }}>
                        {/* ─── LEFT COLUMN: VIDEO CARD ─── */}
                        <div className="story-video-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                position: 'relative',
                                borderRadius: 18,
                                overflow: 'hidden',
                                background: '#0F172A',
                                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(15, 23, 42, 0.06)',
                                cursor: 'pointer',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                aspectRatio: '16 / 9',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 28px 60px rgba(15, 23, 42, 0.18), 0 6px 20px rgba(15, 23, 42, 0.08)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(15, 23, 42, 0.06)'; }}
                                onClick={() => setShowVideoModal(true)}
                            >
                                {/* Video Thumbnail */}
                                <img
                                    src={heroCroquettes}
                                    alt="TableNest restaurant experience"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />

                                {/* Gradient Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(180deg, transparent 50%, rgba(15, 23, 42, 0.7) 100%)',
                                }} />

                                {/* Bottom Gradient for text readability */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 80,
                                    background: 'linear-gradient(0deg, #0F172A 0%, transparent 100%)',
                                }} />

                                {/* Play Button - Centered */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    background: 'rgba(249, 115, 22, 0.95)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(249, 115, 22, 0.45)',
                                    transition: 'all 0.2s ease',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.08)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(249, 115, 22, 0.55)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.45)'; }}
                                >
                                    <Play size={28} fill="white" color="white" style={{ marginLeft: 3 }} />
                                </div>

                                {/* Video Label */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 16,
                                    left: 16,
                                    color: '#FFFFFF',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    letterSpacing: '0.02em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}>
                                    <span style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: '#F97316',
                                        display: 'inline-block',
                                        boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.3)',
                                    }} />
                                    Watch Intro
                                </div>
                            </div>
                        </div>

                        {/* ─── RIGHT COLUMN: TEXT CONTENT ─── */}
                        <div className="story-content-col" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            {/* Headline */}
                            <h2 style={{
                                fontSize: 'clamp(30px, 3.6vw, 44px)',
                                fontWeight: 800,
                                lineHeight: 1.18,
                                letterSpacing: '-1.2px',
                                color: '#0F172A',
                                marginBottom: 0,
                            }}>
                                Real food. Real flavor. <span style={{ color: '#F97316' }}>Places you'll miss.</span>
                            </h2>

                            {/* Descriptive Paragraph */}
                            <p style={{
                                fontSize: 15,
                                color: '#64748B',
                                lineHeight: 1.75,
                                margin: 0,
                            }}>
                                Great food starts with great kitchens. We spotlight restaurants that take pride in what they serve — so every order feels like a meal worth remembering.
                            </p>

                            {/* Watch Intro CTA */}
                            <button
                                className="story-watch-btn"
                                onClick={() => setShowVideoModal(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#0F172A',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    fontFamily: 'inherit',
                                    padding: 0,
                                    marginTop: 8,
                                }}
                            >
                                <div
                                    className="story-play-icon"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        border: '1.5px solid #E2E8F0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#F97316',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />
                                </div>
                                <span>Watch Intro</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Modal Preview */}
            {showVideoModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                }} onClick={() => setShowVideoModal(false)}>
                    <div style={{
                        background: '#0F172A',
                        borderRadius: 20,
                        padding: 24,
                        maxWidth: 720,
                        width: '100%',
                        position: 'relative',
                        color: '#FFFFFF',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Discover TableNest Experience</h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{
                            width: '100%',
                            height: 380,
                            borderRadius: 14,
                            background: '#1E293B',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                        }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: '#F97316',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Play size={28} fill="white" color="white" style={{ marginLeft: 3 }} />
                            </div>
                            <p style={{ color: '#CBD5E1', fontSize: 14 }}>TableNest Introduction & Dining Demo</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
