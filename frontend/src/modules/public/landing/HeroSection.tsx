import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Utensils, Search } from 'lucide-react';

export default function HeroSection() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [cuisine, setCuisine] = useState('');

    const handleSearch = () => {
        navigate(`/restaurants?search=${cuisine}&location=${location}`);
    };

    return (
        <>
            <style>{`
                .hero-input::placeholder { color: #94A3B8; }
                .hero-find-btn:hover { background: #EA580C !important; }

                @media (max-width: 900px) {
                    .hero-image-col { display: none !important; }
                    .hero-content-col { max-width: 100% !important; }
                }
                @media (max-width: 600px) {
                    .hero-search-wrap { flex-direction: column !important; border-radius: 12px !important; }
                    .hero-find-btn { border-radius: 10px !important; padding: 14px !important; width: 100% !important; justify-content: center !important; }
                }
            `}</style>

            <section style={{
                background: '#FFFFFF',
                paddingTop: 72,
                minHeight: 600,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{
                    maxWidth: 1280,
                    width: '100%',
                    margin: '0 auto',
                    padding: '64px 64px 76px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 48,
                    alignItems: 'center',
                }}>
                    {/* ─── LEFT CONTENT ─── */}
                    <div className="hero-content-col">
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#FFF7ED', border: '1px solid #FED7AA',
                            borderRadius: 9999, padding: '6px 16px', marginBottom: 28,
                        }}>
                            <span style={{ color: '#F97316', fontSize: 11, fontWeight: 600 }}>
                                ✦ Your table is waiting
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(40px, 5vw, 60px)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-2px',
                            color: '#0F172A',
                            marginBottom: 20,
                        }}>
                            Good food.<br />
                            Great company.<br />
                            That's <span style={{ color: '#F97316' }}>TableNest.</span>
                        </h1>

                        {/* Subtext */}
                        <p style={{
                            fontSize: 16, color: '#64748B', lineHeight: 1.7,
                            marginBottom: 36, fontWeight: 400, maxWidth: 460,
                        }}>
                            Find the best restaurants near you, book in seconds,
                            and enjoy unforgettable dining experiences.
                        </p>

                        {/* Search Bar */}
                        <div className="hero-search-wrap" style={{
                            display: 'flex',
                            background: '#FFFFFF',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: 12,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                            maxWidth: 580,
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', padding: '0 16px',
                                borderRight: '1px solid #E2E8F0', flex: 0.85,
                            }}>
                                <MapPin size={17} color="#94A3B8" style={{ flexShrink: 0 }} />
                                <input
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Location"
                                    className="hero-input"
                                    style={{
                                        border: 'none', outline: 'none',
                                        padding: '16px 10px', fontSize: 14,
                                        fontFamily: 'Poppins', width: '100%', color: '#0F172A',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', flex: 1.4 }}>
                                <Utensils size={17} color="#94A3B8" style={{ flexShrink: 0 }} />
                                <input
                                    value={cuisine}
                                    onChange={e => setCuisine(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="What are you craving?"
                                    className="hero-input"
                                    style={{
                                        border: 'none', outline: 'none',
                                        padding: '16px 10px', fontSize: 14,
                                        fontFamily: 'Poppins', width: '100%', color: '#0F172A',
                                    }}
                                />
                            </div>
                            <button
                                className="hero-find-btn"
                                onClick={handleSearch}
                                style={{
                                    background: '#F97316', color: 'white', border: 'none',
                                    padding: '0 28px', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    transition: 'background 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                                }}
                            >
                                <Search size={15} />
                                Find a Table
                            </button>
                        </div>
                    </div>

                    {/* ─── RIGHT: HERO PHOTO ─── */}
                    <div className="hero-image-col" style={{
                        position: 'relative',
                        height: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img
                            src="/src/assets/hero-photo.png"
                            alt="Hero dining scene"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 16,
                            }}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}