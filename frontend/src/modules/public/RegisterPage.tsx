// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { User, Mail, Lock, Eye, EyeOff, ChefHat } from 'lucide-react';
// import { useAuthStore } from '../../store/authStore';
// import toast from 'react-hot-toast';
// import { authAPI } from '../../services/api';

// // ── RegisterPage ──
// export function RegisterPage() {
//     const navigate = useNavigate();
//     const { register, isLoading } = useAuthStore();
//     const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
//     const [show, setShow] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
//         if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
//         try {
//             await register({ fullName: form.fullName, email: form.email, password: form.password, role: 'customer' });
//             navigate('/home');
//             toast.success('Welcome to TableNest!');
//         } catch (err: any) {
//             toast.error(err?.response?.data?.message || 'Registration failed');
//         }
//     };

//     return (
//         <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
//             <div style={{ flex: 1, background: 'linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&q=80) center/cover', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 48, color: 'white' }}>
//                 <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TableNest</div>
//                 <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>Join thousands of<br />food enthusiasts.</h2>
//                 <p style={{ fontSize: 14, opacity: 0.8 }}>Discover amazing restaurants, book tables instantly, and earn rewards.</p>
//             </div>
//             <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', background: '#FAF7F5' }}>
//                 <div style={{ marginBottom: 28 }}>
//                     <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Create Account</h1>
//                     <p style={{ fontSize: 14, color: '#6B7280' }}>Start your culinary journey today</p>
//                 </div>
//                 <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//                     {[
//                         { label: 'Full Name', key: 'fullName', type: 'text', icon: <User size={15} color="#9CA3AF" />, placeholder: 'John Doe' },
//                         { label: 'Email Address', key: 'email', type: 'email', icon: <Mail size={15} color="#9CA3AF" />, placeholder: 'you@example.com' },
//                     ].map(f => (
//                         <div key={f.key}>
//                             <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
//                             <div style={{ position: 'relative' }}>
//                                 <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>{f.icon}</span>
//                                 <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
//                                     style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
//                                     onFocus={e => (e.target.style.borderColor = '#B91C1C')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
//                             </div>
//                         </div>
//                     ))}
//                     {[
//                         { label: 'Password', key: 'password', placeholder: '••••••••' },
//                         { label: 'Confirm Password', key: 'confirm', placeholder: '••••••••' },
//                     ].map(f => (
//                         <div key={f.key}>
//                             <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
//                             <div style={{ position: 'relative' }}>
//                                 <Lock size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
//                                 <input type={show ? 'text' : 'password'} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
//                                     style={{ width: '100%', padding: '10px 36px 10px 36px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}
//                                     onFocus={e => (e.target.style.borderColor = '#B91C1C')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
//                                 <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
//                                     {show ? <EyeOff size={15} /> : <Eye size={15} />}
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                     <button type="submit" disabled={isLoading}
//                         style={{ padding: '12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 4 }}>
//                         {isLoading ? 'Creating account...' : 'Create Account'}
//                     </button>
//                     <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
//                         Already have an account? <Link to="/login" style={{ color: '#B91C1C', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
//                     </p>
//                     <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
//                         Are you a restaurant owner?{' '}
//                         <Link to="/partner/register" style={{ color: '#B91C1C', fontWeight: 500, textDecoration: 'none' }}>Register here</Link>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // ── ForgotPasswordPage ──
// export function ForgotPasswordPage() {
//     const [email, setEmail] = useState('');
//     const [sent, setSent] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             await authAPI.forgotPassword(email);
//             setSent(true);
//         } catch { toast.error('Error sending reset email'); }
//         finally { setLoading(false); }
//     };

//     return (
//         <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F5', fontFamily: 'Poppins, sans-serif' }}>
//             <div style={{ background: 'white', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
//                 <div style={{ textAlign: 'center', marginBottom: 28 }}>
//                     <div style={{ color: '#B91C1C', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>TableNest</div>
//                     {sent ? (
//                         <>
//                             <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
//                             <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check Your Email</h2>
//                             <p style={{ fontSize: 14, color: '#6B7280' }}>We've sent password reset instructions to <strong>{email}</strong></p>
//                         </>
//                     ) : (
//                         <>
//                             <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Forgot Password?</h2>
//                             <p style={{ fontSize: 14, color: '#6B7280' }}>Enter your email and we'll send you a reset link.</p>
//                         </>
//                     )}
//                 </div>
//                 {!sent && (
//                     <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//                         <div>
//                             <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email Address</label>
//                             <div style={{ position: 'relative' }}>
//                                 <Mail size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
//                                 <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
//                                     style={{ width: '100%', padding: '11px 12px 11px 36px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }}
//                                     onFocus={e => (e.target.style.borderColor = '#B91C1C')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
//                             </div>
//                         </div>
//                         <button type="submit" disabled={loading}
//                             style={{ padding: '12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
//                             {loading ? 'Sending...' : 'Send Reset Link'}
//                         </button>
//                         <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
//                             ← <Link to="/login" style={{ color: '#B91C1C', textDecoration: 'none' }}>Back to Log In</Link>
//                         </p>
//                     </form>
//                 )}
//                 {sent && (
//                     <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#B91C1C', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
//                         Back to Login
//                     </Link>
//                 )}
//             </div>
//         </div>
//     );
// }

// // ── ResetPasswordPage ──
// export function ResetPasswordPage() {
//     const navigate = useNavigate();
//     const [password, setPassword] = useState('');
//     const [confirm, setConfirm] = useState('');
//     const [loading, setLoading] = useState(false);
//     const token = new URLSearchParams(window.location.search).get('token') || '';

//     const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
//     const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength];
//     const strengthColor = ['', '#DC2626', '#D97706', '#16A34A'][strength];

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (password !== confirm) { toast.error('Passwords do not match'); return; }
//         setLoading(true);
//         try {
//             await authAPI.resetPassword({ token, password });
//             toast.success('Password reset successfully');
//             navigate('/login');
//         } catch { toast.error('Reset link expired or invalid'); }
//         finally { setLoading(false); }
//     };

//     return (
//         <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
//             <div style={{ flex: 1, background: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=80) center/cover', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 48, color: 'white' }}>
//                 <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TableNest</div>
//                 <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>Culinary artistry meets<br />operational precision.</h2>
//                 <p style={{ fontSize: 14, opacity: 0.8 }}>Secure your access to the most exclusive dining floor plans and management tools.</p>
//             </div>
//             <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', background: '#FAF7F5' }}>
//                 <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Reset Password</h1>
//                 <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Please choose a strong password to protect your TableNest account.</p>
//                 <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//                     <div>
//                         <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>New Password</label>
//                         <div style={{ position: 'relative' }}>
//                             <Lock size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
//                             <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
//                                 style={{ width: '100%', padding: '11px 12px 11px 36px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }} />
//                         </div>
//                         {password && (
//                             <div style={{ marginTop: 8 }}>
//                                 <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
//                                     {[1, 2, 3].map(i => (
//                                         <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColor : '#E5E7EB', transition: 'all 0.3s' }} />
//                                     ))}
//                                 </div>
//                                 <span style={{ fontSize: 12, color: strengthColor }}>Strength: {strengthLabel}</span>
//                             </div>
//                         )}
//                     </div>
//                     <div>
//                         <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Confirm Password</label>
//                         <div style={{ position: 'relative' }}>
//                             <Lock size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
//                             <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
//                                 style={{ width: '100%', padding: '11px 12px 11px 36px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }} />
//                         </div>
//                     </div>
//                     <button type="submit" disabled={loading}
//                         style={{ padding: '12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
//                         {loading ? 'Resetting...' : 'Reset Password'}
//                     </button>
//                     <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
//                         ← <Link to="/login" style={{ color: '#B91C1C', textDecoration: 'none' }}>Back to Log In</Link>
//                     </p>
//                 </form>
//                 <div style={{ marginTop: 24, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16 }}>
//                     <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Password Requirements</div>
//                     {['At least 8 characters long', 'Include one uppercase letter', 'Include one number or symbol'].map((r, i) => (
//                         <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: i === 2 && password.length < 8 ? '#9CA3AF' : '#374151' }}>
//                             <span style={{ color: password.length >= 8 ? '#16A34A' : '#D1D5DB', fontSize: 16 }}>○</span>{r}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }

// // ── NotFoundPage ──
// export function NotFoundPage() {
//     const navigate = useNavigate();
//     return (
//         <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
//             <nav style={{ height: 60, background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 80px', gap: 32 }}>
//                 <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/')}>TableNest</span>
//                 <div style={{ flex: 1 }} />
//                 {['Home', 'Restaurants', 'How It Works', 'About Us'].map(l => (
//                     <span key={l} style={{ fontSize: 14, color: '#374151', cursor: 'pointer' }}>{l}</span>
//                 ))}
//                 <span onClick={() => navigate('/login')} style={{ fontSize: 14, color: '#374151', cursor: 'pointer' }}>Log In</span>
//                 <button onClick={() => navigate('/register')} style={{ background: '#B91C1C', color: 'white', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Sign Up</button>
//             </nav>
//             <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '80px', gap: 80 }}>
//                 <div style={{ flex: 1, position: 'relative' }}>
//                     <img src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=500&q=80" alt="Chef" style={{ width: '100%', maxWidth: 480, borderRadius: 12, objectFit: 'cover' }} />
//                     <div style={{ position: 'absolute', bottom: 32, right: 32, background: '#B91C1C', color: 'white', padding: 16, borderRadius: 12 }}>
//                         <ChefHat size={32} />
//                     </div>
//                 </div>
//                 <div>
//                     <div style={{ fontSize: 80, fontWeight: 700, color: '#B91C1C', lineHeight: 1, marginBottom: 16 }}>404</div>
//                     <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Oops! This table is reserved<br />for someone else</h2>
//                     <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps it never existed in our menu.</p>
//                     <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
//                         <button onClick={() => navigate('/')} style={{ padding: '11px 24px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Back to Home</button>
//                         <button onClick={() => navigate('/restaurants')} style={{ padding: '11px 24px', background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Report an Issue</button>
//                     </div>
//                     <div style={{ marginBottom: 12 }}>
//                         <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em' }}>TRY SEARCHING FOR:</span>
//                     </div>
//                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                         {['Fine Dining', 'Italian Cuisine', 'Late Night'].map(tag => (
//                             <span key={tag} onClick={() => navigate(`/restaurants?search=${tag}`)} style={{ padding: '6px 14px', border: '1.5px solid #E5E7EB', borderRadius: 9999, fontSize: 13, cursor: 'pointer', color: '#374151', background: 'white' }}>{tag}</span>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//             <footer style={{ background: '#1F1F1F', padding: '32px 80px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
//                 <div>
//                     <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>TableNest</div>
//                     <p style={{ color: '#9CA3AF', fontSize: 12, lineHeight: 1.6 }}>Culinary artistry meets operational precision. We connect diners with the world's most exceptional tables.</p>
//                 </div>
//                 {[['Quick Links', ['Browse Restaurants', 'Table Specials', 'Gift Cards']], ['For Restaurants', ['List Your Venue', 'Partner Dashboard', 'Resources']], ['Contact Info', ['support@tablenest.com', '1-800-NEST-RES']]].map(([title, items]: any) => (
//                     <div key={title}>
//                         <div style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{title}</div>
//                         {items.map((i: string) => <div key={i} style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>{i}</div>)}
//                     </div>
//                 ))}
//             </footer>
//         </div>
//     );
// }

// export default RegisterPage;


