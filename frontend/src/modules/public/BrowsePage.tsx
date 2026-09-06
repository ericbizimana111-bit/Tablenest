import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingHeader from './landing/LandingHeader';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search, Star, SlidersHorizontal, X } from 'lucide-react';
import { restaurantsAPI } from '../../shared/services/api';
import { Spinner, Pagination } from '../../shared/components/ui/index';
import type { Restaurant } from '../../shared/types/restaurant.types';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../shared/utils/restaurantNavigation';
type BrowseRestaurant = Partial<Restaurant> & {
    _id: string;
    name: string;
    cuisineType?: string;
    priceRange?: string;
    status?: string;
    rating?: number;
    city?: string;
    country?: string;
    images?: string[];
    address?: string;
};

const CUISINES = ['All', 'Italian', 'Japanese', 'French', 'Mexican', 'American', 'Chinese', 'Indian', 'Seafood', 'Steakhouse'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];
const SORT_OPTIONS = [
    { value: '', label: 'Highest Rated' },
    { value: 'rating_asc', label: 'Lowest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'name_asc', label: 'Name A-Z' },
];

export default function BrowsePage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [search, setSearch] = useState(params.get('search') || '');
    const [cuisine, setCuisine] = useState(params.get('cuisine') || 'All');
    const [priceRange, setPriceRange] = useState('');
    const [sort, setSort] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data, isLoading } = useQuery({
        queryKey: ['browse-restaurants', search, cuisine, priceRange, sort, page],
        queryFn: () => restaurantsAPI.getPublic({
            search: search || undefined,
            cuisine: cuisine === 'All' ? undefined : cuisine,
            priceRange: priceRange || undefined,
            sort: sort || undefined,
            page, limit: 12,
        }).then(r => r.data),
    });

    const restaurants = data?.restaurants || [];
    const hasFilters = Boolean(search || cuisine !== 'All' || priceRange || sort);

    const clearFilters = () => {
        setSearch('');
        setCuisine('All');
        setPriceRange('');
        setSort('');
        setPage(1);
    };

    return (
        <div className="fade-in" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            <style>{`
                .browse-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .browse-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.07) !important; }
            `}</style>

            <LandingHeader theme="light" />
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 32px' }}>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by restaurant name, cuisine, city, or country..."
                            style={{ width: '100%', padding: '14px 16px 14px 48px', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', border: '1px solid #E2E8F0', borderRadius: 12, background: showFilters ? '#FFF7ED' : 'white', color: showFilters ? '#F97316' : '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                    <div style={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', padding: 3, gap: 2 }}>
                        {(['grid', 'list'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)}
                                style={{ padding: '10px 14px', border: 'none', borderRadius: 8, background: viewMode === v ? '#F97316' : 'transparent', color: viewMode === v ? 'white' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {v === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
                    {CUISINES.map(c => (
                        <button key={c} onClick={() => { setCuisine(c); setPage(1); }}
                            style={{ padding: '8px 20px', borderRadius: 100, border: '1px solid', borderColor: cuisine === c ? '#F97316' : '#E2E8F0', background: cuisine === c ? '#F97316' : 'white', color: cuisine === c ? 'white' : '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap', fontWeight: cuisine === c ? 600 : 500 }}>
                            {c}
                        </button>
                    ))}
                </div>

                {showFilters && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, marginBottom: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</div>
                            {hasFilters && (
                                <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#F97316', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                                    <X size={14} /> Clear all
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: 13, color: '#475569', marginBottom: 10 }}>Price Range</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {PRICE_RANGES.map(p => (
                                        <button key={p} onClick={() => { setPriceRange(priceRange === p ? '' : p); setPage(1); }}
                                            style={{ width: 56, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: priceRange === p ? '#F97316' : '#E2E8F0', borderRadius: 10, background: priceRange === p ? '#FFF7ED' : 'white', color: priceRange === p ? '#F97316' : '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: 13, color: '#475569', marginBottom: 10 }}>Sort By</div>
                                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                                    style={{ width: '100%', height: 42, padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontFamily: 'Poppins', outline: 'none', background: 'white', cursor: 'pointer' }}>
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {hasFilters && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Active:</span>
                        {search && <FilterTag label={`Search: "${search}"`} onRemove={() => setSearch('')} />}
                        {cuisine !== 'All' && <FilterTag label={cuisine} onRemove={() => setCuisine('All')} />}
                        {priceRange && <FilterTag label={`Price: ${priceRange}`} onRemove={() => setPriceRange('')} />}
                        {sort && <FilterTag label={SORT_OPTIONS.find(o => o.value === sort)?.label || sort} onRemove={() => setSort('')} />}
                        <button onClick={clearFilters} style={{ fontSize: 12, color: '#F97316', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
                    </div>
                )}

                <div style={{ fontSize: 14, color: '#475569', marginBottom: 20, fontWeight: 500 }}>
                    Showing <span style={{ color: '#0F172A', fontWeight: 600 }}>{restaurants.length}</span> of <span style={{ color: '#0F172A', fontWeight: 600 }}>{data?.total || restaurants.length}</span> restaurants
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner /></div>
                ) : restaurants.length === 0 ? (
                    <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
                ) : viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28, marginBottom: 36 }}>
                        {restaurants.map((r: BrowseRestaurant) => (
                            <RestaurantCard key={r._id} restaurant={r}
                                onClick={() => navigate(`/restaurants/${r._id}`)}
                                onMenu={() => navigate(getRestaurantMenuPath(r._id))}
                                onBook={() => navigate(getRestaurantBookPath(r._id))} />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
                        {restaurants.map((r: BrowseRestaurant) => (
                            <RestaurantListItem key={r._id} restaurant={r}
                                onClick={() => navigate(`/restaurants/${r._id}`)}
                                onMenu={() => navigate(getRestaurantMenuPath(r._id))}
                                onBook={() => navigate(getRestaurantBookPath(r._id))} />
                        ))}
                    </div>
                )}

                {(data?.pages || 0) > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                        <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                    </div>
                )}
            </main>
        </div>
    );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, background: '#FEE2E2', color: '#F97316', fontSize: 12, fontWeight: 500 }}>
            {label}
            <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#F97316', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={12} /></button>
        </span>
    );
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
    return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Search size={28} color="#F97316" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                {hasFilters ? 'No restaurants match your filters' : 'No restaurants available yet'}
            </h3>
            <p style={{ fontSize: 14, color: '#475569', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.6 }}>
                {hasFilters ? 'Try adjusting your search criteria or clearing the filters.' : 'There are no active restaurants yet. Check back soon!'}
            </p>
            {hasFilters && (
                <button onClick={onClearFilters} style={{ padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    Clear Filters
                </button>
            )}
        </div>
    );
}

function RestaurantCard({ restaurant: r, onClick, onMenu, onBook }: { restaurant: BrowseRestaurant; onClick: () => void; onMenu: () => void; onBook: () => void }) {
    return (
        <div onClick={onClick}
            style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={r.images?.[0] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80'} alt={r.name} style={{ width: '100%', height: 210, objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: 14, left: 14, backgroundColor: r.status === 'active' ? '#16A34A' : '#DC2626', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                </span>
            </div>
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#0F172A' }}>{r.name}</div>
                    {r.rating != null && r.rating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600, background: '#FFFBEB', padding: '2px 6px', borderRadius: 6, border: '1px solid #FDE68A' }}>
                            <Star size={13} fill="#F59E0B" color="#F59E0B" /><span>{r.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{r.cuisineType || 'Various'}</span>
                    <span style={{ color: '#CBD5E1' }}>·</span>
                    <span style={{ color: '#0F172A', fontWeight: 500 }}>{r.priceRange || '$$'}</span>
                    {(r.city || r.country) && (<><span style={{ color: '#CBD5E1' }}>·</span><span>{r.city}{r.city && r.country ? ', ' : ''}{r.country}</span></>)}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={(e) => { e.stopPropagation(); onMenu(); }} style={{ flex: 1, padding: '11px', border: '1px solid #CBD5E1', borderRadius: 10, background: 'white', color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>View Menu</button>
                    <button onClick={(e) => { e.stopPropagation(); onBook(); }} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: '#F97316', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Book Table</button>
                </div>
            </div>
        </div>
    );
}

function RestaurantListItem({ restaurant: r, onClick, onMenu, onBook }: { restaurant: BrowseRestaurant; onClick: () => void; onMenu: () => void; onBook: () => void }) {
    return (
        <div onClick={onClick}
            style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, display: 'flex', gap: 20, cursor: 'pointer', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
            <img src={r.images?.[0] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80'} alt={r.name} style={{ width: 130, height: 110, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>{r.name}</div>
                    {r.rating != null && r.rating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, background: '#FFFBEB', padding: '2px 6px', borderRadius: 6, border: '1px solid #FDE68A' }}>
                            <Star size={12} fill="#F59E0B" color="#F59E0B" />{r.rating.toFixed(1)}
                        </div>
                    )}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 12, display: 'flex', gap: 6 }}>
                    <span>{r.cuisineType || 'Various'}</span><span>·</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{r.priceRange || '$$'}</span>
                    {(r.city || r.country) && (<><span>·</span><span>{r.city}{r.city && r.country ? ', ' : ''}{r.country}</span></>)}
                </div>
                <span style={{ background: r.status === 'active' ? '#E6F4EA' : '#FCE8E6', color: r.status === 'active' ? '#137333' : '#C5221F', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                    {r.status === 'active' ? 'Open Now' : 'Closed'}
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                <button onClick={(e) => { e.stopPropagation(); onMenu(); }} style={{ padding: '10px 16px', border: '1px solid #CBD5E1', borderRadius: 10, background: 'white', color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>Menu</button>
                <button onClick={(e) => { e.stopPropagation(); onBook(); }} style={{ padding: '10px 16px', border: 'none', borderRadius: 10, background: '#F97316', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Book Table</button>
            </div>
        </div>
    );
}
