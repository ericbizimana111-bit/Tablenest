import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { restaurantsAPI } from '../../../shared/services/api';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

export default function PopularRestaurants() {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(gridRef, 'stagger');

    const { data, isLoading } = useQuery<{ restaurants: Restaurant[] }>({
        queryKey: ['featured-restaurants-landing'],
        queryFn: () => restaurantsAPI.getFeatured(4).then((r) => r.data),
        staleTime: 60_000,
    });
    const restaurants = data?.restaurants || [];
    if (!isLoading && restaurants.length === 0) return null;

    return (
        <section style={{ background: 'var(--color-cream)', padding: '72px 0 80px' }}>
            <div ref={sectionRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                    <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, color: 'var(--color-ink)' }}>
                        Popular restaurants <span className="text-gradient">near you</span>
                    </h2>
                    <button onClick={() => navigate('/restaurants')} className="btn btn-ghost" style={{ color: 'var(--color-brand-600)' }}>
                        View all <ArrowRight size={15} />
                    </button>
                </div>

                <div ref={gridRef} className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 290, borderRadius: 18 }} />)
                        : restaurants.map((r) => (
                              <div key={r._id} onClick={() => navigate(`/restaurants/${r._id}`)} className="card card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                                  <div style={{ position: 'relative', height: 160 }}>
                                      <img src={r.images?.[0]} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                      <span className={`badge ${(r as any).openNow !== false ? 'badge-green' : 'badge-gray'}`} style={{ position: 'absolute', top: 10, left: 10 }}>
                                          {(r as any).openNow !== false ? 'Open now' : 'Closed'}
                                      </span>
                                  </div>
                                  <div style={{ padding: '14px 16px 16px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: 'var(--color-ink-soft)', fontWeight: 600, flexShrink: 0 }}>
                                              <Star size={13} fill="#f9691a" color="#f9691a" /> {r.rating || '—'}
                                          </span>
                                      </div>
                                      <div style={{ fontSize: 12.5, color: 'var(--color-ink-mute)', marginBottom: 4 }}>{r.cuisineType} · {r.priceRange}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 14 }}>
                                          <MapPin size={12} /> {r.city}
                                      </div>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate(`/restaurants/${r._id}?tab=menu`); }}>Menu</button>
                                          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate(`/restaurants/${r._id}?tab=book`); }}>Book</button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </section>
    );
}
