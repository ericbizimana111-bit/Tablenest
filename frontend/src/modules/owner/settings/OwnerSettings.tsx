

import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { usersAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export default function OwnerSettings() {
    const { user, setUser } = useAuthStore();
    const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await usersAPI.updateProfile(form);
            setUser(res.data);
            toast.success('Settings saved!');
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Manage your account and restaurant preferences.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Account Information</div>
                    {[
                        { label: 'Full Name', key: 'fullName', type: 'text' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Phone', key: 'phone', type: 'tel' },
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    ))}
                    <button onClick={save} disabled={saving}
                        style={{ width: '100%', padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Notification Preferences</div>
                    {[
                        { label: 'New Reservations', desc: 'Get notified when a new booking arrives' },
                        { label: 'New Orders', desc: 'Alerts for incoming orders' },
                        { label: 'Low Inventory', desc: 'Warnings when stock runs low' },
                        { label: 'New Reviews', desc: 'Notify when guests leave feedback' },
                    ].map((n, i) => (
                        <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{n.desc}</div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
EOF

cat > /home/claude / tablenest / frontend / src / modules / owner / auth / PartnerRegistration.tsx << 'EOF'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Business', 'Operations', 'Media'];
const CUISINES = ['Italian', 'Japanese', 'French', 'Mexican', 'American', 'Chinese', 'Indian', 'Mediterranean', 'Seafood', 'Steakhouse', 'Modern European', 'British Modern', 'Other'];

export default function PartnerRegistration() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuthStore();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        fullName: '', email: '', password: '', restaurantName: '', cuisineType: 'Italian',
        description: '', seatingCapacity: '', priceRange: '$$', address: '', dineIn: true, delivery: false,
    });

    const up = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

    const submit = async () => {
        try {
            if (!isAuthenticated) {
                await register({ fullName: form.fullName, email: form.email, password: form.password, role: 'owner' });
            }
            await restaurantsAPI.create({
                name: form.restaurantName, cuisineType: form.cuisineType, description: form.description,
                seatingCapacity: +form.seatingCapacity, priceRange: form.priceRange,
                address: form.address, dineIn: form.dineIn, delivery: form.delivery,
            });
            toast.success('Application submitted! Await approval.');
            navigate('/owner');
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAF7F5', fontFamily: 'Poppins, sans-serif', padding: '40px 20px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
                <div>
                    {/* Step progress */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > i + 1 ? '#16A34A' : step === i + 1 ? '#B91C1C' : '#E5E7EB', color: step >= i + 1 ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{i + 1}</div>
                                    <span style={{ fontSize: 12, color: step === i + 1 ? '#B91C1C' : '#9CA3AF', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                                </div>
                                {i < 3 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#16A34A' : '#E5E7EB', marginTop: 15 }} />}
                            </React.Fragment>
                        ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 32 }}>
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Partner with TableNest</h2>
                                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Join our exclusive network of top-tier culinary destinations.</p>
                                {[
                                    { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your name' },
                                    { label: 'Email', key: 'email', type: 'email', placeholder: 'restaurant@email.com' },
                                    { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                                ].map(f => (
                                    <div key={f.key} style={{ marginBottom: 16 }}>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => up(f.key, e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Business Information</h2>
                                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Tell us about your restaurant.</p>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Restaurant Name</label>
                                    <input placeholder="The Golden Truffle" value={form.restaurantName} onChange={e => up('restaurantName', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Cuisine Type</label>
                                    <select value={form.cuisineType} onChange={e => up('cuisineType', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                                        {CUISINES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Description</label>
                                    <textarea value={form.description} onChange={e => up('description', e.target.value)} placeholder="Describe your culinary philosophy..."
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', minHeight: 80, resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Seating Capacity</label>
                                        <input type="number" placeholder="120" value={form.seatingCapacity} onChange={e => up('seatingCapacity', e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Price Range</label>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {['$', '$$', '$$$', '$$$$'].map(p => (
                                                <button key={p} onClick={() => up('priceRange', p)}
                                                    style={{ flex: 1, padding: '10px 4px', border: '1.5px solid', borderColor: form.priceRange === p ? '#B91C1C' : '#E5E7EB', borderRadius: 8, background: form.priceRange === p ? '#FEE2E2' : 'white', color: form.priceRange === p ? '#B91C1C' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: form.priceRange === p ? 700 : 400 }}>{p}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Location & Operations</h2>
                                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Set your address and service type.</p>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Primary Address</label>
                                    <input placeholder="23 Culinary Way, Arts District" value={form.address} onChange={e => up('address', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>Services Offered</label>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        {[{ key: 'dineIn', label: 'Dine-in' }, { key: 'delivery', label: 'Delivery' }].map(s => (
                                            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                                                <input type="checkbox" checked={(form as any)[s.key]} onChange={e => up(s.key, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#B91C1C' }} />
                                                {s.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: '#FEE2E2', border: '1px solid #B91C1C', borderRadius: 10, padding: 14 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#B91C1C', marginBottom: 4 }}>Verification Required</div>
                                    <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>To ensure the quality of the TableNest ecosystem, all new partners must provide a valid culinary license and undergo a 48-hour vetting process.</p>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Media & Branding</h2>
                                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Upload your restaurant logo and photos.</p>
                                <div style={{ border: '2px dashed #E5E7EB', borderRadius: 10, padding: 40, textAlign: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Upload Restaurant Logo</div>
                                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>PNG, JPG up to 5MB</div>
                                </div>
                                <div style={{ background: '#F0FDF4', border: '1px solid #16A34A', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, color: '#16A34A', marginBottom: 4 }}>🎉 Ready to Submit!</div>
                                    <p style={{ fontSize: 13, color: '#374151' }}>Review your details and submit your application for approval.</p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                            <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
                                style={{ padding: '10px 20px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                {step === 1 ? 'Back to Home' : '← Back to Step ' + (step - 1)}
                            </button>
                            {step < 4
                                ? <button onClick={() => setStep(s => s + 1)} style={{ padding: '10px 24px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Continue →</button>
                                : <button onClick={submit} style={{ padding: '10px 24px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Submit for Approval</button>
                            }
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ borderRadius: 12, overflow: 'hidden' }}>
                        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" alt="Restaurant" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                        <div style={{ background: 'rgba(0,0,0,0.7)', padding: '12px 14px', marginTop: -4 }}>
                            <p style={{ color: 'white', fontSize: 13, fontStyle: 'italic' }}>"TableNest has revolutionized how we handle our peak-hour rush."</p>
                        </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Why Partner With Us?</div>
                        {['Reach 42,000+ active diners', 'Real-time reservation management', 'Powerful analytics dashboard', '24/7 dedicated support'].map(b => (
                            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                                <span style={{ color: '#16A34A' }}>✓</span>{b}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
EOF

cat > /home/claude / tablenest / frontend / src / modules / owner / qrcodes / QRCodeManager.tsx << 'EOF'
import React, { useState } from 'react';
import { tablesAPI, restaurantsAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Download, Printer, RefreshCw, Plus } from 'lucide-react';
import { Toggle } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

const COLORS = ['#B91C1C', '#1F1F1F', '#92400E', '#C2410C'];

export default function QRCodeManager() {
    const { user } = useAuthStore();
    const [restaurantId, setRestaurantId] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#B91C1C');
    const [outputSize, setOutputSize] = useState('Standard (1024 × 1024 px)');

    React.useEffect(() => {
        if (user?.restaurantId) setRestaurantId(user.restaurantId.toString());
        else restaurantsAPI.getMyRestaurant().then(r => r.data?._id && setRestaurantId(r.data._id)).catch(() => { });
    }, [user]);

    const { data: tables = [] } = useQuery({
        queryKey: ['tables-qr', restaurantId],
        queryFn: () => tablesAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
        initialData: DEMO_TABLES,
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 20, height: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {Array(4).fill(0).map((_, i) => <div key={i} style={{ background: '#B91C1C', borderRadius: 1 }} />)}
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 700 }}>QR Code Manager</h1>
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>Manage and customize contactless ordering for your dining floor.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toast.success('Printing all...')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Printer size={13} /> Print All
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Download size={13} /> Export ZIP
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Plus size={13} /> New Table
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
                <div>
                    {/* Promo banner */}
                    <div style={{ background: '#B91C1C', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <div style={{ maxWidth: 400 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Boost Operational Efficiency</div>
                            <p style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>Our intelligent QR system doesn't just open a menu—it tracks table dwell time, streamlines peak-hour ordering, and reduces server workload by up to 30%.</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button style={{ padding: '7px 14px', background: 'white', color: '#B91C1C', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>View Analytics</button>
                                <button style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>Tutorial Video</button>
                            </div>
                        </div>
                        <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg viewBox="0 0 60 60" width="60" height="60" fill="rgba(255,255,255,0.6)">
                                <rect x="5" y="5" width="20" height="20" rx="2" /><rect x="35" y="5" width="20" height="20" rx="2" />
                                <rect x="5" y="35" width="20" height="20" rx="2" />
                                <rect x="10" y="10" width="10" height="10" fill="rgba(185,28,28,0.8)" />
                                <rect x="40" y="10" width="10" height="10" fill="rgba(185,28,28,0.8)" />
                                <rect x="10" y="40" width="10" height="10" fill="rgba(185,28,28,0.8)" />
                                <rect x="35" y="35" width="5" height="5" /><rect x="43" y="35" width="5" height="5" />
                                <rect x="35" y="43" width="5" height="5" /><rect x="43" y="43" width="5" height="5" />
                            </svg>
                        </div>
                    </div>

                    {/* Table QR grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {(tables.length ? tables : DEMO_TABLES).map((t: any) => (
                            <div key={t._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>T-{t.tableNumber || t.number}</span>
                                    <Toggle checked={t.isActive !== false} onChange={() => { }} />
                                </div>
                                <div style={{ aspect: '1/1', background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <svg viewBox="0 0 80 80" width="64" height="64">
                                        <rect x="5" y="5" width="30" height="30" rx="3" fill={t.isActive !== false ? primaryColor : '#9CA3AF'} opacity="0.8" />
                                        <rect x="45" y="5" width="30" height="30" rx="3" fill={t.isActive !== false ? primaryColor : '#9CA3AF'} opacity="0.8" />
                                        <rect x="5" y="45" width="30" height="30" rx="3" fill={t.isActive !== false ? primaryColor : '#9CA3AF'} opacity="0.8" />
                                        <rect x="12" y="12" width="16" height="16" fill="white" />
                                        <rect x="52" y="12" width="16" height="16" fill="white" />
                                        <rect x="12" y="52" width="16" height="16" fill="white" />
                                        {t.isActive !== false && <>
                                            <rect x="45" y="45" width="8" height="8" fill={primaryColor} />
                                            <rect x="57" y="45" width="8" height="8" fill={primaryColor} />
                                            <rect x="45" y="57" width="8" height="8" fill={primaryColor} />
                                            <rect x="57" y="57" width="8" height="8" fill={primaryColor} />
                                        </>}
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11, color: '#9CA3AF' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#6B7280', fontFamily: 'Poppins', fontSize: 10 }}>
                                        <Download size={13} /> DL
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#6B7280', fontFamily: 'Poppins', fontSize: 10 }}>
                                        <Printer size={13} /> PRINT
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#6B7280', fontFamily: 'Poppins', fontSize: 10 }}>
                                        <RefreshCw size={13} /> NEW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customization panel */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>🎨 Customization</div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Live Preview</div>
                    <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 16 }}>
                        <svg viewBox="0 0 100 100" width="80" height="80" style={{ margin: '0 auto 8px' }}>
                            <rect x="5" y="5" width="38" height="38" rx="4" fill={primaryColor} />
                            <rect x="57" y="5" width="38" height="38" rx="4" fill={primaryColor} />
                            <rect x="5" y="57" width="38" height="38" rx="4" fill={primaryColor} />
                            <rect x="14" y="14" width="20" height="20" fill="white" />
                            <rect x="66" y="14" width="20" height="20" fill="white" />
                            <rect x="14" y="66" width="20" height="20" fill="white" />
                            <circle cx="50" cy="50" r="15" fill={primaryColor} />
                            <text x="50" y="55" textAnchor="middle" fill="white" fontSize="10" fontFamily="Poppins" fontWeight="700">TN</text>
                        </svg>
                        <div style={{ fontWeight: 700, fontSize: 13, color: primaryColor }}>TABLE 12</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Scan to Order & Pay</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Primary Color</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {COLORS.map(c => (
                                <button key={c} onClick={() => setPrimaryColor(c)}
                                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: primaryColor === c ? '3px solid #374151' : '2px solid white', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                            ))}
                            <button style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', border: '1.5px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✎</button>
                        </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Output Size</div>
                        <select value={outputSize} onChange={e => setOutputSize(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                            <option>Standard (1024 × 1024 px)</option>
                            <option>Large (2048 × 2048 px)</option>
                            <option>Print (300 DPI)</option>
                        </select>
                    </div>
                    <button onClick={() => toast.success('Styles applied to all tables!')}
                        style={{ width: '100%', padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        Apply to All Tables
                    </button>
                </div>
            </div>
        </div>
    );
}

const DEMO_TABLES = [
    { _id: '1', tableNumber: '01', isActive: true }, { _id: '2', tableNumber: '02', isActive: true },
    { _id: '3', tableNumber: '03', isActive: true }, { _id: '4', tableNumber: '04', isActive: false },
];
EOF

echo "QR, Settings, Partner done"
Output

QR, Settings, Partner done