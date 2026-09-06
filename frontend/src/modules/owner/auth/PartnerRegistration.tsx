import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI, uploadsAPI } from '../../../shared/services/api';
import { useAuth } from '../../../shared/hooks/useAuthContext';
import { getRoleHomePath } from '../../../shared/utils/auth.utils';
import toast from 'react-hot-toast';
import {
    CheckCircle2,
    Check,
    Image as ImageIcon,
    X,
    Upload,
    ArrowLeft,
    ArrowRight,
    Loader2,
    User,
    Mail,
    Lock,
    Store,
    UtensilsCrossed,
    Users,
    Globe,
    MapPin,
    Phone,
    ShieldCheck,
    Info,
    Star,
    Sparkles,
    Home,
} from 'lucide-react';

const STEPS = [
    { label: 'Owner info', desc: 'Set up your account so you can manage your restaurant and access your dashboard.' },
    { label: 'Restaurant info', desc: 'Tell us about your restaurant so we can set up your public profile.' },
    { label: 'Location & operations', desc: 'Add your address and choose which services you offer.' },
    { label: 'Media & submit', desc: 'Add photos and send your application for review.' },
];

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
    city: string;
    country: string;
    phone: string;
    dineIn: boolean;
    delivery: boolean;
};

function IconField({ icon: Icon, ...props }: { icon: any } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="pr-icon-input">
            <Icon size={16} className="pr-icon-input-glyph" />
            <input {...props} className="pr-input pr-input--icon" />
        </div>
    );
}

export default function PartnerRegistration() {
    const navigate = useNavigate();
    const { registerOwner, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<PartnerForm>({
        fullName: '', email: '', password: '', restaurantName: '', cuisineType: 'Italian',
        description: '', seatingCapacity: '', priceRange: '$$', address: '', city: '', country: 'Rwanda', phone: '', dineIn: true, delivery: false,
    });

    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const up = <K extends keyof PartnerForm>(key: K, val: PartnerForm[K]) => setForm(f => ({ ...f, [key]: val }));

    const passwordChecks = {
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const res = await uploadsAPI.uploadImage(files[i]);
                setImages(prev => [...prev, res.data.url]);
            }
            toast.success('Images uploaded');
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

    const submit = async () => {
        setSubmitting(true);
        try {
            if (!isAuthenticated) {
                await registerOwner({ fullName: form.fullName, email: form.email, password: form.password });
            }
            await restaurantsAPI.create({
                name: form.restaurantName, cuisineType: form.cuisineType, description: form.description,
                seatingCapacity: +form.seatingCapacity, priceRange: form.priceRange,
                address: form.address, city: form.city, country: form.country, phone: form.phone, dineIn: form.dineIn, delivery: form.delivery, images,
                logo: images.length > 0 ? images[0] : null,
            });
            toast.success('Application submitted. Await approval.');
            navigate(getRoleHomePath('owner'), { replace: true });
        } catch (unknownError) {
            const error = unknownError as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pr-page">
            <style>{`
                .pr-page { min-height: 100vh; background: #FFFFFF; font-family: 'Poppins', sans-serif; }

                .pr-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 40px; border-bottom: 1px solid #F1F5F9; position: sticky; top: 0; background: white; z-index: 10; }
                .pr-logo { display: inline-flex; align-items: center; gap: 10px; }
                .pr-logo-icon { width: 36px; height: 36px; border-radius: 12px; background: #F97316; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
                .pr-logo-text { font-size: 17px; font-weight: 800; color: #0F172A; letter-spacing: -0.01em; }
                .pr-header-note { font-size: 13px; color: #94A3B8; }
                .pr-header-note a { color: #F97316; font-weight: 600; text-decoration: none; }

                .pr-shell { max-width: 1180px; margin: 0 auto; padding: 40px 24px 60px; display: grid; grid-template-columns: 300px 1fr; gap: 40px; align-items: start; }

                .pr-sidebar { position: sticky; top: 90px; overflow: hidden; background: #FFF3E8; border-radius: 20px; padding: 36px 28px; }
                .pr-sidebar::before { content: ''; position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(249,115,22,0.16), transparent 70%); }
                .pr-stepper { display: flex; flex-direction: column; }
                .pr-step { display: flex; gap: 14px; }
                .pr-step-marker { display: flex; flex-direction: column; align-items: center; }
                .pr-step-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; font-weight: 700; border: 1.5px solid; }
                .pr-step-circle--done { background: #16A34A; border-color: #16A34A; color: white; }
                .pr-step-circle--current { background: #F97316; border-color: #F97316; color: white; }
                .pr-step-circle--upcoming { background: white; border-color: #FBDFC3; color: #C2803F; }
                .pr-step-line { width: 1.5px; flex: 1; min-height: 30px; background: #FBDFC3; margin: 4px 0; }
                .pr-step-line--done { background: #16A34A; }
                .pr-step-text { padding-bottom: 26px; padding-top: 2px; }
                .pr-step-label { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
                .pr-step-label--current { color: #F97316; }
                .pr-step-desc { font-size: 12.5px; color: #64748B; line-height: 1.5; max-width: 210px; }

                .pr-main-inner { max-width: 640px; }
                .pr-back { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1.5px solid #F97316; color: #F97316; font-size: 13px; cursor: pointer; padding: 8px 16px; border-radius: 14px; font-family: 'Poppins', sans-serif; font-weight: 600; margin-bottom: 32px; transition: background 0.15s ease; }
                .pr-back:hover { background: #FFF7ED; }

                .pr-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #F97316; background: #FFF3E8; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px; }
                .pr-title { font-size: 28px; font-weight: 800; color: #0F172A; margin-bottom: 8px; letter-spacing: -0.02em; }
                .pr-subtitle { font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 24px; max-width: 520px; }
                .pr-divider { height: 1px; background: #E2E8F0; margin-bottom: 28px; }

                .pr-split { display: grid; grid-template-columns: 170px 1fr; gap: 28px; }
                .pr-intro-text { font-size: 13.5px; color: #475569; line-height: 1.6; }
                .pr-intro-note { font-size: 12px; color: #94A3B8; margin-top: 16px; line-height: 1.5; }

                .pr-field { margin-bottom: 18px; }
                .pr-label { font-size: 13px; font-weight: 500; color: #334155; display: block; margin-bottom: 6px; }
                .pr-input { width: 100%; padding: 11px 13px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: 'Poppins', sans-serif; outline: none; color: #0F172A; background: white; transition: border-color 0.15s ease; box-sizing: border-box; }
                .pr-input:focus { border-color: #F97316; }
                .pr-input--icon { padding-left: 38px; }
                .pr-icon-input { position: relative; }
                .pr-icon-input-glyph { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; }
                .pr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .pr-price-group { display: flex; gap: 6px; }
                .pr-price-btn { flex: 1; padding: 11px 4px; border: 1.5px solid #E2E8F0; border-radius: 10px; background: white; color: #475569; font-size: 13px; cursor: pointer; font-family: 'Poppins', sans-serif; font-weight: 500; transition: all 0.15s ease; }
                .pr-price-btn--active { border-color: #F97316; background: #FFF7ED; color: #F97316; font-weight: 700; }
                .pr-checkbox-row { display: flex; gap: 20px; }
                .pr-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #334155; }

                .pr-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
                .pr-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid; }
                .pr-pill--met { background: #F0FDF4; border-color: #BBF7D0; color: #16A34A; }
                .pr-pill--unmet { background: #F8FAFC; border-color: #E2E8F0; color: #94A3B8; }

                .pr-notice { display: flex; gap: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; }
                .pr-notice-title { font-weight: 600; font-size: 13px; color: #0F172A; margin-bottom: 3px; }
                .pr-notice-text { font-size: 12px; color: #64748B; line-height: 1.5; }

                .pr-dropzone { border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 32px 24px; cursor: pointer; background: #F8FAFC; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; transition: all 0.15s ease; }
                .pr-dropzone:hover { border-color: #F97316; background: #FFF7ED; }
                .pr-dropzone--uploading { border-color: #F97316; background: #FFF7ED; cursor: wait; }
                .pr-dropzone-icon { width: 44px; height: 44px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
                .pr-dropzone-title { font-weight: 600; font-size: 14px; color: #0F172A; margin-bottom: 4px; }
                .pr-dropzone-hint { font-size: 12px; color: #94A3B8; }

                .pr-cover { position: relative; border-radius: 12px; overflow: hidden; border: 1.5px solid #F97316; margin-bottom: 20px; }
                .pr-cover img { width: 100%; height: 190px; object-fit: cover; display: block; }
                .pr-cover-badge { position: absolute; bottom: 12px; left: 12px; display: inline-flex; align-items: center; gap: 5px; background: #0F172A; color: white; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px; }

                .pr-photo-count { font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 8px; }
                .pr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
                .pr-thumb { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; }
                .pr-thumb img { width: 100%; height: 96px; object-fit: cover; display: block; }
                .pr-thumb-badge { position: absolute; top: 5px; left: 5px; background: #0F172A; color: white; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.02em; }
                .pr-thumb-remove { position: absolute; top: 5px; right: 5px; background: rgba(15,23,42,0.65); border: none; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: background 0.15s ease; }
                .pr-thumb-remove:hover { background: #F97316; }
                .pr-hint { display: flex; gap: 6px; align-items: flex-start; font-size: 12px; color: #94A3B8; margin-top: 8px; line-height: 1.5; }

                .pr-ready { display: flex; align-items: flex-start; gap: 10px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; }
                .pr-ready-title { font-weight: 600; color: #16A34A; font-size: 13px; margin-bottom: 3px; }
                .pr-ready-text { font-size: 13px; color: #64748B; }

                .pr-actions { display: flex; justify-content: space-between; margin-top: 28px; padding-top: 24px; border-top: 1px solid #E2E8F0; }
                .pr-btn-secondary { padding: 11px 20px; border: 1.5px solid #E2E8F0; border-radius: 14px; background: white; color: #334155; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Poppins', sans-serif; transition: border-color 0.15s ease; }
                .pr-btn-secondary:hover { border-color: #CBD5E1; }
                .pr-btn-primary { padding: 11px 24px; background: #F97316; color: white; border: none; border-radius: 14px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s ease; }
                .pr-btn-primary:hover:not(:disabled) { background: #EA6A0C; }
                .pr-btn-primary:disabled { background: #94A3B8; cursor: not-allowed; }

                @keyframes pr-spin { to { transform: rotate(360deg); } }
                .pr-spin { animation: pr-spin 0.8s linear infinite; }

                @media (max-width: 900px) {
                    .pr-shell { grid-template-columns: 1fr; }
                    .pr-sidebar { position: relative; top: 0; }
                    .pr-split { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="pr-shell">
                <aside className="pr-sidebar">
                    <div className="pr-stepper">
                        {STEPS.map((s, i) => {
                            const idx = i + 1;
                            const status = step > idx ? 'done' : step === idx ? 'current' : 'upcoming';
                            return (
                                <div className="pr-step" key={s.label}>
                                    <div className="pr-step-marker">
                                        <div className={`pr-step-circle pr-step-circle--${status}`}>
                                            {status === 'done' ? <Check size={15} /> : idx}
                                        </div>
                                        {i < STEPS.length - 1 && (
                                            <div className={`pr-step-line ${status === 'done' ? 'pr-step-line--done' : ''}`} />
                                        )}
                                    </div>
                                    <div className="pr-step-text">
                                        <div className={`pr-step-label ${status === 'current' ? 'pr-step-label--current' : ''}`}>{s.label}</div>
                                        <div className="pr-step-desc">{s.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                <main>
                    <button className="pr-back" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/register')}>
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="pr-main-inner">
                        <div className="pr-eyebrow">Step {step} of 4</div>

                        {step === 1 && (
                            <>
                                <h2 className="pr-title">Restaurant owner info</h2>
                                <p className="pr-subtitle">Set up your account to manage your restaurant. This information is used to access your dashboard.</p>
                                <div className="pr-divider" />
                                <div className="pr-split">
                                    <div className="pr-intro-text">
                                        Let's get to know you. Share your details so we can set up your restaurant account.
                                        <div className="pr-intro-note">By continuing you agree to TableNest's Partner Terms.</div>
                                    </div>
                                    <div>
                                        <div className="pr-field">
                                            <label className="pr-label">Full name</label>
                                            <IconField icon={User} type="text" placeholder="e.g. Jean Mugisha" value={form.fullName} onChange={e => up('fullName', e.target.value)} />
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Email address</label>
                                            <IconField icon={Mail} type="email" placeholder="restaurant@email.com" value={form.email} onChange={e => up('email', e.target.value)} />
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Password</label>
                                            <IconField icon={Lock} type="password" placeholder="Create a password" value={form.password} onChange={e => up('password', e.target.value)} />
                                            <div className="pr-pills">
                                                <span className={`pr-pill ${passwordChecks.length ? 'pr-pill--met' : 'pr-pill--unmet'}`}><Check size={11} /> 8+ chars</span>
                                                <span className={`pr-pill ${passwordChecks.upper ? 'pr-pill--met' : 'pr-pill--unmet'}`}><Check size={11} /> Uppercase</span>
                                                <span className={`pr-pill ${passwordChecks.number ? 'pr-pill--met' : 'pr-pill--unmet'}`}><Check size={11} /> Number</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="pr-title">Restaurant info</h2>
                                <p className="pr-subtitle">Tell us about your restaurant. This becomes your public profile once approved.</p>
                                <div className="pr-divider" />
                                <div className="pr-split">
                                    <div className="pr-intro-text">
                                        Diners will see this name, cuisine, and description first — make it count.
                                    </div>
                                    <div>
                                        <div className="pr-field">
                                            <label className="pr-label">Restaurant name</label>
                                            <IconField icon={Store} placeholder="The Golden Truffle" value={form.restaurantName} onChange={e => up('restaurantName', e.target.value)} />
                                        </div>
                                        <div className="pr-row">
                                            <div className="pr-field">
                                                <label className="pr-label">Cuisine type</label>
                                                <div className="pr-icon-input">
                                                    <UtensilsCrossed size={16} className="pr-icon-input-glyph" />
                                                    <select className="pr-input pr-input--icon" value={form.cuisineType} onChange={e => up('cuisineType', e.target.value)}>
                                                        {CUISINES.map(c => <option key={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pr-field">
                                                <label className="pr-label">Seating capacity</label>
                                                <IconField icon={Users} type="number" placeholder="120" value={form.seatingCapacity} onChange={e => up('seatingCapacity', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Description</label>
                                            <textarea className="pr-input" style={{ minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => up('description', e.target.value)} placeholder="Describe your culinary philosophy..." />
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Price range</label>
                                            <div className="pr-price-group">
                                                {['$', '$$', '$$$', '$$$$'].map(p => (
                                                    <button key={p} onClick={() => up('priceRange', p)} className={`pr-price-btn ${form.priceRange === p ? 'pr-price-btn--active' : ''}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="pr-title">Location & operations</h2>
                                <p className="pr-subtitle">Set your address and choose which services you offer.</p>
                                <div className="pr-divider" />
                                <div className="pr-split">
                                    <div className="pr-intro-text">
                                        This address and these services appear on your public listing.
                                    </div>
                                    <div>
                                        <div className="pr-row">
                                            <div className="pr-field">
                                                <label className="pr-label">Country</label>
                                                <div className="pr-icon-input">
                                                    <Globe size={16} className="pr-icon-input-glyph" />
                                                    <select className="pr-input pr-input--icon" value={form.country || 'Rwanda'} onChange={e => up('country', e.target.value)}>
                                                        {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pr-field">
                                                <label className="pr-label">City / district</label>
                                                <IconField icon={MapPin} placeholder="e.g. Kigali" value={form.city || ''} onChange={e => up('city', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Primary address</label>
                                            <IconField icon={MapPin} placeholder="23 Culinary Way, Arts District" value={form.address} onChange={e => up('address', e.target.value)} />
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Phone number</label>
                                            <IconField icon={Phone} type="tel" placeholder="+250 784 955 081" value={form.phone} onChange={e => up('phone', e.target.value)} />
                                        </div>
                                        <div className="pr-field">
                                            <label className="pr-label">Services offered</label>
                                            <div className="pr-checkbox-row">
                                                {([{ key: 'dineIn', label: 'Dine-in' }, { key: 'delivery', label: 'Delivery' }] as const).map(s => (
                                                    <label key={s.key} className="pr-checkbox-label">
                                                        <input type="checkbox" checked={form[s.key]} onChange={e => up(s.key, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#F97316' }} />
                                                        {s.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="pr-notice">
                                            <ShieldCheck size={18} color="#F97316" style={{ flexShrink: 0, marginTop: 1 }} />
                                            <div>
                                                <div className="pr-notice-title">Verification required</div>
                                                <div className="pr-notice-text">All new partners must provide a valid culinary license and complete a 48-hour vetting process before going live.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <h2 className="pr-title">Media & branding</h2>
                                <p className="pr-subtitle">Upload your restaurant photos. The first photo becomes your cover image.</p>
                                <div className="pr-divider" />
                                <div className="pr-split">
                                    <div className="pr-intro-text">
                                        Listings with three or more photos get noticeably more bookings.
                                    </div>
                                    <div>
                                        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />

                                        {images.length > 0 && (
                                            <div className="pr-cover">
                                                <img src={images[0]} alt="Cover" />
                                                <div className="pr-cover-badge"><Star size={12} /> Cover photo</div>
                                            </div>
                                        )}

                                        <div className={`pr-dropzone ${uploading ? 'pr-dropzone--uploading' : ''}`} onClick={() => !uploading && fileInputRef.current?.click()}>
                                            <div className="pr-dropzone-icon">
                                                {uploading ? <Loader2 size={20} color="#F97316" className="pr-spin" /> : <Upload size={20} color="#475569" />}
                                            </div>
                                            <div className="pr-dropzone-title">
                                                {uploading ? 'Uploading...' : images.length > 0 ? 'Add more photos' : 'Click to upload restaurant photos'}
                                            </div>
                                            <div className="pr-dropzone-hint">PNG, JPG up to 5MB each — multiple files supported</div>
                                        </div>

                                        {images.length > 0 && (
                                            <div>
                                                <div className="pr-photo-count">{images.length} photo{images.length !== 1 ? 's' : ''} uploaded</div>
                                                <div className="pr-grid">
                                                    {images.map((url, i) => (
                                                        <div className="pr-thumb" key={i}>
                                                            <img src={url} alt={`Restaurant photo ${i + 1}`} />
                                                            {i === 0 && <div className="pr-thumb-badge">COVER</div>}
                                                            <button className="pr-thumb-remove" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                                                                <X size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pr-hint">
                                                    <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                                    The first image is used as your restaurant's cover photo on cards and search results.
                                                </div>
                                            </div>
                                        )}

                                        <div className="pr-ready" style={{ marginTop: 20 }}>
                                            <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
                                            <div>
                                                <div className="pr-ready-title">Ready to submit</div>
                                                <div className="pr-ready-text">Review your details and submit your application for approval.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pr-actions">
                            <button className="pr-btn-secondary" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}>
                                {step === 1 ? 'Back to home' : `Back to step ${step - 1}`}
                            </button>
                            {step < 4 ? (
                                <button className="pr-btn-primary" onClick={() => setStep(s => s + 1)}>Continue</button>
                            ) : (
                                <button className="pr-btn-primary" onClick={submit} disabled={submitting}>
                                    {submitting && <Loader2 size={14} className="pr-spin" />}
                                    {submitting ? 'Submitting...' : 'Submit for approval'}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}