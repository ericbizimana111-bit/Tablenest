import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { authAPI } from '../../shared/services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');

        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch {
            toast.error('Error sending reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins, sans-serif' }}>

            {/* LEFT SIDE */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80) center/cover',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 60,
                color: '#fff'
            }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                    TableNest
                </div>

                <h2 style={{
                    fontSize: 34,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: 16,
                    maxWidth: 500
                }}>
                    Reset your password<br />in seconds.
                </h2>

                <p style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    opacity: 0.85,
                    maxWidth: 500
                }}>
                    We'll send you a secure link to get back into your account.
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: 60
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    {!sent ? (
                        <>
                            {/* HEADER */}
                            <div style={{ marginBottom: 32 }}>
                                <h1 style={{
                                    fontSize: 34,
                                    fontWeight: 700,
                                    color: '#0F172A',
                                    marginBottom: 10
                                }}>
                                    Forgot Password
                                </h1>

                                <p style={{ fontSize: 15, color: '#475569' }}>
                                    Enter your email to receive a reset link
                                </p>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 22
                            }}>

                                {/* EMAIL */}
                                <div>
                                    <label style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#475569',
                                        marginBottom: 8,
                                        display: 'block'
                                    }}>
                                        Email Address
                                    </label>

                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{
                                            position: 'absolute',
                                            left: 14,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8'
                                        }} />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
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
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={e => (e.target.style.borderColor = '#F97316')}
                                            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                                        />
                                    </div>
                                </div>

                                {/* BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        height: 54,
                                        background: '#F97316',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 12,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    <Send size={16} />
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                {/* BACK */}
                                <p style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                    color: '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6
                                }}>
                                    <ArrowLeft size={14} />
                                    <Link
                                        to="/login"
                                        style={{
                                            color: '#F97316',
                                            fontWeight: 600,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Back to Login
                                    </Link>
                                </p>

                            </form>
                        </>
                    ) : (
                        /* SUCCESS STATE */
                        <div style={{ textAlign: 'center' }}>

                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: '#DCFCE7',
                                border: '3px solid #16A34A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <CheckCircle size={28} color="#16A34A" />
                            </div>

                            <h2 style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 10
                            }}>
                                Check Your Email
                            </h2>

                            <p style={{
                                fontSize: 14,
                                color: '#475569',
                                marginBottom: 24
                            }}>
                                Reset link sent to <strong>{email}</strong>
                            </p>

                            <button
                                onClick={() => setSent(false)}
                                style={{
                                    width: '100%',
                                    height: 52,
                                    borderRadius: 12,
                                    border: '1.5px solid #E2E8F0',
                                    background: '#fff',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    marginBottom: 12,
                                    cursor: 'pointer'
                                }}
                            >
                                Try Again
                            </button>

                            <Link
                                to="/login"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 52,
                                    borderRadius: 12,
                                    background: '#F97316',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                Back to Login
                            </Link>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}