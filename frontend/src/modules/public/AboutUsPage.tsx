import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/layout/Header';
import Footer from '../../shared/components/layout/Footer';
import { Users, Target, Award, Globe, Utensils, Heart } from 'lucide-react';

export default function AboutPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('About Us');

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#F8FAFC' }}>

            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* HERO */}
            <section style={{
                marginTop: 70,
                padding: '100px 100px',
                textAlign: 'center',
                background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1600) center/cover'
            }}>
                <h1 style={{ color: 'white', fontSize: 48, fontWeight: 800 }}>
                    About TableNest
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 16, maxWidth: 700, marginInline: 'auto' }}>
                    We are building the future of dining — connecting people to unforgettable restaurant experiences through technology, speed, and simplicity.
                </p>
            </section>

            {/* MISSION */}
            <section style={{ padding: '80px', background: 'white', textAlign: 'center' }}>
                <h2 style={{ fontSize: 32, fontWeight: 800 }}>Our Mission</h2>
                <p style={{ maxWidth: 800, margin: '20px auto', color: '#475569', lineHeight: 1.7 }}>
                    To simplify how people discover, book, and enjoy restaurants while empowering restaurant owners with powerful digital tools to grow their business.
                </p>
            </section>

            {/* CORE VALUES */}
            <section style={{ padding: '80px', background: '#FFF7ED' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 50 }}>
                    What We Stand For
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                    {[
                        { icon: <Users />, title: 'People First', desc: 'Every feature is designed around diners and restaurant owners.' },
                        { icon: <Target />, title: 'Precision', desc: 'Fast bookings, real-time availability, zero friction.' },
                        { icon: <Globe />, title: 'Scalable Impact', desc: 'Built to support restaurants across the world.' },
                        { icon: <Utensils />, title: 'Dining Experience', desc: 'We elevate how people enjoy food.' },
                        { icon: <Award />, title: 'Quality Driven', desc: 'Only the best restaurants make it to our platform.' },
                        { icon: <Heart />, title: 'Passion', desc: 'We love food, technology, and great experiences.' },
                    ].map((v) => (
                        <div key={v.title}
                            style={{
                                background: 'white',
                                padding: 28,
                                borderRadius: 14,
                                border: '1px solid #E2E8F0'
                            }}>
                            <div style={{ color: '#F97316', marginBottom: 12 }}>{v.icon}</div>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>{v.title}</div>
                            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{v.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STORY */}
            <section style={{ padding: '80px', background: 'white' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800 }}>Our Story</h2>

                <p style={{
                    maxWidth: 900,
                    margin: '30px auto',
                    textAlign: 'center',
                    color: '#475569',
                    lineHeight: 1.8
                }}>
                    TableNest started with a simple idea: booking a restaurant should be as easy as ordering food.
                    We saw long queues, missed reservations, and outdated systems — and decided to change that.
                    Today, we’re building a platform that brings restaurants and diners together in a seamless digital experience.
                </p>
            </section>

            {/* CTA */}
            <section style={{
                margin: '0 80px 80px',
                padding: 60,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                color: 'white',
                textAlign: 'center'
            }}>
                <h3 style={{ fontSize: 26, fontWeight: 800 }}>Join the TableNest experience</h3>
                <p style={{ marginTop: 10, opacity: 0.9 }}>
                    Discover restaurants or become a partner today.
                </p>

                <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => navigate('/restaurants')}
                        style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Explore Restaurants
                    </button>

                    <button onClick={() => navigate('/partner/register')}
                        style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Become a Partner
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}