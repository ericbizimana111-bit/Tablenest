import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Utensils, Calendar, Search, Star, ArrowRight, ChevronRight } from 'lucide-react';
import Footer from '../../shared/components/layout/Footer';

const CUISINES = ['Healthy', 'Italian', 'Japanese', 'Mexican', 'American', 'Chinese', 'Indian', 'French'];
const STEPS = [
    { n: '01', title: 'Find Your Spot', desc: 'Search by cuisine, location, or atmosphere.' },
    { n: '02', title: 'Pick Your Time', desc: 'Select an available slot that fits your schedule.' },
    { n: '03', title: 'Enjoy Your Meal', desc: 'Arrive and be seated immediately for a VIP experience.' },
];
const TESTIMONIALS = [
    { text: 'TableNest has completely changed how we dine out. The booking process is seamless.', name: 'Sarah Jenkins', role: 'Food Critic' },
    { text: 'I love the order ahead feature. It saves so much time during lunch hours.', name: 'David Chen', role: 'Busy Professional' },
    { text: 'The only app I use for dinner plans now. Reliable, fast, and the interface is beautiful.', name: 'Emily Rodriguez', role: 'Local Guide' },
];
const FEATURED = [
    { name: "L'Osteria", cuisine: 'Italian', rating: 4.8, dist: '0.6 miles', isOpen: true, img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
    { name: 'Zento Sushi', cuisine: 'Japanese', rating: 4.7, dist: '1.2 miles', isOpen: true, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80' },
    { name: 'Iron Grill', cuisine: 'Steakhouse', rating: 4.8, dist: '2.5 miles', isOpen: false, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
    { name: 'Bleu Bistro', cuisine: 'French', rating: 4.6, dist: '3.1 miles', isOpen: true, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [cuisine, setCuisine] = useState('');

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: 'white' }}>
            {/* Navbar */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 80px', zIndex: 100, gap: 32 }}>
                <div style={{ color: '#B91C1C', fontWeight: 700, fontSize: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>TableNest</div>
                <div style={{ flex: 1 }} />
                {['Home', 'Restaurants', 'How It Works', 'About Us'].map(l => (
                    <span key={l} style={{ fontSize: 14, color: '#374151', cursor: 'pointer', fontWeight: 500 }}
                        onClick={() => l === 'Restaurants' && navigate('/restaurants')}>{l}</span>
                ))}
                <span onClick={() => navigate('/login')} style={{ fontSize: 14, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>Log In</span>
                <button onClick={() => navigate('/register')} style={{ background: '#B91C1C', color: 'white', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins' }}>Sign Up</button>
            </nav>

            {/* Hero */}
            <section style={{ marginTop: 64, background: 'linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80) center/cover', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '60px 20px', textAlign: 'center' }}>
                <h1 style={{ color: 'white', fontSize: 48, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Discover the Best<br />Restaurants Near You</h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 36, maxWidth: 560 }}>Culinary artistry meets operational precision. Book your next unforgettable dining experience in seconds.</p>
                <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', maxWidth: 700, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1px solid #E5E7EB' }}>
                        <MapPin size={16} color="#9CA3AF" />
                        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" style={{ border: 'none', outline: 'none', padding: '14px 10px', fontSize: 14, fontFamily: 'Poppins', width: 140 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1px solid #E5E7EB', flex: 1 }}>
                        <Utensils size={16} color="#9CA3AF" />
                        <input value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="Cuisine or Restaurant" style={{ border: 'none', outline: 'none', padding: '14px 10px', fontSize: 14, fontFamily: 'Poppins', width: '100%' }} />
                    </div>
                    <button onClick={() => navigate(`/restaurants?search=${cuisine}&location=${location}`)}
                        style={{ background: '#B91C1C', color: 'white', border: 'none', padding: '0 28px', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins' }}>
                        Find a Table
                    </button>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '60px 80px', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                    {[
                        { icon: <Search size={24} />, title: 'Browse Restaurants', desc: 'Explore curated lists of the finest dining spots in your city, with real-time availability and verified reviews.' },
                        { icon: <Calendar size={24} />, title: 'Instant Bookings', desc: 'Secure your table in seconds. Get instant confirmations and easy management for all your reservations.' },
                        { icon: <Utensils size={24} />, title: 'Pre-Order Meals', desc: 'Skip the wait by pre-ordering your favorite dishes. Perfect for business lunches or time-sensitive dining.' },
                    ].map(f => (
                        <div key={f.title} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 28 }}>
                            <div style={{ background: '#FEE2E2', color: '#B91C1C', width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{f.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '60px 80px', background: '#FAF7F5' }}>
                <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 48 }}>How It Works</h2>
                <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 2, background: '#E5E7EB', zIndex: 0 }} />
                    {STEPS.map(s => (
                        <div key={s.n} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#B91C1C', color: 'white', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{s.n}</div>
                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                            <p style={{ fontSize: 13, color: '#6B7280', maxWidth: 180, margin: '0 auto' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Restaurants */}
            <section style={{ padding: '60px 80px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Popular Near You</h2>
                    <span onClick={() => navigate('/restaurants')} style={{ color: '#B91C1C', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>View All <ArrowRight size={14} /></span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                    {FEATURED.map(r => (
                        <div key={r.name} style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/restaurants')}>
                            <div style={{ position: 'relative' }}>
                                <img src={r.img} alt={r.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                <span style={{ position: 'absolute', top: 10, left: 10, background: r.isOpen ? '#16A34A' : '#DC2626', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 9999 }}>{r.isOpen ? '● Open' : '● Closed'}</span>
                            </div>
                            <div style={{ padding: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: '#6B7280' }}><Star size={12} fill="#F59E0B" color="#F59E0B" />{r.rating}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>{r.cuisine} • {r.dist}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ flex: 1, padding: '7px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>View Menu</button>
                                    <button style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 6, background: '#B91C1C', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600 }}>Book</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cuisines */}
            <section style={{ padding: '60px 80px', background: '#FAF7F5' }}>
                <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Explore by Cuisine</h2>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {CUISINES.map((c, i) => (
                        <div key={c} onClick={() => navigate(`/restaurants?cuisine=${c}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                                <img src={`https://images.unsplash.com/photo-${['1546069901-ba9599a7e63c', '1582878826629-28b7b0e4e07c', '1565299585323-38d6b0865b47', '1631452180519-927e944a09e4', '1563245372-f21724e3856d', '1563245372-f21724e3856d', '1546069901-ba9599a7e63c', '1414235077428-338989a2e8c0'][i]}?w=80&q=70`} alt={c} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{c}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '60px 80px', background: 'white' }}>
                <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, marginBottom: 36 }}>What Diners Are Saying</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                    {TESTIMONIALS.map(t => (
                        <div key={t.name} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
                            <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                                {Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                            </div>
                            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, color: '#6B7280' }}>{t.name[0]}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ margin: '0 80px 60px', background: '#C2410C', borderRadius: 16, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Are you a restaurant owner?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>List your restaurant on TableNest and reach thousands of diners every day.</p>
                </div>
                <button onClick={() => navigate('/partner/register')} style={{ background: 'white', color: '#C2410C', padding: '12px 28px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins', whiteSpace: 'nowrap' }}>
                    List Your Restaurant
                </button>
            </section>

            <Footer />
        </div>
    );
}