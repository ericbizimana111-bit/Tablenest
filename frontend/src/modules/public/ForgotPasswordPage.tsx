
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { toast.error('Please enter your email'); return; }
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch { toast.error('Error sending reset email. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins, sans-serif' }}>
            {/* Left panel */}
            <div style={{ flex: 1, background: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80) center/cover', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 48, color: 'white' }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TableNest</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>Reset your password<br />in seconds.</h2>
                <p style={{ fontSize: 14, opacity: 0.8 }}>We'll send you a secure link to get back into your account.</p>
            </div>

            {/* Right panel */}
            <div style={{ width: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px', background: '#FAF7F5' }}>
                {!sent ? (
                    <>
                        <div style={{ marginBottom: 32 }}>
                            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Forgot Password?</h1>
                            <p style={{ fontSize: 14, color: '#6B7280' }}>Enter your email address and we'll send you a link to reset your password.</p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input
                                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        style={{ width: '100%', padding: '11px 12px 11px 38px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                                        onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                        onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                style={{ padding: '12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Send size={15} /> {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <ArrowLeft size={13} />
                                <Link to="/login" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 500 }}>Back to Log In</Link>
                            </p>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', border: '3px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle size={28} color="#16A34A" />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Check Your Email</h2>
                        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
                            We've sent password reset instructions to<br /><strong>{email}</strong>
                        </p>
                        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Didn't receive the email? Check spam or try again.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button onClick={() => setSent(false)} style={{ padding: '11px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>Try Again</button>
                            <Link to="/login" style={{ padding: '11px', background: '#B91C1C', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>Back to Login</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
