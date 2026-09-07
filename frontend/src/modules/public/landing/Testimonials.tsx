import { useRef } from 'react';
import { Star } from 'lucide-react';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Olivier Imanizabayo',
        role: 'Restaurant owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        quote: "TableNest helped us reach more customers without changing how we work. Reservations are easier to manage, and we finally get a clearer picture of what people want.",
        rating: 5,
    },
    {
        id: 2,
        name: 'Marie Claire Uwera',
        role: 'Regular diner',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        quote: "It is the easiest way to find restaurants I actually trust. I can see what is popular, book a table, or order in a few taps, and the places are always good.",
        rating: 5,
    },
    {
        id: 3,
        name: 'Jean Patrick',
        role: 'Customer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        quote: "I use it when I want a good meal without spending time searching. The options feel reliable, and booking takes the stress out of planning dinner.",
        rating: 5,
    },
    {
        id: 4,
        name: 'Diana Mukherjee',
        role: 'Restaurant partner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        quote: "For us, TableNest is not just visibility. It is a simpler way to connect with diners, handle reservations smoothly, and grow without the usual guesswork.",
        rating: 5,
    },
];

export default function Testimonials() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(headerRef, 'stagger');
    useRevealChildren(trackRef, 'stagger');

    return (
        <>
            <style>{`
                .test-marquee {
                    position: relative;
                    overflow: hidden;
                    border-radius: 24px;
                    border: 1px solid #F1F5F9;
                    background: linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.8));
                    padding: 18px 0;
                }

                .test-marquee::before,
                .test-marquee::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 90px;
                    z-index: 2;
                    pointer-events: none;
                }

                .test-marquee::before {
                    left: 0;
                    background: linear-gradient(90deg, #FAFAFC 0%, rgba(250,250,252,0) 100%);
                }

                .test-marquee::after {
                    right: 0;
                    background: linear-gradient(270deg, #FAFAFC 0%, rgba(250,250,252,0) 100%);
                }

                .test-track {
                    display: flex;
                    gap: 20px;
                    flex-wrap: nowrap;
                    width: max-content;
                    min-width: max-content;
                    animation: testLoop 28s linear infinite;
                    will-change: transform;
                }

                .test-track:hover {
                    animation-play-state: paused;
                }

                .test-track:hover .test-card {
                    border-color: #F97316;
                    box-shadow: 0 16px 32px rgba(249, 115, 22, 0.12);
                }

                .test-card {
                    transition: transform 0.3s var(--ease-out-expo),
                        box-shadow 0.3s var(--ease-smooth),
                        border-color 0.3s ease;
                }

                .test-card:hover {
                    transform: translateY(-4px) scale(1.01);
                }

                @keyframes testLoop {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                @media (max-width: 768px) {
                    .test-marquee {
                        border-radius: 18px;
                        padding: 14px 0;
                    }
                    .test-marquee::before,
                    .test-marquee::after {
                        width: 48px;
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
                <div ref={sectionRef} style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    {/* Header */}
                    <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 54 }}>
                        <h2 style={{
                            fontSize: 'clamp(28px, 3.4vw, 40px)',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.8px',
                            marginBottom: 12,
                        }}>
                            Trusted by diners and restaurants
                        </h2>
                        <p style={{
                            fontSize: 15,
                            color: '#64748B',
                            maxWidth: 580,
                            margin: '0 auto',
                            lineHeight: 1.6,
                        }}>
                            Real experiences from people using TableNest to find restaurants, make reservations, order easily, and grow their business.
                        </p>
                    </div>

                    {/* Testimonial Track */}
                    <div className="test-marquee" style={{ margin: '0 auto 32px' }}>
                        <div
                            ref={trackRef}
                            className="test-track stagger is-visible"
                        >
                            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="test-card card-lift"
                                    style={{
                                        width: 280,
                                        flexShrink: 0,
                                        background: '#FFFFFF',
                                        borderRadius: 20,
                                        border: '1.5px solid #F1F5F9',
                                        padding: '26px 24px 24px',
                                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                                        opacity: 1,
                                        transform: 'none',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        marginBottom: 16,
                                    }}>
                                        <img
                                            src={item.avatar}
                                            alt={item.name}
                                            className="img-reveal is-visible"
                                            style={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #FFFFFF',
                                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                                                flexShrink: 0,
                                                opacity: 1,
                                                transform: 'none',
                                            }}
                                        />
                                        <div>
                                            <h4 style={{
                                                fontSize: 15.5,
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

                                    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                                        ))}
                                    </div>

                                    <p style={{
                                        fontSize: 14,
                                        color: '#334155',
                                        lineHeight: 1.65,
                                        margin: 0,
                                    }}>
                                        {item.quote}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
