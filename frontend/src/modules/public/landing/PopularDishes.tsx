import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import dishWings from '../../../assets/dish_wings.jpg';
import dishCake from '../../../assets/dish_cake.jpg';
import dishChicken from '../../../assets/dish_chicken.jpg';
import dishBurger from '../../../assets/dish_burger.jpg';

const POPULAR_DISHES = [
    {
        id: 1,
        name: 'Crispy Chicken Wings',
        description: 'Buffalo sauce with blue cheese dip on the side',
        price: '$5.50',
        rating: '4.8',
        image: dishWings,
    },
    {
        id: 2,
        name: 'Chocolate Lava Cake',
        description: 'Warm molten center with vanilla ice cream scoop',
        price: '$7.50',
        rating: '4.9',
        image: dishCake,
    },
    {
        id: 3,
        name: 'Herb-Roasted Chicken',
        description: 'Seasoned with rosemary and thyme, served with vegetables',
        price: '$12.50',
        rating: '4.7',
        image: dishChicken,
    },
    {
        id: 4,
        name: 'Classic Beef Burger',
        description: 'Juicy patty with lettuce, tomato, and secret sauce',
        price: '$9.00',
        rating: '4.8',
        image: dishBurger,
    },
];

export default function PopularDishes() {
    const navigate = useNavigate();

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
                .dish-card:hover .dish-circle-img {
                    transform: scale(1.05) rotate(2deg);
                }
                .dish-order-btn {
                    background: #F97316;
                    color: #FFFFFF;
                    transition: all 0.2s ease;
                }
                .dish-order-btn:hover {
                    background: #EA580C;
                    transform: scale(1.04);
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
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
                            Popular Dishes Near You
                        </h2>

                        <p style={{
                            fontSize: 15,
                            color: '#64748B',
                            maxWidth: 620,
                            margin: '0 auto',
                            lineHeight: 1.65,
                        }}>
                            Discover handpicked signature dishes from top rated restaurants, crafted by expert chefs using the freshest ingredients.
                        </p>
                    </div>

                    {/* Dish Cards Grid */}
                    <div className="popular-dishes-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 24,
                    }}>
                        {POPULAR_DISHES.map((dish) => (
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
                                {/* Top-right Price Pill */}
                                <div style={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    background: '#F97316',
                                    color: '#FFFFFF',
                                    padding: '4px 12px',
                                    borderRadius: 9999,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
                                    zIndex: 2,
                                }}>
                                    {dish.price}
                                </div>

                                {/* Circular Dish Image */}
                                <div style={{
                                    width: 144,
                                    height: 144,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    marginTop: 10,
                                    marginBottom: 20,
                                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                                    border: '3px solid #FFFFFF',
                                }}>
                                    <img
                                        src={dish.image}
                                        alt={dish.name}
                                        className="dish-circle-img"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.4s ease',
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

                                {/* Bottom Bar (Rating & Order button) */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    paddingTop: 14,
                                    borderTop: '1px solid #F1F5F9',
                                    marginTop: 'auto',
                                }}>
                                    {/* Rating */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: '#0F172A',
                                    }}>
                                        <Star size={15} fill="#F59E0B" color="#F59E0B" />
                                        <span>{dish.rating}</span>
                                    </div>

                                    {/* Order Button */}
                                    <button
                                        className="dish-order-btn"
                                        onClick={() => navigate('/restaurants')}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            border: 'none',
                                            padding: '8px 18px',
                                            borderRadius: 9999,
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        Order Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
