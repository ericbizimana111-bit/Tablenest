import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../shared/utils/auth.utils';
import toast from 'react-hot-toast';


export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isSubmitting } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const loggedInUser = await login(email, password);
            navigate(getRoleHomePath(loggedInUser.role), { replace: true });
            toast.success('Welcome back!');
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Invalid credentials';

            toast.error(message);
        }
    };

    return (
        <div
            style={{
                fontFamily: 'Poppins, sans-serif',
                background: '#F8FAFC',
                minHeight: '100vh',
            }}
        >
        <div
            style={{
                display: 'flex',
                width: '100%',
                minHeight: '100vh',
            }}
        >
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
                        Culinary artistry meets
                        <br />
                        operational precision.
                    </h2>

                    <p
                        style={{
                            fontSize: 16,
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: 500,
                        }}
                    >
                        Secure your access to the most exclusive dining floor
                        plans and management tools.
                    </p>
                </div>
            </div>









            {/* RIGHT SIDE */}
            <div
                style={{
                    width: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#F8FAFC',
                    padding: '60px',
                    boxSizing: 'border-box'
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                    }}
                >
                    <div style={{ marginBottom: 36 }}>
                        <h1
                            style={{
                                fontSize: 34,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 10,
                            }}
                        >
                            Welcome Back
                        </h1>

                        <p
                            style={{
                                fontSize: 15,
                                color: '#475569',
                            }}
                        >
                            Sign in to your TableNest account
                        </p>
                    </div>





                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 22,
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#475569',
                                }}
                            >
                                Email Address
                            </label>

                            <div style={{ position: 'relative' }}>
                                <Mail
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94A3B8',
                                    }}
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%',
                                        height: 52,
                                        paddingLeft: 44,
                                        border: '1.5px solid #E2E8F0',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        background: '#fff',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#475569',
                                    }}
                                >
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    style={{
                                        fontSize: 12,
                                        color: '#F97316',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94A3B8',
                                    }}
                                />

                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        height: 52,
                                        paddingLeft: 44,
                                        paddingRight: 44,
                                        border: '1.5px solid #E2E8F0',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        background: '#fff',
                                        outline: 'none',
                                        boxSizing: 'border-box',
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
                                    }}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

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
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </button>


                        <p
                            style={{
                                textAlign: 'center',
                                fontSize: 14,
                                color: '#475569',
                            }}
                        >
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#F97316',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
}