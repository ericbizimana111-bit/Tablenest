import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../shared/contexts/AuthContext';
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
                role: 'customer'
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
        color: '#9CA3AF'
    };

    const inputStyle = {
        width: '100%',
        height: 52,
        paddingLeft: 44,
        paddingRight: 14,
        border: '1.5px solid #E5E7EB',
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
            background: '#FAF7F5'
        }}>

            {/* LEFT SIDE */}
            <div style={{
                width: '50%',
                background: 'linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&q=80) center/cover',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '60px',
                color: '#fff'
            }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                    TableNest
                </div>

                <h2 style={{
                    fontSize: 40,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: 16,
                    maxWidth: 500
                }}>
                    Join thousands of
                    <br />
                    food enthusiasts.
                </h2>

                <p style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    opacity: 0.9,
                    maxWidth: 500
                }}>
                    Discover amazing restaurants, book tables instantly, and earn rewards.
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div style={{
                width: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#FAF7F5',
                padding: '60px'
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    <div style={{ marginBottom: 30 }}>
                        <h1 style={{
                            fontSize: 34,
                            fontWeight: 700,
                            color: '#111827',
                            marginBottom: 10
                        }}>
                            Create Account
                        </h1>

                        <p style={{ fontSize: 15, color: '#6B7280' }}>
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
                                    onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
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
                                    onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
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
                                    onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
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
                                        color: '#9CA3AF'
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
                                    onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
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
                                        color: '#9CA3AF'
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
                                background: '#B91C1C',
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

                        <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#B91C1C', fontWeight: 600 }}>
                                Sign in
                            </Link>
                        </p>
                        <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
                            Are you a restaurant owner?{' '}
                            <Link to="/partner/register" style={{ color: '#B91C1C', fontWeight: 500, textDecoration: 'none' }}>Register here</Link>
                        </div>


                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;