import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIAL_SETS = [
    [
        {
            quote: "I used to feel overwhelmed trying to find quality spots for weekend dinners. TableNest curated the best restaurants near me and let me book instantly. It was the dining shift I truly needed.",
            name: "David R.",
            role: "Chief Creative Officer",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            rating: 5,
        },
        {
            quote: "The pre-order feature changed everything. Skipping the lunch rush and having our meals freshly prepared upon arrival has made weekday dining seamless. I've found a level of convenience I didn't think was possible.",
            name: "Elena W.",
            role: "Ultra-Runner & Entrepreneur",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            featured: true,
        },
        {
            quote: "Unlike every other food app, this feels like a true dining partnership. From booking quiet brunch spots to anniversary dinners, it's the first time a reservation system felt effortless and human.",
            name: "Marcus K.",
            role: "Software Engineer",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            rating: 5,
        },
    ],
    [
        {
            quote: "We used TableNest for my parents' 40th anniversary dinner. Picked a place we never would've found on our own, and the whole night was perfect. Already booked again for next month.",
            name: "Priya Sharma",
            role: "Design Director",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
            rating: 5,
        },
        {
            quote: "The instant table booking is what keeps me coming back. I used to call restaurants and get put on hold for 10 minutes. Now I just tap once and my table is confirmed with zero hassle.",
            name: "Jake Morrison",
            role: "Product Lead & Foodie",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            featured: true,
        },
        {
            quote: "As someone who loves exploring authentic local flavors, finding real-time availability and verified menus in one clean interface is a breath of fresh air. An absolute daily essential.",
            name: "Rosa Gutierrez",
            role: "Culinary Enthusiast",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            rating: 5,
        },
    ],
];

export default function Testimonials() {
    const [page, setPage] = useState(0);
    const activeSet = TESTIMONIAL_SETS[page];

    return (
        <section style={{
            padding: '80px 48px 88px',
            background: '#F8FAFC',
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
        }}>
            <div style={{
                maxWidth: 1180,
                margin: '0 auto',
                width: '100%',
            }}>
                {/* ─── SECTION HEADER ─── */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 52,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {/* Small Badge / Kicker */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#FFF7ED',
                        border: '1px solid #FED7AA',
                        borderRadius: 9999,
                        padding: '5px 16px',
                        marginBottom: 16,
                    }}>
                        <span style={{
                            color: '#F97316',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>
                            The Anthology
                        </span>
                    </div>

                    {/* Headline */}
                    <h2 style={{
                        fontSize: 'clamp(32px, 4vw, 44px)',
                        fontWeight: 800,
                        color: '#0F172A',
                        letterSpacing: '-1px',
                        lineHeight: 1.15,
                        margin: '0 0 16px',
                    }}>
                        Real lives,<br />
                        <span style={{
                            fontFamily: 'Georgia, serif',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: '#F97316',
                        }}>
                            beautifully shared.
                        </span>
                    </h2>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: 15,
                        color: '#64748B',
                        lineHeight: 1.7,
                        maxWidth: 580,
                        margin: 0,
                    }}>
                        Great dining isn't just about what's on the menu. It's the moments of clarity,
                        the return of energy, and the quiet joy of a table in perfect harmony.
                    </p>
                </div>

                {/* ─── 3 CARDS GRID ─── */}
                <div
                    className="testimonial-cards-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 24,
                        alignItems: 'stretch',
                        marginBottom: 44,
                    }}
                >
                    {activeSet.map((t, idx) => {
                        const isFeatured = t.featured;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: isFeatured
                                        ? 'linear-gradient(165deg, #F97316 0%, #EA580C 100%)'
                                        : '#FFFFFF',
                                    borderRadius: 24,
                                    padding: '36px 30px',
                                    boxShadow: isFeatured
                                        ? '0 20px 40px -10px rgba(234, 88, 12, 0.35)'
                                        : '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
                                    border: isFeatured
                                        ? '1px solid rgba(255, 255, 255, 0.2)'
                                        : '1px solid #E2E8F0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    if (isFeatured) {
                                        e.currentTarget.style.boxShadow = '0 25px 48px -10px rgba(234, 88, 12, 0.45)';
                                    } else {
                                        e.currentTarget.style.boxShadow = '0 18px 36px -5px rgba(0, 0, 0, 0.09)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    if (isFeatured) {
                                        e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(234, 88, 12, 0.35)';
                                    } else {
                                        e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.05)';
                                    }
                                }}
                            >
                                {/* Decorative watermark quote on featured card */}
                                {isFeatured && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 22,
                                        opacity: 0.18,
                                        color: '#FFFFFF',
                                        pointerEvents: 'none',
                                    }}>
                                        <Quote size={52} />
                                    </div>
                                )}

                                <div>
                                    {/* Stars */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        marginBottom: 20,
                                    }}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={isFeatured ? '#FFFFFF' : '#F97316'}
                                                color={isFeatured ? '#FFFFFF' : '#F97316'}
                                            />
                                        ))}
                                    </div>

                                    {/* Quote Text */}
                                    <p style={{
                                        fontSize: 14,
                                        lineHeight: 1.75,
                                        fontStyle: 'italic',
                                        color: isFeatured ? '#FFFFFF' : '#475569',
                                        margin: '0 0 28px',
                                        fontWeight: 400,
                                    }}>
                                        "{t.quote}"
                                    </p>
                                </div>

                                {/* Author Section */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    paddingTop: 16,
                                    borderTop: isFeatured
                                        ? '1px solid rgba(255, 255, 255, 0.2)'
                                        : '1px solid #F1F5F9',
                                }}>
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: isFeatured
                                                ? '2px solid rgba(255, 255, 255, 0.9)'
                                                : '2px solid #FED7AA',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: isFeatured ? '#FFFFFF' : '#0F172A',
                                            lineHeight: 1.3,
                                        }}>
                                            {t.name}
                                        </div>
                                        <div style={{
                                            fontSize: 12,
                                            color: isFeatured ? 'rgba(255, 255, 255, 0.85)' : '#94A3B8',
                                            fontWeight: 500,
                                        }}>
                                            {t.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── BOTTOM CONTROLS & QUOTE ─── */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 16,
                }}>
                    {/* Pagination indicators */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                            disabled={page === 0}
                            aria-label="Previous stories"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px solid #E2E8F0',
                                background: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: page === 0 ? 'not-allowed' : 'pointer',
                                opacity: page === 0 ? 0.4 : 1,
                                transition: 'all 0.2s',
                            }}
                        >
                            <ChevronLeft size={16} color="#0F172A" />
                        </button>

                        <div style={{ display: 'flex', gap: 6 }}>
                            {TESTIMONIAL_SETS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    aria-label={`Story set ${i + 1}`}
                                    style={{
                                        width: page === i ? 24 : 8,
                                        height: 8,
                                        borderRadius: 4,
                                        background: page === i ? '#F97316' : '#CBD5E1',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        padding: 0,
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(p + 1, TESTIMONIAL_SETS.length - 1))}
                            disabled={page === TESTIMONIAL_SETS.length - 1}
                            aria-label="Next stories"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px solid #E2E8F0',
                                background: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: page === TESTIMONIAL_SETS.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: page === TESTIMONIAL_SETS.length - 1 ? 0.4 : 1,
                                transition: 'all 0.2s',
                            }}
                        >
                            <ChevronRight size={16} color="#0F172A" />
                        </button>
                    </div>

                    {/* Italic Bottom Tagline */}
                    <div style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: 15,
                        color: '#64748B',
                    }}>
                        "Your next unforgettable meal is waiting for you to pull up a chair."
                    </div>

                    {/* View All Stories Link */}
                    <button
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0F172A',
                            fontSize: 13.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'color 0.2s',
                            fontFamily: 'Poppins',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                        onMouseLeave={e => e.currentTarget.style.color = '#0F172A'}
                    >
                        View all 2,000+ stories →
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .testimonial-cards-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                    }
                }
            `}</style>
        </section>
    );
}
