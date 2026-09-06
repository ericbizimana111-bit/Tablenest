export default function WhatWeOffer() {
    return (
        <>
            <style>{`
                .offer-item-card {
                    text-align: center;
                    padding: 20px;
                    transition: all 0.3s ease;
                }
                .offer-item-card:hover .offer-illustration-box {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 32px rgba(249, 115, 22, 0.12);
                }
                @media (max-width: 900px) {
                    .what-we-offer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 36px !important;
                    }
                }
            `}</style>

            <section style={{
                background: '#FFFFFF',
                padding: '90px 0 100px',
                width: '100%',
                position: 'relative',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div style={{
                            display: 'inline-block',
                            color: '#F97316',
                            fontSize: 12.5,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 10,
                        }}>
                            WHAT WE OFFER
                        </div>

                        <h2 style={{
                            fontSize: 'clamp(28px, 3.4vw, 42px)',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.8px',
                            lineHeight: 1.2,
                        }}>
                            Discover. Reserve. Dine.
                        </h2>
                    </div>

                    {/* 3 Pillars Grid */}
                    <div className="what-we-offer-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 36,
                    }}>
                        {/* 1. Easy To Order */}
                        <div className="offer-item-card">
                            <div
                                className="offer-illustration-box"
                                style={{
                                    width: '100%',
                                    height: 220,
                                    borderRadius: 20,
                                    background: '#FFF7ED',
                                    border: '1.5px solid #FED7AA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 24,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
                                    {/* Desk/computer & customer ordering SVG illustration */}
                                    <rect x="30" y="145" width="140" height="8" rx="4" fill="#E2E8F0" />
                                    <rect x="50" y="70" width="80" height="60" rx="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
                                    <rect x="58" y="78" width="64" height="44" rx="4" fill="#FFEDD5" />
                                    <path d="M75 90h30M75 98h20M75 106h14" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
                                    <rect x="85" y="130" width="10" height="15" fill="#94A3B8" />
                                    <rect x="75" y="143" width="30" height="3" rx="1.5" fill="#64748B" />
                                    {/* Floating food cart badge */}
                                    <circle cx="145" cy="65" r="24" fill="#F97316" />
                                    <path d="M138 65h14M145 58v14" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                                    {/* Cute burger item */}
                                    <circle cx="45" cy="55" r="16" fill="#FED7AA" />
                                    <path d="M37 54h16M37 57h16" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>

                            <h3 style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 10,
                                letterSpacing: '-0.3px',
                            }}>
                                Discover & Order
                            </h3>

                            <p style={{
                                fontSize: 14,
                                color: '#64748B',
                                lineHeight: 1.65,
                                maxWidth: 300,
                                margin: '0 auto',
                            }}>
                                Browse restaurants, explore menus, and order in a few taps — everything you need is in one place.
                            </p>
                        </div>

                        {/* 2. Fastest Delivery */}
                        <div className="offer-item-card">
                            <div
                                className="offer-illustration-box"
                                style={{
                                    width: '100%',
                                    height: 220,
                                    borderRadius: 20,
                                    background: '#FFF7ED',
                                    border: '1.5px solid #FED7AA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 24,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
                                    {/* Doorway & drone delivery SVG */}
                                    <rect x="65" y="55" width="70" height="105" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
                                    <rect x="75" y="65" width="50" height="40" rx="4" fill="#FFEDD5" />
                                    <circle cx="120" cy="115" r="4" fill="#F97316" />
                                    {/* Door plant decorations */}
                                    <rect x="42" y="125" width="16" height="25" rx="3" fill="#64748B" />
                                    <circle cx="50" cy="118" r="14" fill="#FDBA74" />
                                    <rect x="142" y="125" width="16" height="25" rx="3" fill="#64748B" />
                                    <circle cx="150" cy="118" r="14" fill="#FDBA74" />
                                    {/* Delivery box with wings/drone */}
                                    <rect x="80" y="28" width="40" height="26" rx="4" fill="#F97316" />
                                    <path d="M80 38h40M100 28v26" stroke="#FFFFFF" strokeWidth="2" />
                                    <path d="M60 25c10 5 15 5 20 5M120 30c5 0 10 0 20-5" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                                    <circle cx="60" cy="25" r="3" fill="#EA580C" />
                                    <circle cx="140" cy="25" r="3" fill="#EA580C" />
                                </svg>
                            </div>

                            <h3 style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 10,
                                letterSpacing: '-0.3px',
                            }}>
                                Reserve in Seconds
                            </h3>

                            <p style={{
                                fontSize: 14,
                                color: '#64748B',
                                lineHeight: 1.65,
                                maxWidth: 300,
                                margin: '0 auto',
                            }}>
                                Book a table without the back-and-forth. Pick a time, confirm, and show up when you mean to.
                            </p>
                        </div>

                        {/* 3. Best Quality */}
                        <div className="offer-item-card">
                            <div
                                className="offer-illustration-box"
                                style={{
                                    width: '100%',
                                    height: 220,
                                    borderRadius: 20,
                                    background: '#FFF7ED',
                                    border: '1.5px solid #FED7AA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 24,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
                                    {/* Quality Clock & Chef running with parcel SVG */}
                                    <circle cx="135" cy="95" r="45" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
                                    <circle cx="135" cy="95" r="38" fill="#FFEDD5" />
                                    <path d="M135 70v25l16 12" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="135" cy="50" r="4" fill="#0F172A" />
                                    {/* Chef/courier running figure */}
                                    <circle cx="65" cy="70" r="14" fill="#FED7AA" />
                                    <path d="M60 62c0-8 10-8 10 0" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
                                    <path d="M65 84v30l-14 18M65 98l18 16" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M50 95h30" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                                    {/* Fresh food package */}
                                    <rect x="75" y="80" width="22" height="22" rx="3" fill="#F97316" />
                                    <path d="M75 90h22" stroke="#FFFFFF" strokeWidth="1.5" />
                                    <circle cx="40" cy="135" r="3" fill="#EA580C" />
                                    <circle cx="48" cy="142" r="2" fill="#EA580C" />
                                </svg>
                            </div>

                            <h3 style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 10,
                                letterSpacing: '-0.3px',
                            }}>
                                Dine with Confidence
                            </h3>

                            <p style={{
                                fontSize: 14,
                                color: '#64748B',
                                lineHeight: 1.65,
                                maxWidth: 300,
                                margin: '0 auto',
                            }}>
                                Real reviews, clear pricing, and reliable restaurants — so the experience matches what you expected.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
