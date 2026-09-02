import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Star, ArrowRight, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI, reservationsAPI, ordersAPI, usersAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../../shared/utils/restaurantNavigation';

type HomeRestaurant = Partial<Restaurant> & { _id: string; name: string; cuisineType?: string; priceRange?: string; status?: string; rating?: number; images?: string[]; logo?: string };

const CUISINES = ['All', 'Italian', 'Japanese', 'French', 'Mexican', 'American', 'Chinese', 'Indian'];

export default function CustomerHome() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [activeCuisine, setActiveCuisine] = useState('All');

    const { data } = useQuery({
        queryKey: ['public-restaurants', activeCuisine],
        queryFn: () => restaurantsAPI.getPublic({
            limit: 8,
            cuisine: activeCuisine === 'All' ? undefined : activeCuisine,
        }).then(r => r.data),
        });

    const restaurants = data?.restaurants || [];

    const { data: bookingsData } = useQuery({
        queryKey: ['my-bookings-count'],
        queryFn: () => reservationsAPI.getMyReservations().then(r => r.data),
    });
    const bookingsCount = (bookingsData?.reservations || []).filter((b: { status?: string }) => b.status === 'pending' || b.status === 'confirmed').length;

    const { data: ordersData } = useQuery({
        queryKey: ['my-orders-count'],
        queryFn: () => ordersAPI.getMyOrders().then(r => r.data),
    });
    const ordersCount = (ordersData?.orders || []).filter((o: { status?: string }) => o.status !== 'delivered' && o.status !== 'cancelled').length;

    const { data: favData } = useQuery({
        queryKey: ['favorites-count'],
        queryFn: () => usersAPI.getFavorites().then(r => r.data),
    });
    const favoritesCount = (favData?.favorites || []).length;

    return (
        <div className="fade-in">
            {/* Welcome banner */}
            <div style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                borderRadius: 16, padding: '28px 32px', marginBottom: 28, color: 'white',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Guest'}!
                    </h1>
                    <p style={{ fontSize: 14, opacity: 0.85 }}>
                        Discover your next unforgettable dining experience.
                    </p>
                    <button
                        onClick={() => navigate('/browse')}
                        style={{ marginTop: 16, padding: '9px 20px', background: 'white', color: '#F97316', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        Browse Restaurants <ArrowRight size={14} />
                    </button>
                </div>
                <div style={{ textAlign: 'right', opacity: 0.9 }}>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Quick Links</div>
                    <div style={{ fontSize: 14, opacity: 0.85, marginTop: 8 }}>Explore restaurants, make bookings, and manage your dining experience.</div>
                </div>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: 28 }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/browse?search=${search}`)}
                    placeholder="Search restaurants or dishes..."
                    style={{ width: '100%', padding: '14px 16px 14px 46px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, fontFamily: 'Poppins', outline: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                    { label: 'Upcoming Bookings', value: String(bookingsCount), icon: <Calendar size={18} />, path: '/my-bookings', color: '#F97316' },
                    { label: 'Active Orders', value: String(ordersCount), icon: <Clock size={18} />, path: '/my-orders', color: '#F59E0B' },
                    { label: 'Saved Favorites', value: String(favoritesCount), icon: <Star size={18} />, path: '/favorites', color: '#2563EB' },
                ].map(s => (
                    <div key={s.label} onClick={() => navigate(s.path)}
                        style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                        <div style={{ background: `${s.color}15`, color: s.color, padding: 10, borderRadius: 10 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#475569' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cuisine filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {CUISINES.map(c => (
                    <button key={c} onClick={() => setActiveCuisine(c)}
                        style={{ padding: '7px 18px', borderRadius: 9999, border: '1.5px solid', borderColor: activeCuisine === c ? '#F97316' : '#E2E8F0', background: activeCuisine === c ? '#F97316' : 'white', color: activeCuisine === c ? 'white' : '#475569', fontSize: 13, fontWeight: activeCuisine === c ? 600 : 400, cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap' }}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Restaurants grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Popular Near You</h2>
                <span onClick={() => navigate('/browse')} style={{ fontSize: 13, color: '#F97316', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                    View all <ArrowRight size={13} />
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {(restaurants as HomeRestaurant[]).map((r) => (
                    <div key={r._id}
                        onClick={() => navigate(`/restaurants/${r._id}`)}
                        style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                        <div style={{ position: 'relative' }}>
                            <img
                                src={r.images?.[0] || r.logo || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'}
                                alt={r.name}
                                style={{ width: '100%', height: 150, objectFit: 'cover' }}
                            />
                            <span style={{ position: 'absolute', top: 10, left: 10, background: r.status === 'active' ? '#16A34A' : '#DC2626', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'inline-block' }} />
                                {r.status === 'active' ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{r.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#475569', flexShrink: 0 }}>
                                    <Star size={11} fill="#F59E0B" color="#F59E0B" />
                                    {r.rating != null && r.rating > 0 ? r.rating.toFixed(1) : null}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
                                {r.cuisineType} · {r.priceRange || '$$'}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={e => { e.stopPropagation(); navigate(getRestaurantMenuPath(r._id)); }}
                                    style={{ flex: 1, padding: '7px', border: '1.5px solid #E2E8F0', borderRadius: 6, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, color: '#475569' }}
                                >
                                    View Menu
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); navigate(getRestaurantBookPath(r._id)); }}
                                    style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 6, background: '#F97316', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}
                                >
                                    Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

