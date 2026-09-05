import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';
import LandingHeader from './landing/LandingHeader';
import LandingFooter from './landing/LandingFooter';

const CATEGORIES = [
    { id: 'general', label: 'General' },
    { id: 'customers', label: 'Customers' },
    { id: 'owners', label: 'Owners' },
    { id: 'orders', label: 'Orders & Tracking' },
    { id: 'payments', label: 'Payments' },
];

const FAQS = [
    {
        category: 'orders',
        question: 'How do I track my order?',
        answer: 'You can track your order in real-time through the \'My Orders\' section in your dashboard. Once a restaurant accepts your order, you\'ll receive live updates from preparation to delivery status.',
    },
    {
        category: 'general',
        question: 'Can I cancel a reservation?',
        answer: 'Yes. Go to My Bookings, select the reservation you wish to change, and choose Modify or Cancel. Cancellations made at least 2 hours before the reservation time are free.',
    },
    {
        category: 'payments',
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as Apple Pay, Google Pay, and loyalty point redemptions.',
    },
    {
        category: 'owners',
        question: 'How do I list my restaurant?',
        answer: 'Visit our Partner Registration page, complete the application form with your business details, and submit it for approval. Our onboarding team will reach out within 48 hours.',
    },
    {
        category: 'customers',
        question: 'Is there a loyalty program?',
        answer: 'Yes, you earn loyalty points automatically with every dining reservation or online order placed through TableNest, which can be redeemed for exclusive dining rewards.',
    },
    {
        category: 'customers',
        question: 'What if I have dietary restrictions?',
        answer: 'You can add dietary restrictions directly to your user profile or mention them while checking out or reserving a table. Restaurants will receive these details along with your ticket.',
    }
];

export default function FAQPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('general');
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [search, setSearch] = useState('');

    const displayList = search
        ? FAQS.filter(f => {
            const q = search.toLowerCase();
            return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
        })
        : FAQS.filter(f => f.category === activeCategory);

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#0F172A', minHeight: '100vh', color: 'white' }}>
            <style>{`
                .faq-cat-btn { transition: all 0.2s ease; }
                .faq-cat-btn:hover { color: #F97316 !important; border-color: rgba(249,115,22,0.5) !important; }
                .faq-item { transition: border-color 0.2s ease; }
                .faq-item:hover { border-color: rgba(249,115,22,0.3) !important; }
                .faq-contact-btn { transition: all 0.2s ease; }
                .faq-contact-btn:hover { background: #EA580C !important; transform: scale(1.03); }
                .faq-search:focus { border-color: #F97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important; outline: none; }
            `}</style>

            <LandingHeader />

            {/* ── HERO ── */}
            <section style={{
                marginTop: 72,
                position: 'relative',
                padding: '80px 24px 64px',
                textAlign: 'center',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 500, height: 350,
                    background: 'radial-gradient(ellipse, rgba(249,115,22,0.13) 0%, transparent 70%)',
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
                    textTransform: 'uppercase' as const,
                    marginBottom: 20,
                }}>
                    Help Center
                </div>

                <h1 style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 800,
                    margin: '0 auto 16px',
                    maxWidth: 600,
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                }}>
                    Frequently Asked <span style={{ color: '#F97316' }}>Questions</span>
                </h1>

                <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.6 }}>
                    Everything you need to know about dining, reservations, and management with TableNest.
                </p>

                {/* Search */}
                <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
                    <Search size={15} style={{
                        position: 'absolute', left: 16, top: '50%',
                        transform: 'translateY(-50%)', color: '#475569',
                    }} />
                    <input
                        className="faq-search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for answers..."
                        style={{
                            width: '100%',
                            padding: '13px 16px 13px 44px',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            color: 'white',
                            boxSizing: 'border-box' as const,
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                    />
                </div>
            </section>

            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>

                {/* Category Pills */}
                {!search && (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className="faq-cat-btn"
                                onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                                style={{
                                    padding: '7px 18px',
                                    border: activeCategory === cat.id
                                        ? '1px solid #F97316'
                                        : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 9999,
                                    background: activeCategory === cat.id
                                        ? 'rgba(249,115,22,0.15)'
                                        : 'transparent',
                                    color: activeCategory === cat.id ? '#F97316' : '#94A3B8',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins',
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* FAQ Accordion Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {displayList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#475569' }}>
                            <Search size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ fontSize: 14, margin: 0 }}>No results found. Try a different search term.</p>
                        </div>
                    ) : (
                        displayList.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <div
                                    key={i}
                                    className="faq-item"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: 12,
                                        border: isOpen
                                            ? '1px solid rgba(249,115,22,0.35)'
                                            : '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        style={{
                                            width: '100%',
                                            padding: '20px 24px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, fontSize: 14.5, color: isOpen ? '#F97316' : 'white' }}>
                                            {faq.question}
                                        </span>
                                        {isOpen
                                            ? <ChevronUp size={16} color="#F97316" />
                                            : <ChevronDown size={16} color="#64748B" />
                                        }
                                    </button>
                                    {isOpen && (
                                        <div style={{
                                            padding: '0 24px 20px',
                                            fontSize: 14,
                                            color: '#94A3B8',
                                            lineHeight: 1.7,
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            paddingTop: 16,
                                        }}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Contact Banner */}
                <div style={{
                    marginTop: 56,
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.08) 100%)',
                    border: '1px solid rgba(249,115,22,0.25)',
                    borderRadius: 16,
                    padding: '32px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 20,
                    flexWrap: 'wrap' as const,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 44, height: 44,
                            background: 'rgba(249,115,22,0.15)',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F97316', flexShrink: 0,
                        }}>
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Still have questions?</h3>
                            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                                Our support team is available 24/7 to help you.
                            </p>
                        </div>
                    </div>
                    <button
                        className="faq-contact-btn"
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '11px 24px',
                            background: '#F97316',
                            color: 'white',
                            border: 'none',
                            borderRadius: 9,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Poppins',
                            boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
                            whiteSpace: 'nowrap' as const,
                        }}
                    >
                        Contact Us
                    </button>
                </div>

            </div>

            <LandingFooter />
        </div>
    );
}
