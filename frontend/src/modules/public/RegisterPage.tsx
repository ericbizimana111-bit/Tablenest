import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../shared/utils/auth.utils';
import toast from 'react-hot-toast';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register, isSubmitting } = useAuth();

    type RegisterForm = {
        fullName: string;
        email: string;
        password: string;
        confirm: string;
    };

    const [form, setForm] = useState<RegisterForm>({
        fullName: '',
        email: '',
        password: '',
        confirm: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (key: keyof RegisterForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirm) {
            toast.error('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            const user = await register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
            });

            toast.success('Welcome to TableNest!');
            navigate(getRoleHomePath(user.role), { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            toast.error(message);
        }
    };

    const inputWrapper = {
        position: 'relative' as const
    };

    const iconStyle = {
        position: 'absolute' as const,
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94A3B8'
    };

    const inputStyle = {
        width: '100%',
        height: 52,
        paddingLeft: 44,
        paddingRight: 14,
        border: '1.5px solid #E2E8F0',
        borderRadius: 12,
        fontSize: 14,
        background: '#fff',
        outline: 'none',
        boxSizing: 'border-box' as const
    };

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            fontFamily: 'Poppins, sans-serif',
            background: '#F8FAFC'
        }}>









         

            {/* LEFT SIDE */}
            <div
                style={{
                    width: '50%',
                    background:
                        'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80)', // Slightly darkened the overlay for better overall contrast
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    color: '#fff',
                    boxSizing: 'border-box'
                }}
            >
                {/* BRAND LOGO - HIGH VISIBILITY UPGRADE */}
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        width: 'fit-content',
                        background: 'rgba(255, 255, 255, 0.07)', // Glassmorphism backdrop to isolate it from image noise
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        padding: '10px 20px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div
                        style={{
                            width: 40, // Expanded slightly for better visual presence
                            height: 40,
                            background: '#F97316',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.5)', // Stronger brand glow
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2z" />
                            <path d="M18 18a4 4 0 0 0-1.23-7.79 4.36 4.36 0 0 0-9.54 0A4 4 0 0 0 6 18" />
                        </svg>
                    </div>
                    <span
                        style={{
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: 23,
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)', // Adds a crisp text boundary layer
                        }}
                    >
                        TableNest
                    </span>
                </Link>

                {/* SLOGAN & MARKETING TEXT */}
                <div style={{ marginTop: 'auto' }}>
                    <h2
                        style={{
                            fontSize: 40,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            marginBottom: 16,
                            maxWidth: 500,
                        }}
                    >

                        Join thousands of
                        <br />
                        food enthusiasts.
                    </h2>

                    <p
                        style={{
                            fontSize: 16,
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: 500,
                        }}
                    >
                        Discover amazing restaurants, book tables instantly, and earn rewards.
                    </p>
                </div>
            </div>







            {/* RIGHT SIDE */}
            <div style={{
                width: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: '60px'
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    <div style={{ marginBottom: 30 }}>
                        <h1 style={{
                            fontSize: 34,
                            fontWeight: 700,
                            color: '#0F172A',
                            marginBottom: 10
                        }}>
                            Create Account
                        </h1>

                        <p style={{ fontSize: 15, color: '#475569' }}>
                            Start your culinary journey today
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* FULL NAME */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                                Full Name
                            </label>

                            <div style={inputWrapper}>
                                <User size={18} style={iconStyle} />

                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.fullName}
                                    onChange={e => handleChange('fullName', e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                                Email Address
                            </label>

                            <div style={inputWrapper}>
                                <Mail size={18} style={iconStyle} />

                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                                Password
                            </label>

                            <div style={inputWrapper}>
                                <Lock size={18} style={iconStyle} />

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    style={{ ...inputStyle, paddingRight: 44 }}
                                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
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
                                        color: '#94A3B8'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                                Confirm Password
                            </label>

                            <div style={inputWrapper}>
                                <Lock size={18} style={iconStyle} />

                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.confirm}
                                    onChange={e => handleChange('confirm', e.target.value)}
                                    style={{ ...inputStyle, paddingRight: 44 }}
                                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
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
                                        color: '#94A3B8'
                                    }}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                height: 54,
                                background: '#F97316',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginTop: 6,
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? 'Creating account...' : 'Create Account'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 15 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#F97316', fontWeight: 600 }}>
                                Sign in
                            </Link>
                        </p>
                        


                        <div style={{ textAlign: 'center', fontSize: 15,}}>
                            Are you a restaurant owner?{' '}
                            <Link to="/partner/register" style={{ color: '#F97316', fontWeight: '600' }}>
                                Register Your Restaurant 
                            </Link>
                        </div>




                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;