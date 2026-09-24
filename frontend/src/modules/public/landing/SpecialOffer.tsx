import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag, ArrowRight, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { promotionsAPI } from '../../../shared/services/api';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

interface FeaturedPromo {
    _id: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    code?: string;
    restaurant?: { _id: string; name: string; images?: string[]; city?: string };
}

export default function SpecialOffer() {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(gridRef, 'stagger');

    const { data } = useQuery<{ promotions: FeaturedPromo[] }>({
        queryKey: ['landing-promos'],
        queryFn: () => promotionsAPI.getFeatured(3).then((r) => r.data),
        staleTime: 60_000,
    });
    const promos = data?.promotions || [];
    if (!promos.length) return null;

    const copyCode = (code?: string) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        toast.success(`Code ${code} copied`);
    };

    return (
        <section style={{ background: '#fff', padding: '40px 0 90px' }}>
            <div ref={sectionRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-brand-600)', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                        <Tag size={14} /> Live offers
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: 'var(--color-ink)' }}>Deals running right now</h2>
                </div>
                <div ref={gridRef} className="stagger" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(promos.length, 3)}, 1fr)`, gap: 24 }}>
                    {promos.map((p) => (
                        <div
                            key={p._id}
                            className="card card-hover"
                            style={{ overflow: 'hidden', position: 'relative', color: '#fff', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', cursor: 'pointer' }}
                            onClick={() => p.restaurant && navigate(`/restaurants/${p.restaurant._id}`)}
                        >
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${p.restaurant?.images?.[0] || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,19,13,0.1), rgba(26,19,13,0.85))' }} />
                            <div style={{ position: 'relative', padding: 22 }}>
                                <span className="badge" style={{ background: 'var(--color-brand-500)', color: '#fff', marginBottom: 10 }}>
                                    {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `$${p.discountValue} OFF`}
                                </span>
                                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                                <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>{p.restaurant?.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    {p.code ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); copyCode(p.code); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.5)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            {p.code} <Copy size={12} />
                                        </button>
                                    ) : <span />}
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
