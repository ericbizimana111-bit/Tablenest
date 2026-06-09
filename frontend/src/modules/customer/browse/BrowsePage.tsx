import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search, Star, SlidersHorizontal, Globe, Utensils, Calendar } from 'lucide-react';
import { restaurantsAPI } from '../../../shared/services/api';
import { Spinner, Pagination } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../../shared/utils/restaurantNavigation';
import Header from '../../../shared/components/layout/Header'


type BrowseRestaurant = Partial<Restaurant> & {
    _id: string;
    name: string;
    cuisineType?: string;
    priceRange?: string;
    status?: string;
    rating?: number;
    city?: string;
    images?: string[];
};

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
        placeholderData: (previous) => previous,
    });

    const restaurants = data?.restaurants || DEMO_RESTAURANTS;

    return (
        <div className="fade-in" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#FAFAFA', minHeight: '100vh' }}>

                
           <Header  />

            {/* MAIN CONTENT AREA */}
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

                {/* Hero / Page Intro */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Browse Restaurants</h1>
                    <p style={{ fontSize: 15, color: '#4B5563', marginTop: 4 }}>Discover exceptional elite dining curation near you.</p>
                </div>

                {/* Search & Filter Bar Ecosystem */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by restaurant name, culinary styles, specialties..."
                            style={{ width: '100%', padding: '14px 16px 14px 48px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                            onFocus={e => {
                                e.target.style.borderColor = '#B91C1C';
                                e.target.style.boxShadow = '0 0 0 3px rgba(185, 28, 28, 0.1)';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = '#E5E7EB';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                            }}
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', border: '1px solid #E5E7EB', borderRadius: 12, background: showFilters ? '#FEF2F2' : 'white', color: showFilters ? '#B91C1C' : '#374151', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, transition: 'all 0.2s' }}
                    >
                        <SlidersHorizontal size={16} color={showFilters ? '#B91C1C' : '#4B5563'} /> Advanced Filters
                    </button>

                    <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', padding: 3, gap: 2 }}>
                        {(['grid', 'list'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)}
                                style={{ padding: '10px 14px', border: 'none', borderRadius: 8, background: viewMode === v ? '#B91C1C' : 'transparent', color: viewMode === v ? 'white' : '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                {v === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cuisine Horizon Horizontal Scrolling Chips */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
                    {CUISINES.map(c => {
                        const isSelected = cuisine === c;
                        return (
                            <button key={c} onClick={() => setCuisine(c)}
                                style={{ padding: '8px 20px', borderRadius: 100, border: '1px solid', borderColor: isSelected ? '#B91C1C' : '#E5E7EB', background: isSelected ? '#B91C1C' : 'white', color: isSelected ? 'white' : '#4B5563', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap', fontWeight: isSelected ? 600 : 500, transition: 'all 0.2s', boxShadow: isSelected ? '0 4px 12px rgba(185, 28, 28, 0.15)' : 'none' }}>
                                {c}
                            </button>
                        );
                    })}
                </div>

                {/* Extended Dropdown Contextual Filter Tray */}
                {showFilters && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Accommodation</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {PRICE_RANGES.map(p => {
                                const isPriceSelected = priceRange === p;
                                return (
                                    <button key={p} onClick={() => setPriceRange(priceRange === p ? '' : p)}
                                        style={{ width: 56, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: isPriceSelected ? '#B91C1C' : '#E5E7EB', borderRadius: 10, background: isPriceSelected ? '#FEF2F2' : 'white', color: isPriceSelected ? '#B91C1C' : '#374151', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, transition: 'all 0.15s' }}>
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Metadata Results metrics counter */}
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, fontWeight: 500 }}>
                    Showing <span style={{ color: '#111827', fontWeight: 600 }}>{restaurants.length}</span> of <span style={{ color: '#111827', fontWeight: 600 }}>{data?.total || restaurants.length}</span> luxury destinations
                </div>

                {/* Main Results View Renderer */}
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner /></div>
                ) : viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28, marginBottom: 36 }}>
                        {restaurants.map((r: BrowseRestaurant) => (
                            <RestaurantCard
                                key={r._id}
                                restaurant={r}
                                onClick={() => navigate(`/restaurants/${r._id}`)}
                                onMenu={() => navigate(getRestaurantMenuPath(r._id))}
                                onBook={() => navigate(getRestaurantBookPath(r._id))}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
                        {restaurants.map((r: BrowseRestaurant) => (
                            <RestaurantListItem
                                key={r._id}
                                restaurant={r}
                                onClick={() => navigate(`/restaurants/${r._id}`)}
                                onMenu={() => navigate(getRestaurantMenuPath(r._id))}
                                onBook={() => navigate(getRestaurantBookPath(r._id))}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Controls Alignment */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                    <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                </div>
            </main>
        </div>
    );
}

/* ==========================================
   REUSABLE REFACTORED CARD COMPONENT (GRID)
   ========================================== */
function RestaurantCard({ restaurant: r, onClick, onMenu, onBook }: {
    restaurant: BrowseRestaurant;
    onClick: () => void;
    onMenu: () => void;
    onBook: () => void;
}) {
    const imgId = FOOD_IMG_IDS[(r.name?.charCodeAt(0) ?? 0) % FOOD_IMG_IDS.length];
    return (
        <div onClick={onClick}
            style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                    src={r.images?.[0] || `https://images.unsplash.com/photo-${imgId}?w=500&q=80`}
                    alt={r.name}
                    style={{ width: '100%', height: 210, objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', top: 14, left: 14, backgroundColor: r.status === 'active' ? '#10B981' : '#EF4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                </span>
            </div>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', letterSpacing: '-0.01em' }}>{r.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#111827', fontWeight: 600, background: '#FFFBEB', padding: '2px 6px', borderRadius: 6, border: '1px solid #FDE68A' }}>
                        <Star size={13} fill="#F59E0B" color="#F59E0B" />
                        <span>{r.rating || '4.7'}</span>
                    </div>
                </div>

                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{r.cuisineType}</span>
                    <span style={{ color: '#D1D5DB' }}>•</span>
                    <span style={{ color: '#111827', fontWeight: 500 }}>{r.priceRange || '$$'}</span>
                    <span style={{ color: '#D1D5DB' }}>•</span>
                    <span>{r.city || '0.8 miles'}</span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMenu(); }}
                        style={{ flex: 1, padding: '11px', border: '1px solid #D1D5DB', borderRadius: 10, background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >View Menu</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBook(); }}
                        style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: '#B91C1C', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, boxShadow: '0 2px 4px rgba(185, 28, 28, 0.15)', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#991B1B'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#B91C1C'}
                    >Book Table</button>
                </div>
            </div>
        </div>
    );
}

/* ==========================================
   REUSABLE REFACTORED CARD COMPONENT (LIST)
   ========================================== */
function RestaurantListItem({ restaurant: r, onClick, onMenu, onBook }: {
    restaurant: BrowseRestaurant;
    onClick: () => void;
    onMenu: () => void;
    onBook: () => void;
}) {
    const imgId = FOOD_IMG_IDS[(r.name?.charCodeAt(0) ?? 0) % FOOD_IMG_IDS.length];
    return (
        <div onClick={onClick}
            style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, display: 'flex', gap: 20, cursor: 'pointer', alignItems: 'center', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.04)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <img
                src={r.images?.[0] || `https://images.unsplash.com/photo-${imgId}?w=300&q=80`}
                alt={r.name}
                style={{ width: 130, height: 110, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
            />

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>{r.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#111827', fontWeight: 600, background: '#FFFBEB', padding: '2px 6px', borderRadius: 6, border: '1px solid #FDE68A' }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />{r.rating || '4.7'}
                    </div>
                </div>

                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, display: 'flex', gap: 6 }}>
                    <span>{r.cuisineType}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{r.priceRange || '$$'}</span>
                    <span>•</span>
                    <span>{r.city || '1.2 miles'}</span>
                </div>

                <span style={{ background: r.status === 'active' ? '#E6F4EA' : '#FCE8E6', color: r.status === 'active' ? '#137333' : '#C5221F', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onMenu(); }}
                    style={{ padding: '10px 16px', border: '1px solid #D1D5DB', borderRadius: 10, background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                >Menu</button>
                <button
                    onClick={(e) => { e.stopPropagation(); onBook(); }}
                    style={{ padding: '10px 16px', border: 'none', borderRadius: 10, background: '#B91C1C', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600, boxShadow: '0 2px 4px rgba(185, 28, 28, 0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#991B1B'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#B91C1C'}
                >Book Table</button>
            </div>
        </div>
    );
}

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