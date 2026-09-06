import { Star } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Olivier Imanizabayo',
        role: 'Restaurant owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        quote: "TableNest helped us reach more customers without changing how we work. Reservations are easier to manage, and we finally get a clearer picture of what people want.",
        rating: 5,
    },
    {
        id: 2,
        name: 'Marie Claire Uwera',
        role: 'Regular diner',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        quote: "It is the easiest way to find restaurants I actually trust. I can see what is popular, book a table, or order in a few taps, and the places are always good.",
        rating: 5,
    },
    {
        id: 3,
        name: 'Jean Patrick',
        role: 'Customer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        quote: "I use it when I want a good meal without spending time searching. The options feel reliable, and booking takes the stress out of planning dinner.",
        rating: 5,
    },
    {
        id: 4,
        name: 'Diana Mukherjee',
        role: 'Restaurant partner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        quote: "For us, TableNest is not just visibility. It is a simpler way to connect with diners, handle reservations smoothly, and grow without the usual guesswork.",
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <>
            <style>{`
                .test-track {
                    display: flex;
                    gap: 20px;
                    flex-wrap: nowrap;
                    justify-content: flex-start;
                    animation: testLoop 28s linear infinite;
                }

                @keyframes testLoop {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                @media (max-width: 768px) {
                    .test-deck-wrap {
                        height: auto !important;
                        min-height: 380px !important;
                    }
                    .test-side-card {
                        display: none !important;
                    }
                }
            `}</style>

            <section style={{
                background: '#FAFAFC',
                padding: '90px 0 100px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 54 }}>
                        <h2 style={{
                            fontSize: 'clamp(28px, 3.4vw, 40px)',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.8px',
                            marginBottom: 12,
                        }}>
                            Trusted by diners and restaurants
                        </h2>
                        <p style={{
                            fontSize: 15,
                            color: '#64748B',
                            maxWidth: 580,
                            margin: '0 auto',
                            lineHeight: 1.6,
                        }}>
                            Real experiences from people using TableNest to find restaurants, make reservations, order easily, and grow their business.
                        </p>
                    </div>

                    {/* Testimonial Track */}
                    <div style={{
                        overflow: 'hidden',
                        margin: '0 auto 32px',
                    }}>
                        <div className="test-track">
                            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        width: 280,
                                        flexShrink: 0,
                                        background: '#FFFFFF',
                                        borderRadius: 20,
                                        border: '1.5px solid #F1F5F9',
                                        padding: '26px 24px 24px',
                                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        marginBottom: 16,
                                    }}>
                                        <img
                                            src={item.avatar}
                                            alt={item.name}
                                            style={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #FFFFFF',
                                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div>
                                            <h4 style={{
                                                fontSize: 15.5,
                                                fontWeight: 700,
                                                color: '#0F172A',
                                                margin: 0,
                                                letterSpacing: '-0.2px',
                                            }}>
                                                {item.name}
                                            </h4>
                                            <p style={{
                                                fontSize: 12.5,
                                                color: '#64748B',
                                                margin: '2px 0 0',
                                            }}>
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                                        ))}
                                    </div>

                                    <p style={{
                                        fontSize: 14,
                                        color: '#334155',
                                        lineHeight: 1.65,
                                        margin: 0,
                                    }}>
                                        {item.quote}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </section>
        </>
    );
}
