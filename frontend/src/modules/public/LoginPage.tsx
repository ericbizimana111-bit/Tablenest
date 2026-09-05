import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ChefHat } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../shared/utils/auth.utils';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isSubmitting } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const validate = () => {
        const errs: typeof errors = {};
        if (!email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        try {
            const loggedInUser = await login(email, password);
            navigate(getRoleHomePath(loggedInUser.role), { replace: true });
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Invalid credentials. Please try again.';
            setErrors({ general: message });
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

    const inputFocused: React.CSSProperties = {
        borderColor: '#FF6B00',
        background: '#FFF8F0',
    };

    const inputError: React.CSSProperties = {
        borderColor: '#EF4444',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: 6,
        fontSize: 14,
        fontWeight: 600,
        color: '#0B1B3A',
    };

    const errorTextStyle: React.CSSProperties = {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        display: 'block',
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
                    {/* Logo - Centered */}
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

                    {/* Header - Centered */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h1 style={{
                            fontSize: 'clamp(28px, 4vw, 36px)',
                            fontWeight: 800,
                            color: '#0B1B3A',
                            marginBottom: 6,
                            letterSpacing: '-0.5px',
                            lineHeight: 1.2,
                        }}>
                            Welcome <span style={{ color: '#FF6B00' }}>Back</span>
                        </h1>
                        <p style={{
                            fontSize: 15,
                            color: '#64748B',
                            margin: 0,
                            lineHeight: 1.5,
                        }}>
                            Sign in to your TableNest account
                        </p>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            borderRadius: 8,
                            padding: '10px 14px',
                            marginBottom: 24,
                            color: '#EF4444',
                            fontSize: 13,
                        }}>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Email */}
                        <div>
                            <label style={labelStyle} htmlFor="email">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={17} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: focusedField === 'email' ? '#FF6B00' : '#94A3B8',
                                    transition: 'color 0.2s',
                                }} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(p => ({ ...p, email: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    style={{
                                        ...inputBase,
                                        ...(focusedField === 'email' ? inputFocused : {}),
                                        ...(errors.email ? inputError : {}),
                                    }}
                                />
                            </div>
                            {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                                <label style={labelStyle} htmlFor="password">Password</label>
                                <Link to="/forgot-password" style={{
                                    fontSize: 13,
                                    color: '#FF6B00',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}>
                                    Forgot password?
                                </Link>
                            </div>
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
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    style={{
                                        ...inputBase,
                                        paddingRight: 44,
                                        ...(focusedField === 'password' ? inputFocused : {}),
                                        ...(errors.password ? inputError : {}),
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
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
                                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
                        </div>

                        {/* Remember me */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            userSelect: 'none',
                            fontSize: 13,
                            color: '#64748B',
                        }}>
                            <div
                                onClick={() => setRememberMe(!rememberMe)}
                                style={{
                                    width: 17,
                                    height: 17,
                                    borderRadius: 4,
                                    border: '1.5px solid',
                                    borderColor: rememberMe ? '#FF6B00' : '#CBD5E1',
                                    background: rememberMe ? '#FF6B00' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                                role="checkbox"
                                aria-checked={rememberMe}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setRememberMe(!rememberMe);
                                    }
                                }}
                            >
                                {rememberMe && (
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span style={{ fontSize: 13, color: '#64748B' }}>Remember me</span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                height: 48,
                                background: isSubmitting ? 'rgba(255, 107, 0, 0.7)' : '#FF6B00',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                transition: 'all 0.2s',
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '0.2px',
                                marginTop: 4,
                                boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(255, 107, 0, 0.25)',
                            }}
                            onMouseEnter={e => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.background = '#E55A00';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.background = '#FF6B00';
                                }
                            }}
                            onFocus={e => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.2)';
                                }
                            }}
                            onBlur={e => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 0, 0.25)';
                                }
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </button>

                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' }}>
                            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                or continue with
                            </span>
                            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                        </div>

                        {/* Social logins */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                type="button"
                                style={{
                                    flex: 1,
                                    height: 42,
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    color: '#475569',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
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
                                onFocus={e => {
                                    e.currentTarget.style.borderColor = '#FF6B00';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                style={{
                                    flex: 1,
                                    height: 42,
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    color: '#475569',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
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
                                onFocus={e => {
                                    e.currentTarget.style.borderColor = '#FF6B00';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.98-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.54-3.74 4.25z" />
                                </svg>
                                Apple
                            </button>
                        </div>

                        {/* Sign up link */}
                        <p style={{
                            textAlign: 'center',
                            fontSize: 14,
                            color: '#64748B',
                            margin: '4px 0 0',
                            lineHeight: 1.5,
                        }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{
                                color: '#FF6B00',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}>
                                Sign up
                            </Link>
                        </p>
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
                        <ChefHat size={28} color="#FF6B00" />
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
                    > div:last-child .brand-panel-content {
                        display: none !important;
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
