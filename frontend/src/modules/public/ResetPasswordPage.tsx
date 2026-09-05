import React, { useState } from 'react';
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
        width: '100%', height: 52, paddingLeft: 44, paddingRight: 44,
        border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12,
        fontSize: 14, background: 'rgba(255,255,255,0.06)', color: '#FFFFFF',
        outline: 'none', boxSizing: 'border-box' as const,
        fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s ease',
    };

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', background: '#0C1426' }}>
            {/* Left side */}
            <div style={{
                flex: 1, position: 'relative',
                background: 'linear-gradient(135deg, rgba(12,20,38,0.92) 0%, rgba(15,23,42,0.85) 100%), url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85)',
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
                        Create a new<br />secure password.
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.8, maxWidth: 460 }}>
                        Make sure it's something strong and unique that you haven't used before.
                    </p>
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}><div style={{ width: 60, height: 3, background: '#F97316', borderRadius: 2 }} /></div>
            </div>

            {/* Right side */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                background: '#0F172A', padding: '48px 56px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
                <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#FFFFFF', marginBottom: 8, letterSpacing: '-0.5px' }}>Reset Password</h1>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Choose a strong password for your account</p>
                    </div>

                    {errors.general && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#FCA5A5', fontSize: 13 }}>{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* New Password */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#F97316' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Min. 6 characters" style={{ ...inputBase, borderColor: focusedField === 'password' ? '#F97316' : 'rgba(255,255,255,0.12)', background: focusedField === 'password' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)' }} />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }} tabIndex={-1}>
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span style={{ fontSize: 12, color: '#FCA5A5', marginTop: 4, display: 'block' }}>{errors.password}</span>}
                            {password.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 600 }}>{strengthLabels[strength]}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'confirm' ? '#F97316' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                                <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => { setConfirm(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined })); }} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} placeholder="Re-enter your password" style={{ ...inputBase, borderColor: focusedField === 'confirm' ? '#F97316' : 'rgba(255,255,255,0.12)', background: focusedField === 'confirm' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)' }} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }} tabIndex={-1}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirm && <span style={{ fontSize: 12, color: '#FCA5A5', marginTop: 4, display: 'block' }}>{errors.confirm}</span>}
                        </div>

                        <button type="submit" disabled={loading} style={{
                            height: 52, background: loading ? 'rgba(249,115,22,0.7)' : '#F97316',
                            color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.3)',
                            fontFamily: 'Poppins, sans-serif', marginTop: 4, transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#EA6A08'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F97316'; }}
                        >
                            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</> : <>Reset Password <ArrowRight size={18} /></>}
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </form>
                </div>
            </div>
            <style>{`@media (max-width: 960px) { > div:first-child { display: none !important; } > div:last-child { width: 100% !important; flex: unset !important; min-width: 0 !important; } } @media (max-width: 480px) { > div:last-child { padding: 32px 24px !important; } }`}</style>
        </div>
    );
}
