import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../shared/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        try {
            await login(email, password);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'super_admin') navigate('/admin');
            else if (user.role === 'owner') navigate('/owner');
            else navigate('/home');
            toast.success('Welcome back!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Invalid credentials';
            toast.error(message);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
            {/* Left image */}
            <div style={{
                flex: 1, background: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80) center/cover',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 48, color: 'white',
            }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TableNest</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>Culinary artistry meets<br />operational precision.</h2>
                <p style={{ fontSize: 14, opacity: 0.8 }}>Secure your access to the most exclusive dining floor plans and management tools.</p>
            </div>

            {/* Right form */}
            <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', background: '#FAF7F5' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Welcome Back</h1>
                    <p style={{ fontSize: 14, color: '#6B7280' }}>Sign in to your TableNest account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={{ width: '100%', padding: '11px 12px 11px 38px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                                onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: 12, color: '#B91C1C', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '11px 38px 11px 38px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                                onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading}
                        style={{ padding: '13px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* Demo accounts */}
                    <div style={{ background: '#FEE2E2', borderRadius: 8, padding: 14, fontSize: 12, color: '#374151' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6, color: '#B91C1C' }}>Demo Accounts</div>
                        <div>Admin: admin@tablenest.com / admin123</div>
                        <div>Owner: owner@tablenest.com / owner123</div>
                        <div>Customer: customer@tablenest.com / customer123</div>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#B91C1C', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}