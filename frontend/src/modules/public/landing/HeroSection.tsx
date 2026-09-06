import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Utensils, Search, ArrowRight } from 'lucide-react';
import heroPhoto from '../../../assets/hero-photo.png';
import { useScrollReveal, useImageReveal } from '../../../shared/hooks/useScrollReveal';

export default function HeroSection() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [cuisine, setCuisine] = useState('');

    const sectionRef = useRef<HTMLDivElement>(null);
    const heroImgRef = useRef<HTMLDivElement>(null);
    const graphicRingRef = useRef<HTMLDivElement>(null);

    useScrollReveal(sectionRef, 'reveal');
    useImageReveal(heroImgRef);

    useEffect(() => {
        if (!graphicRingRef.current) return;
        const el = graphicRingRef.current;
        // Slight delayed gentle float start after entrance
        const onEnter = () => {
            requestAnimationFrame(() => {
                el.classList.add('float-slow');
            });
        };
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { onEnter(); observer.disconnect(); } },
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleSearch = () => {
        navigate(`/restaurants?search=${cuisine}&location=${location}`);
    };

    return (
        <>
            <style>{`
                .hero-input::placeholder { color: #94A3B8; }
                .hero-find-btn:hover { background: #EA580C !important; }
                .hero-action-btn:hover { transform: translateY(-2px); }

                @media (max-width: 960px) {
                    .hero-image-col { display: none !important; }
                    .hero-content-col { max-width: 100% !important; }
                }
                @media (max-width: 600px) {
                    .hero-search-wrap { flex-direction: column !important; border-radius: 12px !important; }
                    .hero-find-btn { border-radius: 10px !important; padding: 14px !important; width: 100% !important; justify-content: center !important; }
                    .hero-action-btns { flex-direction: column !important; width: 100% !important; }
                    .hero-action-btns button { width: 100% !important; justify-content: center !important; }
                }
            `}</style>

            <section style={{
                background: '#FFFFFF',
                paddingTop: 88,
                paddingBottom: 48,
                minHeight: 580,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div
                    ref={sectionRef}
                    style={{
                        maxWidth: 1280,
                        width: '100%',
                        margin: '0 auto',
                        padding: '48px 40px 32px',
                        display: 'grid',
                        gridTemplateColumns: '1.15fr 0.85fr',
                        gap: 48,
                        alignItems: 'center',
                    }}
                >
                    {/* ─── LEFT CONTENT ─── */}
                    <div className="hero-content-col stagger">
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#FFF7ED',
                            border: '1px solid #FED7AA',
                            borderRadius: 9999,
                            padding: '6px 16px',
                            marginBottom: 24,
                        }}>
                            <span style={{ color: '#F97316', fontSize: 11.5, fontWeight: 700 }}>
                                ✦ Your table is waiting
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(38px, 4.8vw, 58px)',
                            fontWeight: 800,
                            lineHeight: 1.12,
                            letterSpacing: '-1.8px',
                            color: '#0F172A',
                            marginBottom: 18,
                        }}>
                            Good food.<br />
                            Great company.<br />
                            That's <span style={{ color: '#F97316' }}>TableNest.</span>
                        </h1>

                        {/* Subtext */}
                        <p style={{
                            fontSize: 16,
                            color: '#64748B',
                            lineHeight: 1.7,
                            marginBottom: 32,
                            fontWeight: 400,
                            maxWidth: 500,
                        }}>
                            Find the best restaurants near you, book in seconds, and enjoy unforgettable dining experiences.
                        </p>

                        {/* Action Buttons: Get Started & Book Restaurants */}
                        <div className="hero-action-btns" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 30,
                        }}>
                            <button
                                className="hero-action-btn"
                                onClick={() => navigate('/register')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    background: '#F97316',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '13px 24px',
                                    borderRadius: 10,
                                    fontSize: 14.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Get Started
                                <ArrowRight size={16} />
                            </button>

                            <button
                                className="hero-action-btn"
                                onClick={() => navigate('/partner/register')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    background: '#FFF7ED',
                                    color: '#F97316',
                                    border: '1.5px solid #FED7AA',
                                    padding: '13px 24px',
                                    borderRadius: 10,
                                    fontSize: 14.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                }}
                            >
                                List Your Restaurant
                            </button>
                        </div>

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
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 16px',
                                borderRight: '1px solid #E2E8F0',
                                flex: 0.9,
                            }}>
                                <MapPin size={17} color="#94A3B8" style={{ flexShrink: 0 }} />
                                <input
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Location"
                                    className="hero-input"
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        padding: '15px 10px',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        width: '100%',
                                        color: '#0F172A',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', flex: 1.3 }}>
                                <Utensils size={17} color="#94A3B8" style={{ flexShrink: 0 }} />
                                <input
                                    value={cuisine}
                                    onChange={e => setCuisine(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="What are you craving?"
                                    className="hero-input"
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        padding: '15px 10px',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        width: '100%',
                                        color: '#0F172A',
                                    }}
                                />
                            </div>
                            <button
                                className="btn-press hero-find-btn"
                                onClick={handleSearch}
                                style={{
                                    background: '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0 26px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    fontFamily: 'Poppins',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                className="btn-press",
                                transition: 'background 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div
                            ref={graphicRingRef}
                            style={{
                                width: '100%',
                                maxWidth: 460,
                                height: 460,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #FFF7ED 0%, #FED7AA 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 24,
                                boxShadow: '0 20px 40px rgba(249, 115, 22, 0.12)',
                                willChange: 'transform',
                            }}
                        >
                            <img
                                ref={heroImgRef}
                                src={heroPhoto}
                                alt="Delicious gourmet salad bowl"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.15))',
                                    willChange: 'transform, opacity',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}