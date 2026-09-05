import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
        height: 52,
        paddingLeft: 44,
        paddingRight: 14,
        border: '1.5px solid #E2E8F0',
        borderRadius: 12,
        fontSize: 14,
        background: 'white',
        color: '#0F172A',
        outline: 'none',
        boxSizing: 'border-box' as const,
        fontFamily: 'Poppins, sans-serif',
        transition: 'all 0.2s ease',
    };

    const inputFocused: React.CSSProperties = {
        borderColor: '#F97316',
        background: '#FFF7ED',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: 8,
        fontSize: 13,
        fontWeight: 600,
        color: '#475569',
    };

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', background: 'white' }}>

            {/* ── LEFT SIDE: Brand + Image ── */}
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(12,20,38,0.92) 0%, rgba(15,23,42,0.85) 100%), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85)',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '48px 56px',
                    color: '#fff',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative gradient orb */}
                <div style={{
                    position: 'absolute', top: -120, right: -120,
                    width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', width: 'fit-content', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: 42, height: 42, background: '#F97316', borderRadius: 11,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                            <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>TableNest</span>
                </Link>

                {/* Brand statement */}
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
                    <h2 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, marginBottom: 18, letterSpacing: '-1px' }}>
                        Culinary artistry meets<br />operational precision.
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.8, maxWidth: 460 }}>
                        Secure your access to the TableNest dining experience and management tools.
                    </p>

                    {/* Trust indicators */}
                    <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
                        {[
                            { num: '2,400+', label: 'Restaurants' },
                            { num: '50K+', label: 'Reservations' },
                            { num: '4.9', label: 'App Rating' },
                        ].map((s) => (
                            <div key={s.label}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#F97316' }}>{s.num}</div>
                                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom decorative line */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 60, height: 3, background: '#F97316', borderRadius: 2 }} />
                </div>
            </div>

            {/* ── RIGHT SIDE: Auth Card ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'white',
                padding: '48px 56px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
            }}>

                <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.5px' }}>
                            Welcome Back
                        </h1>
                        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
                            Sign in to your TableNest account
                        </p>
                    </div>

                    {/* General Error */}
                    {errors.general && (                        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5',
                            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                            color: '#EF4444', fontSize: 13,
                        }}>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: focusedField === 'email' ? '#F97316' : '#94A3B8',
                                    transition: 'color 0.2s',
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    style={{
                                        ...inputBase,
                                        ...(focusedField === 'email' ? inputFocused : {}),
                                    }}
                                />
                            </div>
                            {errors.email && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={labelStyle}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: 12, color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: focusedField === 'password' ? '#F97316' : '#94A3B8',
                                    transition: 'color 0.2s',
                                }} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    style={{
                                        ...inputBase,
                                        paddingRight: 44,
                                        ...(focusedField === 'password' ? inputFocused : {}),
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#94A3B8', padding: 0,
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>                            {errors.password && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>{errors.password}</span>}
                        </div>

                        {/* Remember me */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                            <div
                                onClick={() => setRememberMe(!rememberMe)}
                                style={{
                                    width: 18, height: 18, borderRadius: 5, border: '1.5px solid',
                                    borderColor: rememberMe ? '#F97316' : '#CBD5E1',
                                    background: rememberMe ? '#F97316' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s', cursor: 'pointer',
                                }}>
                                {rememberMe && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
                                height: 52,
                                background: isSubmitting ? 'rgba(249,115,22,0.7)' : '#F97316',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all 0.2s',
                                boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(249,115,22,0.3)',
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '0.3px',
                                marginTop: 4,
                            }}
                            onMouseEnter={e => {
                                if (!isSubmitting) e.currentTarget.style.background = '#EA6A08';
                            }}
                            onMouseLeave={e => {
                                if (!isSubmitting) e.currentTarget.style.background = '#F97316';
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0' }}>
                            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>or continue with</span>
                            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                        </div>

                        {/* Social logins */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                style={{
                                    flex: 1, height: 46,
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    color: '#475569',
                                    fontSize: 13, fontWeight: 500,
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                            <button
                                type="button"
                                style={{
                                    flex: 1, height: 46,
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    color: '#475569',
                                    fontSize: 13, fontWeight: 500,
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.98-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.54-3.74 4.25z" /></svg>
                                Apple
                            </button>
                        </div>

                        {/* Sign up link */}
                        <p style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', margin: '8px 0 0' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* ── Responsive ── */}
            <style>{`
                @media (max-width: 960px) {
                    > div:first-child { display: none !important; }
                    > div:last-child { width: 100% !important; flex: unset !important; min-width: 0 !important; }
                }
                @media (max-width: 480px) {
                    > div:last-child { padding: 32px 24px !important; }
                }
            `}</style>
        </div>
    );
}
