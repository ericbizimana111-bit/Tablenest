import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';
import Footer from '../../shared/components/layout/Footer';
import Header from '../../shared/components/layout/Header';

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
    const [openIndex, setOpenIndex] = useState(0); // Keeping the first open by default like the image
    const [search, setSearch] = useState('');

    const filtered = FAQS.filter(f => {
        const matchCat = f.category === activeCategory;
        if (!search) return matchCat;
        const q = search.toLowerCase();
        return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });

    const allFiltered = search
        ? FAQS.filter(f => {
            const q = search.toLowerCase();
            return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
        })
        : FAQS; // Showing all questions initially or matching the layout of the screenshot

    return (

        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#FFFFFF', minHeight: '100vh' }}>
            <Header />

            {/* Hero Section */}
            <div style={{ background: '#F9F9F9', padding: '64px 24px', textAlign: 'center', color: '#0F172A', marginTop: 90 }}>
                <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>Frequently Asked Questions</h1>
                <p style={{ fontSize: 15, color: '#475569', maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.5 }}>
                    Everything you need to know about dining, reservations, and management with TableNest.
                </p>
                <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
                    <Search size={16} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for answers..."
                        style={{
                            width: '100%',
                            padding: '14px 16px 14px 48px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            outline: 'none',
                            boxSizing: 'border-box',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

                {/* Category Selection Pills */}
                {!search && (
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                                style={{
                                    padding: '8px 20px',
                                    border: 'none',
                                    borderRadius: 9999,
                                    background: activeCategory === cat.id ? '#A91D22' : '#E2E8F0',
                                    color: activeCategory === cat.id ? 'white' : '#475569',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* FAQ Accordions Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {allFiltered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                            <div style={{ fontSize: 14 }}>No results found matching your criteria.</div>
                        </div>
                    ) : (
                        allFiltered.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        background: 'white',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        overflow: 'hidden',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
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
                                        <span style={{ fontWeight: 600, fontSize: 15, color: '#0F172A' }}>
                                            {faq.question}
                                        </span>
                                        {isOpen
                                            ? <ChevronUp size={16} color="#475569" />
                                            : <ChevronDown size={16} color="#475569" />
                                        }
                                    </button>
                                    {isOpen && (
                                        <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Horizontal Contact Banner */}
                <div style={{
                    background: '#D32F2F',
                    borderRadius: 8,
                    padding: '24px 40px',
                    marginTop: 56,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white',
                    position: 'relative'
                }}>
                    <div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>Still have questions?</h3>
                        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>
                            Our support team is available 24/7 to help you with any issues or culinary inquiries you might have.
                        </p>
                    </div>
                    {/* Visual Center Icon Ornament */}
                    <div style={{ opacity: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={24} style={{ position: 'absolute', left: '49%' }} />
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '12px 28px',
                            background: 'white',
                            color: '#0F172A',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Poppins',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Contact Us
                    </button>
                </div>

                {/* Bottom Graphic Showcase Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr',
                    gap: 16,
                    marginTop: 48,
                    height: 480
                }}>
                    {/* Big left feature card */}
                    <div style={{
                        position: 'relative',
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%)'
                        }} />
                        <div style={{ position: 'absolute', bottom: 24, left: 24, color: 'white' }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '0.02em' }}>
                                Operational Excellence for Every Table
                            </p>
                        </div>
                    </div>

                    {/* Right side side-stack photos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{
                            flex: 1,
                            borderRadius: 12,
                            overflow: 'hidden',
                            backgroundImage: 'url("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=500")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                        <div style={{
                            flex: 1,
                            borderRadius: 12,
                            overflow: 'hidden',
                            backgroundImage: 'url("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=500")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
}