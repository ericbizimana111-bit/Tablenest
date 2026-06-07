import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../shared/services/api';
import toast from 'react-hot-toast';

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

    const requirements = [
        { label: 'At least 8 characters long', met: password.length >= 8 },
        { label: 'Include one uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Include one number or symbol', met: /[0-9!@#$%^&*]/.test(password) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirm) { toast.error('Please fill in all fields'); return; }
        if (password !== confirm) { toast.error('Passwords do not match'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await authAPI.resetPassword({ token, password });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch { toast.error('Reset link expired or invalid. Please request a new one.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
            {/* Left panel */}
            <div >
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TableNest</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>Culinary artistry meets<br />operational precision.</h2>
                <p style={{ fontSize: 14, opacity: 0.8 }}>Secure your access to the most exclusive dining floor plans and management tools.</p>
            </div>

            {/* Right panel */}
            <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px', background: '#FAF7F5' }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Reset Password</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Please choose a strong password to protect your TableNest account.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* New Password */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '11px 38px 11px 38px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                                onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {password && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColors[strength] : '#E5E7EB', transition: 'background 0.3s' }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: 12, color: strengthColors[strength], fontWeight: 500 }}>Strength: {strengthLabels[strength]}</span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '11px 12px 11px 38px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
                                onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        style={{ padding: '12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <ArrowLeft size={13} />
                        <Link to="/login" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 500 }}>Back to Log In</Link>
                    </p>
                </form>

                {/* Password requirements */}
                <div style={{ marginTop: 24, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 10 }}>Password Requirements</div>
                    {requirements.map(r => (
                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                            {r.met
                                ? <CheckCircle size={14} color="#16A34A" />
                                : <XCircle size={14} color="#D1D5DB" />}
                            <span style={{ color: r.met ? '#16A34A' : '#9CA3AF' }}>{r.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

