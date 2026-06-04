import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { restaurantsAPI } from '../../../services/api';
import { Spinner, Pagination } from '../../../shared/components/ui/index';

const CUISINES = ['All', 'Italian', 'Japanese', 'French', 'Mexican', 'American', 'Chinese', 'Indian', 'Seafood', 'Steakhouse'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];
const FOOD_IMG_IDS = [
    '1414235077428-338989a2e8c0', '1555396273-367ea4eb4db5',
    '1546069901-ba9599a7e63c', '1579871494447-9811cf80d66c',
    '1565299585323-38d6b0865b47', '1544025162-d76694265947',
    '1485921325833-c519f76c4927', '1565958011703-44f9829ba187',
];

export default function BrowsePage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [search, setSearch] = useState(params.get('search') || '');
    const [cuisine, setCuisine] = useState(params.get('cuisine') || 'All');
    const [priceRange, setPriceRange] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data, isLoading } = useQuery({
        queryKey: ['browse-restaurants', search, cuisine, priceRange, page],
        queryFn: () => restaurantsAPI.getPublic({
            search,
            cuisine: cuisine === 'All' ? undefined : cuisine,
            priceRange: priceRange || undefined,
            page, limit: 12,
        }).then(r => r.data),
        initialData: { restaurants: DEMO_RESTAURANTS, total: 12, pages: 1 },
        keepPreviousData: true,
    });

    const restaurants = data?.restaurants || DEMO_RESTAURANTS;

    return (
        <div className="fade-in" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Browse Restaurants</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Discover exceptional dining near you.</p>
            </div>

            {/* Search + filter bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search restaurants, cuisines..."
                        style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                        onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                        onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', border: '1.5px solid #E5E7EB', borderRadius: 10, background: showFilters ? '#FEE2E2' : 'white', color: showFilters ? '#B91C1C' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}
                >
                    <SlidersHorizontal size={15} /> Filters
                </button>
                <div style={{ display: 'flex', gap: 0, border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                    {(['grid', 'list'] as const).map(v => (
                        <button key={v} onClick={() => setViewMode(v)}
                            style={{ padding: '9px 14px', border: 'none', background: viewMode === v ? '#B91C1C' : 'white', color: viewMode === v ? 'white' : '#6B7280', cursor: 'pointer', fontSize: 12, fontFamily: 'Poppins' }}>
                            {v === 'grid' ? '⊞' : '≡'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cuisine chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                {CUISINES.map(c => (
                    <button key={c} onClick={() => setCuisine(c)}
                        style={{ padding: '6px 16px', borderRadius: 9999, border: '1.5px solid', borderColor: cuisine === c ? '#B91C1C' : '#E5E7EB', background: cuisine === c ? '#B91C1C' : 'white', color: cuisine === c ? 'white' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap', fontWeight: cuisine === c ? 600 : 400 }}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Extended filters */}
            {showFilters && (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Price Range</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {PRICE_RANGES.map(p => (
                            <button key={p} onClick={() => setPriceRange(priceRange === p ? '' : p)}
                                style={{ padding: '7px 16px', border: '1.5px solid', borderColor: priceRange === p ? '#B91C1C' : '#E5E7EB', borderRadius: 8, background: priceRange === p ? '#FEE2E2' : 'white', color: priceRange === p ? '#B91C1C' : '#374151', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: priceRange === p ? 700 : 400 }}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results count */}
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                Showing {restaurants.length} of {data?.total || restaurants.length} restaurants
            </div>

            {/* Grid / List view */}
            {isLoading ? <Spinner /> : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
                    {restaurants.map((r: any) => (
                        <RestaurantCard key={r._id} restaurant={r} onClick={() => navigate(`/restaurants/${r._id}`)} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {restaurants.map((r: any) => (
                        <RestaurantListItem key={r._id} restaurant={r} onClick={() => navigate(`/restaurants/${r._id}`)} />
                    ))}
                </div>
            )}

            <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
        </div>
    );
}

function RestaurantCard({ restaurant: r, onClick }: any) {
    const imgId = FOOD_IMG_IDS[r.name?.charCodeAt(0) % FOOD_IMG_IDS.length];
    return (
        <div onClick={onClick}
            style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
            <div style={{ position: 'relative' }}>
                <img
                    src={r.images?.[0] || `https://images.unsplash.com/photo-${imgId}?w=400&q=80`}
                    alt={r.name}
                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', top: 10, left: 10, background: r.status === 'active' ? '#16A34A' : '#DC2626', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 9999 }}>
                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                </span>
            </div>
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: '#6B7280' }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />{r.rating || '4.7'}
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>{r.cuisineType} · {r.priceRange || '$$'} · {r.city || '0.8 miles'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, padding: '8px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>View Menu</button>
                    <button style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, background: '#B91C1C', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Book</button>
                </div>
            </div>
        </div>
    );
}

function RestaurantListItem({ restaurant: r, onClick }: any) {
    const imgId = FOOD_IMG_IDS[r.name?.charCodeAt(0) % FOOD_IMG_IDS.length];
    return (
        <div onClick={onClick}
            style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, display: 'flex', gap: 16, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
            <img
                src={r.images?.[0] || `https://images.unsplash.com/photo-${imgId}?w=200&q=80`}
                alt={r.name}
                style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: '#6B7280' }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />{r.rating || '4.7'}
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{r.cuisineType} · {r.priceRange || '$$'} · {r.city || '1.2 miles'}</div>
                <span style={{ background: r.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: r.status === 'active' ? '#16A34A' : '#DC2626', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999 }}>
                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                <button style={{ padding: '7px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>Menu</button>
                <button style={{ padding: '7px 16px', border: 'none', borderRadius: 8, background: '#B91C1C', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Book</button>
            </div>
        </div>
    );
}

const FOOD_IMG_IDS = [
    '1414235077428-338989a2e8c0', '1555396273-367ea4eb4db5',
    '1546069901-ba9599a7e63c', '1579871494447-9811cf80d66c',
    '1565299585323-38d6b0865b47', '1544025162-d76694265947',
    '1485921325833-c519f76c4927', '1565958011703-44f9829ba187',
];

const DEMO_RESTAURANTS = [
    { _id: '1', name: "L'Atelier de Joël", cuisineType: 'Modern French', priceRange: '$$$$', status: 'active', rating: 4.9, city: '0.4 miles' },
    { _id: '2', name: 'Trattoria Da Luigi', cuisineType: 'Authentic Italian', priceRange: '$$$', status: 'closed', rating: 4.7, city: '1.2 miles' },
    { _id: '3', name: 'Sakura Sushi Zen', cuisineType: 'Japanese Fusion', priceRange: '$$$', status: 'active', rating: 4.8, city: '0.8 miles' },
    { _id: '4', name: 'The Rosso Kitchen', cuisineType: 'Italian', priceRange: '$$$', status: 'active', rating: 4.9, city: '0.6 miles' },
    { _id: '5', name: 'Umi Omakase', cuisineType: 'Japanese', priceRange: '$$$$', status: 'active', rating: 4.8, city: '2.1 miles' },
    { _id: '6', name: 'Bistro Celeste', cuisineType: 'French', priceRange: '$$$', status: 'active', rating: 4.7, city: '1.5 miles' },
    { _id: '7', name: 'Iron Grill', cuisineType: 'Steakhouse', priceRange: '$$$', status: 'active', rating: 4.8, city: '2.5 miles' },
    { _id: '8', name: 'Cantina Azul', cuisineType: 'Mexican', priceRange: '$$', status: 'closed', rating: 4.5, city: '3.1 miles' },
    { _id: '9', name: 'Bleu Bistro', cuisineType: 'French', priceRange: '$$$', status: 'active', rating: 4.6, city: '3.1 miles' },
];