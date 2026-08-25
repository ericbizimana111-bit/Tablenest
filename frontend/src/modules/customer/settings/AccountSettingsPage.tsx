import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Phone, MapPin, Lock, AlertTriangle, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import { usersAPI, authAPI } from '../../../shared/services/api';
import { Toggle } from '../../../shared/components/ui/index';
import { useQuery } from '@tanstack/react-query';
import { loyaltyAPI } from '../../../shared/services/api';
import type { NotificationPrefs } from '../../../shared/types/auth.types';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
    type ProfileForm = {
        fullName: string;
        email: string;
        phone: string;
        address: string;
    };

    type PasswordForm = {
        currentPassword: string;
        newPassword: string;
    };

    const navigate = useNavigate();
    const { user, setUser, logout } = useAuthStore();
    const [form, setForm] = useState<ProfileForm>({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [pwForm, setPwForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '' });
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(user?.notificationPrefs || { bookingConfirmation: true, marketing: false, orderTracking: true });
    const [saving, setSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);

    const { data: loyalty } = useQuery({
        queryKey: ['loyalty'],
        queryFn: () => loyaltyAPI.get().then(r => r.data),
        initialData: { points: 0 },
    });

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await usersAPI.updateProfile(form);
            setUser(res.data);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const changePassword = async () => {
        if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill in all fields'); return; }
        setPwSaving(true);
        try {
            await authAPI.changePassword(pwForm);
            toast.success('Password updated!');
            setPwForm({ currentPassword: '', newPassword: '' });
        } catch (e: unknown) {
            const message = e && typeof e === 'object' && 'response' in e
                ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            toast.error(message || 'Password update failed');
        }
        finally { setPwSaving(false); }
    };

    const saveNotifs = async (key: keyof NotificationPrefs, val: boolean) => {
        const updated = { ...notifPrefs, [key]: val };
        setNotifPrefs(updated);
        await usersAPI.updateNotificationPrefs(updated).catch(() => { });
    };

    const up = <K extends keyof ProfileForm>(key: K, val: ProfileForm[K]) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Account Settings</h1>
                        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Manage your profile information and preferences.</p>
                    </div>

                    {/* Personal Info */}
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Personal Information</div>

                        {/* Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: 'white', overflow: 'hidden' }}>
                                    {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Camera size={12} color="white" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Profile Photo</div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>JPG, GIF or PNG. Max size of 800K</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ padding: '6px 14px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Upload New</button>
                                    <button style={{ padding: '6px 14px', background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>Remove</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {[
                                { label: 'Full Name', key: 'fullName' as keyof ProfileForm, icon: <User size={14} color="#9CA3AF" />, type: 'text' },
                                { label: 'Email Address', key: 'email' as keyof ProfileForm, icon: <Mail size={14} color="#9CA3AF" />, type: 'email' },
                                { label: 'Phone Number', key: 'phone' as keyof ProfileForm, icon: <Phone size={14} color="#9CA3AF" />, type: 'tel' },
                                { label: 'Address', key: 'address' as keyof ProfileForm, icon: <MapPin size={14} color="#9CA3AF" />, type: 'text' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5, color: '#374151' }}>{f.label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>{f.icon}</span>
                                        <input
                                            type={f.type}
                                            value={form[f.key]}
                                            onChange={e => up(f.key, e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }}
                                            onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Security</div>
                        <div style={{ fontWeight: 500, fontSize: 14, color: '#374151', marginBottom: 12 }}>Change Password</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password" placeholder="Current Password" value={pwForm.currentPassword}
                                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }}
                                    onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password" placeholder="New Password" value={pwForm.newPassword}
                                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }}
                                    onFocus={e => (e.target.style.borderColor = '#B91C1C')}
                                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                                />
                            </div>
                            <button onClick={changePassword} disabled={pwSaving}
                                style={{ alignSelf: 'flex-start', padding: '9px 20px', background: '#D97706', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                {pwSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Notifications</div>
                        {[
                            { key: 'bookingConfirmation', label: 'Booking Confirmation', desc: 'Receive email updates about your table reservations.' },
                            { key: 'marketing', label: 'Marketing & Promotions', desc: 'Stay updated with the latest culinary events and deals.' },
                            { key: 'orderTracking', label: 'Order Tracking', desc: 'Real-time alerts for your takeout and delivery orders.' },
                        ].map((n, i, arr) => (
                            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: 14 }}>{n.label}</div>
                                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{n.desc}</div>
                                </div>
                                <Toggle checked={notifPrefs[n.key as keyof NotificationPrefs]} onChange={() => saveNotifs(n.key as keyof NotificationPrefs, !notifPrefs[n.key as keyof NotificationPrefs])} />
                            </div>
                        ))}
                    </div>

                    {/* Danger Zone */}
                    <div style={{ background: 'white', borderRadius: 12, border: '2px solid #FEE2E2', padding: 24 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, color: '#B91C1C', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} /> Danger Zone
                        </div>
                        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Once you delete your account, there is no going back. Please be certain.</p>
                        <button onClick={() => { if (window.confirm('Are you sure? This cannot be undone.')) { usersAPI.deleteAccount(); logout(); } }}
                            style={{ padding: '9px 20px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            Delete My Account
                        </button>
                    </div>
                </div>

                {/* Right sidebar */}
                <div>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, position: 'sticky', top: 80 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Quick Summary</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                            Member since {user ? new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                        </div>
                        {[
                            { label: 'Total Bookings', value: '12', color: '#B91C1C' },
                            { label: 'Total Orders', value: '28', color: '#B91C1C' },
                            { label: 'Loyalty Points', value: `${loyalty?.points || 450} pts`, color: '#B91C1C' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6', fontSize: 14 }}>
                                <span style={{ color: '#374151' }}>{s.label}</span>
                                <span style={{ fontWeight: 600, color: s.color }}>{s.value}</span>
                            </div>
                        ))}
                        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginTop: 12, marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>ACTIVE PLAN</div>
                            <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CreditCard size={14} color="#B91C1C" /> Gourmet Pro
                            </div>
                        </div>
                        <button onClick={saveProfile} disabled={saving}
                            style={{ width: '100%', padding: '11px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                        <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>Last updated: 2 hours ago</div>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
                            <span onClick={() => navigate('/settings/addresses')} style={{ fontSize: 13, color: '#B91C1C', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <CreditCard size={13} /> Manage Addresses & Payments
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}