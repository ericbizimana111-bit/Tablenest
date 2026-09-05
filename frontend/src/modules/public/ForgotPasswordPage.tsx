import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { authAPI } from '../../shared/services/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email) { setError('Please enter your email'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }

        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch {
            setError('Error sending reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputBase: React.CSSProperties = {
        width: '100%',
        height: 48,
        paddingLeft: 44,
        paddingRight: 14,
        border: '1.5px solid #E2E8F0',
        borderRadius: 10,
        fontSize: 15,
        background: 'white',
        color: '#0B1B3A',
        outline: 'none',
        boxSizing: 'border-box' as const,
        fontFamily: 'Poppins, sans-serif',
        transition: 'all 0.2s ease',
    };

    return (
        <div style={{
            fontFamily: 'Poppins, sans-serif',
            minHeight: '100vh',
            display: 'flex',
            background: '#F8FAFC',
        }}>
            {/* ── LEFT SIDE: White Form ── */}
            <div style={{
                flex: '1 1 55%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'white',
                padding: '64px 48px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
                    {/* Logo */}
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                        marginBottom: 40,
                        justifyContent: 'center',
                        width: '100%',
                    }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            background: '#FF6B00',
                            borderRadius: 9,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                                <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                            </svg>
                        </div>
                        <span style={{ color: '#0B1B3A', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
                            TableNest
                        </span>
                    </Link>

                    {!sent ? (
                        <>
                            {/* Back button */}
                            <button
                                onClick={() => window.history.back()}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: 'none',
                                    border: 'none',
                                    color: '#94A3B8',
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    marginBottom: 24,
                                    padding: 0,
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 500,
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#0B1B3A'}
                                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                            >
                                <ArrowLeft size={14} />
                                Back
                            </button>

                            {/* Header */}
                            <div style={{ marginBottom: 32 }}>
                                <h1 style={{
                                    fontSize: 'clamp(28px, 4vw, 36px)',
                                    fontWeight: 800,
                                    color: '#0B1B3A',
                                    marginBottom: 6,
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.2,
                                }}>
                                    Forgot <span style={{ color: '#FF6B00' }}>Password</span>
                                </h1>
                                <p style={{
                                    fontSize: 15,
                                    color: '#64748B',
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}>
                                    Enter your email and we'll help you reset your password
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FCA5A5',
                                    borderRadius: 8,
                                    padding: '10px 14px',
                                    marginBottom: 24,
                                    color: '#EF4444',
                                    fontSize: 13,
                                }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: 6,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#0B1B3A',
                                    }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={17} style={{
                                            position: 'absolute',
                                            left: 14,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: focused ? '#FF6B00' : '#94A3B8',
                                            transition: 'color 0.2s',
                                        }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => {
                                                setEmail(e.target.value);
                                                if (error) setError('');
                                            }}
                                            onFocus={() => setFocused(true)}
                                            onBlur={() => setFocused(false)}
                                            placeholder="you@example.com"
                                            style={{
                                                ...inputBase,
                                                ...(focused ? {
                                                    borderColor: '#FF6B00',
                                                    background: '#FFF8F0',
                                                } : {}),
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        height: 48,
                                        background: loading ? 'rgba(255, 107, 0, 0.7)' : '#FF6B00',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        transition: 'all 0.2s',
                                        fontFamily: 'Poppins, sans-serif',
                                        boxShadow: loading ? 'none' : '0 2px 8px rgba(255, 107, 0, 0.25)',
                                    }}
                                    onMouseEnter={e => {
                                        if (!loading) e.currentTarget.style.background = '#E55A00';
                                    }}
                                    onMouseLeave={e => {
                                        if (!loading) e.currentTarget.style.background = '#FF6B00';
                                    }}
                                    onFocus={e => {
                                        if (!loading) e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.2)';
                                    }}
                                    onBlur={e => {
                                        if (!loading) e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 0, 0.25)';
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>

                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                                {/* Back to sign in */}
                                <Link
                                    to="/login"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        fontSize: 14,
                                        color: '#64748B',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#FF6B00'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                                >
                                    <ArrowLeft size={14} />
                                    Back to Sign In
                                </Link>
                            </form>
                        </>
                    ) : (
                        /* Success state */
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: '#F0FDF4',
                                border: '2px solid #22C55E',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}>
                                <CheckCircle size={28} color="#22C55E" />
                            </div>
                            <h2 style={{
                                fontSize: 24,
                                fontWeight: 800,
                                color: '#0B1B3A',
                                marginBottom: 8,
                                letterSpacing: '-0.3px',
                            }}>
                                Check Your Email
                            </h2>
                            <p style={{
                                fontSize: 14,
                                color: '#64748B',
                                marginBottom: 32,
                                lineHeight: 1.6,
                            }}>
                                We've sent a password reset link to{' '}
                                <strong style={{ color: '#FF6B00', fontWeight: 600 }}>{email}</strong>
                            </p>

                            <button
                                onClick={() => {
                                    setSent(false);
                                    setEmail('');
                                }}
                                style={{
                                    width: '100%',
                                    height: 44,
                                    borderRadius: 8,
                                    border: '1.5px solid #E2E8F0',
                                    background: 'white',
                                    color: '#475569',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    marginBottom: 10,
                                    fontFamily: 'Poppins, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#F8FAFC';
                                    e.currentTarget.style.borderColor = '#CBD5E1';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                            >
                                Try a different email
                            </button>

                            <Link
                                to="/login"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 44,
                                    borderRadius: 8,
                                    background: '#FF6B00',
                                    color: 'white',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    boxShadow: '0 2px 8px rgba(255, 107, 0, 0.25)',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#E55A00'}
                                onMouseLeave={e => e.currentTarget.style.background = '#FF6B00'}
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ── RIGHT SIDE: Navy Brand Panel ── */}
            <div style={{
                flex: '1 1 45%',
                position: 'relative',
                background: '#0B1B3A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '64px 48px',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 8,
                    height: 8,
                    background: '#FF6B00',
                    borderRadius: '50%',
                    opacity: 0.9,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    right: 40,
                    width: 120,
                    height: 120,
                    border: '1.5px solid rgba(255, 107, 0, 0.15)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: 60,
                    right: 60,
                    width: 60,
                    height: 60,
                    border: '1px solid rgba(255, 107, 0, 0.1)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                {/* Logo + Icon + Text - Centered */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        marginBottom: 32,
                        width: '100%',
                    }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            background: '#FF6B00',
                            borderRadius: 9,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                                <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                            </svg>
                        </div>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
                            TableNest
                        </span>
                    </div>

                    <div style={{
                        width: 56,
                        height: 56,
                        background: 'rgba(255, 107, 0, 0.1)',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <Mail size={28} color="#FF6B00" />
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 38px)',
                        fontWeight: 800,
                        color: 'white',
                        letterSpacing: '-1px',
                        lineHeight: 1.15,
                        marginBottom: 12,
                    }}>
                        Table<span style={{ color: '#FF6B00' }}>Nest</span>
                    </h2>
                    <p style={{
                        fontSize: 16,
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: 1.6,
                        margin: 0,
                        fontWeight: 400,
                    }}>
                        Good food starts<br />with the right table.
                    </p>
                </div>

                {/* Bottom accent line */}
                <div style={{
                    position: 'absolute',
                    bottom: 48,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 48,
                    height: 3,
                    background: '#FF6B00',
                    borderRadius: 2,
                }} />
            </div>

            {/* ── Responsive ── */}
            <style>{`
                @media (max-width: 900px) {
                    > div:first-child {
                        flex: 1 1 100% !important;
                        max-width: 100% !important;
                        padding: 48px 32px !important;
                    }
                    > div:last-child {
                        flex: 0 0 auto !important;
                        width: 100% !important;
                        min-width: 0 !important;
                        padding: 32px 32px !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: flex-start !important;
                        gap: 24px !important;
                    }
                    > div:last-child > div[style*="maxWidth: 400"] {
                        max-width: 280px !important;
                    }
                }
                @media (max-width: 600px) {
                    > div:first-child {
                        padding: 32px 24px !important;
                    }
                    > div:last-child {
                        padding: 24px 24px !important;
                    }
                    > div:first-child > div[style*="maxWidth: 400"] {
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}
