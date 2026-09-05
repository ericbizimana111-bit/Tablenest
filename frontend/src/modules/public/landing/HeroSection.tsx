import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Utensils, Search } from 'lucide-react';

export default function HeroSection() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [cuisine, setCuisine] = useState('');

    return (
        <>
            <style>{`
                .hero-input::placeholder { color: #94A3B8; }
                @media (max-width: 768px) {
                    .hero-search-bar { flex-direction: column !important; gap: 0 !important; }
                    .hero-search-bar > div { border-right: none !important; border-bottom: 1px solid #E2E8F0 !important; }
                    .hero-search-bar > div:last-of-type { border-bottom: none !important; }
                    .hero-search-btn { width: 100% !important; padding: 14px !important; border-radius: 0 0 10px 10px !important; }
                }
            `}</style>

            <section style={{
                position: 'relative', minHeight: 580, display: 'flex', alignItems: 'center',
                background: '#0F172A', overflow: 'hidden',
            }}>
                {/* Background food image on the right */}
                <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: '55%',
                    backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, #0F172A 0%, #0F172A 25%, rgba(15,23,42,0.7) 50%, transparent 100%)',
                    }} />
                </div>

                {/* Dark overlay on right image for blending */}
                <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: '55%',
                    background: 'rgba(15,23,42,0.15)',
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative', zIndex: 2, maxWidth: 1280, width: '100%',
                    margin: '0 auto', padding: '100px 48px 60px', display: 'flex',
                    flexDirection: 'column', alignItems: 'flex-start',
                }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                        borderRadius: 9999, padding: '6px 16px', marginBottom: 24,
                    }}>
                        <span style={{ fontSize: 12, color: '#F97316', fontWeight: 600 }}>
                            ✦ Great Food, Great Moments
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 52, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1.5px',
                        color: 'white', marginBottom: 20, maxWidth: 520,
                    }}>
                        Your Table.<br />
                        Your Taste.<br />
                        <span style={{ color: '#F97316' }}>Your Moment.</span>
                    </h1>

                    {/* Description */}
                    <p style={{
                        fontSize: 16, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36,
                        maxWidth: 480, fontWeight: 300,
                    }}>
                        Discover the best restaurants, book your table instantly,
                        pre-order your favorite meals, and enjoy unforgettable dining experiences.
                    </p>

                    {/* Search Bar */}
                    <div className="hero-search-bar" style={{
                        display: 'flex', background: 'white', borderRadius: 12,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden',
                        width: '100%', maxWidth: 640, padding: 5,
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', padding: '0 16px',
                            borderRight: '1px solid #E2E8F0', flex: 0.7,
                        }}>
                            <MapPin size={18} color="#94A3B8" />
                            <input
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="Location"
                                className="hero-input"
                                style={{
                                    border: 'none', outline: 'none', padding: '13px 10px',
                                    fontSize: 14, fontFamily: 'Poppins', width: '100%',
                                }}
                            />
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', padding: '0 16px', flex: 1.2,
                        }}>
                            <Utensils size={18} color="#94A3B8" />
                            <input
                                value={cuisine}
                                onChange={e => setCuisine(e.target.value)}
                                placeholder="What are you craving?"
                                className="hero-input"
                                style={{
                                    border: 'none', outline: 'none', padding: '13px 10px',
                                    fontSize: 14, fontFamily: 'Poppins', width: '100%',
                                }}
                            />
                        </div>
                        <button
                            className="hero-search-btn"
                            onClick={() => navigate(`/restaurants?search=${cuisine}&location=${location}`)}
                            style={{
                                background: '#F97316', color: 'white', border: 'none',
                                padding: '0 28px', borderRadius: 10, cursor: 'pointer',
                                fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                                display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'background 0.2s', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#EA580C'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F97316'}
                        >
                            <Search size={16} />
                            Find a Table
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
