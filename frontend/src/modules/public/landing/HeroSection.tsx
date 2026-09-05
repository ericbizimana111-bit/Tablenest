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

                /* ── Dining scene animations ── */
                /* Entrance: plate rises with an overshoot + a soft landing squash */
                @keyframes plateUp {
                    0%   { transform: translateY(70px) scale(0.92); opacity: 0; }
                    55%  { transform: translateY(-9px) scale(1.015); opacity: 1; }
                    72%  { transform: translateY(5px) scale(1.02, 0.97); }yy
                    86%  { transform: translateY(-2px) scale(0.99, 1.01); }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }

                /* Food falls under something like gravity, then squashes/rebounds on impact */
                @keyframes foodDrop {
                    0%   { transform: translateY(-90px) scale(0.55) rotate(-6deg); opacity: 0; }
                    50%  { transform: translateY(-14px) scale(0.85) rotate(-3deg); opacity: 1; }
                    64%  { transform: translateY(5px) scale(1.08, 0.9) rotate(0deg); }
                    78%  { transform: translateY(-4px) scale(0.96, 1.05) rotate(0deg); }
                    90%  { transform: translateY(1px) scale(1.02, 0.99) rotate(0deg); }
                    100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
                }

                @keyframes forkIn {
                    0%   { transform: translateX(90px) rotate(-8deg); opacity: 0; }
                    70%  { transform: translateX(-6px) rotate(-17deg); opacity: 1; }
                    100% { transform: translateX(0) rotate(-15deg); opacity: 1; }
                }

                /* Fork scoops down, lifts to mouth, pauses for a bite, then eases back */
                @keyframes forkEat {
                    0%   { transform: translate(0, 0) rotate(-15deg); }
                    15%  { transform: translate(-5px, 7px) rotate(-6deg); }
                    32%  { transform: translate(-11px, -3px) rotate(-11deg); }
                    46%  { transform: translate(-27px, -35px) rotate(-29deg); }
                    58%  { transform: translate(-25px, -37px) rotate(-31deg); }
                    72%  { transform: translate(-13px, -17px) rotate(-21deg); }
                    100% { transform: translate(0, 0) rotate(-15deg); }
                }

                /* Steam drifts with a gentle side-to-side wobble, like real convection */
                @keyframes steam {
                    0%   { transform: translate(0, 0) scale(0.55) rotate(0deg); opacity: 0; }
                    18%  { opacity: 0.5; }
                    40%  { transform: translate(-7px, -18px) scale(0.9) rotate(-5deg); opacity: 0.55; }
                    62%  { transform: translate(6px, -31px) scale(1.15) rotate(4deg); opacity: 0.32; }
                    85%  { transform: translate(-4px, -44px) scale(1.35) rotate(-3deg); opacity: 0.12; }
                    100% { transform: translate(3px, -56px) scale(1.55) rotate(2deg); opacity: 0; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-8px); }
                }

                /* Head nods along with the bite, not just a generic bob */
                @keyframes headBob {
                    0%   { transform: translateY(0) rotate(0deg); }
                    46%  { transform: translateY(-3px) rotate(-4deg); }
                    58%  { transform: translateY(-2px) rotate(-3deg); }
                    72%  { transform: translateY(1px) rotate(2deg); }
                    100% { transform: translateY(0) rotate(0deg); }
                }

                /* Arm follows the same scoop-lift-bite arc as the fork it's holding */
                @keyframes armEat {
                    0%   { transform: rotate(-30deg) translateY(0); }
                    15%  { transform: rotate(-24deg) translateY(3px); }
                    46%  { transform: rotate(-58deg) translateY(-10px); }
                    58%  { transform: rotate(-60deg) translateY(-11px); }
                    72%  { transform: rotate(-41deg) translateY(-4px); }
                    100% { transform: rotate(-30deg) translateY(0); }
                }

                /* Mouth opens for the bite, then chews, independent of blinking */
                @keyframes chewSmile {
                    0%   { transform: scaleY(1) scaleX(1); }
                    50%  { transform: scaleY(1) scaleX(1); }
                    58%  { transform: scaleY(0.55) scaleX(1.15); }
                    67%  { transform: scaleY(1.1) scaleX(0.9); }
                    78%  { transform: scaleY(0.9) scaleX(1.05); }
                    88%  { transform: scaleY(1) scaleX(1); }
                    100% { transform: scaleY(1) scaleX(1); }
                }

                /* Eyes blink on their own clock so the face reads as alive, not looping mechanically */
                @keyframes blink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    94%            { transform: scaleY(0.1); }
                    97%            { transform: scaleY(1); }
                }

                @keyframes plateShine {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.8; }
                }
                @keyframes sauceDrip {
                    from { stroke-dashoffset: 120; opacity: 0; }
                    to   { stroke-dashoffset: 0; opacity: 1; }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50%       { opacity: 1; transform: scale(1.2); }
                }
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
                    padding: '64px 64px 56px',
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
                                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                            }}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}