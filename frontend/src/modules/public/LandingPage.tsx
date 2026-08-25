import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI } from '../../shared/services/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Utensils, Calendar, Search, Star, ArrowRight } from 'lucide-react';
import Header from '../../shared/components/layout/Header'; // Adjust this import path to match your folder setup
import Footer from '../../shared/components/layout/Footer';

const CUISINE_DATA = [
    { name: 'Healthy', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&q=80' },
    { name: 'Italian', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=150&q=80' },
    { name: 'Japanese', img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=150&q=80' },
    { name: 'Mexican', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&q=80' },
    { name: 'American', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&q=80' },
    { name: 'Chinese', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=150&q=80' },
    { name: 'Indian', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80' },
    { name: 'French', img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=150&q=80' }
];

const STEPS = [
    { n: '01', title: 'Find Your Spot', desc: 'Search by cuisine, location, or atmosphere.' },
    { n: '02', title: 'Pick Your Time', desc: 'Select an available slot that fits your schedule.' },
    { n: '03', title: 'Enjoy Your Meal', desc: 'Arrive and be seated immediately for a VIP experience.' },
];

const TESTIMONIALS = [
    { text: 'TableNest has completely changed how we dine out. The booking process is seamless.', name: 'Sarah Jenkins', role: 'Food Critic', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    { text: 'I love the order ahead feature. It saves so much time during lunch hours.', name: 'David Chen', role: 'Busy Professional', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
    { text: 'The only app I use for dinner plans now. Reliable, fast, and the interface is beautiful.', name: 'Emily Rodriguez', role: 'Local Guide', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [activeTab, setActiveTab] = useState('Home');

    const { data: featuredData } = useQuery({
        queryKey: ['featured-restaurants'],
        queryFn: () => restaurantsAPI.getPublic({ limit: 8 }).then(r => r.data),
    });
    const featuredRestaurants = featuredData?.restaurants || [];

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#FAFAFA', overflowX: 'hidden' }}>
            {/* Page-Specific Animations */}
            <style>{`
                @keyframes fadeRainIn {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-rain-fade {
                    animation: fadeRainIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .hover-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
                    border-color: #FCA5A5 !important;
                }
                .btn-outline-hover {
                    transition: all 0.2s ease;
                }
                .btn-outline-hover:hover {
                    background: #FEF2F2 !important;
                    border-color: #B91C1C !important;
                    color: #B91C1C !important;
                }
                .cuisine-track {
                    display: flex;
                    gap: 48px;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .cuisine-track:hover {
                    animation-play-state: paused;
                }
                .cuisine-item {
                    transition: all 0.3s ease;
                }
                .cuisine-item:hover {
                    transform: translateY(-4px);
                }
                .cuisine-item:hover div {
                    border-color: #B91C1C !important;
                    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.2) !important;
                }
                .partner-btn {
                    background: white;
                    color: #C2410C;
                    padding: 14px 32px;
                    border-radius: 10px;
                    border: 2px solid white;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 14px;
                    font-family: 'Poppins';
                    white-space: nowrap;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .partner-btn:hover {
                    background: #B91C1C !important;
                    color: white !important;
                    border-color: #B91C1C !important;
                    transform: scale(1.03);
                }
            `}</style>

            {/* Global Reusable Navigation Header */}
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Hero Section */}
            <section className="animate-rain-fade" style={{ marginTop: 75, background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80) center/cover no-repeat', minHeight: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '60px 20px', textAlign: 'center' }}>
                <h1 style={{ color: 'white', fontSize: 52, fontWeight: 800, marginBottom: 18, lineHeight: 1.15, letterSpacing: '-1px' }}>Discover the Best<br />Restaurants Near You</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 17, marginBottom: 40, maxWidth: 580, fontWeight: 300, lineHeight: 1.6 }}>Culinary artistry meets operational precision. Book your next unforgettable dining experience in seconds.</p>
                <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', maxWidth: 720, width: '100%', padding: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1px solid #E5E7EB', flex: 0.8 }}>
                        <MapPin size={18} color="#9CA3AF" />
                        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" style={{ border: 'none', outline: 'none', padding: '14px 10px', fontSize: 14, fontFamily: 'Poppins', width: '100%' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', flex: 1.2 }}>
                        <Utensils size={18} color="#9CA3AF" />
                        <input value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="Cuisine or Restaurant" style={{ border: 'none', outline: 'none', padding: '14px 10px', fontSize: 14, fontFamily: 'Poppins', width: '100%' }} />
                    </div>

                    <button onClick={() => navigate(`/restaurants?search=${cuisine}&location=${location}`)} className="btn-hover"
                        style={{ background: '#B91C1C', color: 'white', border: 'none', padding: '0 32px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins' }}>
                        Find a Table
                    </button>
                </div>
            </section>

            {/* Features Component */}
            <section className="animate-rain-fade" style={{ padding: '80px 80px', background: 'white', animationDelay: '0.1s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
                    {[
                        { icon: <Search size={24} />, title: 'Browse Restaurants', desc: 'Explore curated lists of the finest dining spots in your city, with real-time availability and verified reviews.' },
                        { icon: <Calendar size={24} />, title: 'Instant Bookings', desc: 'Secure your table in seconds. Get instant confirmations and easy management for all your reservations.' },
                        { icon: <Utensils size={24} />, title: 'Pre-Order Meals', desc: 'Skip the wait by pre-ordering your favorite dishes. Perfect for business lunches or time-sensitive dining.' },
                    ].map(f => (
                        <div key={f.title} className="hover-card" style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 32, background: '#FFF' }}>
                            <div style={{ background: '#FEE2E2', color: '#B91C1C', width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{f.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#111827' }}>{f.title}</div>
                            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            

            {/* How It Works */}
            <section className="animate-rain-fade" style={{ padding: '80px 80px', background: '#F9F6F4', animationDelay: '0.2s' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 60, color: '#111827', letterSpacing: '-0.5px' }}>How It Works</h2>
                <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 2, background: '#E5E7EB', zIndex: 0 }} />
                    {STEPS.map(s => (
                        <div key={s.n} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#B91C1C', color: 'white', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 10px rgba(185, 28, 28, 0.25)' }}>{s.n}</div>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#111827' }}>{s.title}</div>
                            <p style={{ fontSize: 14, color: '#4B5563', maxWidth: 220, margin: '0 auto', lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>



            {/* Featured Restaurants */}
            <section className="animate-rain-fade" style={{ padding: '80px 80px', background: 'white', animationDelay: '0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Popular Near You</h2>
                    <span onClick={() => navigate('/restaurants')} className="nav-link" style={{ color: '#B91C1C', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>View All <ArrowRight size={16} /></span>
                </div>





                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
                    {(featuredRestaurants || []).map((r: any) => (
                        <div key={r.name} className="hover-card" style={{ border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => navigate('/restaurants/booking')}>
                            <div style={{ position: 'relative' }}>

                                <img src={r.images?.[0] || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80"} alt={r.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                                <span style={{ position: 'absolute', top: 12, left: 12, background: r.status === 'active' ? '#10B981' : '#EF4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 8 }}>●</span> {r.status === 'active' ? 'Open' : 'Closed'}
                                </span>
                            </div>
                            <div style={{ padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{r.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#4B5563', fontWeight: 500 }}><Star size={14} fill="#F59E0B" color="#F59E0B" />{r.rating}</span>
                                </div>
                                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{r.cuisineType || "Various"} • {r.dist}</div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn-outline-hover" style={{ flex: 1, padding: "9px", border: "1px solid #E5E7EB", borderRadius: 8, background: "white", fontSize: 13, cursor: "pointer", fontFamily: "Poppins", fontWeight: 600, color: "#4B5563" }} onClick={(e) => { e.stopPropagation(); navigate("/restaurants/" + r._id); }}>View Menu</button>
                                    <button className="btn-hover" style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, background: "#B91C1C", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "Poppins", fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); navigate("/restaurants/" + r._id); }}>Book</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>






            </section>

            {/* Cuisines Infinite Moving Carousel */}
            <section className="animate-rain-fade" style={{ padding: '60px 0', background: '#F9F6F4', animationDelay: '0.4s', overflow: 'hidden' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 44, color: '#111827', letterSpacing: '-0.5px' }}>Explore by Cuisine</h2>
                <div style={{ width: '100%', overflow: 'hidden', padding: '10px 0' }}>
                    <div className="cuisine-track">
                        {[...CUISINE_DATA, ...CUISINE_DATA].map((c, i) => (
                            <div key={`${c.name}-${i}`} onClick={() => navigate(`/restaurants?cuisine=${c.name}`)} className="cuisine-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', width: 100 }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
                                    <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="animate-rain-fade" style={{ padding: '80px 80px', background: '#FAFAFA', animationDelay: '0.5s' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48, color: '#111827', letterSpacing: '-0.5px' }}>What Diners Are Saying</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
                    {TESTIMONIALS.map(t => (
                        <div key={t.name} className="hover-card" style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: '32px 32px 28px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#B91C1C', borderRadius: '16px 0 0 16px' }} />
                            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 400, margin: '0 0 24px 8px' }}>"{t.text}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={t.img} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FEE2E2' }} />
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                                    <div style={{ fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner Section */}
            <section className="animate-rain-fade" style={{ margin: '0 80px 80px', background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)', borderRadius: 20, padding: '50px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(194, 65, 12, 0.25)', animationDelay: '0.6s' }}>
                <div>
                    <h3 style={{ color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' }}>Are you a restaurant owner?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0, fontWeight: 300 }}>List your restaurant on TableNest and reach thousands of diners every day.</p>
                </div>
                <button onClick={() => navigate('/partner/register')} className="partner-btn">
                    List Your Restaurant
                </button>
            </section>

            <Footer />
        </div>
    );
}