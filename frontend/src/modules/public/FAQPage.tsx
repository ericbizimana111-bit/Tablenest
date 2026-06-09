import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, HelpCircle, Utensils, CreditCard, Calendar, Truck, Star } from 'lucide-react';
import Footer from '../../shared/components/layout/Footer';

const CATEGORIES = [
    { id: 'general', label: 'General', icon: <HelpCircle size={16} /> },
    { id: 'reservations', label: 'Reservations', icon: <Calendar size={16} /> },
    { id: 'orders', label: 'Orders & Delivery', icon: <Truck size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'restaurants', label: 'Restaurants', icon: <Utensils size={16} /> },
    { id: 'rewards', label: 'Rewards', icon: <Star size={16} /> },
];

const FAQS = [
    {
        category: 'general',
        question: 'What is TableNest?',
        answer: 'TableNest is a full-service restaurant management and dining platform that connects diners with the finest restaurants in their city. You can browse menus, book tables, place orders, and earn loyalty rewards — all in one place.',
    },
    {
        category: 'general',
        question: 'Is TableNest free to use?',
        answer: 'Yes, TableNest is completely free for diners. You can browse restaurants, make reservations, and order food with no subscription fee. We offer optional premium plans with perks like priority booking and exclusive discounts.',
    },
    {
        category: 'general',
        question: 'Which cities does TableNest operate in?',
        answer: 'TableNest currently operates in over 40 cities across North America and Europe. We are rapidly expanding — if your city is not listed, you can sign up to be notified when we launch there.',
    },
    {
        category: 'reservations',
        question: 'How do I make a reservation?',
        answer: 'Find a restaurant you love, select "Book a Seat", choose your preferred date, time slot, number of guests, and table location. Confirm your booking and receive an instant confirmation with a QR code to show on arrival.',
    },
    {
        category: 'reservations',
        question: 'Can I modify or cancel a reservation?',
        answer: 'Yes. Go to My Bookings, select the reservation you wish to change, and choose Modify or Cancel. Cancellations made at least 2 hours before the reservation time are free. Late cancellations may incur a fee depending on the restaurant policy.',
    },
    {
        category: 'reservations',
        question: 'What happens if the restaurant cannot accommodate my booking?',
        answer: 'In the rare event a confirmed reservation cannot be honoured, we will notify you immediately via app notification and email. Our team will work to find you an equivalent alternative restaurant, or issue a full refund plus loyalty point compensation.',
    },
    {
        category: 'orders',
        question: 'How does pre-ordering work?',
        answer: 'On any restaurant page, switch to the Menu tab, browse items, and add them to your cart. You can place the order for immediate delivery, scheduled pick-up, or to be ready at your table when you arrive for your reservation.',
    },
    {
        category: 'orders',
        question: 'Can I track my delivery in real time?',
        answer: 'Yes. Once your order is out for delivery, you will see a live tracking screen showing your driver\'s position, estimated arrival time, and their contact details so you can reach them directly.',
    },
    {
        category: 'orders',
        question: 'What if an item is missing from my order?',
        answer: 'Open My Orders, select the affected order, and tap "Report Issue". Our support team aims to resolve all order issues within 2 hours. Eligible missing items are refunded to your original payment method or added as loyalty points.',
    },
    {
        category: 'payments',
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as Apple Pay, Google Pay, and loyalty point redemptions. All transactions are secured with industry-standard encryption.',
    },
    {
        category: 'payments',
        question: 'When am I charged for a reservation?',
        answer: 'Most reservations are free to book with no upfront charge. Some premium or special-event bookings require a deposit at the time of booking, which is clearly indicated before you confirm.',
    },
    {
        category: 'payments',
        question: 'How do refunds work?',
        answer: 'Refunds are processed to your original payment method within 3–5 business days. For cancelled reservations and qualifying order issues, refunds are initiated automatically. You will receive a confirmation email once processed.',
    },
    {
        category: 'restaurants',
        question: 'How can I list my restaurant on TableNest?',
        answer: 'Visit our Partner Registration page, complete the 4-step application form with your business details, and submit for approval. Our team reviews each application within 48 hours and will contact you with onboarding instructions.',
    },
    {
        category: 'restaurants',
        question: 'What commission does TableNest charge restaurants?',
        answer: 'Our standard commission rate is 15% of order revenue. Premium partnership tiers with lower commission rates and additional marketing support are available for high-volume partners.',
    },
    {
        category: 'rewards',
        question: 'How do I earn loyalty points?',
        answer: 'You earn points automatically on every qualifying order and reservation. Standard rate is 1 point per $1 spent. You also earn 500 bonus points for each friend you refer who completes their first booking.',
    },
    {
        category: 'rewards',
        question: 'How do I redeem my loyalty points?',
        answer: 'Go to the Rewards section of your dashboard to see available redemptions. Points can be exchanged for discount vouchers, free menu items, priority booking access, and exclusive dining experiences.',
    },
    {
        category: 'rewards',
        question: 'Do loyalty points expire?',
        answer: 'Points remain valid for 12 months from the date they were earned. Points are refreshed with every new transaction, so active members rarely see expiry. We will notify you 30 days before any points are due to expire.',
    },
];

export default function FAQPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('general');
    const [openIndex, setOpenIndex] = useState<number | null>(0);
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
        : filtered;

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#FAF7F5', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav style={{ height: 64, background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 80px', gap: 32, position: 'sticky', top: 0, zIndex: 50 }}>
                <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/')}>TableNest</span>
                <div style={{ flex: 1 }} />
                {['Home', 'Restaurants', 'How It Works', 'About Us'].map(l => (
                    <span key={l} style={{ fontSize: 14, color: '#374151', cursor: 'pointer', fontWeight: 500 }}
                        onClick={() => l === 'Restaurants' ? navigate('/restaurants') : navigate('/')}>{l}</span>
                ))}
                <span onClick={() => navigate('/login')} style={{ fontSize: 14, color: '#374151', cursor: 'pointer' }}>Log In</span>
                <button onClick={() => navigate('/register')}
                    style={{ background: '#B91C1C', color: 'white', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Poppins' }}>
                    Sign Up
                </button>
            </nav>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)', padding: '56px 80px', textAlign: 'center', color: 'white' }}>
                <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Help Centre</h1>
                <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 28 }}>Find answers to the most common questions about TableNest.</p>
                <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search frequently asked questions..."
                        style={{ width: '100%', padding: '13px 16px 13px 46px', borderRadius: 10, border: 'none', fontSize: 14, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
                {!search && (
                    /* Category tabs */
                    <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '9px 18px',
                                    border: '1.5px solid',
                                    borderColor: activeCategory === cat.id ? '#B91C1C' : '#E5E7EB',
                                    borderRadius: 9999,
                                    background: activeCategory === cat.id ? '#B91C1C' : 'white',
                                    color: activeCategory === cat.id ? 'white' : '#374151',
                                    fontSize: 13, fontWeight: activeCategory === cat.id ? 600 : 400,
                                    cursor: 'pointer', fontFamily: 'Poppins',
                                }}>
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* FAQ accordion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {allFiltered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                            <HelpCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>No results found</div>
                            <div style={{ fontSize: 14 }}>Try a different search term or browse by category.</div>
                        </div>
                    ) : (
                        allFiltered.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <div key={i}
                                    style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${isOpen ? '#B91C1C' : '#E5E7EB'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        style={{
                                            width: '100%', padding: '18px 20px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontFamily: 'Poppins', textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, fontSize: 14, color: isOpen ? '#B91C1C' : '#111827', flex: 1, paddingRight: 16 }}>
                                            {faq.question}
                                        </span>
                                        {isOpen
                                            ? <ChevronUp size={18} color="#B91C1C" style={{ flexShrink: 0 }} />
                                            : <ChevronDown size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                                        }
                                    </button>
                                    {isOpen && (
                                        <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Contact CTA */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: '32px 40px', marginTop: 48, textAlign: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Still have questions?</h3>
                    <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Our support team is available 24/7 to help you with anything.</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button onClick={() => navigate('/login')}
                            style={{ padding: '10px 24px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            Contact Support
                        </button>
                        <a href="mailto:support@tablenest.com"
                            style={{ padding: '10px 24px', background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Poppins', textDecoration: 'none' }}>
                            support@tablenest.com
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}