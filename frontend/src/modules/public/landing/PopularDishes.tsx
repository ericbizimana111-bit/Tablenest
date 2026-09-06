import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dishWings from '../../../assets/dish_wings.jpg';
import dishCake from '../../../assets/dish_cake.jpg';
import dishChicken from '../../../assets/dish_chicken.jpg';
import dishBurger from '../../../assets/dish_burger.jpg';

const POPULAR_DISHES = [
    {
        id: 1,
        name: 'Buffalo Wings',
        description: 'A popular favorite for sharing, from kitchens that get the balance right.',
        rating: '4.8',
        image: dishWings,
    },
    {
        id: 2,
        name: 'Chocolate Lava Cake',
        description: 'Warm, refined, and hard to skip — a dessert worth making room for.',
        rating: '4.9',
        image: dishCake,
    },
    {
        id: 3,
        name: 'Roasted Chicken',
        description: 'Simple, seasoned well, and served with the kind of care people notice.',
        rating: '4.7',
        image: dishChicken,
    },
    {
        id: 4,
        name: 'Beef Burger',
        description: 'A solid favorite on the menu, built for a satisfying first bite.',
        rating: '4.8',
        image: dishBurger,
    },
];

export default function PopularDishes() {
    const navigate = useNavigate();
    const [offset, setOffset] = React.useState(0);
    const dishesPerView = window.innerWidth <= 1080 ? 2 : window.innerWidth <= 600 ? 1 : 4;

    const handlePrev = () => setOffset(o => Math.max(0, o - dishesPerView));
    const handleNext = () => setOffset(o => Math.min(POPULAR_DISHES.length - dishesPerView, o + dishesPerView));

    return (
        <>
            <style>{`
                .dish-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dish-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 35px rgba(15, 23, 42, 0.08) !important;
                    border-color: #FED7AA !important;
                }
                .dish-order-btn {
                    background: #F97316;
                    color: #FFFFFF;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .dish-order-btn:hover {
                    background: #EA580C;
                    transform: scale(1.04);
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
                }
                .dish-book-btn {
                    background: white;
                    color: #F97316;
                    border: 1.5px solid #F97316;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .dish-book-btn:hover {
                    background: #FFF7ED;
                    transform: scale(1.04);
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
                }
                .dish-nav-btn {
                    background: #FFFFFF;
                    border: 1.5px solid #F1F5F9;
                    color: #0F172A;
                    transition: all 0.2s ease;
                }
                .dish-nav-btn:hover {
                    border-color: #F97316;
                    color: #F97316;
                    background: #FFF7ED;
                }
                @media (max-width: 1080px) {
                    .popular-dishes-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 24px !important;
                    }
                }
                @media (max-width: 600px) {
                    .popular-dishes-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <section style={{
                background: '#FAFAFC',
                padding: '88px 0 96px',
                width: '100%',
                position: 'relative',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: 54 }}>
                        <div style={{
                            display: 'inline-block',
                            color: '#F97316',
                            fontSize: 12.5,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 10,
                        }}>
                            TRENDING NOW
                        </div>

                        <h2 style={{
                            fontSize: 'clamp(28px, 3.2vw, 40px)',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.8px',
                            marginBottom: 12,
                        }}>
                            Dishes people are ordering right now
                        </h2>

                        <p style={{
                            fontSize: 15,
                            color: '#64748B',
                            maxWidth: 620,
                            margin: '0 auto',
                            lineHeight: 1.65,
                        }}>
                            A short list of popular dishes from restaurants on TableNest — what people are enjoying most, right now.
                        </p>
                    </div>

                    {/* Nav arrows */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 24,
                            width: '100%',
                        }}>
                            <button
                                className="dish-nav-btn"
                                onClick={handlePrev}
                                disabled={offset === 0}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: offset === 0 ? 'default' : 'pointer',
                                    opacity: offset === 0 ? 0.4 : 1,
                                    padding: 0,
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                className="dish-nav-btn"
                                onClick={handleNext}
                                disabled={offset + dishesPerView >= POPULAR_DISHES.length}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: offset + dishesPerView >= POPULAR_DISHES.length ? 'default' : 'pointer',
                                    opacity: offset + dishesPerView >= POPULAR_DISHES.length ? 0.4 : 1,
                                    padding: 0,
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Dish Cards Grid */}
                        <div className="popular-dishes-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 24,
                        }}>
                            {POPULAR_DISHES.slice(offset, offset + dishesPerView).map((dish) => (
                                <div
                                    key={dish.id}
                                    className="dish-card"
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: 22,
                                        border: '1.5px solid #F1F5F9',
                                        padding: '24px 20px 22px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        position: 'relative',
                                        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Dish Cover Image */}
                                    <div style={{
                                        width: '100%',
                                        height: 168,
                                        borderRadius: '22px 22px 0 0',
                                        overflow: 'hidden',
                                        margin: 0,
                                        marginBottom: 18,
                                        background: '#F1F5F9',
                                    }}>
                                        <img
                                            src={dish.image}
                                            alt={dish.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />
                                    </div>

                                    {/* Dish Title */}
                                    <h3 style={{
                                        fontSize: 17,
                                        fontWeight: 700,
                                        color: '#0F172A',
                                        marginBottom: 8,
                                        letterSpacing: '-0.3px',
                                    }}>
                                        {dish.name}
                                    </h3>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: 13,
                                        color: '#64748B',
                                        lineHeight: 1.55,
                                        marginBottom: 22,
                                        minHeight: 40,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>
                                        {dish.description}
                                    </p>

                                    {/* Bottom Bar (Rating & buttons) */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        paddingTop: 14,
                                        borderTop: '1px solid #F1F5F9',
                                        marginTop: 'auto',
                                    }}>
                                        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            {/* View Restaurant Button */}
                                            <button
                                                className="dish-order-btn"
                                                onClick={() => navigate('/restaurants')}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    border: 'none',
                                                    padding: '9px 18px',
                                                    borderRadius: 8,
                                                    fontSize: 12.5,
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                View Restaurant
                                            </button>
                                            {/* Book Button */}
                                            <button
                                                className="dish-book-btn"
                                                onClick={() => navigate('/restaurants')}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    border: '1.5px solid #F97316',
                                                    padding: '9px 18px',
                                                    borderRadius: 8,
                                                    fontSize: 12.5,
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                    background: 'white',
                                                    color: '#F97316',
                                                }}
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                </div>
            </section>
        </>
    );
}
