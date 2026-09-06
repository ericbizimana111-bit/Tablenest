import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, ChefHat, ArrowRight } from 'lucide-react';

const FEATURES = [
    {
        id: 1,
        title: 'Takeaway',
        description: 'Order ahead, pick up fresh, and keep moving. Great food, zero wait when you are on the go.',
        icon: ShoppingBag,
    },
    {
        id: 3,
        title: 'Home Delivery',
        description: 'Meals arrive where you are, reliably and hot. Easy for busy days, nights in, and sharing.',
        icon: Truck,
    },
    {
        id: 4,
        title: 'Event Catering',
        description: 'Feed a room without the hassle. Tailored menus for gatherings, offices, and special moments.',
        icon: ChefHat,
    },
];

export default function WhyChooseUs() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                .why-card {
                    background: #FFF7ED;
                    border: 1px solid #FED7AA;
                    border-radius: 20px;
                    padding: 26px 24px;
                    transition: all 0.25s ease;
                }
                .why-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 28px rgba(249, 115, 22, 0.12);
                    border-color: #FDBA74;
                }
                .why-btn-primary {
                    background: #F97316;
                    color: #FFFFFF;
                    transition: all 0.2s ease;
                }
                .why-btn-primary:hover {
                    background: #EA580C;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 18px rgba(249, 115, 22, 0.3);
                }
                .why-btn-secondary {
                    background: #FFFFFF;
                    color: #F97316;
                    border: 1.5px solid #F97316;
                    transition: all 0.2s ease;
                }
                .why-btn-secondary:hover {
                    background: #FFF7ED;
                    transform: translateY(-2px);
                }
                @media (max-width: 960px) {
                    .why-choose-layout {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                }
                @media (max-width: 600px) {
                    .why-cards-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .why-actions {
                        flex-direction: column !important;
                        width: 100% !important;
                    }
                    .why-actions button {
                        width: 100% !important;
                        justify-content: center !important;
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
                    <div className="why-choose-layout" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.05fr 1.35fr',
                        gap: 60,
                        alignItems: 'center',
                    }}>
                        {/* ─── LEFT COLUMN: Text & Buttons ─── */}
                        <div>
                            <h2 style={{
                                fontSize: 'clamp(32px, 3.8vw, 44px)',
                                fontWeight: 800,
                                color: '#0F172A',
                                letterSpacing: '-1px',
                                marginBottom: 20,
                                lineHeight: 1.15,
                            }}>
                                A better way to eat out, order in, and share a meal.
                            </h2>

                            <p style={{
                                fontSize: 15,
                                color: '#64748B',
                                lineHeight: 1.8,
                                marginBottom: 36,
                                maxWidth: 460,
                            }}>
                                TableNest brings diners and standout restaurants together in one place. Find the right spot, choose how you want it, and enjoy the meal.
                            </p>

                            <div className="why-actions" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                            }}>
                                <button
                                    className="why-btn-primary"
                                    onClick={() => navigate('/register')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        border: 'none',
                                        padding: '13px 26px',
                                        borderRadius: 10,
                                        fontSize: 14.5,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    Get Started
                                </button>

                                <button
                                    className="why-btn-secondary"
                                    onClick={() => navigate('/restaurants')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '13px 26px',
                                        borderRadius: 10,
                                        fontSize: 14.5,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    Explore Restaurants
                                </button>
                            </div>
                        </div>

                        {/* ─── RIGHT COLUMN: 2x2 Feature Grid ─── */}
                        <div className="why-cards-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 20,
                        }}>
                            {FEATURES.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.id} className="why-card">
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 12,
                                            background: '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 16,
                                            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.15)',
                                        }}>
                                            <Icon size={22} color="#F97316" />
                                        </div>

                                        <h3 style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: '#0F172A',
                                            marginBottom: 8,
                                            letterSpacing: '-0.3px',
                                        }}>
                                            {item.title}
                                        </h3>

                                        <p style={{
                                            fontSize: 13,
                                            color: '#64748B',
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }}>
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
