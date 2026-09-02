import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Calendar } from 'lucide-react';
import { usersAPI } from '../../../shared/services/api';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../../shared/utils/restaurantNavigation';
import { Spinner } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

const FOOD_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<{ restaurants: Restaurant[] }>({
        queryKey: ['favorites'],
        queryFn: () => usersAPI.getFavorites().then(r => r.data),
    });

    const removeMut = useMutation({
        mutationFn: (restaurantId: string) => usersAPI.removeFavorite(restaurantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            toast.success('Removed from favorites');
        },
        onError: () => toast.error('Could not remove favorite'),
    });

    const favorites = data?.restaurants || [];

    if (isLoading) return <Spinner />;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Favorites</h1>
                    <p style={{ fontSize: 14, color: '#475569', marginTop: 2 }}>Your saved restaurants and wishlist.</p>
                </div>
                <span style={{ background: '#FEE2E2', color: '#F97316', padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 600 }}>
                    {favorites.length} saved
                </span>
            </div>

            {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <Heart size={48} style={{ margin: '0 auto 16px', color: '#CBD5E1' }} />
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#475569', marginBottom: 8 }}>No favorites yet</div>
                    <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>Browse restaurants and tap the heart icon to save your favorites.</p>
                    <button onClick={() => navigate('/browse')} style={{ padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Browse Restaurants</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                    {favorites.map(r => (
                        <div key={r._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={r.images?.[0] || FOOD_IMG} alt={r.name} style={{ width: '100%', height: 170, objectFit: 'cover' }} />
                                <button
                                    onClick={() => removeMut.mutate(r._id)}
                                    style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                    <Heart size={15} fill="#F97316" color="#F97316" />
                                </button>
                                <span style={{ position: 'absolute', top: 10, left: 10, background: r.status === 'active' ? '#16A34A' : '#DC2626', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 9999 }}>
                                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                                </span>
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#475569' }}>
                                        <Star size={11} fill="#F59E0B" color="#F59E0B" />{r.rating || '—'}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={11} /> {r.cuisineType} · {r.city || r.address}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => navigate(getRestaurantMenuPath(r._id))}
                                        style={{ flex: 1, padding: '8px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                                        Menu
                                    </button>
                                    <button onClick={() => navigate(getRestaurantBookPath(r._id))}
                                        style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, background: '#F97316', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <Calendar size={12} /> Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
