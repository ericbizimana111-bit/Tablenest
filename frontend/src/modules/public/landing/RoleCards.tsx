import { useNavigate } from 'react-router-dom';
import {
    Search, BookOpen, Utensils, CreditCard, Check,
    BarChart3, Menu, ShoppingBag, TrendingUp, Star,
} from 'lucide-react';

export default function RoleCards() {
    const navigate = useNavigate();

    return (
        <section style={{
            width: '100%',
            background: '#FFFFFF',
            padding: '72px 0 80px',
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '0 48px' }}>
                <div className="role-cards-grid" style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28,
                    alignItems: 'stretch',
                }}>
                {/* Customer Card */}
                <div style={{
                    background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
                    padding: '36px 32px', display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#FFF7ED', borderRadius: 9999, padding: '5px 14px',
                        marginBottom: 16, alignSelf: 'flex-start',
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            I'm a Customer
                        </span>
                    </div>
                    <p style={{
                        fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, marginBottom: 24,
                    }}>
                        Discover restaurants, browse menus, make reservations, and order food — all in one place.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                        {[
                            { icon: <Search size={16} />, text: 'Discover Restaurants' },
                            { icon: <BookOpen size={16} />, text: 'Browse Menus' },
                            { icon: <Utensils size={16} />, text: 'Make Reservations' },
                            { icon: <CreditCard size={16} />, text: 'Order Food' },
                        ].map(item => (
                            <div key={item.text} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: 6, background: '#FFF7ED',
                                    color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {item.icon}
                                </div>
                                <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 500 }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: '#F97316', color: 'white', border: 'none', padding: '12px 28px',
                            borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                            cursor: 'pointer', alignSelf: 'flex-start',
                            boxShadow: '0 2px 8px rgba(249,115,22,0.2)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#EA580C'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F97316'; }}
                    >
                        Explore as Customer →
                    </button>
                </div>

                {/* Restaurant Owner Card */}
                <div style={{
                    background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
                    padding: '36px 32px', display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#F0FDF4', borderRadius: 9999, padding: '5px 14px',
                        marginBottom: 16, alignSelf: 'flex-start',
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            I'm a Restaurant Owner
                        </span>
                    </div>
                    <p style={{
                        fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, marginBottom: 24,
                    }}>
                        Manage your restaurant, orders, reservations, and grow your business with powerful tools.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        {[
                            { icon: <BarChart3 size={16} />, text: 'Smart Order Management' },
                            { icon: <Menu size={16} />, text: 'Advanced Menu Builder' },
                            { icon: <ShoppingBag size={16} />, text: 'Inventory Tracking' },
                            { icon: <TrendingUp size={16} />, text: 'Analytics & Insights' },
                        ].map(item => (
                            <div key={item.text} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: 6, background: '#F0FDF4',
                                    color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {item.icon}
                                </div>
                                <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 500 }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
                        padding: '16px', background: '#F8FAFC', borderRadius: 10,
                    }}>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>₦8,725,800</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Total Revenue</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>128</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Total Orders</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                                <span style={{ color: '#F97316' }}>4.8</span>
                                <Star size={14} fill="#F97316" color="#F97316" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Average Rating</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>36</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Total Reservations</div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/partner/register')}
                        style={{
                            background: '#166534', color: 'white', border: 'none', padding: '12px 28px',
                            borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: 'Poppins',
                            cursor: 'pointer', alignSelf: 'flex-start',
                            boxShadow: '0 2px 8px rgba(22,101,52,0.2)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#14532D'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#166534'; }}
                    >
                        Partner with Us →
                    </button>
                </div>
            </div>
        </div>

            <style>{`
                @media (max-width: 768px) {
                    .role-cards-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
