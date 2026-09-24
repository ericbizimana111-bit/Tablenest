import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search, Star, SlidersHorizontal, X, MapPin } from 'lucide-react';
import LandingHeader from './landing/LandingHeader';
import LandingFooter from './landing/LandingFooter';
import { restaurantsAPI } from '../../shared/services/api';
import { Spinner, Pagination } from '../../shared/components/ui/index';
import type { Restaurant } from '../../shared/types/restaurant.types';
import { getRestaurantBookPath, getRestaurantMenuPath } from '../../shared/utils/restaurantNavigation';

type BrowseRestaurant = Restaurant & { openNow?: boolean };

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];
const SORT_OPTIONS = [
    { value: '', label: 'Highest rated' },
    { value: 'popular', label: 'Most popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'name_asc', label: 'Name A–Z' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
];

export default function BrowsePage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [search, setSearch] = useState(params.get('search') || '');
    const [cuisine, setCuisine] = useState(params.get('cuisine') || 'All');
    const [city] = useState(params.get('location') || params.get('city') || '');
    const [priceRange, setPriceRange] = useState('');
    const [service, setService] = useState('');
    const [sort, setSort] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data: cuisinesData } = useQuery<Array<{ name: string; count: number }>>({
        queryKey: ['cuisines'],
        queryFn: () => restaurantsAPI.getCuisines().then((r) => r.data),
        staleTime: 300_000,
    });
    const cuisines = ['All', ...(cuisinesData?.map((c) => c.name) || [])];

    const { data, isLoading } = useQuery({
        queryKey: ['browse-restaurants', search, cuisine, city, priceRange, service, sort, page],
        queryFn: () =>
            restaurantsAPI
                .getPublic({
                    search: search || undefined,
                    cuisine: cuisine === 'All' ? undefined : cuisine,
                    city: city || undefined,
                    priceRange: priceRange || undefined,
                    service: service || undefined,
                    sort: sort || undefined,
                    page,
                    limit: 12,
                })
                .then((r) => r.data),
    });

    const restaurants: BrowseRestaurant[] = data?.restaurants || [];
    const hasFilters = Boolean(search || cuisine !== 'All' || priceRange || service || sort);

    const clearFilters = () => {
        setSearch(''); setCuisine('All'); setPriceRange(''); setService(''); setSort(''); setPage(1);
    };

    return (
        <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
            <LandingHeader theme="light" />
            <main style={{ maxWidth: 1240, margin: '0 auto', padding: '104px 24px 40px' }}>
                <div className="animate-fade-up" style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6 }}>
                        {city ? `Restaurants near ${city}` : 'Find your table'}
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)' }}>{data?.total ?? '—'} restaurants ready to book or order from.</p>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                        <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-mute)' }} />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name, cuisine or city…"
                            className="input"
                            style={{ paddingLeft: 44 }}
                        />
                    </div>
                    <button onClick={() => setShowFilters((s) => !s)} className="btn" style={{ background: showFilters ? 'var(--color-brand-100)' : '#fff', color: showFilters ? 'var(--color-brand-700)' : 'var(--color-ink-soft)', border: '1.5px solid var(--color-line)' }}>
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                    <div style={{ display: 'flex', border: '1.5px solid var(--color-line)', borderRadius: 12, background: '#fff', padding: 3, gap: 2 }}>
                        {(['grid', 'list'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                className="btn-icon"
                                style={{ background: viewMode === v ? 'var(--color-brand-500)' : 'transparent', color: viewMode === v ? '#fff' : 'var(--color-ink-soft)' }}
                            >
                                {v === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 22, overflowX: 'auto', paddingBottom: 4 }}>
                    {cuisines.map((c) => (
                        <button key={c} onClick={() => { setCuisine(c); setPage(1); }} className="chip" data-active={cuisine === c}>
                            {c}
                        </button>
                    ))}
                </div>

                {showFilters && (
                    <div className="card animate-fade-up" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Refine results</div>
                            {hasFilters && (
                                <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-brand-600)' }}>
                                    <X size={14} /> Clear all
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            <div>
                                <div className="label">Price range</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {PRICE_RANGES.map((p) => (
                                        <button key={p} onClick={() => { setPriceRange(priceRange === p ? '' : p); setPage(1); }} className="chip" data-active={priceRange === p} style={{ minWidth: 48, justifyContent: 'center' }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="label">Service</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {[{ v: 'delivery', l: 'Delivery' }, { v: 'pickup', l: 'Pickup' }, { v: 'dine_in', l: 'Dine-in' }].map((s) => (
                                        <button key={s.v} onClick={() => { setService(service === s.v ? '' : s.v); setPage(1); }} className="chip" data-active={service === s.v}>
                                            {s.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="label">Sort by</div>
                                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input">
                                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 20 }} />)}
                    </div>
                ) : restaurants.length === 0 ? (
                    <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
                ) : viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginBottom: 36 }}>
                        {restaurants.map((r) => (
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
                        {restaurants.map((r) => (
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

                {(data?.pages || 0) > 1 && <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />}
            </main>
            <LandingFooter />
        </div>
    );
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
    return (
        <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Search size={28} color="var(--color-brand-600)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>
                {hasFilters ? 'No restaurants match your filters' : 'No restaurants available yet'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.6 }}>
                {hasFilters ? 'Try adjusting your search or clearing the filters.' : 'Check back soon — new restaurants join TableNest regularly.'}
            </p>
            {hasFilters && <button onClick={onClearFilters} className="btn btn-primary">Clear filters</button>}
        </div>
    );
}

function OpenBadge({ r }: { r: BrowseRestaurant }) {
    const open = r.openNow !== false;
    return <span className={`badge ${open ? 'badge-green' : 'badge-gray'}`}>{open ? 'Open now' : 'Closed'}</span>;
}

function RestaurantCard({ restaurant: r, onClick, onMenu, onBook }: { restaurant: BrowseRestaurant; onClick: () => void; onMenu: () => void; onBook: () => void }) {
    return (
        <div onClick={onClick} className="card card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
                <img src={r.images?.[0]} alt={r.name} style={{ width: '100%', height: 190, objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', top: 14, left: 14 }}><OpenBadge r={r} /></div>
            </div>
            <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-ink)' }}>{r.name}</div>
                    {!!r.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            <Star size={13} fill="#f9691a" color="#f9691a" />{r.rating.toFixed(1)}
                        </div>
                    )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>{r.cuisineType}</span><span>·</span><span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{r.priceRange}</span>
                    {r.city && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{r.city}</span></>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={(e) => { e.stopPropagation(); onMenu(); }} className="btn btn-outline" style={{ flex: 1 }}>View menu</button>
                    <button onClick={(e) => { e.stopPropagation(); onBook(); }} className="btn btn-primary" style={{ flex: 1 }}>Book table</button>
                </div>
            </div>
        </div>
    );
}

function RestaurantListItem({ restaurant: r, onClick, onMenu, onBook }: { restaurant: BrowseRestaurant; onClick: () => void; onMenu: () => void; onBook: () => void }) {
    return (
        <div onClick={onClick} className="card card-hover" style={{ padding: 18, display: 'flex', gap: 20, alignItems: 'center', cursor: 'pointer' }}>
            <img src={r.images?.[0]} alt={r.name} style={{ width: 130, height: 110, objectFit: 'cover', borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-ink)' }}>{r.name}</div>
                    {!!r.rating && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, flexShrink: 0 }}><Star size={13} fill="#f9691a" color="#f9691a" />{r.rating.toFixed(1)}</div>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span>{r.cuisineType}</span><span>·</span><span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{r.priceRange}</span>
                    {r.city && <><span>·</span><span>{r.city}</span></>}
                </div>
                <OpenBadge r={r} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                <button onClick={(e) => { e.stopPropagation(); onMenu(); }} className="btn btn-outline btn-sm">Menu</button>
                <button onClick={(e) => { e.stopPropagation(); onBook(); }} className="btn btn-primary btn-sm">Book table</button>
            </div>
        </div>
    );
}
