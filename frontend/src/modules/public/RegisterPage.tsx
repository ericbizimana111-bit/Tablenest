import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, UtensilsCrossed, Store } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../shared/utils/auth.utils';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, registerOwner, isSubmitting } = useAuth();

    type Role = 'customer' | 'owner';
    type RegisterForm = { fullName: string; email: string; password: string; confirm: string; phone: string };

    const [role, setRole] = useState<Role | null>(null);
    const [form, setForm] = useState<RegisterForm>({ fullName: '', email: '', password: '', confirm: '', phone: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm | 'general', string>>>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const update = (key: keyof RegisterForm, val: string) => setForm(prev => ({ ...prev, [key]: val }));

    const getPasswordStrength = (pw: string) => {
        if (pw.length === 0) return { level: 0, label: '', color: '' };
        if (pw.length < 6) return { level: 1, label: 'Weak', color: '#EF4444' };
        if (pw.length < 10) return { level: 2, label: 'Fair', color: '#F59E0B' };
        if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw.length >= 12)
            return { level: 4, label: 'Strong', color: '#22C55E' };
        return { level: 3, label: 'Good', color: '#3B82F6' };
    };

    const strength = getPasswordStrength(form.password);

    const validate = () => {
        const errs: typeof errors = {};
        if (!form.fullName.trim()) errs.fullName = 'Full name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'At least 6 characters required';
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
        if (role === 'owner' && !form.phone) errs.phone = 'Phone number is required for owners';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        try {
            let user;
            if (role === 'owner') {
                user = await registerOwner({
                    fullName: form.fullName,
                    email: form.email,
                    password: form.password,
                });
            } else {
                user = await register({
                    fullName: form.fullName,
                    email: form.email,
                    password: form.password,
                });
            }
            navigate(getRoleHomePath(user.role), { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setErrors({ general: message });
        }
    };

    const inputBase: React.CSSProperties = {
        width: '100%', height: 52, paddingLeft: 44, paddingRight: 14,
        border: '1.5px solid #E2E8F0', borderRadius: 12,
        fontSize: 14, background: 'white', color: '#0F172A',
        outline: 'none', boxSizing: 'border-box' as const,
        fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s ease',
    };

    const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569' };

    // ── Role Selection Screen ──
    if (!role) {
        return (
            <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', background: 'white' }}>
                {/* Left side */}
                <div style={{
                    flex: 1, position: 'relative',
                    background: 'linear-gradient(135deg, rgba(12,20,38,0.92) 0%, rgba(15,23,42,0.85) 100%), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85)',
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
                            Join thousands of<br />food enthusiasts.
                        </h2>
                        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.8, maxWidth: 460 }}>
                            Discover amazing restaurants, book tables instantly, and earn rewards.
                        </p>
                        <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
                            {[{ num: '2,400+', label: 'Restaurants' }, { num: '50K+', label: 'Reservations' }, { num: '4.9', label: 'App Rating' }].map(s => (
                                <div key={s.label}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#F97316' }}>{s.num}</div>
                                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}><div style={{ width: 60, height: 3, background: '#F97316', borderRadius: 2 }} /></div>
                </div>

                {/* Right side — role selection */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                background: 'white', padding: '48px 56px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
            }}>
                    <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
                        <div style={{ marginBottom: 36 }}>
                            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.5px' }}>Create Account</h1>
                            <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>How would you like to use TableNest?</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Customer */}
                            <button
                                onClick={() => setRole('customer')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px',
                                    background: 'white', border: '1.5px solid #E2E8F0',
                                    borderRadius: 14, cursor: 'pointer', textAlign: 'left', color: '#0F172A',
                                    transition: 'all 0.2s', fontFamily: 'Poppins, sans-serif',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.background = '#FFF7ED'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <UtensilsCrossed size={22} color="#60A5FA" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>Customer</div>
                                    <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                                        Discover restaurants · Book tables · Pre-order meals · Earn rewards
                                    </div>
                                </div>
                                <ArrowRight size={18} color="#94A3B8" />
                            </button>

                            {/* Owner */}
                            <button
                                onClick={() => setRole('owner')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px',
                                    background: 'white', border: '1.5px solid #E2E8F0',
                                    borderRadius: 14, cursor: 'pointer', textAlign: 'left', color: '#0F172A',
                                    transition: 'all 0.2s', fontFamily: 'Poppins, sans-serif',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.background = '#FFF7ED'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, background: 'rgba(249,115,22,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Store size={22} color="#F97316" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>Restaurant Owner</div>
                                    <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                                        Register your restaurant · Manage bookings · Upload menus · Analytics
                                    </div>
                                </div>
                                <ArrowRight size={18} color="#94A3B8" />
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', marginTop: 28 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </div>
                </div>
                <style>{`@media (max-width: 960px) { > div:first-child { display: none !important; } > div:last-child { width: 100% !important; flex: unset !important; min-width: 0 !important; } }`}</style>
            </div>
        );
    }

    // ── Registration Form ──
    return (            <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Left side */}
            <div style={{
                flex: 1, position: 'relative',
                background: 'linear-gradient(135deg, rgba(12,20,38,0.92) 0%, rgba(15,23,42,0.85) 100%), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85)',
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
                        Join thousands of<br />food enthusiasts.
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.8, maxWidth: 460 }}>
                        Discover amazing restaurants, book tables instantly, and earn rewards.
                    </p>
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}><div style={{ width: 60, height: 3, background: '#F97316', borderRadius: 2 }} /></div>
            </div>

            {/* Right side — form */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                background: 'white', padding: '40px 56px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
                    {/* Back + Header */}
                    <button onClick={() => setRole(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0, fontFamily: 'Poppins, sans-serif' }}>
                        <ArrowLeft size={14} /> Back
                    </button>
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.5px' }}>
                            Create {role === 'owner' ? 'Owner' : 'Customer'} Account
                        </h1>
                        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                            {role === 'owner' ? 'Set up your account to manage your restaurant' : 'Start your culinary journey today'}
                        </p>
                    </div>

                    {errors.general && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Full Name */}
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'fullName' ? '#F97316' : '#94A3B8', transition: 'color 0.2s' }} />
                                <input type="text" value={form.fullName} onChange={e => { update('fullName', e.target.value); if (errors.fullName) setErrors(p => ({ ...p, fullName: undefined })); }} onFocus={() => setFocusedField('fullName')} onBlur={() => setFocusedField(null)} placeholder="John Doe" style={{ ...inputBase, borderColor: focusedField === 'fullName' ? '#F97316' : '#E2E8F0', background: focusedField === 'fullName' ? '#FFF7ED' : 'white' }} />
                            </div>
                            {errors.fullName && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 3, display: 'block' }}>{errors.fullName}</span>}
                        </div>

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#F97316' : '#94A3B8', transition: 'color 0.2s' }} />
                                <input type="email" value={form.email} onChange={e => { update('email', e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="you@example.com" style={{ ...inputBase, borderColor: focusedField === 'email' ? '#F97316' : '#E2E8F0', background: focusedField === 'email' ? '#FFF7ED' : 'white' }} />
                            </div>
                            {errors.email && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 3, display: 'block' }}>{errors.email}</span>}
                        </div>

                        {/* Phone — owner only */}
                        {role === 'owner' && (
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <div style={{ position: 'relative' }}>                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={focusedField === 'phone' ? '#F97316' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'stroke 0.2s' }}>
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input type="tel" value={form.phone} onChange={e => { update('phone', e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: undefined })); }} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} placeholder="+1 (555) 000-1234" style={{ ...inputBase, borderColor: focusedField === 'phone' ? '#F97316' : '#E2E8F0', background: focusedField === 'phone' ? '#FFF7ED' : 'white' }} />
                                </div>
                                {errors.phone && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 3, display: 'block' }}>{errors.phone}</span>}
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#F97316' : '#94A3B8', transition: 'color 0.2s' }} />
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => { update('password', e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Min. 6 characters" style={{ ...inputBase, paddingRight: 44, borderColor: focusedField === 'password' ? '#F97316' : '#E2E8F0', background: focusedField === 'password' ? '#FFF7ED' : 'white' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }} tabIndex={-1}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 3, display: 'block' }}>{errors.password}</span>}                                {form.password.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength.level ? strength.color : '#E2E8F0', transition: 'all 0.3s' }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={labelStyle}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'confirm' ? '#F97316' : '#94A3B8', transition: 'color 0.2s' }} />
                                <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={e => { update('confirm', e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined })); }} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} placeholder="Re-enter your password" style={{ ...inputBase, paddingRight: 44, borderColor: focusedField === 'confirm' ? '#F97316' : '#E2E8F0', background: focusedField === 'confirm' ? '#FFF7ED' : 'white' }} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }} tabIndex={-1}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirm && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 3, display: 'block' }}>{errors.confirm}</span>}
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isSubmitting} style={{
                            height: 52, background: isSubmitting ? 'rgba(249,115,22,0.7)' : '#F97316',
                            color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(249,115,22,0.3)',
                            fontFamily: 'Poppins, sans-serif', marginTop: 4, transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#EA6A08'; }}
                            onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = '#F97316'; }}
                        >
                            {isSubmitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                        <p style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', margin: '4px 0 0' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
            <style>{`@media (max-width: 960px) { > div:first-child { display: none !important; } > div:last-child { width: 100% !important; flex: unset !important; min-width: 0 !important; } } @media (max-width: 480px) { > div:last-child { padding: 32px 24px !important; } }`}</style>
        </div>
    );
}
