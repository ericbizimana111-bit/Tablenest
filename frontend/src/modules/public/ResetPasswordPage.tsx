import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../shared/services/api';
import toast from 'react-hot-toast';
import Header from 

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const token = new URLSearchParams(window.location.search).get('token') || '';

    const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
    const strengthColors = ['', '#DC2626', '#D97706', '#16A34A'];
    const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirm) return toast.error('Please fill in all fields');
        if (password !== confirm) return toast.error('Passwords do not match');

        setLoading(true);
        try {
            await authAPI.resetPassword({ token, password });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch {
            toast.error('Reset link expired or invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

            {/* LEFT */}
            <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TableNest</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>
                    Culinary artistry meets<br />operational precision.
                </h2>
            </div>

            {/* RIGHT */}
            <div style={{
                width: 480,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 52px',
                background: '#FAF7F5'
            }}>

                <h1 style={{ fontSize: 34, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                    Reset Password
                </h1>

                <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28 }}>
                    Choose a strong password for your account
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                    {/* PASSWORD */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>
                            New Password
                        </label>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9CA3AF'
                            }} />

                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    height: 52,
                                    paddingLeft: 44,
                                    paddingRight: 44,
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    background: '#fff',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
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
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {password && (
                            <div style={{ marginTop: 8 }}>
                                <span style={{ fontSize: 12, color: strengthColors[strength] }}>
                                    Strength: {strengthLabels[strength]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONFIRM */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>
                            Confirm Password
                        </label>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9CA3AF'
                            }} />

                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    height: 52,        // ✅ MATCH LOGIN
                                    paddingLeft: 44,
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    background: '#fff',                                                                                                                                                                                                                                                                                                     
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            height: 54,
                            background: '#B91C1C',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p style={{
                        textAlign: 'center',
                        fontSize: 14,
                        color: '#6B7280',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        <ArrowLeft size={13} />
                        <Link to="/login" style={{ color: '#B91C1C', fontWeight: 600, textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    );
}