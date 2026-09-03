import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

const CUISINES = [
    { name: 'Pizza', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80' },
    { name: 'Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
    { name: 'Sushi', img: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&q=80' },
    { name: 'African', img: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&q=80' },
    { name: 'Desserts', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80' },
    { name: 'Healthy', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80' },
    { name: 'Drinks', img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&q=80' },
    { name: 'More', img: '', isMore: true },
];

export default function CuisineCategories() {
    const navigate = useNavigate();

    return (
        <section style={{
            padding: '48px 48px 20px', background: '#FFFFFF',
            maxWidth: 1280, margin: '0 auto', width: '100%',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 32,
                flexWrap: 'wrap',
            }}>
                {CUISINES.map(c => (
                    <div
                        key={c.name}
                        onClick={() => !c.isMore && navigate(`/restaurants?cuisine=${c.name}`)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: 10, cursor: 'pointer', minWidth: 72,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                            border: '3px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                        >
                            {c.isMore ? (
                                <div style={{
                                    width: '100%', height: '100%', background: '#F1F5F9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <MoreHorizontal size={24} color="#475569" />
                                </div>
                            ) : (
                                <img
                                    src={c.img}
                                    alt={c.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                />
                            )}
                        </div>
                        <span style={{
                            fontSize: 13, fontWeight: 600, color: '#475569',
                            textAlign: 'center', whiteSpace: 'nowrap',
                        }}>
                            {c.name}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
