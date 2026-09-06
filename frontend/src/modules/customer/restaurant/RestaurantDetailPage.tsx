import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Heart,
    MapPin,
    Minus,
    Plus,
    ShoppingBag,
    Star,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import { menuAPI, ordersAPI, reservationsAPI, restaurantsAPI, usersAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import { useAuthStore } from '../../../shared/store/authStore';
import type { MenuCategory, MenuItem, Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

type TabKey = 'overview' | 'menu' | 'book';
type CartItem = { menuItemId: string; name: string; price: number; quantity: number; image?: string };

const FOOD_IMG_IDS = [
    '1414235077428-338989a2e8c0', '1555396273-367ea4eb4db5',
    '1546069901-ba9599a7e63c', '1579871494447-9811cf80d66c',
];

export default function RestaurantDetailPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = (searchParams.get('tab') as TabKey) || 'overview';
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderNotes, setOrderNotes] = useState('');

    const [bookingForm, setBookingForm] = useState({
        date: '',
        time: '19:00',
        guests: 2,
        notes: '',
    });

    const { data: restaurant, isLoading } = useQuery<Restaurant>({
        queryKey: ['restaurant', id],
        queryFn: () => restaurantsAPI.getPublicById(id).then((r) => r.data),
        enabled: Boolean(id),
    });

    const { data: menuData, isLoading: menuLoading } = useQuery<{ categories: MenuCategory[] }>({
        queryKey: ['restaurant-menu', id],
        queryFn: () => menuAPI.getFullMenu(id).then((r) => r.data),
        enabled: Boolean(id) && tab === 'menu',
    });

    const bookMut = useMutation({
        mutationFn: () => reservationsAPI.create({
            restaurantId: id,
            date: bookingForm.date,
            time: bookingForm.time,
            guests: bookingForm.guests,
            notes: bookingForm.notes,
        }),
        onSuccess: () => {
            toast.success('Booking confirmed!');
            navigate('/my-bookings');
        },
        onError: () => toast.error('Could not create booking'),
    });

    const orderMut = useMutation({
        mutationFn: () => ordersAPI.create({
            restaurantId: id,
            items: cart,
            total: cartTotal,
            notes: orderNotes,
        }),
        onSuccess: (res) => {
            toast.success('Order placed!');
            setCart([]);
            navigate(`/my-orders/${res.data._id}/track`);
        },
        onError: () => toast.error('Could not place order. Please log in as a customer.'),
    });

    const favoriteMut = useMutation({
        mutationFn: () => usersAPI.addFavorite(id),
        onSuccess: () => toast.success('Added to favorites'),
        onError: () => toast.error('Could not add favorite'),
    });

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

    const addToCart = (item: MenuItem) => {
        if (!item.isAvailable) return;
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === item._id);
            if (existing) {
                return prev.map(i => i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, image: item.image }];
        });
        toast.success(`${item.name} added to cart`);
    };

    const updateQty = (menuItemId: string, delta: number) => {
        setCart(prev => prev
            .map(i => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i)
            .filter(i => i.quantity > 0));
    };

    useEffect(() => {
        if (tab === 'book' || tab === 'menu') {
            return;
        }
        const requested = searchParams.get('tab');
        if (requested === 'menu' || requested === 'book') {
            setSearchParams({ tab: requested }, { replace: true });
        }
    }, [searchParams, setSearchParams, tab]);

    const setTab = (next: TabKey) => {
        setSearchParams({ tab: next }, { replace: true });
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!restaurant) {
        return (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>Restaurant not found</h2>
                <button onClick={() => navigate('/restaurants')} style={{ marginTop: 16, padding: '10px 20px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Browse Restaurants</button>
            </div>
        );
    }

    const displayRestaurant = restaurant;
    const imgId = FOOD_IMG_IDS[(displayRestaurant.name?.charCodeAt(0) ?? 0) % FOOD_IMG_IDS.length];
    const heroImage = displayRestaurant.images?.[0] || `https://images.unsplash.com/photo-${imgId}?w=1200&q=80`;

    const formattedRating = displayRestaurant.rating != null && displayRestaurant.rating > 0
        ? displayRestaurant.rating.toFixed(1)
        : '4.7';

    const statusColor = displayRestaurant.status === 'active'
        ? { bg: '#ECFDF5', dot: '#10B981', text: '#065F46' }
        : { bg: '#FEF2F2', dot: '#EF4444', text: '#991B1B' };
    const statusLabel = displayRestaurant.status === 'active' ? 'Open' : 'Closed';

    const locationParts = [displayRestaurant.address, displayRestaurant.city, displayRestaurant.country].filter(Boolean);

    return (
        <div className="fade-in" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '24px 24px 64px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#475569', cursor: 'pointer', marginBottom: 20, fontFamily: 'Poppins', fontSize: 14, fontWeight: 500 }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 28, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #E2E8F0', padding: '24px 26px', marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                                            {displayRestaurant.name}
                                        </h1>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            padding: '4px 10px',
                                            borderRadius: 9999,
                                            background: statusColor.bg,
                                            color: statusColor.text,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            border: `1px solid ${statusColor.dot}30`,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor.dot, display: 'inline-block' }} />
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 13.5, color: '#475569' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Star size={15} fill="#F59E0B" color="#F59E0B" />
                                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{formattedRating}</span>
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <UtensilsCrossed size={14} style={{ color: '#94A3B8' }} />
                                            {displayRestaurant.cuisineType}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <MapPin size={14} style={{ color: '#94A3B8' }} />
                                            {displayRestaurant.address || displayRestaurant.city || 'Downtown'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {displayRestaurant.priceRange || '$$'}
                                        </span>
                                    </div>
                                </div>
                                {isAuthenticated && (
                                    <button
                                        onClick={() => favoriteMut.mutate()}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            background: 'white',
                                            border: '1.5px solid #E2E8F0',
                                            color: '#475569',
                                            borderRadius: 9999,
                                            padding: '9px 14px',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#FFF7ED'; e.currentTarget.style.borderColor = '#FDE68A'; e.currentTarget.style.color = '#F97316'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                                    >
                                        <Heart size={15} /> Save
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4, borderBottom: '1.5px solid #E2E8F0', marginBottom: 22, paddingBottom: 0 }}>
                            {[
                                { key: 'overview' as const, label: 'Overview', icon: <Star size={15} /> },
                                { key: 'menu' as const, label: 'Menu', icon: <UtensilsCrossed size={15} /> },
                                { key: 'book' as const, label: 'Book a Table', icon: <Calendar size={15} /> },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setTab(item.key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        padding: '11px 20px',
                                        border: 'none',
                                        background: 'transparent',
                                        fontFamily: 'Poppins',
                                        fontSize: 14,
                                        fontWeight: tab === item.key ? 600 : 400,
                                        color: tab === item.key ? '#F97316' : '#475569',
                                        borderBottom: tab === item.key ? '2.5px solid #F97316' : '2.5px solid transparent',
                                        marginBottom: -1.5,
                                        cursor: 'pointer',
                                        transition: 'color 0.15s',
                                    }}
                                >
                                    {item.icon} {item.label}
                                </button>
                            ))}
                        </div>

                        {tab === 'overview' && (
                            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, marginBottom: 22 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>About</h2>
                                    {displayRestaurant.openingHours && (
                                        <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Clock size={12} style={{ color: '#94A3B8' }} />
                                            See hours below
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: '0 0 20px' }}>
                                    {displayRestaurant.description || 'Experience exceptional cuisine in an inviting atmosphere. Perfect for special occasions and everyday dining.'}
                                </p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={() => setTab('menu')}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: '1.5px solid #E2E8F0',
                                            borderRadius: 10,
                                            background: 'white',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins',
                                            fontWeight: 600,
                                            fontSize: 14,
                                            transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                                    >
                                        View Menu
                                    </button>
                                    <button
                                        onClick={() => setTab('book')}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: 'none',
                                            borderRadius: 10,
                                            background: '#F97316',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins',
                                            fontWeight: 600,
                                            fontSize: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        <Calendar size={15} /> Book a Table
                                    </button>
                                </div>
                            </div>
                        )}

                        {tab === 'menu' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
                                <div>
                                    {menuLoading ? <Spinner /> : (
                                        (menuData?.categories?.length ? menuData.categories : []).map((category) => (
                                            <div key={category._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, marginBottom: 16 }}>
                                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{category.name}</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {(category.items || []).map((item) => (
                                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                                                                {item.description && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{item.description}</div>}
                                                                <div style={{ fontWeight: 600, color: '#F97316', fontSize: 14, marginTop: 6 }}>${item.price?.toFixed(2)}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (!isAuthenticated) {
                                                                        toast.error('Please log in to order');
                                                                        navigate('/login');
                                                                        return;
                                                                    }
                                                                    addToCart(item);
                                                                }}
                                                                disabled={!item.isAvailable}
                                                                style={{ padding: '8px 14px', background: item.isAvailable ? '#F97316' : '#E2E8F0', color: item.isAvailable ? 'white' : '#94A3B8', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: item.isAvailable ? 'pointer' : 'not-allowed', fontFamily: 'Poppins', whiteSpace: 'nowrap' }}
                                                            >
                                                                {item.isAvailable ? 'Add' : 'Unavailable'}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {!menuLoading && !menuData?.categories?.length && (
                                        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24, color: '#475569' }}>No menu items available yet.</div>
                                    )}
                                </div>

                                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, position: 'sticky', top: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                        <ShoppingBag size={18} color="#F97316" />
                                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Order</h3>
                                    </div>
                                    {cart.length === 0 ? (
                                        <p style={{ fontSize: 13, color: '#94A3B8' }}>Add items from the menu to start your order.</p>
                                    ) : (
                                        <>
                                            {cart.map(item => (
                                                <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                        <div style={{ color: '#94A3B8' }}>${item.price.toFixed(2)} each</div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <button onClick={() => updateQty(item.menuItemId, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}><Minus size={12} /></button>
                                                        <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                                                        <button onClick={() => updateQty(item.menuItemId, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}><Plus size={12} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Special instructions..." rows={2}
                                                style={{ width: '100%', marginTop: 8, marginBottom: 12, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontFamily: 'Poppins', fontSize: 12 }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 12 }}>
                                                <span>Total</span>
                                                <span style={{ color: '#F97316' }}>${cartTotal.toFixed(2)}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (!isAuthenticated) {
                                                        navigate('/login');
                                                        return;
                                                    }
                                                    orderMut.mutate();
                                                }}
                                                disabled={orderMut.isPending}
                                                style={{ width: '100%', padding: '12px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: orderMut.isPending ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', opacity: orderMut.isPending ? 0.85 : 1 }}
                                            >
                                                {orderMut.isPending ? 'Placing Order...' : 'Place Order'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === 'book' && (
                            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24, maxWidth: 480 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Reserve Your Table</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Date</label>
                                        <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14 }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Time</label>
                                        <input type="time" value={bookingForm.time} onChange={(e) => setBookingForm((f) => ({ ...f, time: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14 }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Guests</label>
                                        <input type="number" min={1} max={20} value={bookingForm.guests} onChange={(e) => setBookingForm((f) => ({ ...f, guests: Number(e.target.value) }))}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14 }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Special Requests</label>
                                        <textarea value={bookingForm.notes} onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))} rows={3}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14, resize: 'vertical' }} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!bookingForm.date) {
                                                toast.error('Please select a date');
                                                return;
                                            }
                                            bookMut.mutate();
                                        }}
                                        disabled={bookMut.isPending}
                                        style={{ padding: '12px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: bookMut.isPending ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: bookMut.isPending ? 0.85 : 1 }}
                                    >
                                        <Calendar size={16} /> {bookMut.isPending ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                                <div style={{ marginTop: 16, fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Instant confirmation</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> Up to 20 guests</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: 24, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#0F172A', aspectRatio: '4 / 3', maxHeight: 'calc(100vh - 140px)' }}>
                            <img
                                src={heroImage}
                                alt={displayRestaurant.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.0) 35%, rgba(15,23,42,0.28) 100%)' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 80% 10%, rgba(249,115,22,0.18), rgba(15,23,42,0) 60%)' }} />
                            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{formattedRating}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                                    <MapPin size={13} />
                                    <span style={{ fontWeight: 500, opacity: 0.92 }}>{locationParts[0] || locationParts[1] || 'Downtown'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                            <button
                                onClick={() => setTab('menu')}
                                style={{ padding: '13px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, background: 'white', color: '#0F172A', fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s ease', textAlign: 'center' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                            >
                                <UtensilsCrossed size={15} /> Menu
                            </button>
                            <button
                                onClick={() => setTab('book')}
                                style={{ padding: '13px 14px', border: 'none', borderRadius: 12, background: '#F97316', color: 'white', fontFamily: 'Poppins', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Calendar size={15} /> Book Table
                            </button>
                        </div>

                        {displayRestaurant.openingHours && Object.keys(displayRestaurant.openingHours).length > 0 && (
                            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '16px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                                    <Clock size={15} color="#F97316" />
                                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Opening Hours</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {Object.entries(displayRestaurant.openingHours).map(([day, hours]) => (
                                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                            <span style={{ color: '#475569', textTransform: 'capitalize' }}>{day || 'Day'}</span>
                                            <span style={{ fontWeight: 600, color: hours.closed ? '#94A3B8' : '#0F172A' }}>
                                                {hours.closed ? 'Closed' : `${hours.open}${hours.close ? ' - ' + hours.close : ''}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
