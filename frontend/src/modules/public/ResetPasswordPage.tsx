import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI } from '../../shared/services/api';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const token = new URLSearchParams(window.location.search).get('token') || '';

    const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && password.length >= 12 ? 4 : 3;
    const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    const validate = () => {
        const errs: typeof errors = {};
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'At least 6 characters required';
        if (!confirm) errs.confirm = 'Please confirm your password';
        else if (password !== confirm) errs.confirm = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        setLoading(true);
        try {
            await authAPI.resetPassword({ token, password });
            navigate('/login');
        } catch {
            setErrors({ general: 'Reset link expired or invalid. Please request a new one.' });
        } finally {
            setLoading(false);
        }
    };

    const inputBase: React.CSSProperties = {
        width: '100%',
        height: 48,
        paddingLeft: 44,
        paddingRight: 44,
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

    const inputFocused: React.CSSProperties = {
        borderColor: '#FF6B00',
        background: '#FFF8F0',
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
                        marginBottom: 24,
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

                    {/* Back link */}
                    <Link
                        to="/login"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#94A3B8',
                            fontSize: 13,
                            textDecoration: 'none',
                            marginBottom: 24,
                            fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FF6B00'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                        <ArrowLeft size={14} />
                        Back to Sign In
                    </Link>

                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{
                            fontSize: 'clamp(24px, 3.5vw, 30px)',
                            fontWeight: 800,
                            color: '#0B1B3A',
                            marginBottom: 6,
                            letterSpacing: '-0.5px',
                            lineHeight: 1.2,
                        }}>
                            Reset <span style={{ color: '#FF6B00' }}>Password</span>
                        </h1>
                        <p style={{
                            fontSize: 14,
                            color: '#64748B',
                            margin: 0,
                            lineHeight: 1.5,
                        }}>
                            Choose a strong password for your account
                        </p>
                    </div>

                    {/* Error */}
                    {errors.general && (
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            borderRadius: 8,
                            padding: '10px 14px',
                            marginBottom: 20,
                            color: '#EF4444',
                            fontSize: 13,
                        }}>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* New Password */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0B1B3A',
                            }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={17} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: focusedField === 'password' ? '#FF6B00' : '#94A3B8',
                                    transition: 'color 0.2s',
                                }} />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Min. 6 characters"
                                    style={{
                                        ...inputBase,
                                        ...(focusedField === 'password' ? inputFocused : {}),
                                        ...(errors.password ? { borderColor: '#EF4444' } : {}),
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    style={{
                                        position: 'absolute',
                                        right: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94A3B8',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    tabIndex={-1}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            {errors.password && (
                                <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>
                                    {errors.password}
                                </span>
                            )}
                            {password.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ display: 'flex', gap: 3, flex: 1, marginRight: 8 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                style={{
                                                    height: 3,
                                                    flex: 1,
                                                    borderRadius: 2,
                                                    background: i <= strength ? strengthColors[strength] : '#E2E8F0',
                                                    transition: 'all 0.3s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 600, minWidth: 40 }}>
                                        {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0B1B3A',
                            }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={17} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: focusedField === 'confirm' ? '#FF6B00' : '#94A3B8',
                                    transition: 'color 0.2s',
                                }} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={e => {
                                        setConfirm(e.target.value);
                                        if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('confirm')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Re-enter your password"
                                    style={{
                                        ...inputBase,
                                        ...(focusedField === 'confirm' ? inputFocused : {}),
                                        ...(errors.confirm ? { borderColor: '#EF4444' } : {}),
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    style={{
                                        position: 'absolute',
                                        right: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94A3B8',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    tabIndex={-1}
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            {errors.confirm && (
                                <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>
                                    {errors.confirm}
                                </span>
                            )}
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
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    Reset Password
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </button>

                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </form>
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
                }} />                {/* Icon + Text - Centered */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 8
                }}>
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
                        <Lock size={28} color="#FF6B00" />
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
