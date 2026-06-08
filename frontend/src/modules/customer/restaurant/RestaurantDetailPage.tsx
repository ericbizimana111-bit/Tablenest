import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Star,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import { menuAPI, reservationsAPI, restaurantsAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import type { MenuCategory, Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

type TabKey = 'overview' | 'menu' | 'book';

const FOOD_IMG_IDS = [
    '1414235077428-338989a2e8c0', '1555396273-367ea4eb4db5',
    '1546069901-ba9599a7e63c', '1579871494447-9811cf80d66c',
];

export default function RestaurantDetailPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = (searchParams.get('tab') as TabKey) || 'overview';

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

    const displayRestaurant = restaurant || DEMO_RESTAURANT;
    const imgId = FOOD_IMG_IDS[(displayRestaurant.name?.charCodeAt(0) ?? 0) % FOOD_IMG_IDS.length];
    const heroImage = displayRestaurant.images?.[0] || `https://images.unsplash.com/photo-${imgId}?w=1200&q=80`;

    return (
        <div className="fade-in" style={{ fontFamily: 'Poppins, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontFamily: 'Poppins', fontSize: 14 }}
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
                <img src={heroImage} alt={displayRestaurant.name} style={{ width: '100%', height: 320, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', color: 'white' }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{displayRestaurant.name}</h1>
                    <div style={{ display: 'flex', gap: 16, fontSize: 14, opacity: 0.9, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="#F59E0B" color="#F59E0B" /> {displayRestaurant.rating || 4.7}</span>
                        <span>{displayRestaurant.cuisineType}</span>
                        <span>{displayRestaurant.priceRange || '$$'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {displayRestaurant.address || displayRestaurant.city || 'Downtown'}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #E5E7EB' }}>
                {([
                    { key: 'overview' as const, label: 'Overview', icon: <Star size={15} /> },
                    { key: 'menu' as const, label: 'Menu', icon: <UtensilsCrossed size={15} /> },
                    { key: 'book' as const, label: 'Book a Table', icon: <Calendar size={15} /> },
                ]).map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setTab(item.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', background: 'transparent',
                            fontFamily: 'Poppins', fontSize: 14, fontWeight: tab === item.key ? 600 : 400,
                            color: tab === item.key ? '#B91C1C' : '#6B7280',
                            borderBottom: tab === item.key ? '2px solid #B91C1C' : '2px solid transparent', marginBottom: -2, cursor: 'pointer',
                        }}
                    >
                        {item.icon} {item.label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>About</h2>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 20 }}>
                        {displayRestaurant.description || 'Experience exceptional cuisine in an inviting atmosphere. Perfect for special occasions and everyday dining.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setTab('menu')} style={{ padding: '10px 20px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                            View Menu
                        </button>
                        <button onClick={() => setTab('book')} style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: '#B91C1C', color: 'white', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>
                            Book a Table
                        </button>
                    </div>
                </div>
            )}

            {tab === 'menu' && (
                <div>
                    {menuLoading ? <Spinner /> : (
                        (menuData?.categories?.length ? menuData.categories : DEMO_MENU).map((category) => (
                            <div key={category._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, marginBottom: 16 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{category.name}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {(category.items || []).map((item) => (
                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                                                {item.description && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.description}</div>}
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#B91C1C', fontSize: 14 }}>${item.price?.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'book' && (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, maxWidth: 480 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Reserve Your Table</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Date</label>
                            <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))}
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Time</label>
                            <input type="time" value={bookingForm.time} onChange={(e) => setBookingForm((f) => ({ ...f, time: e.target.value }))}
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Guests</label>
                            <input type="number" min={1} max={20} value={bookingForm.guests} onChange={(e) => setBookingForm((f) => ({ ...f, guests: Number(e.target.value) }))}
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Special Requests</label>
                            <textarea value={bookingForm.notes} onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))} rows={3}
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: 'Poppins', fontSize: 14, resize: 'vertical' }} />
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
                            style={{ padding: '12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <Calendar size={16} /> {bookMut.isPending ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                    <div style={{ marginTop: 16, fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Instant confirmation</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> Up to 20 guests</span>
                    </div>
                </div>
            )}
        </div>
    );
}

const DEMO_RESTAURANT: Restaurant = {
    _id: 'demo',
    name: 'TableNest Bistro',
    ownerId: 'owner1',
    cuisineType: 'Modern European',
    address: '123 Culinary Avenue',
    city: 'Downtown',
    priceRange: '$$$',
    status: 'active',
    rating: 4.8,
    description: 'Seasonal ingredients, refined technique, and warm hospitality.',
};

const DEMO_MENU: MenuCategory[] = [
    {
        _id: 'c1', restaurantId: 'demo', name: 'Starters', items: [
            { _id: 'i1', restaurantId: 'demo', categoryId: 'c1', name: 'Burrata & Heirloom Tomatoes', description: 'Fresh basil, aged balsamic', price: 16, isAvailable: true },
            { _id: 'i2', restaurantId: 'demo', categoryId: 'c1', name: 'Tuna Tartare', description: 'Avocado, citrus, sesame', price: 18, isAvailable: true },
        ],
    },
    {
        _id: 'c2', restaurantId: 'demo', name: 'Mains', items: [
            { _id: 'i3', restaurantId: 'demo', categoryId: 'c2', name: 'Pan-Seared Salmon', description: 'Asparagus, lemon butter', price: 32, isAvailable: true },
            { _id: 'i4', restaurantId: 'demo', categoryId: 'c2', name: 'Wagyu Striploin', description: 'Truffle mash, red wine jus', price: 48, isAvailable: true },
        ],
    },
];
