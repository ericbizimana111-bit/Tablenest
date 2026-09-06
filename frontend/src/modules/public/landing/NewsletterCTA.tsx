import { useRef } from 'react';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

export default function NewsletterCTA() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(cardRef, 'stagger');

    return (
        <>
            <style>{`@media (max-width: 900px) {
                    .what-we-offer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 36px !important;
                    }
                }`}</style>

            {/* ─── NEWSLETTER CARD ─── */}
            <section style={{
                background: '#FFFFFF',
                padding: '80px 0 90px',
                width: '100%',
                position: 'relative',
            }}>
                <div ref={sectionRef} style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}>
                    <div ref={cardRef} className="stagger" style={{
                        maxWidth: 680,
                        margin: '0 auto',
                        background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                        borderRadius: 24,
                        padding: '48px 44px',
                        textAlign: 'center',
                        boxShadow: '0 4px 16px rgba(249, 115, 22, 0.10)',
                    }}>
                        <h3 style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.3px',
                            marginBottom: 8,
                        }}>
                            Don&apos;t miss out on great meals.
                        </h3>

                        <p style={{
                            fontSize: 14,
                            color: '#64748B',
                            lineHeight: 1.65,
                            marginBottom: 24,
                            maxWidth: 380,
                            margin: '0 auto 24px',
                        }}>
                            Subscribe to our newsletter and get exclusive offers, new restaurant alerts, and seasonal specials delivered to your inbox.
                        </p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
                                if (input.value) {
                                    console.log('Subscribed:', input.value);
                                    input.value = '';
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#FFFFFF',
                                border: '1.5px solid #FED7AA',
                                borderRadius: 9999,
                                padding: '4px 4px 4px 20px',
                                maxWidth: 600,
                                margin: '0 auto',
                                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
                            }}
                        >
                            <input
                                type="email"
                                required
                                placeholder="Your email address"
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '12px 0',
                                    fontSize: 14,
                                    color: '#334155',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-press"
                                style={{
                                    background: '#F97316',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: 9999,
                                    padding: '11px 24px',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    whiteSpace: 'nowrap',
                                    transition: 'background 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    (e.target as HTMLButtonElement).style.background = '#EA580C';
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLButtonElement).style.background = '#F97316';
                                }}
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
