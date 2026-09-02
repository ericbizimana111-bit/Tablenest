

import React, { useState } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { usersAPI } from '../../../shared/services/api';
import toast from 'react-hot-toast';

type SettingsForm = { fullName: string; email: string; phone: string };

export default function OwnerSettings() {
    const { user, setUser } = useAuthStore();
    const [form, setForm] = useState<SettingsForm>({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
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
                <p style={{ fontSize: 13, color: '#475569' }}>Manage your account and restaurant preferences.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Account Information</div>
                    {[
                        { label: 'Full Name', key: 'fullName', type: 'text' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Phone', key: 'phone', type: 'tel' },
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input type={f.type} value={form[f.key as keyof SettingsForm]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value } as SettingsForm))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    ))}
                    <button onClick={save} disabled={saving}
                        style={{ width: '100%', padding: '10px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Notification Preferences</div>
                    {[
                        { label: 'New Reservations', desc: 'Get notified when a new booking arrives' },
                        { label: 'New Orders', desc: 'Alerts for incoming orders' },
                        { label: 'Low Inventory', desc: 'Warnings when stock runs low' },
                        { label: 'New Reviews', desc: 'Notify when guests leave feedback' },
                    ].map((n, i) => (
                        <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #F1F5F9' : 'none' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                                <div style={{ fontSize: 11, color: '#94A3B8' }}>{n.desc}</div>
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
