import React, { useState } from 'react';
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

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Left side */}
            <div style={{
                flex: 1, position: 'relative',
                background: 'linear-gradient(135deg, rgba(12,20,38,0.92) 0%, rgba(15,23,42,0.85) 100%), url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85)',
                backgroundPosition: 'center', backgroundSize: 'cover',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '48px 56px', color: '#fff', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', width: 'fit-content', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 42, height: 42, background: '#F97316', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" /><path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>TableNest</span>
                </Link>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
                    <h2 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, marginBottom: 18, letterSpacing: '-1px' }}>
                        Reset your password<br />in seconds.
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.8, maxWidth: 460 }}>
                        We'll send you a secure link to get back into your account.
                    </p>
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}><div style={{ width: 60, height: 3, background: '#F97316', borderRadius: 2 }} /></div>
            </div>

            {/* Right side */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                background: 'white', padding: '48px 56px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
                    {!sent ? (
                        <>
                            <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0, fontFamily: 'Poppins, sans-serif' }}>
                                <ArrowLeft size={14} /> Back
                            </button>
                            <div style={{ marginBottom: 36 }}>
                                <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.5px' }}>Forgot Password</h1>
                                <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>Enter your email and we'll help you reset your password</p>
                            </div>

                            {error && (
                                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#EF4444', fontSize: 13 }}>{error}</div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#F97316' : '#94A3B8', transition: 'color 0.2s' }} />
                                        <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="you@example.com" style={{
                                            width: '100%', height: 52, paddingLeft: 44, border: '1.5px solid', borderColor: focused ? '#F97316' : '#E2E8F0',
                                            borderRadius: 12, fontSize: 14, background: focused ? '#FFF7ED' : 'white', color: '#0F172A', outline: 'none',
                                            boxSizing: 'border-box' as const, fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s',
                                        }} />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} style={{
                                    height: 52, background: loading ? 'rgba(249,115,22,0.7)' : '#F97316',
                                    color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.3)',
                                    fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#EA6A08'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F97316'; }}
                                >
                                    {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <>Send Reset Link <ArrowRight size={18} /></>}
                                </button>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, color: '#94A3B8', textDecoration: 'none' }}>
                                    <ArrowLeft size={14} />
                                    <span>Back to Sign In</span>
                                </Link>
                            </form>
                        </>
                    ) : (
                        /* Success state */
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: '#F0FDF4', border: '2px solid #22C55E',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}>
                                <CheckCircle size={32} color="#22C55E" />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Check Your Email</h2>
                            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32, lineHeight: 1.6 }}>
                                We've sent a password reset link to<br />
                                <strong style={{ color: '#F97316' }}>{email}</strong>
                            </p>
                            <button onClick={() => { setSent(false); setEmail(''); }} style={{
                                width: '100%', height: 50, borderRadius: 12,
                                border: '1.5px solid #E2E8F0', background: 'white',
                                color: '#475569', fontSize: 14, fontWeight: 500,
                                cursor: 'pointer', marginBottom: 12, fontFamily: 'Poppins, sans-serif',
                            }}>
                                Try a different email
                            </button>
                            <Link to="/login" style={{
                                display: 'flex', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 12,
                                background: '#F97316', color: '#fff', fontSize: 14, fontWeight: 700,
                                textDecoration: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                            }}>
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@media (max-width: 960px) { > div:first-child { display: none !important; } > div:last-child { width: 100% !important; flex: unset !important; min-width: 0 !important; } } @media (max-width: 480px) { > div:last-child { padding: 32px 24px !important; } }`}</style>
        </div>
    );
}
