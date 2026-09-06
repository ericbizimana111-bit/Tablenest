import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Patrick Nkurunziza',
        role: 'Manager, Cafe Kigali',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        quote: "The analytics dashboard alone is worth it. I can see exactly which items sell best and when peak hours are. It's like having a business consultant built right into the app.",
        rating: 5,
    },
    {
        id: 2,
        name: 'Sarah M.',
        role: 'Head Chef, Olive & Thyme',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        quote: "TableNest has transformed our table turnover and pre-orders. Guests arrive relaxed, and our kitchen workflow has never been this smooth and predictable.",
        rating: 5,
    },
    {
        id: 3,
        name: 'David R.',
        role: 'Chief Creative Officer & Foodie',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        quote: "I used to feel overwhelmed trying to find quality spots for weekend dinners. TableNest curated the best restaurants near me and let me book instantly.",
        rating: 5,
    },
    {
        id: 4,
        name: 'Elena W.',
        role: 'Food Critic & Explorer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        quote: "The pre-order feature is a game-changer. Skipping the rush and having our meals freshly prepared upon arrival has made weekday dining an absolute delight.",
        rating: 5,
    },
];

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
    };

    return (
        <>
            <style>{`
                .test-arrow-btn {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    border: 1.5px solid #E2E8F0;
                    background: #FFFFFF;
                    color: #0F172A;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .test-arrow-btn:hover {
                    border-color: #F97316;
                    color: #F97316;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
                    transform: scale(1.05);
                }
                .test-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 9999px;
                    background: #CBD5E1;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .test-dot.active {
                    width: 26px;
                    background: #F97316;
                }
                @media (max-width: 768px) {
                    .test-deck-wrap {
                        height: auto !important;
                        min-height: 380px !important;
                    }
                    .test-side-card {
                        display: none !important;
                    }
                    .test-center-card {
                        position: relative !important;
                        left: auto !important;
                        transform: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>

            <section style={{
                background: '#FAFAFC',
                padding: '90px 0 100px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 54 }}>
                        <h2 style={{
                            fontSize: 'clamp(28px, 3.4vw, 40px)',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.8px',
                            marginBottom: 12,
                        }}>
                            What clients say?
                        </h2>
                        <p style={{
                            fontSize: 15,
                            color: '#64748B',
                            maxWidth: 580,
                            margin: '0 auto',
                            lineHeight: 1.6,
                        }}>
                            Hear from restaurant owners who grew their business and customers who love discovering new favourite spots.
                        </p>
                    </div>

                    {/* Fanned 3D Deck */}
                    <div className="test-deck-wrap" style={{
                        position: 'relative',
                        height: 360,
                        maxWidth: 960,
                        margin: '0 auto 40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {TESTIMONIALS.map((item, index) => {
                            // Calculate position relative to activeIndex
                            let offset = index - activeIndex;
                            if (offset < -1) offset += TESTIMONIALS.length;
                            if (offset > 1) offset -= TESTIMONIALS.length;

                            const isCenter = offset === 0;
                            const isLeft = offset === -1;
                            const isRight = offset === 1;

                            if (!isCenter && !isLeft && !isRight) return null;

                            let transform = 'translateX(-50%) translateY(0) scale(1)';
                            let zIndex = 10;
                            let opacity = 1;
                            let border = '2px solid #F97316';
                            let boxShadow = '0 20px 40px rgba(249, 115, 22, 0.12)';

                            if (isLeft) {
                                transform = 'translateX(calc(-50% - 190px)) translateY(18px) rotate(-6deg) scale(0.88)';
                                zIndex = 5;
                                opacity = 0.55;
                                border = '1px solid #E2E8F0';
                                boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                            } else if (isRight) {
                                transform = 'translateX(calc(-50% + 190px)) translateY(18px) rotate(6deg) scale(0.88)';
                                zIndex = 5;
                                opacity = 0.55;
                                border = '1px solid #E2E8F0';
                                boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                            }

                            return (
                                <div
                                    key={item.id}
                                    className={isCenter ? 'test-center-card' : 'test-side-card'}
                                    onClick={() => {
                                        if (isLeft) handlePrev();
                                        if (isRight) handleNext();
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform,
                                        zIndex,
                                        opacity,
                                        width: '100%',
                                        maxWidth: 420,
                                        background: '#FFFFFF',
                                        borderRadius: 22,
                                        border,
                                        padding: '30px 28px',
                                        boxShadow,
                                        cursor: isCenter ? 'default' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                >
                                    {/* Author Top Row */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        marginBottom: 16,
                                    }}>
                                        <img
                                            src={item.avatar}
                                            alt={item.name}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #FED7AA',
                                            }}
                                        />
                                        <div>
                                            <h4 style={{
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: '#0F172A',
                                                margin: 0,
                                                letterSpacing: '-0.2px',
                                            }}>
                                                {item.name}
                                            </h4>
                                            <p style={{
                                                fontSize: 12.5,
                                                color: '#64748B',
                                                margin: '2px 0 0',
                                            }}>
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quote Text */}
                                    <p style={{
                                        fontSize: 13.5,
                                        color: '#334155',
                                        lineHeight: 1.7,
                                        marginBottom: 18,
                                        minHeight: 80,
                                    }}>
                                        "{item.quote}"
                                    </p>

                                    {/* Star Rating */}
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Controls Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 20,
                    }}>
                        <button className="test-arrow-btn" onClick={handlePrev} aria-label="Previous testimonial">
                            <ChevronLeft size={20} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {TESTIMONIALS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`test-dot ${i === activeIndex ? 'active' : ''}`}
                                    onClick={() => setActiveIndex(i)}
                                />
                            ))}
                        </div>

                        <button className="test-arrow-btn" onClick={handleNext} aria-label="Next testimonial">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
