import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Phone, MapPin, Lock, AlertTriangle, CreditCard, Mail } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import { usersAPI, authAPI, loyaltyAPI, uploadsAPI, ordersAPI, reservationsAPI } from '../../../shared/services/api';
import { Toggle } from '../../../shared/components/ui/index';
import { useQuery } from '@tanstack/react-query';
import type { NotificationPrefs } from '../../../shared/types/auth.types';
import type { Loyalty } from '../../../shared/types/user.types';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
    type ProfileForm = { fullName: string; phone: string; address: string };
    type PasswordForm = { currentPassword: string; newPassword: string };

    const navigate = useNavigate();
    const { user, setUser, logout } = useAuthStore();
    const fileRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState<ProfileForm>({ fullName: user?.fullName || '', phone: user?.phone || '', address: user?.address || '' });
    const [pwForm, setPwForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '' });
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(user?.notificationPrefs || { bookingConfirmation: true, marketing: false, orderTracking: true });
    const [saving, setSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { data: loyalty } = useQuery<Loyalty>({ queryKey: ['loyalty'], queryFn: () => loyaltyAPI.get().then((r) => r.data) });
    const { data: ordersTotal } = useQuery({ queryKey: ['orders-total'], queryFn: () => ordersAPI.getMyOrders({ limit: 1 }).then((r) => r.data.total as number) });
    const { data: bookingsTotal } = useQuery({ queryKey: ['bookings-total'], queryFn: () => reservationsAPI.getMyReservations().then((r) => r.data.length as number) });

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await usersAPI.updateProfile(form);
            setUser(res.data);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to save'); } finally { setSaving(false); }
    };

    const onAvatarPick = async (file: File) => {
        setUploading(true);
        try {
            const upload = await uploadsAPI.uploadImage(file);
            const res = await usersAPI.updateProfile({ avatar: upload.data.url });
            setUser(res.data);
            toast.success('Photo updated');
        } catch { toast.error('Could not upload photo'); } finally { setUploading(false); }
    };

    const removeAvatar = async () => {
        const res = await usersAPI.updateProfile({ avatar: null });
        setUser(res.data);
        toast.success('Photo removed');
    };

    const changePassword = async () => {
        if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill in all fields'); return; }
        setPwSaving(true);
        try {
            await authAPI.changePassword(pwForm);
            toast.success('Password updated!');
            setPwForm({ currentPassword: '', newPassword: '' });
        } catch (e: unknown) {
            const message = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
            toast.error(message || 'Password update failed');
        } finally { setPwSaving(false); }
    };

    const saveNotifs = async (key: keyof NotificationPrefs, val: boolean) => {
        const updated = { ...notifPrefs, [key]: val };
        setNotifPrefs(updated);
        await usersAPI.updateNotificationPrefs(updated).catch(() => toast.error('Could not save preference'));
    };

    const up = <K extends keyof ProfileForm>(key: K, val: ProfileForm[K]) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }} className="settings-grid">
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Account settings</h1>
                        <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Manage your profile information and preferences.</p>
                    </div>

                    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Personal information</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: 'white', overflow: 'hidden' }}>
                                    {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <button onClick={() => fileRef.current?.click()} className="btn-icon" style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: 'var(--color-brand-500)', color: '#fff', border: '2px solid #fff' }}>
                                    <Camera size={12} />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onAvatarPick(e.target.files[0])} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Profile photo</div>
                                <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 10 }}>JPG, PNG or WEBP, up to 5MB</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-primary btn-sm">{uploading ? 'Uploading…' : 'Upload new'}</button>
                                    {user?.avatar && <button onClick={removeAvatar} className="btn btn-outline btn-sm">Remove</button>}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <Field label="Full name" icon={<User size={14} />} value={form.fullName} onChange={(v) => up('fullName', v)} />
                            <div>
                                <label className="label">Email address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-mute)' }} />
                                    <input value={user?.email || ''} disabled className="input" style={{ paddingLeft: 34, background: 'var(--color-sand)', color: 'var(--color-ink-mute)' }} />
                                </div>
                            </div>
                            <Field label="Phone number" icon={<Phone size={14} />} value={form.phone} onChange={(v) => up('phone', v)} type="tel" />
                            <Field label="Address" icon={<MapPin size={14} />} value={form.address} onChange={(v) => up('address', v)} />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Security</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 10 }}>Change password</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-mute)' }} />
                                <input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} className="input" style={{ paddingLeft: 34 }} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-mute)' }} />
                                <input type="password" placeholder="New password (min 8 chars, letter + number)" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} className="input" style={{ paddingLeft: 34 }} />
                            </div>
                            <button onClick={changePassword} disabled={pwSaving} className="btn btn-dark" style={{ alignSelf: 'flex-start' }}>
                                {pwSaving ? 'Updating…' : 'Update password'}
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Notifications</div>
                        {[
                            { key: 'bookingConfirmation', label: 'Booking confirmations', desc: 'Updates about your table reservations.' },
                            { key: 'marketing', label: 'Marketing & promotions', desc: 'Deals and offers from TableNest restaurants.' },
                            { key: 'orderTracking', label: 'Order tracking', desc: 'Real-time alerts for your orders.' },
                        ].map((n, i, arr) => (
                            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-sand)' : 'none' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{n.desc}</div>
                                </div>
                                <Toggle checked={notifPrefs[n.key as keyof NotificationPrefs]} onChange={() => saveNotifs(n.key as keyof NotificationPrefs, !notifPrefs[n.key as keyof NotificationPrefs])} />
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: 24, border: '2px solid #ffe9e7' }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#c0271b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} /> Danger zone
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 16 }}>Deactivating your account cannot be undone from the app.</p>
                        <button
                            onClick={() => { if (window.confirm('Are you sure? This cannot be undone.')) { usersAPI.deleteAccount().then(() => logout()); } }}
                            className="btn"
                            style={{ background: '#dc2626', color: '#fff' }}
                        >
                            Delete my account
                        </button>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Quick summary</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 16 }}>
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                        </div>
                        {[
                            { label: 'Total bookings', value: bookingsTotal ?? '—' },
                            { label: 'Total orders', value: ordersTotal ?? '—' },
                            { label: 'Loyalty points', value: `${loyalty?.points ?? 0} pts` },
                        ].map((s) => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-sand)', fontSize: 14 }}>
                                <span style={{ color: 'var(--color-ink-soft)' }}>{s.label}</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-brand-600)' }}>{s.value}</span>
                            </div>
                        ))}
                        <div style={{ background: 'var(--color-sand)', borderRadius: 10, padding: 12, marginTop: 12, marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: 'var(--color-ink-mute)', marginBottom: 2, textTransform: 'uppercase', fontWeight: 700 }}>Active plan</div>
                            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CreditCard size={14} color="var(--color-brand-500)" /> {user?.activePlan || 'Free plan'}
                            </div>
                        </div>
                        <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ width: '100%' }}>
                            {saving ? 'Saving…' : 'Save all changes'}
                        </button>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-line)', textAlign: 'center' }}>
                            <button onClick={() => navigate('/settings/addresses')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-brand-600)' }}>
                                <CreditCard size={13} /> Manage addresses & payments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

function Field({ label, icon, value, onChange, type = 'text' }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div>
            <label className="label">{label}</label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-mute)' }}>{icon}</span>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input" style={{ paddingLeft: 34 }} />
            </div>
        </div>
    );
}
