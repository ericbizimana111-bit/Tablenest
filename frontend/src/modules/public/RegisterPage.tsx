import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, ChefHat, Store } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../shared/utils/auth.utils';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, registerOwner, isSubmitting } = useAuth();

    type Role = 'customer' | 'owner';
    type RegisterForm = { fullName: string; email: string; password: string; confirm: string; phone: string };

    const [role, setRole] = useState<'customer' | null>(null);
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
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        try {
            const user = await register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
            });
            navigate(getRoleHomePath(user.role), { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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

    const socialButtonStyle: React.CSSProperties = {
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
    };

    // ── Role Selection Screen ──
    if (!role) {
        return (
            <div style={{
                fontFamily: 'Poppins, sans-serif',
                minHeight: '100vh',
                display: 'flex',
                background: '#F8FAFC',
            }}>
                {/* Left side: White form area */}
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
                                Create Your <span style={{ color: '#FF6B00' }}>Account</span>
                            </h1>
                            <p style={{
                                fontSize: 15,
                                color: '#64748B',
                                margin: 0,
                                lineHeight: 1.5,
                            }}>
                                Join TableNest and discover better dining.
                            </p>
                        </div>

                        {/* Role selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Customer */}
                            <button
                                onClick={() => setRole('customer')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    padding: '16px 18px',
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: '#0B1B3A',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#FF6B00';
                                    e.currentTarget.style.background = '#FFF8F0';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.background = 'white';
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
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: 'rgba(255, 107, 0, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <User size={20} color="#FF6B00" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: '#0B1B3A' }}>Customer</div>
                                    <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                                        Discover restaurants · Book tables · Pre-order meals
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </button>

                            {/* Owner */}
                            <button
                                onClick={() => navigate('/partner/register')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    padding: '16px 18px',
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: '#0B1B3A',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#FF6B00';
                                    e.currentTarget.style.background = '#FFF8F0';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.background = 'white';
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
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: 'rgba(255, 107, 0, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Store size={20} color="#FF6B00" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: '#0B1B3A' }}>Restaurant Owner</div>
                                    <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                                        Register your restaurant · Manage bookings · Analytics
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </button>
                        </div>

                        {/* Terms */}
                        <p style={{
                            fontSize: 11,
                            color: '#94A3B8',
                            marginTop: 16,
                            lineHeight: 1.5,
                            textAlign: 'center',
                        }}>
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </p>

                        {/* Sign in link */}
                        <p style={{
                            textAlign: 'center',
                            fontSize: 14,
                            color: '#64748B',
                            marginTop: 16,
                            lineHeight: 1.5,
                        }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: '#FF6B00',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right side: Navy brand panel */}
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

                    {/* Icon */}
                    <div style={{
                        width: 56,
                        height: 56,
                        background: 'rgba(255, 107, 0, 0.1)',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 32,
                    }}>
                        <ChefHat size={28} color="#FF6B00" />
                    </div>

                    {/* Brand text */}
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
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
                            maxWidth: 280,
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

                {/* Responsive */}
                <style>{`
                    @media (max-width: 900px) {
                        > div:first-child {
                            flex: 1 1 100% !important;
                            max-width: 100% !important;
                        }
                        > div:last-child {
                            flex: 0 0 auto !important;
                            width: 100% !important;
                            min-width: 0 !important;
                            flex-direction: row !important;
                            justify-content: space-between !important;
                            align-items: flex-start !important;
                            padding: 24px 32px !important;
                            gap: 24px !important;
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
                    }
                `}</style>
            </div>
        );
    }

    // ── Registration Form (Customer Only) ──
    return (
        <div style={{
            fontFamily: 'Poppins, sans-serif',
            minHeight: '100vh',
            display: 'flex',
            background: '#F8FAFC',
        }}>
            {/* Left side: White form */}
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
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/register')}
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
                        onFocus={e => e.currentTarget.style.color = '#FF6B00'}
                        onBlur={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                        <ArrowLeft size={14} />
                        Back to Role Selection
                    </button>

                    {/* Header - Centered */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <h1 style={{
                            fontSize: 'clamp(24px, 3.5vw, 30px)',
                            fontWeight: 800,
                            color: '#0B1B3A',
                            marginBottom: 4,
                            letterSpacing: '-0.5px',
                            lineHeight: 1.2,
                        }}>
                            Create Customer <span style={{ color: '#FF6B00' }}>Account</span>
                        </h1>
                        <p style={{
                            fontSize: 14,
                            color: '#64748B',
                            margin: 0,
                            lineHeight: 1.5,
                        }}>
                            Start your culinary journey today
                        </p>
                    </div>

                    {/* General Error */}
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
                        {/* Full Name */}
                        <div>
                            <label style={labelStyle} htmlFor="fullName">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={17} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: focusedField === 'fullName' ? '#FF6B00' : '#94A3B8',
                                    transition: 'color 0.2s',
                                }} />
                                <input
                                    id="fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={e => {
                                        update('fullName', e.target.value);
                                        if (errors.fullName) setErrors(p => ({ ...p, fullName: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('fullName')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="John Doe"
                                    style={{
                                        ...inputBase,
                                        ...(focusedField === 'fullName' ? inputFocused : {}),
                                        ...(errors.fullName ? inputError : {}),
                                    }}
                                />
                            </div>
                            {errors.fullName && <span style={errorTextStyle}>{errors.fullName}</span>}
                        </div>

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
                                    value={form.email}
                                    onChange={e => {
                                        update('email', e.target.value);
                                        if (errors.email) setErrors(p => ({ ...p, email: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="you@example.com"
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
                            <label style={labelStyle} htmlFor="password">Password</label>
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
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => {
                                        update('password', e.target.value);
                                        if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Min. 6 characters"
                                    style={{
                                        ...inputBase,
                                        paddingRight: 44,
                                        ...(focusedField === 'password' ? inputFocused : {}),
                                        ...(errors.password ? inputError : {}),
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
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
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
                            {form.password.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ display: 'flex', gap: 3, flex: 1, marginRight: 8 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                style={{
                                                    height: 3,
                                                    flex: 1,
                                                    borderRadius: 2,
                                                    background: i <= strength.level ? strength.color : '#E2E8F0',
                                                    transition: 'all 0.3s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, minWidth: 40 }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={labelStyle} htmlFor="confirm">Confirm Password</label>
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
                                    id="confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirm}
                                    onChange={e => {
                                        update('confirm', e.target.value);
                                        if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined }));
                                    }}
                                    onFocus={() => setFocusedField('confirm')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Re-enter your password"
                                    style={{
                                        ...inputBase,
                                        paddingRight: 44,
                                        ...(focusedField === 'confirm' ? inputFocused : {}),
                                        ...(errors.confirm ? inputError : {}),
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
                            {errors.confirm && <span style={errorTextStyle}>{errors.confirm}</span>}
                        </div>

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
                                marginTop: 4,
                                boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(255, 107, 0, 0.25)',
                            }}
                            onMouseEnter={e => {
                                if (!isSubmitting) e.currentTarget.style.background = '#E55A00';
                            }}
                            onMouseLeave={e => {
                                if (!isSubmitting) e.currentTarget.style.background = '#FF6B00';
                            }}
                            onFocus={e => {
                                if (!isSubmitting) e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.2)';
                            }}
                            onBlur={e => {
                                if (!isSubmitting) e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 0, 0.25)';
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </button>

                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                        {/* Sign in link */}
                        <p style={{
                            textAlign: 'center',
                            fontSize: 14,
                            color: '#64748B',
                            margin: '4px 0 0',
                            lineHeight: 1.5,
                        }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: '#FF6B00',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}>
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right side: Navy brand panel */}
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

            {/* Responsive */}
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
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: flex-start !important;
                        padding: 24px 32px !important;
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
