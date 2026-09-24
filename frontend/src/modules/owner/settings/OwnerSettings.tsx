import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, ImagePlus, Trash2, Star } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import { usersAPI, restaurantsAPI, uploadsAPI } from '../../../shared/services/api';
import { Toggle, Spinner } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import type { NotificationPrefs } from '../../../shared/types/auth.types';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
type ProfileForm = { fullName: string; phone: string };
type RestaurantForm = Partial<Restaurant>;

export default function OwnerSettings() {
    const { user, setUser } = useAuthStore();
    const qc = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [profileForm, setProfileForm] = useState<ProfileForm>({ fullName: user?.fullName || '', phone: user?.phone || '' });
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(user?.notificationPrefs || { bookingConfirmation: true, marketing: false, orderTracking: true });
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState<RestaurantForm | null>(null);

    const { data: restaurant, isLoading } = useQuery<Restaurant>({
        queryKey: ['my-restaurant'],
        queryFn: () => restaurantsAPI.getMyRestaurant().then((r) => r.data),
    });

    useEffect(() => { if (restaurant && !form) setForm(restaurant); }, [restaurant]);

    const saveProfile = async () => {
        setSavingProfile(true);
        try { const res = await usersAPI.updateProfile(profileForm); setUser(res.data); toast.success('Profile updated'); }
        catch { toast.error('Failed to save'); } finally { setSavingProfile(false); }
    };

    const saveRestaurantMut = useMutation({
        mutationFn: () => restaurantsAPI.update(restaurant!._id, form!),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-restaurant'] }); toast.success('Restaurant updated'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not save'),
    });

    const saveNotifs = async (key: keyof NotificationPrefs, val: boolean) => {
        const updated = { ...notifPrefs, [key]: val };
        setNotifPrefs(updated);
        await usersAPI.updateNotificationPrefs(updated).catch(() => toast.error('Could not save preference'));
    };

    const onUploadImage = async (file: File) => {
        setUploading(true);
        try {
            const res = await uploadsAPI.uploadImage(file);
            setForm((f) => ({ ...f, images: [...(f?.images || []), res.data.url] }));
            toast.success('Photo added — save changes to apply');
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    if (isLoading || !form) return <Spinner />;
    const up = <K extends keyof RestaurantForm>(key: K, v: RestaurantForm[K]) => setForm((f) => ({ ...f, [key]: v }));
    const setHours = (day: string, patch: Partial<{ open: string; close: string; closed: boolean }>) =>
        setForm((f) => ({ ...f, openingHours: { ...f?.openingHours, [day]: { ...(f?.openingHours?.[day] || { open: '10:00', close: '22:00', closed: false }), ...patch } } }));

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
                <p style={{ fontSize: 13, color: 'var(--color-ink-mute)' }}>Manage your account and restaurant configuration.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="settings-2col">
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Account information</div>
                    <div style={{ marginBottom: 14 }}><label className="label">Full name</label><input value={profileForm.fullName} onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))} className="input" /></div>
                    <div style={{ marginBottom: 14 }}><label className="label">Email</label><input value={user?.email || ''} disabled className="input" style={{ background: 'var(--color-sand)', color: 'var(--color-ink-mute)' }} /></div>
                    <div style={{ marginBottom: 18 }}><label className="label">Phone</label><input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="input" /></div>
                    <button onClick={saveProfile} disabled={savingProfile} className="btn btn-primary" style={{ width: '100%' }}>{savingProfile ? 'Saving…' : 'Save account'}</button>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Notification preferences</div>
                    {[
                        { key: 'bookingConfirmation', label: 'Booking alerts', desc: 'New reservations and status changes' },
                        { key: 'orderTracking', label: 'Order alerts', desc: 'New orders and order updates' },
                        { key: 'marketing', label: 'Marketing emails', desc: 'Platform tips and product updates' },
                    ].map((n, i, arr) => (
                        <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-sand)' : 'none' }}>
                            <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.label}</div><div style={{ fontSize: 11.5, color: 'var(--color-ink-mute)' }}>{n.desc}</div></div>
                            <Toggle checked={notifPrefs[n.key as keyof NotificationPrefs]} onChange={() => saveNotifs(n.key as keyof NotificationPrefs, !notifPrefs[n.key as keyof NotificationPrefs])} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Restaurant profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div><label className="label">Name</label><input value={form.name || ''} onChange={(e) => up('name', e.target.value)} className="input" /></div>
                    <div><label className="label">Cuisine type</label><input value={form.cuisineType || ''} onChange={(e) => up('cuisineType', e.target.value)} className="input" /></div>
                </div>
                <div style={{ marginBottom: 14 }}><label className="label">Description</label><textarea value={form.description || ''} onChange={(e) => up('description', e.target.value)} className="input" style={{ minHeight: 80, resize: 'vertical' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div><label className="label">Address</label><input value={form.address || ''} onChange={(e) => up('address', e.target.value)} className="input" /></div>
                    <div><label className="label">City</label><input value={form.city || ''} onChange={(e) => up('city', e.target.value)} className="input" /></div>
                    <div><label className="label">Country</label><input value={form.country || ''} onChange={(e) => up('country', e.target.value)} className="input" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div><label className="label">Phone</label><input value={form.phone || ''} onChange={(e) => up('phone', e.target.value)} className="input" /></div>
                    <div><label className="label">Email</label><input value={form.email || ''} onChange={(e) => up('email', e.target.value)} className="input" /></div>
                    <div><label className="label">Website</label><input value={form.website || ''} onChange={(e) => up('website', e.target.value)} className="input" placeholder="https://…" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div><label className="label">Price range</label>
                        <select value={form.priceRange || '$$'} onChange={(e) => up('priceRange', e.target.value as any)} className="input">
                            {['$', '$$', '$$$', '$$$$'].map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div><label className="label">Seating capacity</label><input type="number" min={1} value={form.seatingCapacity || 0} onChange={(e) => up('seatingCapacity', Number(e.target.value))} className="input" /></div>
                </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Ordering & service</div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 18, flexWrap: 'wrap' }}>
                    {[
                        { key: 'dineIn', label: 'Dine-in' }, { key: 'delivery', label: 'Delivery' }, { key: 'pickup', label: 'Pickup' }, { key: 'acceptingOrders', label: 'Accepting orders' },
                    ].map((s) => (
                        <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                            <Toggle checked={!!(form as any)[s.key]} onChange={() => up(s.key as keyof RestaurantForm, !(form as any)[s.key] as any)} /> {s.label}
                        </label>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                    <div><label className="label">Delivery fee ($)</label><input type="number" min={0} step="0.01" value={form.deliveryFee ?? 0} onChange={(e) => up('deliveryFee', Number(e.target.value))} className="input" disabled={!form.delivery} /></div>
                    <div><label className="label">Minimum order ($)</label><input type="number" min={0} step="0.01" value={form.minOrder ?? 0} onChange={(e) => up('minOrder', Number(e.target.value))} className="input" disabled={!form.delivery} /></div>
                    <div><label className="label">Tax rate (%)</label><input type="number" min={0} max={40} step="0.1" value={Math.round((form.taxRate ?? 0.08) * 1000) / 10} onChange={(e) => up('taxRate', Number(e.target.value) / 100)} className="input" /></div>
                    <div><label className="label">Prep time (min)</label><input type="number" min={5} value={form.prepTime ?? 30} onChange={(e) => up('prepTime', Number(e.target.value))} className="input" /></div>
                </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Opening hours</div>
                {DAYS.map((day) => {
                    const h = form.openingHours?.[day] || { open: '10:00', close: '22:00', closed: false };
                    return (
                        <div key={day} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 90px', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-sand)' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{day}</span>
                            <input type="time" value={h.open} disabled={h.closed} onChange={(e) => setHours(day, { open: e.target.value })} className="input" style={{ padding: '6px 10px' }} />
                            <input type="time" value={h.close} disabled={h.closed} onChange={(e) => setHours(day, { close: e.target.value })} className="input" style={{ padding: '6px 10px' }} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                                <Toggle checked={!h.closed} onChange={() => setHours(day, { closed: !h.closed })} /> Open
                            </label>
                        </div>
                    );
                })}
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Photos</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {(form.images || []).map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: 100, height: 100, borderRadius: 12, overflow: 'hidden' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {form.logo === img && <span className="badge badge-brand" style={{ position: 'absolute', top: 4, left: 4 }}><Star size={10} /></span>}
                            <div style={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 4 }}>
                                <button onClick={() => up('logo', img)} className="btn-icon" style={{ width: 22, height: 22, padding: 0, background: '#fff' }} title="Set as cover"><Star size={11} /></button>
                                <button onClick={() => up('images', (form.images || []).filter((x) => x !== img))} className="btn-icon" style={{ width: 22, height: 22, padding: 0, background: '#fff', color: '#c0271b' }}><Trash2 size={11} /></button>
                            </div>
                        </div>
                    ))}
                    <div onClick={() => fileRef.current?.click()} style={{ width: 100, height: 100, borderRadius: 12, border: '2px dashed var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#b3a89d' }}>
                        {uploading ? <Spinner size={20} /> : <ImagePlus size={24} />}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUploadImage(e.target.files[0])} />
                </div>
            </div>

            <button onClick={() => saveRestaurantMut.mutate()} disabled={saveRestaurantMut.isPending} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <Camera size={16} /> {saveRestaurantMut.isPending ? 'Saving…' : 'Save restaurant changes'}
            </button>
            <style>{`@media (max-width: 900px) { .settings-2col { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
