import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Trash2, Calendar } from 'lucide-react';

const DEMO_FAVORITES = [
    { _id: '1', name: "L'Atelier de Joël", cuisineType: 'Modern French', rating: 4.9, city: '0.4 miles', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', status: 'active' },
    { _id: '2', name: 'Sakura Sushi Zen', cuisineType: 'Japanese Fusion', rating: 4.8, city: '0.8 miles', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', status: 'active' },
    { _id: '3', name: 'The Rosso Kitchen', cuisineType: 'Italian', rating: 4.9, city: '0.6 miles', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', status: 'active' },
    { _id: '4', name: 'Iron Grill', cuisineType: 'Steakhouse', rating: 4.8, city: '2.5 miles', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', status: 'closed' },
    { _id: '5', name: 'Bistro Celeste', cuisineType: 'French', rating: 4.7, city: '1.5 miles', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', status: 'active' },
    { _id: '6', name: 'Umi Omakase', cuisineType: 'Japanese', rating: 4.8, city: '2.1 miles', img: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80', status: 'active' },
];

export default function FavoritesPage() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState(DEMO_FAVORITES);

    const remove = (id: string) => {
        setFavorites(f => f.filter(r => r._id !== id));
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Favorites</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Your saved restaurants and wishlist.</p>
                </div>
                <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 600 }}>
                    {favorites.length} saved
                </span>
            </div>

            {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <Heart size={48} style={{ margin: '0 auto 16px', color: '#D1D5DB' }} />
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>No favorites yet</div>
                    <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>Browse restaurants and tap the heart icon to save your favorites.</p>
                    <button onClick={() => navigate('/browse')} style={{ padding: '10px 24px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Browse Restaurants</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                    {favorites.map(r => (
                        <div key={r._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                            <div style={{ position: 'relative' }}>
                                <img src={r.img} alt={r.name} style={{ width: '100%', height: 170, objectFit: 'cover' }} />
                                <button
                                    onClick={() => remove(r._id)}
                                    style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                    <Heart size={15} fill="#B91C1C" color="#B91C1C" />
                                </button>
                                <span style={{ position: 'absolute', top: 10, left: 10, background: r.status === 'active' ? '#16A34A' : '#DC2626', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 9999 }}>
                                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                                </span>
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6B7280' }}>
                                        <Star size={11} fill="#F59E0B" color="#F59E0B" />{r.rating}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={11} /> {r.cuisineType} · {r.city}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => navigate(`/restaurants/${r._id}`)}
                                        style={{ flex: 1, padding: '8px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <Star size={12} /> Menu
                                    </button>
                                    <button onClick={() => navigate(`/restaurants/${r._id}`)}
                                        style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, background: '#B91C1C', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
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