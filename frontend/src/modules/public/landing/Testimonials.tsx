import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TESTIMONIALS = [
    {
        text: 'Honestly I was skeptical at first but I tried pre-ordering for a Monday lunch rush and it actually worked. Got there, food was ready, no line. Changed my whole workday.',
        name: 'Marcus Bell',
        location: 'Brooklyn, NY',
        rating: 4,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        date: '2 weeks ago',
    },
    {
        text: 'We used TableNest for my parents\' 40th anniversary dinner. Picked a place we never would\'ve found on our own, and the whole night was perfect. Already booked again for next month.',
        name: 'Priya Sharma',
        location: 'Austin, TX',
        rating: 5,
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        date: '1 month ago',
    },
    {
        text: 'The QR code ordering is neat but honestly the reservation system is what keeps me coming back. I used to call restaurants and get put on hold for 10 minutes. Now I just tap a button.',
        name: 'Jake Morrison',
        location: 'Chicago, IL',
        rating: 5,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        date: '3 weeks ago',
    },
    {
        text: 'As someone who runs a small restaurant, the owner dashboard has been really helpful for tracking what people are ordering and when our busy hours actually are.',
        name: 'Rosa Gutierrez',
        location: 'Miami, FL',
        rating: 5,
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        date: '1 week ago',
    },
    {
        text: 'Pretty good app overall. The interface is clean and finding restaurants nearby is super easy. Only reason I\'m not giving 5 stars is the search could use some filters for dietary stuff.',
        name: 'Alex Kowalski',
        location: 'Portland, OR',
        rating: 4,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        date: '5 days ago',
    },
    {
        text: 'I work nights so I\'m always looking for places open late. Found a 24-hour diner through TableNest that I never knew existed. The pre-order saved me from waiting 30 minutes at 2am.',
        name: 'Danielle Foster',
        location: 'Nashville, TN',
        rating: 4,
        photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face',
        date: '2 months ago',
    },
];

const PAGE_SIZE = 3;

export default function Testimonials() {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(TESTIMONIALS.length / PAGE_SIZE);

    const paginate = (dir: 'next' | 'prev') => {
        if (dir === 'next') setPage(p => Math.min(p + 1, totalPages - 1));
        else setPage(p => Math.max(p - 1, 0));
    };

    const visible = TESTIMONIALS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    return (
        <section style={{
            padding: '64px 48px',
            background: '#F8FAFC',
            maxWidth: 1280,
            margin: '0 auto',
            width: '100%',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: 40,
                width: '100%',
            }}>
                    <h2 style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: '#0B1B3A',
                        letterSpacing: '-0.5px',
                        marginBottom: 4,
                    }}>
                        What Our Customers Say
                    </h2>
                    <p style={{ fontSize: 14, color: '#64748B', margin: 0, marginTop: 4 }}>
                        Real reviews from real people who use TableNest
                    </p>
                </div>
                <span style={{
                    color: '#FF6B00',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600,
                    marginTop: 12,
                }}>
                    Browse All Reviews →
                </span>
            </div>

            <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 40,
                marginBottom: 32,
                padding: '0 20px',
            }}>
                {/* Left arrow */}
                <button
                    onClick={() => paginate('prev')}
                    disabled={page === 0}
                    style={{
                        position: 'absolute',
                        left: 8,
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        opacity: page === 0 ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <ChevronLeft size={18} color="#0B1B3A" />
                </button>

                {/* Right arrow */}
                <button
                    onClick={() => paginate('next')}
                    disabled={page === totalPages - 1}
                    style={{
                        position: 'absolute',
                        right: 8,
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                        opacity: page === totalPages - 1 ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <ChevronRight size={18} color="#0B1B3A" />
                </button>

                {/* Testimonial cards */}
                <div style={{
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    maxWidth: 960,
                }}>
                    {visible.map((t, idx) => (
                        <div key={idx} style={{
                            width: 240,
                            height: 240,
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            border: '1.5px solid #FF6B00',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 20,
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Profile photo overlapping top of circle */}
                            <div style={{
                                position: 'relative',
                                marginBottom: -20,
                                marginTop: -12,
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid #FF6B00',
                                boxShadow: '0 2px 8px rgba(255, 107, 0, 0.2)',
                                zIndex: 1,
                            }}>
                                <img
                                    src={t.photo}
                                    alt={t.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* Orange rating badge overlapping photo */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: -4,
                                    right: -4,
                                    background: '#FF6B00',
                                    color: 'white',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: 6,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                    lineHeight: 1.3,
                                }}>
                                    {t.rating}.0 ★
                                </div>
                            </div>

                            {/* Stars */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                marginBottom: 8,
                            }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={13}
                                        fill={i < t.rating ? '#FF6B00' : 'transparent'}
                                        color={i < t.rating ? '#FF6B00' : '#CBD5E1'}
                                    />
                                ))}
                            </div>

                            {/* Review date */}
                            <div style={{
                                fontSize: 11,
                                color: '#94A3B8',
                                fontWeight: 500,
                                marginBottom: 8,
                                letterSpacing: '0.3px',
                            }}>
                                {t.date}
                            </div>

                            {/* Review text */}
                            <p style={{
                                fontSize: 12.5,
                                color: '#1E293B',
                                lineHeight: 1.5,
                                margin: '0 0 10px',
                                flex: 1,
                                maxWidth: 200,
                            }}>
                                {t.text}
                            </p>

                            {/* Author info */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}>
                                <div style={{
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    color: '#0B1B3A',
                                    letterSpacing: '0.2px',
                                }}>
                                    {t.name}
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    color: '#64748B',
                                    fontWeight: 500,
                                }}>
                                    {t.location}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination dots */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginTop: 8,
            }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        style={{
                            width: page === i ? 10 : 8,
                            height: page === i ? 10 : 8,
                            borderRadius: '50%',
                            background: page === i ? '#FF6B00' : '#CBD5E1',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: 0,
                        }}
                        aria-label={`Go to page ${i + 1}`}
                    />
                ))}
            </div>

            <style>{`
                @media (max-width: 960px) {
                    .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .testimonials-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
