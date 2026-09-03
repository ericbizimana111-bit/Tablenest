import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI } from '../../../shared/services/api';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import type { Restaurant } from '../../../shared/types/restaurant.types';

export default function PopularRestaurants() {
    const navigate = useNavigate();

    const { data: featuredData } = useQuery({
        queryKey: ['featured-restaurants-landing'],
        queryFn: () => restaurantsAPI.getPublic({ limit: 4 }).then(r => r.data),
    });
    const restaurants: Restaurant[] = featuredData?.restaurants || [];

    return (
        <section style={{
            padding: '64px 48px', background: '#FFFFFF',
            maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32,
            }}>
                <h2 style={{
                    fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px',
                }}>
                    Popular Restaurants <span style={{ color: '#F97316' }}>Near You</span>
                </h2>
                <span
                    onClick={() => navigate('/restaurants')}
                    style={{
                        color: '#F97316', fontSize: 14, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                    }}
                >
                    View All Restaurants <ArrowRight size={15} />
                </span>
            </div>

            <div className="restaurants-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
            }}>
                {restaurants.map((r: Restaurant) => (
                    <div
                        key={r._id}
                        onClick={() => navigate(`/restaurants/${r._id}`)}
                        className="restaurant-card"
                        style={{
                            border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden',
                            cursor: 'pointer', background: 'white', transition: 'all 0.3s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <img
                                src={r.images?.[0] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80'}
                                alt={r.name}
                                style={{ width: '100%', height: 170, objectFit: 'cover' }}
                                loading="lazy"
                            />
                            <span style={{
                                position: 'absolute', top: 10, left: 10,
                                background: r.status === 'active' ? '#16A34A' : '#DC2626',
                                color: 'white', fontSize: 10.5, fontWeight: 700,
                                padding: '3px 10px', borderRadius: 9999,
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                <span style={{ fontSize: 7 }}>●</span>
                                {r.status === 'active' ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        <div style={{ padding: '14px 16px 16px' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                            }}>
                                <span style={{
                                    fontWeight: 700, fontSize: 15, color: '#0F172A',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {r.name}
                                </span>
                                <span style={{
                                    display: 'flex', alignItems: 'center', gap: 3,
                                    fontSize: 13, color: '#475569', fontWeight: 500, flexShrink: 0,
                                }}>
                                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                                    {r.rating || 'N/A'}
                                </span>
                            </div>
                            <div style={{
                                fontSize: 12.5, color: '#94A3B8', marginBottom: 4,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {r.cuisineType || 'Various'} · {r.priceRange || '$$'}
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: 12, color: '#94A3B8', marginBottom: 14,
                            }}>
                                <MapPin size={12} />
                                {r.city || r.address || 'Location'}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    style={{
                                        flex: 1, padding: '8px', border: '1px solid #E2E8F0', borderRadius: 8,
                                        background: 'white', fontSize: 12, cursor: 'pointer',
                                        fontFamily: 'Poppins', fontWeight: 600, color: '#475569',
                                        transition: 'all 0.2s',
                                    }}
                                    onClick={e => { e.stopPropagation(); navigate(`/restaurants/${r._id}`); }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                                >
                                    View Menu
                                </button>
                                <button
                                    style={{
                                        flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                                        background: '#F97316', color: 'white', fontSize: 12,
                                        cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600,
                                        transition: 'background 0.2s',
                                    }}
                                    onClick={e => { e.stopPropagation(); navigate(`/restaurants/${r._id}`); }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#EA580C'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#F97316'}
                                >
                                    Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Fallback cards if no API data */}
                {restaurants.length === 0 && [
                    { name: 'L\'atelier de la Cuisine', cuisine: 'French', city: 'New York', rating: 4.8, price: '$$$', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80' },
                    { name: 'Spice Route', cuisine: 'Indian', city: 'Chicago', rating: 4.6, price: '$$', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80' },
                    { name: 'Sakura Sushi', cuisine: 'Japanese', city: 'San Francisco', rating: 4.9, price: '$$$', img: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80' },
                    { name: 'Mama Africa', cuisine: 'African', city: 'Houston', rating: 4.7, price: '$$', img: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500&q=80' },
                ].map((r, i) => (
                    <div
                        key={`fallback-${i}`}
                        onClick={() => navigate('/restaurants')}
                        className="restaurant-card"
                        style={{
                            border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden',
                            cursor: 'pointer', background: 'white', transition: 'all 0.3s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <img src={r.img} alt={r.name} style={{ width: '100%', height: 170, objectFit: 'cover' }} loading="lazy" />
                            <span style={{
                                position: 'absolute', top: 10, left: 10, background: '#16A34A',
                                color: 'white', fontSize: 10.5, fontWeight: 700,
                                padding: '3px 10px', borderRadius: 9999,
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                <span style={{ fontSize: 7 }}>●</span> Open
                            </span>
                        </div>
                        <div style={{ padding: '14px 16px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{r.name}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                                    <Star size={13} fill="#F59E0B" color="#F59E0B" /> {r.rating}
                                </span>
                            </div>
                            <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 4 }}>{r.cuisine} · {r.price}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>
                                <MapPin size={12} /> {r.city}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{ flex: 1, padding: '8px', border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, color: '#475569' }}>View Menu</button>
                                <button style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, background: '#F97316', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Book</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .restaurants-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 480px) {
                    .restaurants-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
