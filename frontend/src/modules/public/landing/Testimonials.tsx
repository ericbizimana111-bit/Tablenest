import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { reviewsAPI } from '../../../shared/services/api';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

interface FeaturedReview {
    _id: string;
    rating: number;
    comment: string;
    customerName: string;
    restaurant?: { name: string; city?: string };
}

const PALETTE = ['#f9691a', '#e9500e', '#1d5fd1', '#6a3fd1', '#17803d', '#a15c07'];
const initialsOf = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function Testimonials() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(headerRef, 'stagger');
    useRevealChildren(trackRef, 'stagger');

    const { data } = useQuery<FeaturedReview[]>({
        queryKey: ['landing-testimonials'],
        queryFn: () => reviewsAPI.getFeatured(8).then((r) => r.data),
        staleTime: 60_000,
    });
    const reviews = data && data.length ? data : [];
    if (!reviews.length) return null;
    const loop = [...reviews, ...reviews, ...reviews];

    return (
        <>
            <style>{`
                .test-marquee { position: relative; overflow: hidden; border-radius: 24px; border: 1px solid var(--color-line); background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.9)); padding: 18px 0; }
                .test-marquee::before, .test-marquee::after { content: ''; position: absolute; top: 0; bottom: 0; width: 90px; z-index: 2; pointer-events: none; }
                .test-marquee::before { left: 0; background: linear-gradient(90deg, var(--color-sand) 0%, rgba(246,238,228,0) 100%); }
                .test-marquee::after { right: 0; background: linear-gradient(270deg, var(--color-sand) 0%, rgba(246,238,228,0) 100%); }
                .test-track { display: flex; gap: 20px; width: max-content; animation: testLoop 34s linear infinite; }
                .test-track:hover { animation-play-state: paused; }
                .test-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
                .test-card:hover { transform: translateY(-4px); border-color: var(--color-brand-300) !important; box-shadow: var(--shadow-lift); }
                @keyframes testLoop { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
            `}</style>
            <section style={{ background: 'var(--color-sand)', padding: '90px 0 100px', overflow: 'hidden' }}>
                <div ref={sectionRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
                    <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>
                            Trusted by diners everywhere
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--color-ink-mute)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
                            Real reviews from real orders and bookings on TableNest.
                        </p>
                    </div>
                    <div className="test-marquee">
                        <div ref={trackRef} className="test-track">
                            {loop.map((item, idx) => {
                                const color = PALETTE[idx % PALETTE.length];
                                return (
                                    <div key={idx} className="test-card card" style={{ width: 300, flexShrink: 0, padding: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                                {initialsOf(item.customerName || 'Guest')}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>{item.customerName}</h4>
                                                <p style={{ fontSize: 12, color: 'var(--color-ink-mute)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    at {item.restaurant?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                                            {Array.from({ length: item.rating }).map((_, i) => (
                                                <Star key={i} size={13} fill="#f9691a" color="#f9691a" />
                                            ))}
                                        </div>
                                        <p style={{ fontSize: 13.5, color: 'var(--color-ink-soft)', lineHeight: 1.6, margin: 0 }}>“{item.comment}”</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
