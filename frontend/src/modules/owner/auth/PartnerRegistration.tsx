import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI, uploadsAPI } from '../../../shared/services/api';
import { useAuth } from '../../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../../shared/utils/auth.utils';
import toast from 'react-hot-toast';
import { CheckCircle, Image, PartyPopper, X, Upload } from 'lucide-react';

const STEPS = ['Account', 'Business', 'Operations', 'Media'];
const CUISINES = ['Italian', 'Japanese', 'French', 'Mexican', 'American', 'Chinese', 'Indian', 'Mediterranean', 'Seafood', 'Steakhouse', 'Modern European', 'African', 'Other'];
const COUNTRIES = ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Burundi', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa', 'USA', 'UK', 'France', 'Germany', 'Other'];

type PartnerForm = {
    fullName: string;
    email: string;
    password: string;
    restaurantName: string;
    cuisineType: string;
    description: string;
    seatingCapacity: string;
    priceRange: string;
    address: string;
    dineIn: boolean;
    delivery: boolean;
};

export default function PartnerRegistration() {
    const navigate = useNavigate();
    const { registerOwner, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<PartnerForm>({
        fullName: '', email: '', password: '', restaurantName: '', cuisineType: 'Italian',
        description: '', seatingCapacity: '', priceRange: '$$', address: '', city: '', country: 'Rwanda', phone: '', dineIn: true, delivery: false, imageUrls: [],
    });

    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const up = <K extends keyof PartnerForm>(key: K, val: PartnerForm[K]) => setForm(f => ({ ...f, [key]: val }));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const res = await uploadsAPI.uploadImage(files[i]);
                setImages(prev => [...prev, res.data.url]);
            }
            toast.success('Images uploaded!');
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

    const submit = async () => {
        try {
            if (!isAuthenticated) {
                await registerOwner({ fullName: form.fullName, email: form.email, password: form.password });
            }
            await restaurantsAPI.create({
                name: form.restaurantName, cuisineType: form.cuisineType, description: form.description,
                seatingCapacity: +form.seatingCapacity, priceRange: form.priceRange,
                address: form.address, city: form.city, country: form.country, phone: form.phone, dineIn: form.dineIn, delivery: form.delivery, images,
            });
            toast.success('Application submitted! Await approval.');
            navigate(getRoleHomePath('owner'), { replace: true });
        } catch (unknownError) {
            const error = unknownError as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Submission failed');
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
                                {([
                                    { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your name' },
                                    { label: 'Email', key: 'email', type: 'email', placeholder: 'restaurant@email.com' },
                                    { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                                ] as const).map(f => (
                                    <div key={f.key} style={{ marginBottom: 16 }}>
                                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => up(f.key, e.target.value)}
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
                                        {([{ key: 'dineIn', label: 'Dine-in' }, { key: 'delivery', label: 'Delivery' }] as const).map(s => (
                                            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                                                <input type="checkbox" checked={form[s.key]} onChange={e => up(s.key, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#B91C1C' }} />
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
                                    <Image size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Upload Restaurant Logo</div>
                                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>PNG, JPG up to 5MB</div>
                                </div>
                                <div style={{ background: '#F0FDF4', border: '1px solid #16A34A', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, color: '#16A34A', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><PartyPopper size={16} /> Ready to Submit!</div>
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
                                : <button onClick={submit} disabled={submitting} style={{ padding: '10px 24px', background: submitting ? '#9CA3AF' : '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>{submitting ? 'Submitting...' : 'Submit for Approval'}</button>
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
                                <span style={{ color: '#16A34A', display: 'inline-flex' }}><CheckCircle size={14} /></span>{b}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}