import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, Calendar, Clock, Heart, MapPin, Minus, Phone, Plus,
    ShoppingBag, Star, Users, UtensilsCrossed, Bike, ShoppingBasket, Tag, Check, X,
} from 'lucide-react';
import {
    menuAPI, ordersAPI, promotionsAPI, reservationsAPI, restaurantsAPI, reviewsAPI, usersAPI,
} from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import { useAuthStore } from '../../../shared/store/authStore';
import { useOrderStore } from '../../../shared/store/orderStore';
import type { MenuCategory, MenuItem, Restaurant, Review, Promotion } from '../../../shared/types/restaurant.types';
import type { AvailabilityResponse, OrderQuote } from '../../../shared/types/order.types';
import type { Address, PaymentMethod } from '../../../shared/types/user.types';
import toast from 'react-hot-toast';

type TabKey = 'overview' | 'menu' | 'book';
type OrderType = 'delivery' | 'pickup' | 'dine_in';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function RestaurantDetailPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = (searchParams.get('tab') as TabKey) || 'overview';
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartItemCount } = useOrderStore();

    const [orderType, setOrderType] = useState<OrderType>('delivery');
    const [orderNotes, setOrderNotes] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState('');
    const [tip, setTip] = useState(0);
    const [addressIdx, setAddressIdx] = useState(0);
    const [manualAddress, setManualAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [cardIdx, setCardIdx] = useState(0);

    const [bookDate, setBookDate] = useState('');
    const [bookGuests, setBookGuests] = useState(2);
    const [bookTime, setBookTime] = useState('');
    const [bookNotes, setBookNotes] = useState('');

    const { data: restaurant, isLoading } = useQuery<Restaurant>({
        queryKey: ['restaurant', id],
        queryFn: () => restaurantsAPI.getPublicById(id).then((r) => r.data),
        enabled: Boolean(id),
    });

    const { data: favoritesData } = useQuery<{ ids: string[] }>({
        queryKey: ['favorites'],
        queryFn: () => usersAPI.getFavorites().then((r) => r.data),
        enabled: isAuthenticated,
    });
    const isFavorite = Boolean(favoritesData?.ids?.includes(id));

    const { data: menuData, isLoading: menuLoading } = useQuery<Array<MenuCategory & { items: MenuItem[] }>>({
        queryKey: ['restaurant-menu', id],
        queryFn: () => menuAPI.getFullMenu(id).then((r) => r.data),
        enabled: Boolean(id) && tab === 'menu',
    });

    const { data: reviewsData } = useQuery<{ reviews: Review[]; avgRating: number; total: number; distribution: Record<number, number> }>({
        queryKey: ['restaurant-reviews', id],
        queryFn: () => reviewsAPI.getByRestaurant(id, { limit: 6 }).then((r) => r.data),
        enabled: Boolean(id) && tab === 'overview',
    });

    const { data: activePromos } = useQuery<Promotion[]>({
        queryKey: ['restaurant-promos', id],
        queryFn: () => promotionsAPI.getActiveForRestaurant(id).then((r) => r.data),
        enabled: Boolean(id),
    });

    const { data: addressesData } = useQuery<{ addresses: Address[] }>({
        queryKey: ['addresses'],
        queryFn: () => usersAPI.getAddresses().then((r) => r.data),
        enabled: isAuthenticated && tab === 'menu',
    });
    const { data: cardsData } = useQuery<{ paymentMethods: PaymentMethod[] }>({
        queryKey: ['payment-methods'],
        queryFn: () => usersAPI.getPaymentMethods().then((r) => r.data),
        enabled: isAuthenticated && tab === 'menu',
    });
    const addresses = addressesData?.addresses || [];
    const cards = cardsData?.paymentMethods || [];

    const inCartForThisRestaurant = cart?.restaurantId === id;
    const cartItems = inCartForThisRestaurant ? cart!.items : [];

    const quoteBody = useMemo(() => {
        if (!cartItems.length) return null;
        return {
            restaurantId: id,
            items: cartItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
            orderType,
            promoCode: appliedPromo || undefined,
            tip,
        };
    }, [cartItems, id, orderType, appliedPromo, tip]);

    const { data: quote, isFetching: quoting, error: quoteError } = useQuery<OrderQuote>({
        queryKey: ['order-quote', quoteBody],
        queryFn: () => ordersAPI.quote(quoteBody!).then((r) => r.data),
        enabled: Boolean(quoteBody) && isAuthenticated,
        retry: false,
    });

    const { data: availability, isFetching: loadingSlots } = useQuery<AvailabilityResponse>({
        queryKey: ['availability', id, bookDate, bookGuests],
        queryFn: () => reservationsAPI.getAvailability(id, bookDate, bookGuests).then((r) => r.data),
        enabled: Boolean(id) && Boolean(bookDate) && tab === 'book',
    });

    const bookMut = useMutation({
        mutationFn: () => reservationsAPI.create({ restaurantId: id, date: bookDate, time: bookTime, guests: bookGuests, notes: bookNotes }),
        onSuccess: () => {
            toast.success('Booking request sent — the restaurant will confirm shortly.');
            navigate('/my-bookings');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Could not create booking'),
    });

    const orderMut = useMutation({
        mutationFn: () =>
            ordersAPI.create({
                restaurantId: id,
                items: cartItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
                orderType,
                deliveryAddress: orderType === 'delivery' ? (addresses[addressIdx] ? formatAddress(addresses[addressIdx]) : manualAddress) : undefined,
                notes: orderNotes || undefined,
                promoCode: appliedPromo || undefined,
                paymentMethod,
                cardIndex: paymentMethod === 'card' ? cardIdx : undefined,
                tip,
            }),
        onSuccess: (res) => {
            toast.success('Order placed!');
            clearCart();
            navigate(`/my-orders/${res.data._id}/track`);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Could not place order'),
    });

    const favoriteMut = useMutation({
        mutationFn: () => (isFavorite ? usersAPI.removeFavorite(id) : usersAPI.addFavorite(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            toast.success(isFavorite ? 'Removed from favorites' : 'Saved to favorites');
        },
        onError: () => toast.error('Please log in to save favorites'),
    });

    useEffect(() => {
        if (!bookDate) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            setBookDate(d.toISOString().slice(0, 10));
        }
    }, [bookDate]);

    useEffect(() => { setBookTime(''); }, [bookDate, bookGuests]);

    useEffect(() => {
        if (restaurant) {
            if (restaurant.delivery) setOrderType('delivery');
            else if (restaurant.pickup) setOrderType('pickup');
            else if (restaurant.dineIn) setOrderType('dine_in');
        }
    }, [restaurant?._id]);

    const setTab = (next: TabKey) => setSearchParams({ tab: next }, { replace: true });

    const handleAdd = (item: MenuItem) => {
        if (!item.isAvailable || item.isSoldOut) return;
        if (!isAuthenticated) { toast.error('Please log in to order'); navigate('/login'); return; }
        if (cart && cart.restaurantId !== id && cart.items.length > 0) {
            if (!confirm(`Your cart has items from ${cart.restaurantName}. Start a new order at ${restaurant?.name}?`)) return;
        }
        addToCart(id, restaurant?.name || '', { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, image: item.image });
        toast.success(`${item.name} added`);
    };

    if (isLoading) return <Spinner fullPage />;
    if (!restaurant) {
        return (
            <div style={{ padding: 60, textAlign: 'center' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Restaurant not found</h2>
                <button onClick={() => navigate('/restaurants')} className="btn btn-primary" style={{ marginTop: 16 }}>Browse restaurants</button>
            </div>
        );
    }

    const rating = restaurant.rating && restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New';
    const heroImage = restaurant.images?.[0];
    const locationLine = [restaurant.address, restaurant.city, restaurant.country].filter(Boolean).join(', ');
    const sortedHours = restaurant.openingHours
        ? DAY_ORDER.filter((d) => restaurant.openingHours![d]).map((d) => [d, restaurant.openingHours![d]] as const)
        : [];

    return (
        <div style={{ background: 'var(--color-cream)', minHeight: '100vh', padding: '24px 24px 80px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 26, alignItems: 'start' }} className="restaurant-detail-grid">
                    <div style={{ minWidth: 0 }}>
                        <div className="card" style={{ padding: '24px 26px', marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>{restaurant.name}</h1>
                                        <span className={`badge ${restaurant.openNow !== false ? 'badge-green' : 'badge-gray'}`}>
                                            {restaurant.openNow !== false ? 'Open now' : 'Closed'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 13.5, color: 'var(--color-ink-soft)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Star size={15} fill="#f9691a" color="#f9691a" />
                                            <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{rating}</span>
                                            {!!restaurant.totalReviews && <span style={{ color: 'var(--color-ink-mute)' }}>({restaurant.totalReviews})</span>}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UtensilsCrossed size={14} /> {restaurant.cuisineType}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {locationLine || 'Address unavailable'}</span>
                                        <span>{restaurant.priceRange}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                                        {restaurant.delivery && <span className="badge badge-blue"><Bike size={11} /> Delivery</span>}
                                        {restaurant.pickup && <span className="badge badge-purple"><ShoppingBasket size={11} /> Pickup</span>}
                                        {restaurant.dineIn && <span className="badge badge-brand"><UtensilsCrossed size={11} /> Dine-in</span>}
                                    </div>
                                </div>
                                {isAuthenticated && (
                                    <button onClick={() => favoriteMut.mutate()} className="btn btn-outline btn-sm">
                                        <Heart size={15} fill={isFavorite ? '#f9691a' : 'none'} color={isFavorite ? '#f9691a' : undefined} /> {isFavorite ? 'Saved' : 'Save'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4, borderBottom: '1.5px solid var(--color-line)', marginBottom: 22 }}>
                            {[
                                { key: 'overview' as const, label: 'Overview', icon: <Star size={15} /> },
                                { key: 'menu' as const, label: 'Menu & order', icon: <UtensilsCrossed size={15} /> },
                                { key: 'book' as const, label: 'Book a table', icon: <Calendar size={15} /> },
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', border: 'none', background: 'transparent',
                                        fontSize: 14, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? 'var(--color-brand-600)' : 'var(--color-ink-soft)',
                                        borderBottom: tab === t.key ? '2.5px solid var(--color-brand-500)' : '2.5px solid transparent', marginBottom: -1.5, cursor: 'pointer',
                                    }}
                                >
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {tab === 'overview' && (
                            <OverviewTab restaurant={restaurant} reviewsData={reviewsData} sortedHours={sortedHours} onMenu={() => setTab('menu')} onBook={() => setTab('book')} />
                        )}

                        {tab === 'menu' && (
                            <MenuTab
                                menuData={menuData}
                                menuLoading={menuLoading}
                                onAdd={handleAdd}
                            />
                        )}

                        {tab === 'book' && (
                            <BookTab
                                restaurant={restaurant}
                                bookDate={bookDate} setBookDate={setBookDate}
                                bookGuests={bookGuests} setBookGuests={setBookGuests}
                                bookTime={bookTime} setBookTime={setBookTime}
                                bookNotes={bookNotes} setBookNotes={setBookNotes}
                                availability={availability} loadingSlots={loadingSlots}
                                onSubmit={() => {
                                    if (!isAuthenticated) { navigate('/login'); return; }
                                    if (!bookTime) { toast.error('Choose an available time'); return; }
                                    bookMut.mutate();
                                }}
                                submitting={bookMut.isPending}
                            />
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'var(--color-ink)', aspectRatio: '4 / 3' }}>
                            {heroImage && <img src={heroImage} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,19,13,0.05), rgba(26,19,13,0.55))' }} />
                            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}><Star size={14} fill="#f9691a" color="#f9691a" /> {rating}</span>
                                {restaurant.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}><Phone size={13} /> {restaurant.phone}</span>}
                            </div>
                        </div>

                        {tab === 'menu' && cartItems.length > 0 ? (
                            <CartPanel
                                items={cartItems}
                                restaurant={restaurant}
                                orderType={orderType} setOrderType={setOrderType}
                                updateQuantity={updateQuantity}
                                removeFromCart={removeFromCart}
                                orderNotes={orderNotes} setOrderNotes={setOrderNotes}
                                promoCode={promoCode} setPromoCode={setPromoCode}
                                appliedPromo={appliedPromo} setAppliedPromo={setAppliedPromo}
                                tip={tip} setTip={setTip}
                                addresses={addresses} addressIdx={addressIdx} setAddressIdx={setAddressIdx}
                                manualAddress={manualAddress} setManualAddress={setManualAddress}
                                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                                cards={cards} cardIdx={cardIdx} setCardIdx={setCardIdx}
                                quote={quote} quoting={quoting} quoteError={quoteError as any}
                                cartTotal={cartTotal()} itemCount={cartItemCount()}
                                isAuthenticated={isAuthenticated}
                                onSubmit={() => { if (!isAuthenticated) { navigate('/login'); return; } orderMut.mutate(); }}
                                submitting={orderMut.isPending}
                                activePromos={activePromos}
                            />
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <button onClick={() => setTab('menu')} className="btn btn-outline">
                                        <UtensilsCrossed size={15} /> Menu
                                    </button>
                                    <button onClick={() => setTab('book')} className="btn btn-primary">
                                        <Calendar size={15} /> Book table
                                    </button>
                                </div>
                                {!!activePromos?.length && (
                                    <div className="card" style={{ padding: '16px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                                            <Tag size={15} color="var(--color-brand-500)" />
                                            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Live offers</h3>
                                        </div>
                                        {activePromos.map((p) => (
                                            <div key={p._id} style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 6 }}>
                                                <strong style={{ color: 'var(--color-ink)' }}>{p.code}</strong> — {p.discountType === 'percentage' ? `${p.discountValue}% off` : `$${p.discountValue} off`}{p.minOrder ? ` on orders $${p.minOrder}+` : ''}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {sortedHours.length > 0 && (
                                    <div className="card" style={{ padding: '16px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                                            <Clock size={15} color="var(--color-brand-500)" />
                                            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Opening hours</h3>
                                        </div>
                                        {sortedHours.map(([day, hours]) => (
                                            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                                <span style={{ color: 'var(--color-ink-soft)', textTransform: 'capitalize' }}>{day}</span>
                                                <span style={{ fontWeight: 600, color: hours.closed ? 'var(--color-ink-mute)' : 'var(--color-ink)' }}>
                                                    {hours.closed ? 'Closed' : `${hours.open} – ${hours.close}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@media (max-width: 980px) { .restaurant-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

function formatAddress(a: Address) {
    return [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ');
}

function OverviewTab({ restaurant, reviewsData, sortedHours, onMenu, onBook }: any) {
    return (
        <>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>About</h2>
                <p style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.75, marginBottom: 20 }}>
                    {restaurant.description || `${restaurant.name} serves ${restaurant.cuisineType} cuisine in ${restaurant.city || 'the area'}.`}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onMenu} className="btn btn-outline" style={{ flex: 1 }}>View menu</button>
                    <button onClick={onBook} className="btn btn-primary" style={{ flex: 1 }}><Calendar size={15} /> Book a table</button>
                </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700 }}>Reviews</h2>
                    {!!reviewsData?.total && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                            <Star size={15} fill="#f9691a" color="#f9691a" /> <strong>{reviewsData.avgRating}</strong> ({reviewsData.total})
                        </span>
                    )}
                </div>
                {!reviewsData?.reviews?.length ? (
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)' }}>No reviews yet — be the first to visit and share your experience.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {reviewsData.reviews.map((rev: Review) => (
                            <div key={rev._id} style={{ paddingBottom: 14, borderBottom: '1px solid var(--color-line)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <strong style={{ fontSize: 13.5 }}>{rev.customerName || 'Guest'}</strong>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={12} fill="#f9691a" color="#f9691a" />)}
                                    </div>
                                </div>
                                {rev.comment && <p style={{ fontSize: 13.5, color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>{rev.comment}</p>}
                                {rev.ownerReply && (
                                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-sand)', borderRadius: 10, fontSize: 12.5, color: 'var(--color-ink-soft)' }}>
                                        <strong style={{ color: 'var(--color-ink)' }}>Restaurant reply:</strong> {rev.ownerReply}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function MenuTab({ menuData, menuLoading, onAdd }: { menuData?: Array<MenuCategory & { items: MenuItem[] }>; menuLoading: boolean; onAdd: (i: MenuItem) => void }) {
    const [activeCat, setActiveCat] = useState<string>('all');
    if (menuLoading) return <Spinner />;
    if (!menuData?.length) return <div className="card" style={{ padding: 24, color: 'var(--color-ink-mute)' }}>No menu items available yet.</div>;

    const cats = menuData.filter((c) => c.items.length);
    const visible = activeCat === 'all' ? cats : cats.filter((c) => c._id === activeCat);

    return (
        <div>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
                <button className="chip" data-active={activeCat === 'all'} onClick={() => setActiveCat('all')}>All</button>
                {cats.map((c) => (
                    <button key={c._id} className="chip" data-active={activeCat === c._id} onClick={() => setActiveCat(c._id)}>{c.name}</button>
                ))}
            </div>
            {visible.map((category) => (
                <div key={category._id} className="card" style={{ padding: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{category.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {category.items.map((item) => (
                            <div key={item._id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                {item.image && <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--color-ink)' }}>{item.name}</div>
                                    {item.description && <div style={{ fontSize: 12.5, color: 'var(--color-ink-mute)', marginTop: 2 }}>{item.description}</div>}
                                    <div style={{ fontWeight: 700, color: 'var(--color-brand-600)', fontSize: 14, marginTop: 6 }}>${item.price.toFixed(2)}</div>
                                </div>
                                <button
                                    onClick={() => onAdd(item)}
                                    disabled={!item.isAvailable || item.isSoldOut}
                                    className="btn btn-sm"
                                    style={{
                                        background: item.isAvailable && !item.isSoldOut ? 'var(--color-ink)' : 'var(--color-sand)',
                                        color: item.isAvailable && !item.isSoldOut ? '#fff' : 'var(--color-ink-mute)',
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.isSoldOut ? 'Sold out' : item.isAvailable ? 'Add' : 'Unavailable'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function BookTab({ restaurant, bookDate, setBookDate, bookGuests, setBookGuests, bookTime, setBookTime, bookNotes, setBookNotes, availability, loadingSlots, onSubmit, submitting }: any) {
    if (!restaurant.dineIn) {
        return <div className="card" style={{ padding: 24, color: 'var(--color-ink-mute)' }}>This restaurant does not take table reservations.</div>;
    }
    const minDate = new Date().toISOString().slice(0, 10);
    return (
        <div className="card" style={{ padding: 24, maxWidth: 560 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Reserve your table</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                    <label className="label">Date</label>
                    <input type="date" min={minDate} value={bookDate} onChange={(e) => setBookDate(e.target.value)} className="input" />
                </div>
                <div>
                    <label className="label">Guests</label>
                    <input type="number" min={1} max={20} value={bookGuests} onChange={(e) => setBookGuests(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="input" />
                </div>
            </div>

            <label className="label">Available times</label>
            {loadingSlots ? (
                <div className="skeleton" style={{ height: 90, marginBottom: 14 }} />
            ) : availability?.closed ? (
                <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 14 }}>Closed on this date.</div>
            ) : !availability?.slots?.length ? (
                <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 14 }}>Choose a date to see availability.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14, maxHeight: 220, overflowY: 'auto' }}>
                    {availability.slots.map((s: { time: string; available: boolean }) => (
                        <button
                            key={s.time}
                            disabled={!s.available}
                            onClick={() => setBookTime(s.time)}
                            className="chip"
                            data-active={bookTime === s.time}
                            style={{ justifyContent: 'center', opacity: s.available ? 1 : 0.35, cursor: s.available ? 'pointer' : 'not-allowed', textDecoration: s.available ? 'none' : 'line-through' }}
                        >
                            {s.time}
                        </button>
                    ))}
                </div>
            )}

            <label className="label">Special requests (optional)</label>
            <textarea value={bookNotes} onChange={(e) => setBookNotes(e.target.value)} rows={3} className="input" style={{ resize: 'vertical', marginBottom: 18 }} placeholder="Window seat, allergies, celebration…" />

            <button onClick={onSubmit} disabled={submitting || !bookTime} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <Calendar size={16} /> {submitting ? 'Booking…' : bookTime ? `Confirm ${bookTime}` : 'Choose a time'}
            </button>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-ink-mute)', display: 'flex', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Confirmed by the restaurant</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> Up to 20 guests</span>
            </div>
        </div>
    );
}

function CartPanel(props: any) {
    const {
        items, restaurant, orderType, setOrderType, updateQuantity, removeFromCart, orderNotes, setOrderNotes,
        promoCode, setPromoCode, appliedPromo, setAppliedPromo, tip, setTip, addresses, addressIdx, setAddressIdx,
        manualAddress, setManualAddress, paymentMethod, setPaymentMethod, cards, cardIdx, setCardIdx,
        quote, quoting, quoteError, cartTotal, isAuthenticated, onSubmit, submitting, activePromos,
    } = props;

    const types: Array<{ key: OrderType; label: string; icon: React.ReactNode; enabled: boolean }> = [
        { key: 'delivery', label: 'Delivery', icon: <Bike size={14} />, enabled: !!restaurant.delivery },
        { key: 'pickup', label: 'Pickup', icon: <ShoppingBasket size={14} />, enabled: !!restaurant.pickup },
        { key: 'dine_in', label: 'Dine-in', icon: <UtensilsCrossed size={14} />, enabled: !!restaurant.dineIn },
    ];

    return (
        <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <ShoppingBag size={18} color="var(--color-brand-500)" />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Your order</h3>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {types.filter((t) => t.enabled).map((t) => (
                    <button key={t.key} onClick={() => setOrderType(t.key)} className="chip" data-active={orderType === t.key} style={{ flex: 1, justifyContent: 'center' }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
                {items.map((item: any) => (
                    <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{item.name}</div>
                            <div style={{ color: 'var(--color-ink-mute)' }}>${item.price.toFixed(2)} each</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="btn-icon" style={{ width: 24, height: 24, padding: 0, border: '1px solid var(--color-line)', background: '#fff' }}><Minus size={11} /></button>
                            <span style={{ fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="btn-icon" style={{ width: 24, height: 24, padding: 0, border: '1px solid var(--color-line)', background: '#fff' }}><Plus size={11} /></button>
                            <button onClick={() => removeFromCart(item.menuItemId)} className="btn-icon" style={{ width: 24, height: 24, padding: 0, color: '#c0271b' }}><X size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {orderType === 'delivery' && isAuthenticated && (
                <div style={{ marginBottom: 12 }}>
                    <label className="label">Deliver to</label>
                    {addresses.length > 0 ? (
                        <select value={addressIdx} onChange={(e) => setAddressIdx(Number(e.target.value))} className="input">
                            {addresses.map((a: Address, i: number) => <option key={i} value={i}>{a.label}: {formatAddress(a)}</option>)}
                        </select>
                    ) : (
                        <input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Enter delivery address" className="input" />
                    )}
                </div>
            )}

            <div style={{ marginBottom: 12 }}>
                <label className="label">Promo code</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder={activePromos?.[0]?.code || 'Enter code'} className="input" style={{ flex: 1 }} />
                    <button onClick={() => setAppliedPromo(promoCode)} disabled={!promoCode} className="btn btn-outline btn-sm">Apply</button>
                </div>
                {appliedPromo && !quoteError && quote?.discount > 0 && (
                    <div style={{ fontSize: 12, color: '#17803d', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> {appliedPromo} applied</div>
                )}
                {appliedPromo && quoteError && (
                    <div style={{ fontSize: 12, color: '#c0271b', marginTop: 6 }}>{quoteError.response?.data?.message || 'Invalid code'}</div>
                )}
            </div>

            {paymentMethod === 'cash' || true ? (
                <div style={{ marginBottom: 12 }}>
                    <label className="label">Tip</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[0, 2, 5, 10].map((v) => (
                            <button key={v} onClick={() => setTip(v)} className="chip" data-active={tip === v} style={{ flex: 1, justifyContent: 'center' }}>{v === 0 ? 'No tip' : `$${v}`}</button>
                        ))}
                    </div>
                </div>
            ) : null}

            <div style={{ marginBottom: 14 }}>
                <label className="label">Payment</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: cards.length && paymentMethod === 'card' ? 8 : 0 }}>
                    <button onClick={() => setPaymentMethod('cash')} className="chip" data-active={paymentMethod === 'cash'} style={{ flex: 1, justifyContent: 'center' }}>Cash</button>
                    <button onClick={() => setPaymentMethod('card')} disabled={!cards.length} className="chip" data-active={paymentMethod === 'card'} style={{ flex: 1, justifyContent: 'center', opacity: cards.length ? 1 : 0.5 }}>Card</button>
                </div>
                {paymentMethod === 'card' && cards.length > 0 && (
                    <select value={cardIdx} onChange={(e) => setCardIdx(Number(e.target.value))} className="input">
                        {cards.map((c: PaymentMethod, i: number) => <option key={i} value={i}>{c.brand} •••• {c.last4}</option>)}
                    </select>
                )}
            </div>

            <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Special instructions…" rows={2} className="input" style={{ marginBottom: 14, resize: 'vertical' }} />

            <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 12, marginBottom: 14 }}>
                {quote ? (
                    <>
                        <Row label="Subtotal" value={quote.subtotal} />
                        {quote.discount > 0 && <Row label="Discount" value={-quote.discount} color="#17803d" />}
                        {quote.deliveryFee > 0 && <Row label="Delivery fee" value={quote.deliveryFee} />}
                        {quote.tax > 0 && <Row label="Tax" value={quote.tax} />}
                        {quote.tip > 0 && <Row label="Tip" value={quote.tip} />}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--color-line)' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--color-brand-600)' }}>${quote.total.toFixed(2)}</span>
                        </div>
                        {quote.minOrder > 0 && quote.subtotal < quote.minOrder && (
                            <div style={{ fontSize: 12, color: '#c0271b', marginTop: 6 }}>Minimum order ${quote.minOrder.toFixed(2)}</div>
                        )}
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>Estimated total</span>
                        <span>{isAuthenticated ? (quoting ? '…' : `$${cartTotal.toFixed(2)}`) : `$${cartTotal.toFixed(2)}`}</span>
                    </div>
                )}
            </div>

            <button
                onClick={onSubmit}
                disabled={submitting || quoting || (quote && quote.minOrder > 0 && quote.subtotal < quote.minOrder)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
            >
                {submitting ? 'Placing order…' : isAuthenticated ? `Place order · $${(quote?.total ?? cartTotal).toFixed(2)}` : 'Log in to order'}
            </button>
        </div>
    );
}

function Row({ label, value, color }: { label: string; value: number; color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: color || 'var(--color-ink-soft)', marginBottom: 6 }}>
            <span>{label}</span>
            <span>{value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}</span>
        </div>
    );
}
