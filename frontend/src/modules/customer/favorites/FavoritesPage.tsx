import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Calendar, UtensilsCrossed } from 'lucide-react';
import { usersAPI } from '../../../shared/services/api';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../../shared/utils/restaurantNavigation';
import { Spinner } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<{ restaurants: Restaurant[] }>({
        queryKey: ['favorites'],
        queryFn: () => usersAPI.getFavorites().then((r) => r.data),
    });

    const removeMut = useMutation({
        mutationFn: (restaurantId: string) => usersAPI.removeFavorite(restaurantId),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['favorites'] }); toast.success('Removed from favorites'); },
        onError: () => toast.error('Could not remove favorite'),
    });

    const favorites = data?.restaurants || [];
    if (isLoading) return <Spinner />;

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Favorites</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Your saved restaurants.</p>
                </div>
                <span className="badge badge-brand">{favorites.length} saved</span>
            </div>

            {favorites.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <Heart size={44} style={{ margin: '0 auto 16px', color: '#c9bdaf' }} />
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No favorites yet</div>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginBottom: 20 }}>Tap the heart icon on any restaurant to save it here.</p>
                    <button onClick={() => navigate('/restaurants')} className="btn btn-primary">Browse restaurants</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }} className="fav-grid">
                    {favorites.map((r) => (
                        <div key={r._id} className="card card-hover" style={{ overflow: 'hidden' }}>
                            <div style={{ position: 'relative' }}>
                                {r.images?.[0] ? (
                                    <img src={r.images[0]} alt={r.name} style={{ width: '100%', height: 170, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: 170, background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UtensilsCrossed size={26} color="#c9bdaf" /></div>
                                )}
                                <button onClick={() => removeMut.mutate(r._id)} className="btn-icon" style={{ position: 'absolute', top: 10, right: 10, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                    <Heart size={15} fill="#f9691a" color="#f9691a" />
                                </button>
                                <span className={`badge ${(r as any).openNow !== false ? 'badge-green' : 'badge-gray'}`} style={{ position: 'absolute', top: 10, left: 10 }}>
                                    {(r as any).openNow !== false ? 'Open now' : 'Closed'}
                                </span>
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 700 }}><Star size={11} fill="#f9691a" color="#f9691a" />{r.rating || '—'}</div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={11} /> {r.cuisineType} · {r.city || r.address}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => navigate(getRestaurantMenuPath(r._id))} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Menu</button>
                                    <button onClick={() => navigate(getRestaurantBookPath(r._id))} className="btn btn-primary btn-sm" style={{ flex: 1 }}><Calendar size={12} /> Book</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@media (max-width: 900px) { .fav-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 560px) { .fav-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
