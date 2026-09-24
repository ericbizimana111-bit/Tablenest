import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Star, Flame } from 'lucide-react';
import { menuAPI } from '../../../shared/services/api';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

interface PopularDish {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    sold: number;
    restaurant: { _id: string; name: string; rating?: number };
}

export default function PopularDishes() {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(headerRef, 'stagger');
    useRevealChildren(gridRef, 'stagger');

    const { data, isLoading } = useQuery<{ dishes: PopularDish[] }>({
        queryKey: ['landing-popular-dishes'],
        queryFn: () => menuAPI.getPopular(8).then((r) => r.data),
        staleTime: 60_000,
    });
    const dishes = data?.dishes || [];

    const [offset, setOffset] = useState(0);
    const perView = typeof window !== 'undefined' && window.innerWidth <= 1080 ? (window.innerWidth <= 600 ? 1 : 2) : 4;
    const handlePrev = () => setOffset((o) => Math.max(0, o - perView));
    const handleNext = () => setOffset((o) => Math.min(Math.max(0, dishes.length - perView), o + perView));

    const goToDish = (d: PopularDish) => navigate(`/restaurants/${d.restaurant._id}?tab=menu`);

    return (
        <section style={{ background: 'var(--color-sand)', padding: '88px 0 96px' }}>
            <div ref={sectionRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
                <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-brand-600)', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                        <Flame size={14} /> Trending now
                    </div>
                    <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>
                        Dishes people are ordering right now
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--color-ink-mute)', maxWidth: 600, margin: '0 auto', lineHeight: 1.65 }}>
                        Ranked live from real orders placed on TableNest — updated as people order.
                    </p>
                </div>

                {!isLoading && dishes.length > perView && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
                        <button onClick={handlePrev} disabled={offset === 0} className="btn-icon" style={{ background: '#fff', border: '1.5px solid var(--color-line)', opacity: offset === 0 ? 0.4 : 1 }}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={handleNext} disabled={offset + perView >= dishes.length} className="btn-icon" style={{ background: '#fff', border: '1.5px solid var(--color-line)', opacity: offset + perView >= dishes.length ? 0.4 : 1 }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                <div ref={gridRef} className="stagger" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(perView, 4)}, 1fr)`, gap: 24 }}>
                    {isLoading
                        ? Array.from({ length: perView }).map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 22 }} />)
                        : dishes.slice(offset, offset + perView).map((dish) => (
                              <div key={dish._id} onClick={() => goToDish(dish)} className="card card-hover" style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ height: 168, background: 'var(--color-sand)', overflow: 'hidden', position: 'relative' }}>
                                      {dish.image && <img src={dish.image} alt={dish.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                      <span className="badge badge-brand" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)' }}>${dish.price.toFixed(2)}</span>
                                  </div>
                                  <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 4 }}>{dish.name}</h3>
                                      <p style={{ fontSize: 12.5, color: 'var(--color-ink-mute)', marginBottom: 12 }}>{dish.restaurant?.name}</p>
                                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-line)' }}>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: 'var(--color-ink)' }}>
                                              <Star size={13} fill="#f9691a" color="#f9691a" /> {dish.restaurant?.rating?.toFixed(1) ?? '—'}
                                          </span>
                                          <span style={{ fontSize: 11.5, color: 'var(--color-ink-mute)' }}>{dish.sold > 0 ? `${dish.sold}+ ordered` : 'New'}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </section>
    );
}
