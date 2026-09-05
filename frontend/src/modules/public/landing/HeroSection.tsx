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
                @keyframes plateUp {
                    from { transform: translateY(60px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes foodDrop {
                    0%   { transform: translateY(-80px) scale(0.5); opacity: 0; }
                    60%  { transform: translateY(6px) scale(1.08); opacity: 1; }
                    80%  { transform: translateY(-3px) scale(0.97); }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes forkIn {
                    from { transform: translateX(80px) rotate(-20deg); opacity: 0; }
                    to   { transform: translateX(0) rotate(-20deg); opacity: 1; }
                }
                @keyframes forkEat {
                    0%   { transform: translateX(0) rotate(-20deg); }
                    25%  { transform: translateX(-18px) translateY(-22px) rotate(-30deg); }
                    50%  { transform: translateX(-10px) translateY(-10px) rotate(-25deg); }
                    75%  { transform: translateX(-18px) translateY(-22px) rotate(-30deg); }
                    100% { transform: translateX(0) rotate(-20deg); }
                }
                @keyframes steam {
                    0%   { transform: translateY(0) scaleX(1); opacity: 0.7; }
                    50%  { transform: translateY(-22px) scaleX(1.3); opacity: 0.5; }
                    100% { transform: translateY(-44px) scaleX(0.8); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-8px); }
                }
                @keyframes headBob {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    33%       { transform: translateY(-4px) rotate(-3deg); }
                    66%       { transform: translateY(-2px) rotate(2deg); }
                }
                @keyframes armEat {
                    0%   { transform: rotate(-30deg); }
                    40%  { transform: rotate(-55deg) translateY(-5px); }
                    70%  { transform: rotate(-35deg); }
                    100% { transform: rotate(-30deg); }
                }
                @keyframes chewSmile {
                    0%, 100% { transform: scaleX(1); }
                    50%       { transform: scaleX(0.85); }
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

                    {/* ─── RIGHT: ANIMATED DINING SCENE ─── */}
                    <div className="hero-image-col" style={{
                        position: 'relative',
                        height: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>

                        {/* ── PERSON (top right) ── */}
                        <div style={{
                            position: 'absolute', top: 20, right: 60,
                            animation: 'headBob 1.8s ease-in-out 4s infinite',
                        }}>
                            {/* Head */}
                            <div style={{
                                width: 54, height: 54, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FDDCB5 0%, #F5C28A 100%)',
                                border: '2.5px solid #E8A96A',
                                position: 'relative', margin: '0 auto',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}>
                                {/* Eyes */}
                                <div style={{
                                    position: 'absolute', top: 17, left: 11,
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#2D1B69',
                                    animation: 'chewSmile 1.8s ease-in-out 4s infinite',
                                }} />
                                <div style={{
                                    position: 'absolute', top: 17, right: 11,
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#2D1B69',
                                    animation: 'chewSmile 1.8s ease-in-out 4s infinite',
                                }} />
                                {/* Smile / chewing mouth */}
                                <div style={{
                                    position: 'absolute', bottom: 11, left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 20, height: 9,
                                    borderRadius: '0 0 12px 12px',
                                    background: '#C0392B',
                                    animation: 'chewSmile 1.8s ease-in-out 4s infinite',
                                }} />
                                {/* Hair */}
                                <div style={{
                                    position: 'absolute', top: -6, left: -3, right: -3,
                                    height: 22, borderRadius: '50% 50% 0 0',
                                    background: '#3D1F00',
                                }} />
                            </div>
                            {/* Body */}
                            <div style={{
                                width: 70, height: 50, background: '#F97316',
                                borderRadius: '12px 12px 0 0', margin: '0 auto',
                                position: 'relative',
                            }}>
                                {/* Right arm (holding fork) */}
                                <div style={{
                                    position: 'absolute', top: 6, left: -18,
                                    width: 50, height: 10,
                                    background: '#FDDCB5', borderRadius: 5,
                                    transformOrigin: 'right center',
                                    animation: 'armEat 1.8s ease-in-out 4s infinite',
                                }}>
                                    {/* Mini fork tip */}
                                    <div style={{
                                        position: 'absolute', left: -8, top: -4,
                                        width: 12, height: 18,
                                        borderLeft: '2.5px solid #888', borderRight: '2.5px solid #888',
                                        borderTop: '2.5px solid #888',
                                        borderRadius: '2px 2px 0 0',
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* ── TABLE SURFACE ── */}
                        <div style={{
                            position: 'absolute', bottom: 40, left: 20, right: 20,
                            height: 18, borderRadius: '9px 9px 4px 4px',
                            background: 'linear-gradient(180deg, #C8A068 0%, #A0784A 100%)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                        }} />

                        {/* ── PLATE (animates up) ── */}
                        <div style={{
                            position: 'absolute',
                            bottom: 52,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            animation: 'plateUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
                        }}>
                            {/* Outer plate shadow */}
                            <div style={{
                                width: 260, height: 260, borderRadius: '50%',
                                background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #E8E0D8)',
                                border: '3px solid #D4C8BC',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.18), inset 0 2px 8px rgba(255,255,255,0.9)',
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {/* Plate shine */}
                                <div style={{
                                    position: 'absolute', top: 20, left: 40, width: 60, height: 20,
                                    borderRadius: '50%', background: 'white', opacity: 0.5,
                                    transform: 'rotate(-25deg)',
                                    animation: 'plateShine 3s ease-in-out 2s infinite',
                                }} />

                                {/* Inner plate ring */}
                                <div style={{
                                    width: 200, height: 200, borderRadius: '50%',
                                    border: '1.5px solid rgba(0,0,0,0.06)',
                                    position: 'relative',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {/* ── STEAK (food item 1) ── */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 40, left: '50%', transform: 'translateX(-50%)',
                                        animation: 'foodDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) 1s both',
                                    }}>
                                        <div style={{
                                            width: 110, height: 70, borderRadius: '50% 45% 55% 40%',
                                            background: 'linear-gradient(135deg, #8B2500 0%, #C0392B 40%, #922B21 100%)',
                                            position: 'relative',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                        }}>
                                            {/* Grill marks */}
                                            <div style={{ position: 'absolute', top: 18, left: 15, width: 80, height: 3, background: 'rgba(0,0,0,0.25)', borderRadius: 2, transform: 'rotate(-15deg)' }} />
                                            <div style={{ position: 'absolute', top: 28, left: 15, width: 80, height: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 2, transform: 'rotate(-15deg)' }} />
                                            {/* Fat marbling */}
                                            <div style={{ position: 'absolute', top: 12, right: 20, width: 18, height: 14, borderRadius: '50%', background: 'rgba(255,220,150,0.5)' }} />
                                        </div>
                                    </div>

                                    {/* ── GREENS (food item 2) ── */}
                                    <div style={{
                                        position: 'absolute', top: 30, left: 20,
                                        animation: 'foodDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.6s both',
                                    }}>
                                        {[
                                            { w: 34, h: 22, r: '60% 40% 70% 30%', bg: '#27AE60', top: 0, left: 0, rot: '-10deg' },
                                            { w: 28, h: 18, r: '40% 60% 30% 70%', bg: '#2ECC71', top: -8, left: 18, rot: '15deg' },
                                            { w: 30, h: 20, r: '50% 50% 60% 40%', bg: '#1E8449', top: 6, left: 26, rot: '-5deg' },
                                        ].map((l, i) => (
                                            <div key={i} style={{
                                                position: 'absolute', width: l.w, height: l.h,
                                                borderRadius: l.r, background: l.bg,
                                                top: l.top, left: l.left,
                                                transform: `rotate(${l.rot})`,
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                            }} />
                                        ))}
                                    </div>

                                    {/* ── CARROTS (food item 3) ── */}
                                    <div style={{
                                        position: 'absolute', top: 28, right: 18,
                                        animation: 'foodDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) 2.1s both',
                                    }}>
                                        {[
                                            { top: 0, left: 0, rot: '20deg' },
                                            { top: 10, left: 8, rot: '-10deg' },
                                            { top: -4, left: 14, rot: '35deg' },
                                        ].map((c, i) => (
                                            <div key={i} style={{
                                                position: 'absolute', top: c.top, left: c.left,
                                                width: 32, height: 12,
                                                background: 'linear-gradient(90deg, #E67E22, #F39C12)',
                                                borderRadius: '60% 30% 30% 60%',
                                                transform: `rotate(${c.rot})`,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                            }} />
                                        ))}
                                    </div>

                                    {/* ── SAUCE DRIZZLE (food item 4) ── */}
                                    <div style={{
                                        position: 'absolute', bottom: 22, right: 30,
                                        animation: 'foodDrop 0.4s ease-out 2.6s both',
                                    }}>
                                        <svg width="60" height="30" viewBox="0 0 60 30">
                                            <path d="M5 25 Q15 5 25 20 Q35 35 45 10 Q55 -5 60 15"
                                                fill="none" stroke="#C0392B" strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeDasharray="120" strokeDashoffset="120"
                                                style={{ animation: 'sauceDrip 0.8s ease-out 2.7s forwards' }} />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── STEAM (appears after food is on plate) ── */}
                        {[
                            { left: '36%', delay: '3s', dur: '2s' },
                            { left: '48%', delay: '3.3s', dur: '2.4s' },
                            { left: '60%', delay: '3.1s', dur: '1.8s' },
                        ].map((s, i) => (
                            <div key={i} style={{
                                position: 'absolute', bottom: 280, left: s.left,
                                width: 10, height: 36,
                                borderRadius: 5,
                                background: 'rgba(200,200,200,0.35)',
                                filter: 'blur(4px)',
                                animation: `steam ${s.dur} ease-in-out ${s.delay} infinite`,
                                opacity: 0,
                            }} />
                        ))}

                        {/* ── FORK (slides in, then eating motion) ── */}
                        <div style={{
                            position: 'absolute',
                            bottom: 58,
                            right: '22%',
                            animation: 'forkIn 0.5s ease-out 2.8s both, forkEat 1.8s ease-in-out 3.8s infinite',
                            opacity: 0,
                        }}>
                            <svg width="28" height="120" viewBox="0 0 28 120">
                                {/* Handle */}
                                <rect x="11" y="60" width="6" height="56" rx="3" fill="#C0C0C0" />
                                <rect x="12" y="60" width="4" height="56" rx="2" fill="#E8E8E8" />
                                {/* Neck */}
                                <rect x="12" y="40" width="4" height="22" rx="2" fill="#C0C0C0" />
                                {/* Tines */}
                                {[4, 9, 14, 19].map((x, i) => (
                                    <rect key={i} x={x} y="14" width="3" height="28" rx="1.5" fill="#B0B0B0" />
                                ))}
                                {/* Tine connector */}
                                <rect x="4" y="38" width="19" height="3" rx="1.5" fill="#C0C0C0" />
                            </svg>
                        </div>

                        {/* ── KNIFE ── */}
                        <div style={{
                            position: 'absolute', bottom: 58, left: '24%',
                            transform: 'rotate(15deg)',
                            animation: 'plateUp 0.5s ease-out 3s both',
                            opacity: 0,
                        }}>
                            <svg width="18" height="110" viewBox="0 0 18 110">
                                <rect x="6" y="55" width="6" height="52" rx="3" fill="#C8C8C8" />
                                <rect x="7" y="55" width="4" height="52" rx="2" fill="#E0E0E0" />
                                <path d="M9 8 L14 55 L4 55 Z" fill="#D4D4D4" />
                                <path d="M9 8 L13 55 L9 55 Z" fill="#E8E8E8" />
                            </svg>
                        </div>

                        {/* ── SPARKLES ── */}
                        {[
                            { top: 60, right: 80, delay: '3.5s', size: 14 },
                            { top: 100, left: 70, delay: '4.1s', size: 10 },
                            { top: 40, left: '50%', delay: '4.5s', size: 12 },
                        ].map((sp, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                top: sp.top, right: (sp as any).right, left: (sp as any).left,
                                fontSize: sp.size,
                                animation: `sparkle 1.5s ease-in-out ${sp.delay} infinite`,
                                opacity: 0,
                            }}>
                                ✨
                            </div>
                        ))}

                        {/* ── AMBIENT PLATE GLOW ── */}
                        <div style={{
                            position: 'absolute', bottom: 20, left: '50%',
                            transform: 'translateX(-50%)',
                            width: 240, height: 30, borderRadius: '50%',
                            background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)',
                            animation: 'float 3s ease-in-out 2s infinite',
                        }} />
                    </div>
                </div>
            </section>
        </>
    );
}
