import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './landing/LandingHeader';
import LandingFooter from './landing/LandingFooter';
import { Users, Target, Award, Globe, Utensils, Heart } from 'lucide-react';

const VALUES = [
    { icon: <Users size={22} />, title: 'People First', desc: 'Every feature is designed around diners and restaurant owners.' },
    { icon: <Target size={22} />, title: 'Precision', desc: 'Fast bookings, real-time availability, zero friction.' },
    { icon: <Globe size={22} />, title: 'Scalable Impact', desc: 'Built to support restaurants across the world.' },
    { icon: <Utensils size={22} />, title: 'Dining Experience', desc: 'We elevate how people enjoy food.' },
    { icon: <Award size={22} />, title: 'Quality Driven', desc: 'Only the best restaurants make it to our platform.' },
    { icon: <Heart size={22} />, title: 'Passion', desc: 'We love food, technology, and great experiences.' },
];

const STATS = [
    { value: '500+', label: 'Restaurants' },
    { value: '50K+', label: 'Happy Diners' },
    { value: '12', label: 'Cities' },
    { value: '4.9★', label: 'Avg. Rating' },
];

export default function AboutPage() {
    const navigate = useNavigate();
    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#FFFFFF', minHeight: '100vh', color: '#0F172A' }}>
            <LandingHeader />

            <style>{`
                .about-val-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
                .about-val-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(249,115,22,0.12) !important; }
                .about-cta-btn { transition: all 0.2s ease; }
                .about-cta-btn:hover { background: #EA580C !important; transform: scale(1.03); }
                .about-outline-btn { transition: all 0.2s ease; }
                .about-outline-btn:hover { background: rgba(249,115,22,0.12) !important; border-color: #F97316 !important; }
            `}</style>

            {/* ── HERO ── */}
            <section style={{
                marginTop: 72,
                position: 'relative',
                padding: '100px 24px 80px',
                textAlign: 'center',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 600, height: 400,
                    background: 'radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    borderRadius: 9999,
                    padding: '6px 18px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FB923C',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 24,
                }}>
                    Our Story
                </div>
                <h1 style={{
                    fontSize: 'clamp(36px, 5vw, 56px)',
                    fontWeight: 800,
                    margin: '0 auto 20px',
                    maxWidth: 700,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                }}>
                    Redefining How the World <span style={{ color: '#F97316' }}>Dines Out</span>
                </h1>
                <p style={{ color: '#475569', fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                    TableNest connects people to unforgettable restaurant experiences through technology, speed, and simplicity.
                </p>
            </section>

            {/* ── STATS BAR ── */}
            <section style={{ padding: '0 24px 72px' }}>
                <div style={{
                    maxWidth: 800,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    background: '#F8FAFC',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                }}>
                    {STATS.map((s, i) => (
                        <div key={i} style={{
                            padding: '32px 20px',
                            textAlign: 'center',
                            borderRight: i < STATS.length - 1 ? '1px solid #E2E8F0' : 'none',
                        }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#F97316', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, fontWeight: 500, letterSpacing: '0.02em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── MISSION ── */}
            <section style={{
                padding: '72px 24px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
                textAlign: 'center',
            }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <div style={{ width: 40, height: 3, background: '#F97316', borderRadius: 2, margin: '0 auto 28px' }} />
                    <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em' }}>Our Mission</h2>
                    <p style={{ color: '#475569', lineHeight: 1.8, fontSize: 15 }}>
                        To simplify how people discover, book, and enjoy restaurants — while empowering restaurant owners
                        with powerful digital tools to grow their business. We believe great dining should be effortless from search to seat.
                    </p>
                </div>
            </section>

            {/* ── CORE VALUES ── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: 960, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>
                        What We Stand For
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748B', fontSize: 14, marginBottom: 48 }}>
                        The principles that guide everything we build.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                        {VALUES.map((v) => (
                            <div key={v.title} className="about-val-card" style={{
                                background: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: 14,
                                padding: '28px 24px',
                            }}>
                                <div style={{
                                    width: 44, height: 44,
                                    background: 'rgba(249,115,22,0.12)',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#F97316', marginBottom: 16,
                                }}>
                                    {v.icon}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{v.title}</div>
                                <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.65 }}>{v.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUR STORY ── */}
            <section style={{
                padding: '72px 24px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
            }}>
                <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 3, background: '#F97316', borderRadius: 2, margin: '0 auto 28px' }} />
                    <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em' }}>Our Story</h2>
                    <p style={{ color: '#475569', lineHeight: 1.85, fontSize: 15 }}>
                        TableNest started with a simple idea: booking a restaurant should be as easy as ordering food.
                        We saw long queues, missed reservations, and outdated systems — and decided to change that.
                        Today, we're building a platform that brings restaurants and diners together in a seamless digital experience.
                    </p>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{
                    maxWidth: 700,
                    margin: '0 auto',
                    background: '#FFF7ED',
                    border: '1px solid rgba(249,115,22,0.2)',
                    borderRadius: 20,
                    padding: '56px 40px',
                    textAlign: 'center',
                }}>
                    <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.01em' }}>
                        Join the TableNest Experience
                    </h3>
                    <p style={{ color: '#64748B', marginBottom: 32, fontSize: 14 }}>
                        Discover restaurants or become a partner today.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="about-cta-btn" onClick={() => navigate('/restaurants')} style={{
                            padding: '11px 28px', borderRadius: 9, border: 'none',
                            background: '#F97316', color: 'white', cursor: 'pointer',
                            fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                        }}>
                            Explore Restaurants
                        </button>
                        <button className="about-outline-btn" onClick={() => navigate('/partner/register')} style={{
                            padding: '11px 28px', borderRadius: 9,
                            border: '1.5px solid #E2E8F0',
                            background: 'white', color: '#475569',
                            cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                        }}>
                            Become a Partner
                        </button>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}