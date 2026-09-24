import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Star, ArrowRight, Clock, Heart, UtensilsCrossed } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI, reservationsAPI, ordersAPI, usersAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../../shared/utils/restaurantNavigation';

export default function CustomerHome() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [activeCuisine, setActiveCuisine] = useState('All');

    const { data: cuisinesData } = useQuery<Array<{ name: string }>>({ queryKey: ['cuisines'], queryFn: () => restaurantsAPI.getCuisines().then((r) => r.data) });
    const cuisines = ['All', ...(cuisinesData?.map((c) => c.name) || [])];

    const { data } = useQuery({
        queryKey: ['public-restaurants', activeCuisine],
        queryFn: () => restaurantsAPI.getPublic({ limit: 8, cuisine: activeCuisine === 'All' ? undefined : activeCuisine, sort: 'popular' }).then((r) => r.data),
    });
    const restaurants: Restaurant[] = data?.restaurants || [];

    const { data: bookingsData } = useQuery({ queryKey: ['my-bookings-count'], queryFn: () => reservationsAPI.getMyReservations().then((r) => r.data) });
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    const bookingsCount = bookings.filter((b: { status?: string; date?: string; time?: string }) =>
        ['pending', 'confirmed', 'arrived'].includes(b.status || '') && new Date(`${b.date?.slice(0, 10)}T${b.time || '00:00'}`) > new Date()).length;

    const { data: ordersData } = useQuery({ queryKey: ['my-orders-count'], queryFn: () => ordersAPI.getMyOrders({ status: 'active' }).then((r) => r.data) });
    const ordersCount = ordersData?.orders?.length || 0;

    const { data: favData } = useQuery({ queryKey: ['favorites-count'], queryFn: () => usersAPI.getFavorites().then((r) => r.data) });
    const favoritesCount = (favData?.restaurants || []).length;

    const goSearch = () => { if (search.trim()) navigate(`/restaurants?search=${encodeURIComponent(search)}`); };

    return (
        <div className="animate-fade-up">
            <div style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))', borderRadius: 20, padding: '30px 32px', marginBottom: 28, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 23, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>Welcome back, {user?.fullName?.split(' ')[0] || 'Guest'}!</h1>
                    <p style={{ fontSize: 14, opacity: 0.9 }}>Discover your next unforgettable dining experience.</p>
                    <button onClick={() => navigate('/restaurants')} className="btn" style={{ marginTop: 16, background: 'white', color: 'var(--color-brand-600)' }}>
                        Browse restaurants <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <div style={{ position: 'relative', marginBottom: 28 }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-mute)' }} />
                <input
                    value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && goSearch()}
                    placeholder="Search restaurants or dishes…" className="input" style={{ paddingLeft: 46, boxShadow: 'var(--shadow-soft)' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }} className="home-stats">
                {[
                    { label: 'Upcoming bookings', value: bookingsCount, icon: <Calendar size={18} />, path: '/my-bookings', color: '#f9691a' },
                    { label: 'Active orders', value: ordersCount, icon: <Clock size={18} />, path: '/my-orders', color: '#a15c07' },
                    { label: 'Favorites', value: favoritesCount, icon: <Heart size={18} />, path: '/favorites', color: '#1d5fd1' },
                ].map((s) => (
                    <div key={s.label} onClick={() => navigate(s.path)} className="card card-hover" style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ background: `${s.color}18`, color: s.color, padding: 10, borderRadius: 12 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {cuisines.map((c) => (
                    <button key={c} onClick={() => setActiveCuisine(c)} className="chip" data-active={activeCuisine === c}>{c}</button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Popular near you</h2>
                <button onClick={() => navigate('/restaurants')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-brand-600)' }}>View all <ArrowRight size={13} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="home-grid">
                {restaurants.length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--color-ink-mute)' }}>
                        <UtensilsCrossed size={30} style={{ margin: '0 auto 10px', opacity: 0.4 }} /> No restaurants found for this cuisine yet.
                    </div>
                )}
                {restaurants.map((r) => (
                    <div key={r._id} onClick={() => navigate(`/restaurants/${r._id}`)} className="card card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                        <div style={{ position: 'relative' }}>
                            <img src={r.images?.[0]} alt={r.name} style={{ width: '100%', height: 150, objectFit: 'cover' }} loading="lazy" />
                            <span className={`badge ${(r as any).openNow !== false ? 'badge-green' : 'badge-gray'}`} style={{ position: 'absolute', top: 10, left: 10 }}>{(r as any).openNow !== false ? 'Open' : 'Closed'}</span>
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 6 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                                {!!r.rating && <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, flexShrink: 0 }}><Star size={11} fill="#f9691a" color="#f9691a" /> {r.rating.toFixed(1)}</div>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 10 }}>{r.cuisineType} · {r.priceRange}</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={(e) => { e.stopPropagation(); navigate(getRestaurantMenuPath(r._id)); }} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Menu</button>
                                <button onClick={(e) => { e.stopPropagation(); navigate(getRestaurantBookPath(r._id)); }} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`@media (max-width: 1100px) { .home-stats { grid-template-columns: 1fr !important; } .home-grid { grid-template-columns: repeat(2,1fr) !important; } } @media (max-width: 560px) { .home-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
